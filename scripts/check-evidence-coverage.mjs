// Finite data coverage and retrieval consistency; never a clinical validation.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import * as originalAnatomyEvidence from "../src/lib/clinical/anatomy-evidence.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!existsSync(file) && !path.extname(file)) file += ".ts";
  if (file === path.join(root, "src/lib/clinical/anatomy-evidence.mjs")) return originalAnatomyEvidence;
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
  const exports = {};
  cache.set(file, exports);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  assert.equal(diagnostics?.length ?? 0, 0, `syntax: ${file}`);
  vm.runInNewContext(outputText, { exports, require: (target) => load(target.startsWith("@/") ? `src/${target.slice(2)}` : path.relative(root, path.resolve(path.dirname(file), target))) }, { filename: file });
  return exports;
}
const registry = load("src/lib/clinical/evidence-registry.ts");
const { EVIDENCE_INDEX, getCatalogEvidence, selectCuratedEvidence, formatCuratedEvidence } = registry;
const manifest = load("public/anatomy/3d/manifest.json");
const audit = load("src/lib/clinical/catalog-evidence.json");
const domains = [
  ["anatomy", load("src/lib/clinical/anatomy-atlas.ts").ANATOMY_REGIONS, 8],
  ["structure", load("src/lib/clinical/structure-anatomy-evidence.ts").STRUCTURE_ANATOMY_FAMILIES, 8],
  ["muscle", load("src/lib/clinical/muscle-hypertrophy-atlas.ts").MUSCLE_GROUP_ATLAS, 11],
  ["exercise", load("src/lib/clinical/muscle-hypertrophy-atlas.ts").HYPERTROPHY_EXERCISES, 13],
  ["trigger", load("src/lib/clinical/trigger-point-atlas.ts").TRIGGER_POINT_MUSCLES, 10],
  ["pain-site", load("src/lib/clinical/trigger-point-atlas.ts").PAIN_SITE_CULPRIT_MAP, 8],
  ["handbook", load("src/lib/clinical/movement-handbook.ts").HANDBOOK, 4],
  ["rom", load("src/lib/clinical/rom-norms.ts").ROM_MOVEMENTS, 17],
  ["catalog", manifest.structures, 1031],
];
const expected = new Set(["trigger:general", "screening:general", "medication:general", "labs:general", "assistant:general"]);
for (const [domain, records, count] of domains) {
  assert.equal(records.length, count, `${domain}: inventory changed; review coverage explicitly`);
  const recordIds = records.map((record) => `${domain}:${record.id}`);
  assert.equal(new Set(recordIds).size, records.length, `${domain}: duplicate record IDs`);
  recordIds.forEach((id) => expected.add(id));
}
const individualFamilies = ["external-oblique", "gluteus-medius", "infraspinatus", "internal-oblique", "subscapularis", "supraspinatus", "teres-minor", "transversus-abdominis"];
assert.deepEqual(Array.from(EVIDENCE_INDEX.filter((entry) => entry.domain === "structure"), (entry) => entry.id).sort(), individualFamilies.map((id) => `structure:${id}`));
assert.equal(EVIDENCE_INDEX.length, expected.size);
assert.equal(new Set(EVIDENCE_INDEX.map((entry) => entry.id)).size, expected.size);
assert.deepEqual(Array.from(EVIDENCE_INDEX, (entry) => entry.id).sort(), [...expected].sort());
for (const entry of EVIDENCE_INDEX) {
  assert.ok(entry.label && entry.id.startsWith(`${entry.domain}:`));
  assert.ok(entry.evidence, `${entry.id}: silent missing evidence`);
  const record = entry.evidence;
  assert.equal(record.reviewedBy, null);
  assert.ok(["source-only", "limited", "literature-reviewed"].includes(record.status));
  assert.ok(record.sources.length && record.supportedClaims.length && record.limitations.length);
  for (const source of record.sources) {
    assert.ok(source.title && source.access);
    assert.equal(new URL(source.url).protocol, "https:");
    assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
}
assert.deepEqual(Object.keys(audit.structures).sort(), manifest.structures.map((structure) => structure.id).sort());
assert.equal(getCatalogEvidence("unknown-structure"), undefined);
assert.equal(getCatalogEvidence("toString"), undefined);
assert.equal(getCatalogEvidence("__proto__"), undefined);
for (const structure of manifest.structures) {
  const evidence = getCatalogEvidence(structure.id);
  assert.equal(evidence.status, "source-only");
  assert.ok(evidence.limitations.join(" ").includes("3D"));
  assert.ok(evidence.sources[0].url.includes(audit.source.commit));
  assert.equal(evidence.sources[0].checkedAt, audit.provenanceCheckedAt, "local replay does not change source reading date");
  const row = audit.structures[structure.id];
  assert(!Object.hasOwn(row, "ta2Ids"), "derivative keys are not labeled official TA2 IDs");
  if (row.latinMatches) {
    assert(evidence.supportedClaims.some(claim => claim.includes("khóa dòng nguồn") && row.upstreamRowIds.every(id => claim.includes(id))));
  }
  if (row.canonicalTa2Id !== null) {
    assert(["2682", "2474"].includes(row.canonicalTa2Id));
    assert.equal(row.canonicalComparison.checkedAt, "2026-10-27");
    assert(evidence.supportedClaims.some(claim => claim.includes(`Mục TA2 gốc ${row.canonicalTa2Id}`)));
  }
}
for (const query of ["", "   ", "pizza weather javascript", "nguồn và thông tin", "the and of please"]) {
  assert.equal(selectCuratedEvidence(query).length, 0, `unrelated/empty query: ${query}`);
}
for (const [query, domain] of [["metformin insulin beta blocker", "medication"], ["xét nghiệm khoảng tham chiếu", "labs"], ["ROM gối", "rom"], ["trigger point", "trigger"], ["gluteus medius", "muscle"]]) {
  const selected = selectCuratedEvidence(query);
  assert.ok(selected.length && selected.some((entry) => entry.domain === domain), `${query}: relevant records missing`);
  assert.ok(selected.every((entry) => entry.evidence.status !== "source-only"));
}
for (const [query, id] of [["Internal Oblique", "internal-oblique"], ["Transversus abdominis", "transversus-abdominis"], ["Supraspinatus", "supraspinatus"], ["Infraspinatus", "infraspinatus"], ["Subscapularis", "subscapularis"], ["Teres minor", "teres-minor"]]) {
  const selected = selectCuratedEvidence(query);
  const individual = selected.find((entry) => entry.id === `structure:${id}`);
  assert.ok(individual, `${query}: individual knowledge missing`);
  const context = formatCuratedEvidence(selected);
  for (const claim of individual.evidence.supportedClaims) assert.ok(context.includes(claim), `${id}: a supported claim was omitted`);
  assert.ok(selected.every((entry) => entry.domain !== "catalog"));
}
for (const limit of [-5, 0, 1, 2, 6, 1000, NaN, Infinity]) {
  const selected = selectCuratedEvidence("ROM gối vai cơ gluteus medius thuốc insulin", limit);
  assert.ok(selected.length <= 6);
  if (limit <= 0) assert.equal(selected.length, 0);
  if (limit === 1) assert.equal(selected.length, 1);
  const formatted = formatCuratedEvidence(selected);
  assert.ok(formatted.length <= 24000);
  for (const entry of selected) assert.ok(formatted.includes(`[APP:${entry.id}]`), "metadata must match actual supplied context");
  for (const url of formatted.match(/https:\/\/[^\s]+/g) ?? []) {
    assert.ok(selected.some((entry) => entry.evidence.sources.some((source) => source.url === url)), `invented/truncated URL: ${url}`);
  }
}
assert.ok(formatCuratedEvidence(EVIDENCE_INDEX).length <= 24000, "formatter must bound arbitrary caller input");
const route = readFileSync(path.join(root, "src/app/api/chat/route.ts"), "utf8");
assert.match(route, /formatCuratedEvidence\(curated\)/);
assert.match(route, /type: "meta"[^\n]*curated/);
assert.match(route, /citations: \{[^\n]*curated/);
assert.doesNotMatch(route, /searchPubMed\(last/);

// Execute the real route with network/model/storage adapters replaced: this checks
// that curated sources reach the actual model system and backwards-compatible
// metadata/persistence, and that public search never receives raw private text.
const calls = { publicQueries: [], system: "", inserted: [] };
const clientId = "synthetic-client";
const client = { id: clientId, full_name: "PRIVATE_TEST_NAME" };
const db = { from: (table) => {
  if (table === "consultations") return { insert: async (rows) => { calls.inserted.push(...rows); return { error: null }; } };
  const chain = {
    select() { return chain; }, eq() { return chain; }, order() { return chain; },
    single: async () => ({ data: client }), limit: async () => ({ data: [{ recorded_at: "2026-10-20", kind: "blood_lab", metrics: { PRIVATE_TEST_LAB: 123 } }] }),
  };
  return chain;
} };
const adapters = {
  "@/lib/clinical/evidence-registry": registry,
  "@/lib/ai/prompts/clinical-pt-system": load("src/lib/ai/prompts/clinical-pt-system.ts"),
  "@/lib/ai/openrouter": {
    pickChatModel: () => "test-model",
    chatStream: async ({ messages }) => {
      calls.system = messages[0].content;
      return new ReadableStream({ start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Test response"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n'));
        controller.close();
      } });
    },
  },
  "@/lib/clinical/safety": { formatClient: () => "PRIVATE_TEST_NAME", safetyNotes: () => "synthetic safety" },
  "@/lib/local-store": { readLocalStore: () => { throw new Error("unexpected local branch"); } },
  "@/lib/supabase/server": { hasSupabase: () => true, supabase: () => db },
  "@/lib/tools/pubmed": { formatPubMed: () => "", searchPubMed: async (query) => { calls.publicQueries.push(query); return []; } },
  "@/lib/tools/rag-search": { formatRag: () => "", retrieveKnowledge: async () => ({ hits: [], retrieval: { status: "empty", message: "test empty" } }) },
  "@/lib/ai/stream-events": (await import("./lib/load-app-module.mjs")).createAppLoader()("src/lib/ai/stream-events.ts"),
};
const routeExports = {};
vm.runInNewContext(ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: routeExports, process: { env: { OPENROUTER_API_KEY: "synthetic-test-only" } },
  Response, TextEncoder, TextDecoder, ReadableStream,
  require: (target) => { assert.ok(adapters[target], `unexpected route dependency: ${target}`); return adapters[target]; },
});
const answer = await routeExports.POST({ json: async () => ({ clientId, messages: [{ role: "user", content: "PRIVATE_TEST_NAME asks about insulin with PRIVATE_TEST_LAB 123" }] }) });
const events = (await answer.text()).trim().split("\n").map((line) => JSON.parse(line));
assert.equal(events[0].type, "meta");
assert.ok(events[0].rag && events[0].pubmed && events[0].model);
assert.ok(events[0].curated.some((entry) => entry.domain === "medication"));
assert.ok(calls.system.includes("[APP:medication:general]"));
assert.ok(calls.system.includes("PRIVATE_TEST_NAME"), "profile remains in private model context");
assert.equal(calls.publicQueries.length, 1);
assert.equal(calls.publicQueries[0], "exercise diabetes medication");
assert.ok(!calls.publicQueries[0].includes("PRIVATE_TEST"));
assert.equal(events.at(-1).type, "done");
assert.equal(calls.inserted.length, 2);
assert.ok(calls.inserted[1].citations.curated.some((entry) => entry.domain === "medication"));
assert.equal(calls.inserted[1].citations.model, "test-model");
const unrelated = await routeExports.POST({ json: async () => ({ messages: [{ role: "user", content: "pizza weather javascript" }] }) });
const unrelatedEvents = (await unrelated.text()).trim().split("\n").map((line) => JSON.parse(line));
assert.equal(calls.publicQueries.length, 1, "unmatched topics skip public retrieval");
assert.equal(unrelatedEvents[0].publicSearch.skipped, true);
assert.equal(unrelatedEvents[0].curated.length, 0);
console.log(`Evidence coverage passed: ${EVIDENCE_INDEX.length} entries including 8 educational muscle families and 1,031 source-only catalog structures; bounded topic retrieval and truthful source/reviewer metadata checked.`);
