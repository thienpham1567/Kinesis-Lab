import assert from "node:assert/strict";
import * as THREE from "three";
import { getAnatomyEvidence } from "../src/lib/clinical/anatomy-evidence.mjs";
import { surfaceLabelPoint } from "../src/components/atlas3d/surface-label-layout.mjs";
const left = getAnatomyEvidence("za-98cfd2e47395"),
  right = getAnatomyEvidence("za-cc11824f98a0");
assert.ok(left);
assert.equal(left, right);
assert.equal(getAnatomyEvidence("za-unknown"), null);
assert.equal(left.review.clinician, null);
assert.equal(left.fiberMapping.status, "unavailable");
assert.equal(left.facts.length, 4);
for (const fact of left.facts) {
  assert.ok(fact.sources.length >= 1);
  for (const id of fact.sources) {
    assert.ok(left.sources[id]);
    assert.ok(new URL(left.sources[id].url).protocol === "https:");
  }
}
assert.ok(left.sources.uw.url.includes("rad.uw.edu"));
assert.ok(left.sources.tsutsumi.doi === "10.2106/JBJS.18.00602");
const camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial(),
);
cube.updateMatrixWorld(true);
const p = surfaceLabelPoint([cube], [cube], camera, 400, 400);
assert.ok(p);
assert.ok(Math.abs(p.x - 200) < 1);
assert.ok(Math.abs(p.y - 200) < 1);
cube.visible = false;
assert.equal(surfaceLabelPoint([cube], [cube], camera, 400, 400), null);
cube.visible = true;
const front = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial(),
);
front.position.z = 1.4;
front.updateMatrixWorld(true);
assert.equal(surfaceLabelPoint([cube], [cube, front], camera, 400, 400), null);
camera.position.set(0, 0.8, 3);
camera.lookAt(0, 0.8, 0);
camera.updateMatrixWorld(true);
assert.equal(
  surfaceLabelPoint([cube], [cube], camera, 400, 400),
  null,
  "near-edge anchors must hide rather than move onto a different region",
);
camera.position.z = -3;
camera.lookAt(0, 0, -6);
camera.updateMatrixWorld(true);
assert.equal(surfaceLabelPoint([cube], [cube], camera, 400, 400), null);
for (const m of [cube, front]) {
  m.geometry.dispose();
  m.material.dispose();
}
// 3D clinical-region resolution: shoulder-girdle structures must not inherit the
// trunk-height "thoracic_core"/"lumbar" tag, and laryngeal/pharyngeal muscles
// must not carry the cervical spine note.
const { readFileSync } = await import("node:fs");
const { resolveClinicalRegion } = await import(
  "../src/lib/clinical/atlas-3d.ts"
);
const atlasManifest = JSON.parse(
  readFileSync(new URL("../public/anatomy/3d/manifest.json", import.meta.url)),
);
const byEnglish = (english) =>
  atlasManifest.structures.filter((s) => s.english === english);
const shoulderMuscles = [
  "Supraspinatus muscle",
  "Infraspinatus muscle",
  "Subscapularis muscle",
  "Teres minor muscle",
  "Serratus anterior muscle",
  "Pectoralis minor muscle",
  "Latissimus dorsi muscle",
  "Clavicular head of pectoralis major muscle",
  "Sternocostal head of pectoralis major muscle",
  "Abdominal part of pectoralis major muscle",
];
for (const english of shoulderMuscles) {
  const found = byEnglish(english);
  assert.equal(found.length, 2, `${english}: expected left+right meshes`);
  for (const s of found) {
    assert.equal(resolveClinicalRegion(s), "shoulder", `${english} -> shoulder`);
  }
}
const nonSpinalNeckMuscles = [
  "Inferior pharyngeal constrictor",
  "Middle pharyngeal constrictor",
  "Superior pharyngeal constrictor",
  "Palatopharyngeus muscle",
  "Stylopharyngeus muscle",
  "Straight part of cricothyroid muscle",
  "Oblique part of cricothyroid muscle",
  "Posterior crico-arytenoid muscle",
  "Lateral crico-arytenoid muscle",
  "Transverse arytenoid muscle",
  "Ary-epiglottic part of oblique arytenoid muscle",
  "External part of thyro-arytenoid muscle",
  "Thyro-epiglottic part of thyro-arytenoid muscle",
];
for (const english of nonSpinalNeckMuscles) {
  const found = byEnglish(english);
  assert.ok(found.length >= 1, `${english}: missing from manifest`);
  for (const s of found) {
    assert.equal(resolveClinicalRegion(s), null, `${english} -> null`);
  }
}
// Same wrong trunk-height tag, same shoulder-girdle rule: teres major, scapula,
// clavicle and the sternoclavicular/costoclavicular/interclavicular tissue.
const alsoShoulder = [
  "Teres major muscle",
  "Scapula",
  "Clavicle",
  "Anterior sternoclavicular ligament",
  "Posterior sternoclavicular ligament",
  "Articular capsule of sternoclavicular joint",
  "Articular disc of sternoclavicular joint",
  "Costoclavicular ligament",
  "Interclavicular ligament",
];
for (const english of alsoShoulder) {
  const found = byEnglish(english);
  assert.ok(found.length >= 1, `${english}: missing from manifest`);
  for (const s of found) {
    assert.equal(resolveClinicalRegion(s), "shoulder", `${english} -> shoulder`);
  }
}
// Every other mesh keeps its manifest region; the exact set of corrected meshes
// is pinned so a rule change cannot silently move unrelated structures.
const expectedChanged = new Set([
  ...shoulderMuscles,
  ...nonSpinalNeckMuscles,
  ...alsoShoulder,
]);
const changed = atlasManifest.structures.filter(
  (s) => resolveClinicalRegion(s) !== s.clinicalRegion,
);
for (const s of changed) {
  assert.ok(expectedChanged.has(s.english), `unexpected change: ${s.english}`);
}
const tally = {};
for (const s of changed) {
  const key = `${s.clinicalRegion}->${resolveClinicalRegion(s)}`;
  tally[key] = (tally[key] ?? 0) + 1;
}
assert.deepEqual(tally, {
  "thoracic_core->shoulder": 34,
  "lumbar->shoulder": 2,
  "cervical->null": 25,
});
// The exporter must carry the same name rules so a future export agrees.
const { SHOULDER_GIRDLE_NAME_PATTERN, LARYNX_PHARYNX_MUSCLE_NAME_PATTERN } =
  await import("../src/lib/clinical/atlas-3d.ts");
const exporter = readFileSync(
  new URL("./export_z_anatomy.py", import.meta.url),
  "utf8",
);
for (const [name, pattern] of [
  ["SHOULDER_GIRDLE_NAME", SHOULDER_GIRDLE_NAME_PATTERN],
  ["LARYNX_PHARYNX_MUSCLE_NAME", LARYNX_PHARYNX_MUSCLE_NAME_PATTERN],
]) {
  assert.ok(
    exporter.includes(`${name} = r'${pattern.source}'`),
    `export_z_anatomy.py ${name} must match atlas-3d.ts`,
  );
}
console.log(
  "Evidence scope, source links, honest review/fiber status and surface-label visibility/occlusion checks passed.",
);
