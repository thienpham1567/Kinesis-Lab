import assert from "node:assert/strict";
import * as THREE from "three";
import { TissueStudyResources } from "../src/components/atlas3d/tissue-study-resources.ts";
import { createTissueMaterial } from "../src/components/atlas3d/tissue-materials.ts";
let requests = [];
const resource = new TissueStudyResources(
  () => {},
  (load, error, url) => requests.push({ load, error, url }),
);
resource.setEnabled(true);
resource.setEnabled(true);
assert.equal(
  requests.length,
  5,
  "one shared atomic batch must include albedo plus four independent data maps",
);
const textures = requests.map(() => new THREE.Texture());
let disposed = textures.map(() => 0);
textures.forEach((t, i) => t.addEventListener("dispose", () => disposed[i]++));
requests.slice(0, 4).forEach((r, i) => r.load(textures[i]));
assert.equal(
  resource.status,
  "loading",
  "partial batch must not enable mixed/fallback maps",
);
assert.equal(resource.uniforms.studyEnabled.value, 0);
requests[4].load(textures[4]);
assert.equal(resource.status, "ready");
assert.equal(resource.uniforms.studyEnabled.value, 1);
for (let i = 1; i < 5; i++) {
  assert.equal(
    textures[i].flipY,
    false,
    "packed gradients must preserve authored row direction",
  );
  assert.equal(textures[i].colorSpace, THREE.NoColorSpace);
  assert.equal(textures[i].wrapS, THREE.RepeatWrapping);
  assert.equal(textures[i].minFilter, THREE.LinearMipmapLinearFilter);
}
for (const kind of ["muscle", "tendon", "bone", "cartilage"]) {
  const material = createTissueMaterial(kind, true, resource.uniforms);
  const shader = {
    uniforms: {},
    vertexShader: THREE.ShaderLib.physical.vertexShader,
    fragmentShader: THREE.ShaderLib.physical.fragmentShader,
  };
  material.onBeforeCompile(shader);
  assert.equal(
    shader.uniforms.studyDetail,
    resource.uniforms["studyDetail" + kind[0].toUpperCase() + kind.slice(1)],
  );
  assert.ok(shader.fragmentShader.includes("textureGrad("));
  assert.ok(shader.fragmentShader.includes("studySurfaceGradient"));
  assert.ok(shader.fragmentShader.includes("studyNormalVariance"));
  assert.ok(
    !shader.fragmentShader.includes("float h = dot(surface"),
    "normal detail must not be inferred from red albedo",
  );
  material.dispose();
}
resource.dispose();
assert.deepEqual(disposed, [1, 1, 1, 1, 1]);
requests = [];
const failed = new TissueStudyResources(
  () => {},
  (load, error, url) => requests.push({ load, error, url }),
);
failed.setEnabled(true);
let freed = 0;
const partial = new THREE.Texture();
partial.addEventListener("dispose", () => freed++);
requests[1].load(partial);
requests[2].error();
assert.equal(failed.status, "fallback");
assert.equal(freed, 1);
assert.equal(failed.uniforms.studyEnabled.value, 0);
const late = new THREE.Texture();
late.addEventListener("dispose", () => freed++);
requests[3].load(late);
assert.equal(freed, 2, "late success from failed batch is disposed");
failed.retry();
assert.equal(requests.length, 10);
failed.dispose();
for (const r of requests.slice(5)) {
  const t = new THREE.Texture();
  t.addEventListener("dispose", () => freed++);
  r.load(t);
}
assert.equal(freed, 7, "all late arrivals after unmount are disposed");
console.log(
  "Independent tissue maps, atomic batch and filtered shader checks passed.",
);

const { default: sharp } = await import("sharp");
const { readFileSync } = await import("node:fs");
const { createHash } = await import("node:crypto");
const { heightField, roughnessField } =
  await import("./tissue-detail-fields.mjs");
const metadata = JSON.parse(
  readFileSync(
    new URL("../public/anatomy/3d/textures/DETAIL-MAPS.json", import.meta.url),
  ),
);
let transfer = 0;
const unique = new Set();
for (const map of metadata.maps) {
  const bytes = readFileSync(
    new URL("../public/anatomy/3d/textures/" + map.file, import.meta.url),
  );
  transfer += bytes.length;
  assert.equal(createHash("sha256").update(bytes).digest("hex"), map.sha256);
  unique.add(map.sha256);
  const { data, info } = await sharp(bytes)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 4);
  for (let i = 0; i < data.length; i += 4) {
    const x = (data[i] / 255) * 2 - 1,
      y = (data[i + 1] / 255) * 2 - 1,
      z = (data[i + 3] / 255) * 2 - 1;
    assert.ok(Math.abs(Math.hypot(x, y, z) - 1) < 0.015);
    assert.ok(
      Math.hypot(x, y) <
        { muscle: 0.12, tendon: 0.15, bone: 0.12, cartilage: 0.025 }[map.kind],
      map.kind + ": cosmetic normal slope must stay restrained",
    );
    assert.ok(data[i + 2] / 255 > 0.15 && data[i + 2] / 255 < 0.85);
  }
  for (const [u, v] of [
    [0, 0.123],
    [0.999, 0.456],
    [0.372, 0.99],
  ]) {
    assert.ok(
      Math.abs(heightField(map.kind, u, v) - heightField(map.kind, u + 1, v)) <
        1e-10,
    );
    assert.ok(
      Math.abs(heightField(map.kind, u, v) - heightField(map.kind, u, v + 1)) <
        1e-10,
    );
    assert.ok(
      Math.abs(
        roughnessField(map.kind, u, v) - roughnessField(map.kind, u + 1, v + 1),
      ) < 1e-10,
    );
  }
}
assert.equal(unique.size, 4);
assert.ok(transfer < 600 * 1024);
console.log(
  "Packed-map hashes, independent families, periodic fields, finite unit normals and transfer budget checks passed.",
);
const { findSurfaceFocus } =
  await import("../src/components/atlas3d/surface-focus.mjs");
const eye = new THREE.Vector3(0, 0, 3);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial(),
);
box.updateMatrixWorld(true);
const before = box.geometry.attributes.position.array.slice();
let focus = findSurfaceFocus([box], eye);
assert.ok(focus);
assert.ok(Math.abs(focus.target.z - 0.5) < 1e-6);
assert.ok(Math.abs(focus.position.distanceTo(focus.target) - 0.06) < 1e-6);
assert.deepEqual(
  box.geometry.attributes.position.array,
  before,
  "surface focus cannot deform source mesh",
);
box.visible = false;
assert.equal(findSurfaceFocus([box], eye), null);
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.4, 0.05, 8, 32),
  new THREE.MeshBasicMaterial(),
);
ring.updateMatrixWorld(true);
focus = findSurfaceFocus([ring], eye);
assert.ok(focus, "surface focus handles a hole at the bounding-box center");
assert.ok(focus.target.length() > 0.3);
box.geometry.dispose();
box.material.dispose();
ring.geometry.dispose();
ring.material.dispose();
console.log(
  "Surface focus checks passed: real hit, close distance, unchanged geometry, hidden meshes and hollow shape.",
);
