import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { surfaceLabelPoint } from "../src/components/atlas3d/surface-label-layout.mjs";
import { createAppLoader } from "./lib/load-app-module.mjs";

function cameraFor(projection) {
  const camera = projection === "orthographic"
    ? new THREE.OrthographicCamera(-2, 2, 1.5, -1.5, 0.01, 100)
    : new THREE.PerspectiveCamera(50, 4 / 3, 0.01, 100);
  camera.position.set(0, 0, 4);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return camera;
}
function mesh(geometry) {
  const result = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  result.updateMatrixWorld(true);
  return result;
}
for (const projection of ["orthographic", "perspective"]) {
  test(`${projection}: selected curved muscle gets a real visible anchor even when its box center misses`, () => {
    const camera = cameraFor(projection);
    const ring = mesh(new THREE.TorusGeometry(0.7, 0.12, 12, 48));
    assert.equal(surfaceLabelPoint([ring], [ring], camera, 640, 480), null);
    const point = surfaceLabelPoint([ring], [ring], camera, 640, 480, { sampleSurface: true });
    assert.ok(point, "a visible curved structure must keep its selected label");
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(point.x / 320 - 1, 1 - point.y / 240), camera);
    assert.ok(ray.intersectObject(ring)[0].point.distanceTo(point.point) < 1e-6);
  });
  test(`${projection}: partly covered selection uses an exposed surface and fully covered selection stays hidden`, () => {
    const camera = cameraFor(projection);
    const own = mesh(new THREE.BoxGeometry(1, 1, 0.1));
    const cover = mesh(new THREE.BoxGeometry(0.8, 1.2, 0.1));
    cover.position.set(0.25, 0, 0.3);
    cover.updateMatrixWorld(true);
    const point = surfaceLabelPoint([own], [own, cover], camera, 640, 480, { sampleSurface: true });
    assert.ok(point, "use the uncovered part instead of dropping the selected name");
    assert.ok(point.point.x < -0.15);
    cover.scale.set(4, 4, 1);
    cover.updateMatrixWorld(true);
    assert.equal(surfaceLabelPoint([own], [own, cover], camera, 640, 480, { sampleSurface: true }), null);
  });
}

// Only DOM measurement is substituted; selection, raycasting and placement run as shipped.
class Element {
  hidden = false;
  style = {};
  dataset = {};
  children = [];
  attributes = {};
  offsetWidth = 180;
  offsetHeight = 52;
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener() {}
  removeEventListener() {}
  remove() {}
}
const load = createAppLoader({
  mocks: { three: THREE, "./surface-label-layout.mjs": { surfaceLabelPoint } },
  globals: { document: { createElement: () => new Element() } },
});
const { StructureCallouts } = load("src/components/atlas3d/structure-callouts.ts");
test("the selected curved structure owns the visible callout and pointer", () => {
  const host = new Element();
  const callouts = new StructureCallouts(host, () => {});
  const own = mesh(new THREE.TorusGeometry(0.7, 0.12, 12, 48));
  const structure = { id: "selected", english: "Acromial part of deltoid muscle", layer: "muscle" };
  callouts.update(true, "selected", [structure], new Map([["selected", [own]]]), cameraFor("orthographic"), 640, 480, []);
  const root = host.children[0];
  const label = root.children.find(child => child.dataset.structureId === "selected" && !child.hidden);
  assert.ok(label, "selected name must appear on the model, not only in the heading");
  assert.equal(label.attributes["aria-pressed"], "true");
  assert.ok(root.children.some(child => child.attributes["aria-hidden"] === "true" && !child.hidden), "visible pointer to the actual surface");
  callouts.update(false, "selected", [structure], new Map([["selected", [own]]]), cameraFor("orthographic"), 640, 480, []);
  assert.ok(root.children.every(child => child.hidden), "the label toggle still hides all callouts");
  callouts.dispose();
});

test("on narrow screens the selected label leaves its surface pointer uncovered", () => {
  const host = new Element();
  const callouts = new StructureCallouts(host, () => {});
  const own = mesh(new THREE.BoxGeometry(0.3, 0.3, 0.1));
  const structure = { id: "selected", english: "Acromial part of deltoid muscle", layer: "muscle" };
  callouts.update(true, "selected", [structure], new Map([["selected", [own]]]), cameraFor("orthographic"), 300, 480, []);
  const root = host.children[0];
  const label = root.children.find(child => child.dataset.structureId === "selected" && !child.hidden);
  assert.ok(label);
  const x = Number(label.style.cssText.match(/left:([\d.]+)px/)[1]);
  const y = Number(label.style.cssText.match(/top:([\d.]+)px/)[1]);
  assert.ok(!(150 >= x - 8 && 150 <= x + 180 + 8 && 240 >= y - 8 && 240 <= y + 52 + 8), "label must leave the anchor and connecting line visible even when neither side has room");
  callouts.dispose();
});

for (const projection of ["orthographic", "perspective"]) {
  test(`${projection}: anchors survive viewport resizing and transformed non-indexed source geometry`, () => {
    const camera = cameraFor(projection);
    const own = mesh(new THREE.TorusGeometry(0.7, 0.12, 12, 48).toNonIndexed());
    own.position.set(0.2, 0.1, 0);
    own.rotation.z = 0.3;
    own.scale.set(0.8, 1.1, 1);
    own.updateMatrixWorld(true);
    for (const [width, height] of [[640, 480], [300, 480]]) {
      const point = surfaceLabelPoint([own], [own], camera, width, height, { sampleSurface: true });
      assert.ok(point);
      assert.ok(point.x > 12 && point.x < width - 12);
      assert.ok(point.y > 24 && point.y < height - 12);
    }
    own.visible = false;
    assert.equal(surfaceLabelPoint([own], [own], camera, 300, 480, { sampleSurface: true }), null);
    own.visible = true;
    own.position.x = 100;
    own.updateMatrixWorld(true);
    assert.equal(surfaceLabelPoint([own], [own], camera, 300, 480, { sampleSurface: true }), null);
  });
}

test("a visible part can anchor the selected label even when its box center is outside view", () => {
  const own = mesh(new THREE.TorusGeometry(0.7, 0.12, 12, 48));
  own.position.x = 2.3;
  own.updateMatrixWorld(true);
  assert.ok(surfaceLabelPoint([own], [own], cameraFor("orthographic"), 640, 480, { sampleSurface: true }));
});
