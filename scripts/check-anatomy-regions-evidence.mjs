import assert from "node:assert/strict";
import { ANATOMY_REGIONS, matchClientIssuesToRegions } from "../src/lib/clinical/anatomy-atlas.ts";
import { ANATOMY_REGION_EVIDENCE } from "../src/lib/clinical/evidence-anatomy.ts";

// Data and regression consistency only; this cannot establish medical accuracy.
const ids = ["cervical", "shoulder", "thoracic_core", "lumbar", "hip_pelvis", "thigh_hamstring", "knee", "ankle_foot"];
assert.deepEqual(ANATOMY_REGIONS.map((region) => region.id), ids);
assert.deepEqual(Object.keys(ANATOMY_REGION_EVIDENCE), ids);
let structures = 0;
let sourceLinks = 0;
for (const region of ANATOMY_REGIONS) {
  const evidence = ANATOMY_REGION_EVIDENCE[region.id];
  assert.equal(evidence.reviewedBy, null, `${region.id}: expert review must remain pending`);
  assert.ok(["limited", "literature-reviewed"].includes(evidence.status));
  assert.ok(evidence.sources.length >= 5, `${region.id}: regional sources required`);
  assert.ok(evidence.supportedClaims.length >= 4, `${region.id}: field-level mappings required`);
  assert.ok(evidence.limitations.length >= 4, `${region.id}: explicit limits required`);
  for (const entry of evidence.sources) {
    assert.equal(new URL(entry.url).protocol, "https:");
    assert.equal(entry.checkedAt, "2026-10-19");
    assert.ok(entry.title.length > 10 && entry.access.length > 40);
  }
  for (const claim of evidence.supportedClaims) {
    assert.match(claim, /^\[\d/);
    const indices = claim.match(/^\[([^\]]+)\]/)[1].split(/[,–-]/).map(Number);
    assert.ok(indices.every((index) => index > 0 && index <= evidence.sources.length), `${region.id}: invalid source index`);
  }
  assert.equal(region.structures.length, 3);
  assert.equal(region.protocols.length, 2);
  assert.ok(region.redFlags.length > 0);
  structures += region.structures.length;
  sourceLinks += evidence.sources.length;
}
const clinicalText = JSON.stringify(ANATOMY_REGIONS);
for (const removed of ["tăng gấp đôi", "giảm tới 50–70%", "lớn nhất cơ thể", "chuẩn khỏe mạnh: 25", "mục tiêu >20", "<35°", "RPE 6.5", "tâm trương", "ép nhẹ gây tê"]) {
  assert.ok(!clinicalText.includes(removed), `unsupported legacy statement returned: ${removed}`);
}
const alert = matchClientIssuesToRegions({
  orthopedic_issues: [{ region: "gối", painTriggers: "đau khi squat", notes: "" }],
  medical_conditions: [{ name: "đau gối", notes: "" }],
});
assert.equal(alert.knee.severity, "caution", "keyword overlap must not escalate urgency");
console.log(`Region evidence consistency passed: ${ids.length}/8 regions, ${structures} structure summaries, ${sourceLinks} regional source links; expert review pending in all 8.`);
