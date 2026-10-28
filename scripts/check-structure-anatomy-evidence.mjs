// Checks data consistency and scope boundaries, not medical or mesh validation.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import * as original from "../src/lib/clinical/anatomy-evidence.mjs";
import { createAppLoader } from "./lib/load-app-module.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "src/lib/clinical/structure-anatomy-evidence.ts");
const manifest = JSON.parse(readFileSync(path.join(root, "public/anatomy/3d/manifest.json"), "utf8"));
const expected = [
  ["internal-oblique", "Musculus obliquus internus abdominis", "za-6ac590756567", "za-11e8ab43abc3"],
  ["external-oblique", "Musculus obliquus externus abdominis", "za-a37e0a05a2d2", "za-a0399c244657"],
  ["transversus-abdominis", "Musculus transversus abdominis", "za-0f462c8829a0", "za-67d5878d84fa"],
  ["supraspinatus", "Musculus supraspinatus", "za-0425424460a5", "za-01cb75938da6"],
  ["infraspinatus", "Musculus infraspinatus", "za-87ff24e3a85d", "za-3eade513dbf4"],
  ["subscapularis", "Musculus subscapularis", "za-84c7d3654da9", "za-bb19dc35992b"],
  ["teres-minor", "Musculus teres minor", "za-a9f9cad10f26", "za-fd5c02294b47"],
];
const plain = (value) => JSON.parse(JSON.stringify(value));

test("individual-muscle registry preserves exact scope and source provenance", async (t) => {
  assert.ok(existsSync(file), "the individual-muscle registry must exist");
  const exports = {};
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.equal(compiled.diagnostics?.length ?? 0, 0);
  vm.runInNewContext(compiled.outputText, {
    exports,
    require(target) {
      assert.equal(target, "./anatomy-evidence.mjs", "adapter must use the original record");
      return original;
    },
  }, { filename: file });
  const { getStructureAnatomyEvidence: get, STRUCTURE_ANATOMY_EVIDENCE: records } = exports;

  await t.test("fourteen exact bilateral IDs resolve to their own family", () => {
    assert.equal(records.length, 7);
    for (const [family, latin, left, right] of expected) {
      const record = get(left);
      assert.ok(record, left);
      assert.equal(record, get(right));
      assert.equal(record.id, family);
      assert.equal(record.latin, latin);
      assert.deepEqual(plain(record.structureIds), [left, right]);
      for (const [id, side] of [[left, "left"], [right, "right"]]) {
        const structure = manifest.structures.find((item) => item.id === id);
        assert.ok(structure, `${id}: manifest ID exists`);
        assert.equal(structure.side, side, `${id}: laterality must match manifest`);
        assert.equal(structure.latin, latin, `${id}: family must match manifest`);
      }
    }
  });

  await t.test("other catalog muscles and unknown/prototype IDs cannot inherit a record", () => {
    const supported = new Set([...expected.flatMap((row) => row.slice(2)), ...original.GLUTEUS_MEDIUS_IDS]);
    for (const structure of manifest.structures) {
      if (!supported.has(structure.id)) assert.equal(get(structure.id), null, structure.id);
    }
    for (const id of [null, undefined, "", "za-unknown", "toString", "__proto__", "supraspinatus", " za-0425424460a5", "ZA-0425424460A5"]) {
      assert.equal(get(id), null, String(id));
    }
  });

  await t.test("each new record has five source-linked claims, actual dates and honest limits", () => {
    for (const record of records) {
      assert.ok(record.name && record.latin && record.id);
      assert.deepEqual(plain(record.claims.map((claim) => claim.id)), ["position", "origin", "insertion", "innervation", "action"]);
      assert.equal(record.literatureCheckedAt, "2026-10-28");
      assert.equal(record.reviewedBy, null);
      assert.equal(record.fiberMapping.status, "unavailable");
      assert.match(record.fiberMapping.reason, /Chưa có bản đồ hướng sợi được kiểm chứng/);
      assert.ok(record.limitations.some((limit) => /mesh/.test(limit)));
      assert.ok(record.limitations.some((limit) => /điều trị cá nhân/.test(limit)));
      const sources = new Map(record.sources.map((source) => [source.id, source]));
      assert.equal(sources.size, record.sources.length);
      for (const claim of record.claims) {
        assert.ok(claim.label && claim.text && claim.sourceIds.length);
        for (const sourceId of claim.sourceIds) assert.ok(sources.has(sourceId), `${record.id}/${claim.id}: ${sourceId}`);
      }
      for (const source of record.sources) {
        assert.ok(source.id && source.title && source.access);
        assert.equal(new URL(source.url).protocol, "https:");
        assert.equal(source.checkedAt, "2026-10-28");
      }
      for (const sourceId of record.architectureSources ?? []) assert.ok(sources.has(sourceId));
      assert.equal(record.geometryVerified, undefined);
      assert.equal(record.meshValidated, undefined);
    }
    for (const id of ["za-6ac590756567", "za-a37e0a05a2d2"]) {
      assert.doesNotMatch(get(id).claims.find((claim) => claim.id === "action").text, /cùng bên|đối bên/);
    }
  });

  await t.test("the gluteus-medius adapter retains original claims, scopes, dates and architecture", () => {
    const prior = original.getAnatomyEvidence(original.GLUTEUS_MEDIUS_IDS[0]);
    const adapted = get(original.GLUTEUS_MEDIUS_IDS[0]);
    assert.equal(adapted, get(original.GLUTEUS_MEDIUS_IDS[1]));
    assert.equal(adapted.name, prior.name);
    assert.equal(adapted.latin, prior.latin);
    assert.equal(adapted.literatureCheckedAt, prior.review.literatureCheckedAt);
    assert.equal(adapted.reviewedBy, null);
    assert.deepEqual(plain(adapted.fiberMapping), prior.fiberMapping);
    assert.equal(adapted.architectureNote, prior.architectureNote);
    assert.deepEqual(plain(adapted.architectureSources), prior.architectureSources);
    assert.deepEqual(plain(adapted.claims), prior.facts.map(({ sources, ...claim }) => ({ ...claim, sourceIds: sources })));
    assert.deepEqual(plain(adapted.sources), Object.entries(prior.sources).map(([id, { label, ...source }]) => ({ id, title: label, ...source })));
    assert.deepEqual(plain(adapted.structureIds), original.GLUTEUS_MEDIUS_IDS);
  });
});


test("individual anatomy is indexed separately from geometry with complete numbered claims", () => {
  const load = createAppLoader({ mocks: { "./anatomy-evidence.mjs": original } });
  const { EVIDENCE_INDEX, getCatalogEvidence, selectCuratedEvidence, formatCuratedEvidence } = load("src/lib/clinical/evidence-registry.ts");
  const { getStructureAnatomyEvidence: get } = load("src/lib/clinical/structure-anatomy-evidence.ts");
  const families = [...expected, ["gluteus-medius", "Musculus gluteus medius", ...original.GLUTEUS_MEDIUS_IDS]];
  const indexed = EVIDENCE_INDEX.filter((entry) => entry.domain === "structure");
  assert.deepEqual(Array.from(indexed, (entry) => entry.id).sort(), families.map(([id]) => `structure:${id}`).sort());
  for (const [family, , left, right] of families) {
    const record = get(left);
    const item = indexed.find((entry) => entry.id === `structure:${family}`);
    assert.ok(item, family);
    assert.equal(item.evidence.status, "literature-reviewed");
    assert.equal(item.evidence.reviewedBy, null);
    assert.deepEqual(plain(item.evidence.sources), plain(record.sources.map(({ title, url, checkedAt, access }) => ({ title, url, checkedAt, access }))));
    const citations = (ids) => ids.map((id) => `[${record.sources.findIndex((source) => source.id === id) + 1}]`).join(" ");
    const claims = record.claims.map((claim) => `${citations(claim.sourceIds)} ${claim.label}: ${claim.text}`);
    if (record.architectureNote && record.architectureSources?.length) claims.push(`${citations(record.architectureSources)} Cấu trúc cơ và gân: ${record.architectureNote}`);
    assert.deepEqual(plain(item.evidence.supportedClaims), plain(claims));
    const context = formatCuratedEvidence([item]);
    for (const claim of claims) assert.ok(context.includes(claim), `${family}: formatter dropped a claim`);
    for (const limitation of [...record.limitations, record.fiberMapping.reason]) assert.ok(item.evidence.limitations.includes(limitation));
    assert.equal(getCatalogEvidence(left).status, "source-only");
    assert.equal(getCatalogEvidence(right).status, "source-only");
  }
  const bounded = formatCuratedEvidence(indexed);
  assert.ok(bounded.length <= 24000);
  assert.ok((bounded.match(/\[APP:/g) ?? []).length <= 6);
  for (const item of indexed) {
    if (bounded.includes(`[APP:${item.id}]`)) {
      for (const claim of item.evidence.supportedClaims) assert.ok(bounded.includes(claim), `${item.id}: context must retain whole records`);
      for (const source of item.evidence.sources) assert.ok(bounded.includes(source.url));
    }
  }
  // Existing domains retain the previous four-claim formatter contract.
  const legacy = EVIDENCE_INDEX.find((entry) => entry.domain === "anatomy");
  const legacyClaims = ["one", "two", "three", "four", "legacy-fifth-claim-sentinel"];
  const legacyContext = formatCuratedEvidence([{ ...legacy, evidence: { ...legacy.evidence, supportedClaims: legacyClaims } }]);
  assert.ok(legacyClaims.slice(0, 4).every((claim) => legacyContext.includes(`- ${claim}`)));
  assert.ok(!legacyContext.includes(legacyClaims[4]));
  for (const [query, family] of [["Internal Oblique", "internal-oblique"], ["Transversus abdominis", "transversus-abdominis"], ["Supraspinatus", "supraspinatus"], ["Infraspinatus", "infraspinatus"], ["Subscapularis", "subscapularis"], ["Teres minor", "teres-minor"]]) {
    const records = selectCuratedEvidence(query);
    assert.ok(records.some((entry) => entry.id === `structure:${family}`), query);
    assert.ok(records.every((entry) => entry.domain !== "catalog"));
  }
});
