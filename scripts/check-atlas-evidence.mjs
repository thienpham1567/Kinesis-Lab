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
console.log(
  "Evidence scope, source links, honest review/fiber status and surface-label visibility/occlusion checks passed.",
);
