// Checks evidence bookkeeping and consumer compatibility, not clinical truth.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const loaded = new Map();
function load(relative) {
  const file = path.resolve(root, relative);
  if (loaded.has(file)) return loaded.get(file);
  const exports = {};
  loaded.set(file, exports);
  const source = readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.equal(result.diagnostics?.length ?? 0, 0, `TypeScript syntax: ${relative}`);
  vm.runInNewContext(result.outputText, {
    exports,
    require: (target) => load(path.relative(root, path.resolve(path.dirname(file), `${target}.ts`))),
  }, { filename: file });
  return exports;
}

const atlas = load("src/lib/clinical/trigger-point-atlas.ts");
const evidence = load("src/lib/clinical/evidence-trigger.ts");
const ids = ["upper_trapezius", "levator_scapulae", "infraspinatus", "pec_minor", "lats_serratus", "quadratus_lumborum", "iliopsoas", "glute_med_piriformis", "tfl_vastus_lateralis", "soleus_gastroc"];
assert.equal(atlas.TRIGGER_POINT_MUSCLES.length, 10);
assert.equal(atlas.PAIN_SITE_CULPRIT_MAP.length, 8);
assert.deepEqual([...Object.keys(evidence.TRIGGER_POINT_EVIDENCE)].sort(), [...ids].sort());
assert.deepEqual(Array.from(atlas.TRIGGER_POINT_MUSCLES, (muscle) => muscle.id).sort(), [...ids].sort());
const records = [...Object.values(evidence.TRIGGER_POINT_EVIDENCE), evidence.TRIGGER_GENERAL_EVIDENCE];
for (const record of records) {
  assert.equal(record.reviewedBy, null);
  assert.ok(["limited", "literature-reviewed"].includes(record.status));
  assert.ok(record.supportedClaims.length > 0 && record.limitations.length > 0);
  assert.ok(record.limitations.some((text) => text.includes("chuyên môn") || text.includes("chuyên gia")));
  assert.ok(record.sources.length > 0);
  for (const source of record.sources) {
    assert.ok(source.title && source.access);
    assert.match(source.url, /^https:\/\//);
    assert.equal(source.checkedAt, "2026-10-19");
  }
}
for (const muscle of atlas.TRIGGER_POINT_MUSCLES) {
  assert.equal(atlas.getTriggerPointMuscle(muscle.id).id, muscle.id);
  assert.equal(muscle.chain.overloadedState, "Chưa xác định qua đánh giá trực tiếp");
  assert.ok(muscle.references.length > 0);
  for (const node of muscle.nodes) {
    assert.ok(node.id && node.locationLabel.includes("không"));
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
  }
  assert.ok(muscle.referredPain.every((zone) => zone.description.includes("minh họa")));
  assert.ok(muscle.protocol.step1Release.tool && muscle.protocol.step2Mobility && muscle.protocol.step3Activation && muscle.protocol.step4LoadCue);
}
for (const site of atlas.PAIN_SITE_CULPRIT_MAP) {
  assert.equal(atlas.getPainSite(site.id).id, site.id);
  assert.equal(atlas.culpritMusclesForSite(site).length, site.culprits.length);
  for (const candidate of site.culprits) assert.ok(ids.includes(candidate.muscleId));
}
const runtimeText = JSON.stringify([atlas.PALPATION_FUNDAMENTALS, atlas.TRIGGER_POINT_MUSCLES, atlas.PAIN_SITE_CULPRIT_MAP]);
assert.doesNotMatch(runtimeText, /28973518|18164338|30756327|21946988|17197231|20038718|16089175|23993790|20598206|27583147/);
assert.doesNotMatch(runtimeText, /VAS 5|VAS 4|45–90s|60–90s|trong 24 giờ|trong 5 phút|≤10%/);
console.log(`Trigger evidence bookkeeping: ${ids.length} muscles, ${atlas.PAIN_SITE_CULPRIT_MAP.length} pain sites, ${records.length} evidence records; all pending independent clinical/spatial review.`);
