import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { ANATOMY_REGIONS, REGION_FOUNDATIONS, matchClientIssuesToRegions } from "../src/lib/clinical/anatomy-atlas.ts";
import { ANATOMY_REGION_EVIDENCE } from "../src/lib/clinical/evidence-anatomy.ts";

// Data and regression consistency only; this cannot establish medical accuracy.
const ids = ["cervical", "shoulder", "thoracic_core", "lumbar", "hip_pelvis", "thigh_hamstring", "knee", "ankle_foot"];
assert.deepEqual(ANATOMY_REGIONS.map((region) => region.id), ids);
assert.deepEqual(Object.keys(ANATOMY_REGION_EVIDENCE), ids);
let structures = 0;
let sourceLinks = 0;
for (const region of ANATOMY_REGIONS) {
  const evidence = ANATOMY_REGION_EVIDENCE[region.id];
  assert.equal(evidence.reviewedBy, null, `${region.id}: do not invent a reviewer`);
  assert.ok(["limited", "literature-reviewed"].includes(evidence.status));
  assert.ok(evidence.sources.length >= 5, `${region.id}: regional sources required`);
  assert.ok(evidence.supportedClaims.length >= 4, `${region.id}: field-level mappings required`);
  assert.ok(evidence.limitations.length >= 4, `${region.id}: explicit limits required`);
  for (const entry of evidence.sources) {
    assert.equal(new URL(entry.url).protocol, "https:");
    assert.match(entry.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.title.length > 10 && entry.access.length > 40);
  }
  for (const claim of evidence.supportedClaims) {
    assert.match(claim, /^\[\d/);
    const indices = claim.match(/^\[([^\]]+)\]/)[1].split(/[,–-]/).map(Number);
    assert.ok(indices.every((index) => index > 0 && index <= evidence.sources.length), `${region.id}: invalid source index`);
  }
  assert.equal(region.structures.length, 3);
  assert.equal(region.protocols.length, 2);
  const foundations = REGION_FOUNDATIONS[region.id];
  assert.equal(foundations.length, 3, `${region.id}: 3 foundation notes required`);
  assert.ok(
    evidence.supportedClaims.some((claim) => claim.includes("Kiến thức nền")),
    `${region.id}: foundation claim mapping required`,
  );
  for (const item of foundations) {
    assert.ok(item.text.length > 40, `${region.id}: foundation text required`);
    assert.ok(item.sourceRefs.length > 0, `${region.id}: foundation source required`);
    for (const index of item.sourceRefs) {
      assert.ok(evidence.sources[index - 1], `${region.id}: invalid foundation source ${index}`);
    }
  }
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

// Extract the actual plate data without rendering its client hooks or replacing
// sourceRefs with fixtures. Every visible note must resolve to regional sources.
const diagramPath = new URL("../src/components/JointDiagramSvg.tsx", import.meta.url);
const diagramSource = ts.createSourceFile(diagramPath.pathname, readFileSync(diagramPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let platesInitializer;
for (const statement of diagramSource.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(diagramSource) === "REGION_PLATES") platesInitializer = declaration.initializer;
  }
}
assert.ok(platesInitializer, "Actual regional plate data required");
const plates = vm.runInNewContext(`(${platesInitializer.getText(diagramSource)})`);
let plateCount = 0, noteCount = 0;
assert.deepEqual(Object.keys(plates).sort(), [...ids].sort());
for (const [regionId, regionalPlates] of Object.entries(plates)) {
  for (const plate of regionalPlates) {
    plateCount++;
    for (const note of plate.landmarks) {
      noteCount++;
      assert.ok(note.sourceRefs.length, `${plate.id}/${note.code}: no source attached`);
      for (const index of note.sourceRefs) assert.ok(Number.isInteger(index) && ANATOMY_REGION_EVIDENCE[regionId].sources[index - 1], `${plate.id}/${note.code}: invalid source ${index}`);
    }
  }
}

// Citation-accuracy pins (P0 task 1, read 2026-10-23). These foundation and plate notes make
// claims OpenStax §7.3 does not state, so each must cite the specific StatPearls article read.
const sourceIndex = (regionId, fragment) => {
  const index = ANATOMY_REGION_EVIDENCE[regionId].sources.findIndex((entry) => entry.url.includes(fragment)) + 1;
  assert.ok(index > 0, `${regionId}: source ${fragment} missing`);
  const entry = ANATOMY_REGION_EVIDENCE[regionId].sources[index - 1];
  assert.equal(entry.checkedAt, "2026-10-23", `${fragment}: newly read source keeps its real read date`);
  assert.match(entry.access, /Full/, `${fragment}: access scope must be stated`);
  return index;
};
const foundationWith = (regionId, pattern) => {
  const matches = REGION_FOUNDATIONS[regionId].filter((item) => pattern.test(item.text));
  assert.equal(matches.length, 1, `${regionId}: expected one foundation matching ${pattern}`);
  return matches[0];
};
const cervicalPass = sourceIndex("cervical", "NBK459200");
assert.ok(foundationWith("cervical", /đội–chẩm/).sourceRefs.includes(cervicalPass), "atlanto-occipital motion needs the cervical vertebrae source");
assert.ok(foundationWith("cervical", /biên độ/).sourceRefs.includes(cervicalPass), "cervical mobility needs the cervical vertebrae source");
const thoracicPass = sourceIndex("thoracic_core", "NBK459153");
assert.ok(foundationWith("thoracic_core", /Mỏm gai/).sourceRefs.includes(thoracicPass), "thoracic spinous/rib limits need the thoracic vertebrae source");
const lumbarPass = sourceIndex("lumbar", "NBK459278");
assert.ok(foundationWith("lumbar", /xoay/).sourceRefs.includes(lumbarPass), "lumbar facet/rotation limit needs the lumbar vertebrae source");
for (const [regionId, fragment] of [["cervical", "NBK459200"], ["thoracic_core", "NBK459153"], ["lumbar", "NBK459278"]]) {
  const index = sourceIndex(regionId, fragment);
  const mapping = ANATOMY_REGION_EVIDENCE[regionId].supportedClaims.find((claim) => claim.includes("Kiến thức nền"));
  assert.ok(mapping.match(/^\[([^\]]+)\]/)[1].split(",").map(Number).includes(index), `${regionId}: foundation claim mapping lists the new source`);
}
assert.ok(!/gật đầu|đội–chẩm/.test(JSON.stringify(REGION_FOUNDATIONS.thoracic_core)), "no stray cervical claim in thoracic foundations");
const anklePass = sourceIndex("ankle_foot", "NBK545158");
const ligaments = foundationWith("ankle_foot", /dây chằng/);
assert.match(ligaments.text, /sên–mác sau/, "posterior talofibular ligament must be listed");
assert.match(ligaments.text, /PTFL/);
assert.match(ligaments.text, /sên–mác trước/);
assert.match(ligaments.text, /mác–gót/);
assert.ok(ligaments.sourceRefs.includes(anklePass), "ankle ligament list needs the ankle joint source");
const scalenePass = sourceIndex("cervical", "NBK519058");
const scaleneNote = plates.cervical.flatMap((plate) => plate.landmarks).find((note) => /Scalene/.test(note.enLabel));
assert.ok(scaleneNote, "scalene plate note present");
assert.ok(scaleneNote.sourceRefs.includes(scalenePass), "scalene rib attachment needs the scalenus source");
assert.match(scaleneNote.clinicalNote, /xương sườn 1/);
assert.match(scaleneNote.clinicalNote, /xương sườn 2/);
assert.equal(plateCount, 13);
assert.equal(noteCount, 42);
console.log(`Region evidence consistency passed: ${ids.length}/8 regions, ${structures} structure summaries, ${sourceLinks} regional source links, ${noteCount} notes across ${plateCount} plates; truthful source scopes and reviewer metadata.`);
