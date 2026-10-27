import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createTissueMaterial,
  setTissueOpacity,
  setTissueSelection,
} from "../src/components/atlas3d/tissue-materials.ts";
import {
  resolveRenderQuality,
  shouldUseOcclusion,
} from "../src/components/atlas3d/render-policy.ts";

assert.equal(
  resolveRenderQuality("auto", { width: 390, coarsePointer: false }),
  "fast",
  "a narrow viewport must not default to expensive passes",
);
assert.equal(
  resolveRenderQuality("auto", { width: 1440, coarsePointer: true }),
  "fast",
  "large touch devices keep the conservative default",
);
assert.equal(
  resolveRenderQuality("auto", { width: 1440, coarsePointer: false }),
  "detailed",
);
assert.equal(
  resolveRenderQuality("detailed", { width: 390, coarsePointer: true }),
  "detailed",
  "an explicit choice overrides automatic device policy",
);
assert.equal(
  resolveRenderQuality("fast", { width: 1440, coarsePointer: false }),
  "fast",
);
assert.equal(
  shouldUseOcclusion("detailed", true, 0.4),
  false,
  "transparent muscles must not write opaque AO silhouettes",
);
assert.equal(
  shouldUseOcclusion("detailed", false, 0.4),
  true,
  "hidden muscles must not disable bone/joint AO",
);
assert.equal(shouldUseOcclusion("detailed", true, 1), true);
assert.equal(shouldUseOcclusion("fast", true, 1), false);
console.log("Atlas rendering policy checks passed (9 assertions).");

const defaultMaterial = createTissueMaterial("muscle");
assert.equal(defaultMaterial.side, THREE.FrontSide, "unspecified source side retains the front-side default");
defaultMaterial.dispose();
for (const side of [THREE.DoubleSide, THREE.BackSide, THREE.FrontSide]) {
  const material = createTissueMaterial("muscle", false, undefined, side);
  assert.equal(material.side, side, `replacement preserves source side ${side}`);
  setTissueSelection(material, "muscle", true);
  assert.equal(material.side, side, "selection preserves source side");
  setTissueOpacity(material, 0.5);
  assert.equal(material.side, side, "transparency preserves source side");
  setTissueSelection(material, "muscle", false);
  assert.equal(material.side, side, "clearing selection preserves source side");
  setTissueOpacity(material, 1);
  assert.equal(material.side, side, "restoring opacity preserves source side");
  material.dispose();
}
console.log("Source material sidedness lifecycle checks passed (16 assertions).");

const muscle = createTissueMaterial("muscle");
const originalVersion = muscle.version;
setTissueOpacity(muscle, 0.5);
assert.equal(muscle.transparent, true);
assert.equal(muscle.opacity, 0.5);
assert.equal(muscle.depthWrite, false);
assert.ok(
  muscle.version > originalVersion,
  "opacity mode change recompiles the opaque shader",
);
const transparentVersion = muscle.version;
setTissueOpacity(muscle, 0.3);
assert.equal(
  muscle.version,
  transparentVersion,
  "moving within transparent mode avoids shader rebuilds",
);
setTissueOpacity(muscle, 1);
assert.equal(muscle.transparent, false);
assert.equal(muscle.depthWrite, true);
assert.ok(
  muscle.version > transparentVersion,
  "restoring opaque mode also rebuilds the shader",
);
muscle.dispose();
console.log("Tissue transparency lifecycle checks passed (8 assertions).");

const { surfaceKind, setThicknessView, TISSUE_COLORS, SELECTION_COLOR } =
  await import('../src/components/atlas3d/tissue-materials.ts');
assert.equal(surfaceKind('Kinesis_tendon', 'muscle'), 'tendon');
assert.equal(surfaceKind('Kinesis_cartilage', 'bone'), 'cartilage');
assert.equal(surfaceKind('unrecognized', 'joint'), 'joint');
const tendon = createTissueMaterial('tendon', true);
setTissueSelection(tendon, 'tendon', true);
setTissueSelection(tendon, 'tendon', false);
assert.equal(tendon.color.getHex(), TISSUE_COLORS.tendon);
assert.equal(tendon.emissiveIntensity, 0);
for (const kind of Object.keys(TISSUE_COLORS)) {
  const material = createTissueMaterial(kind);
  setTissueSelection(material, kind, true);
  const { r, g, b } = material.color;
  assert.ok(b > r && b > g, `selected ${kind} reads as blue`);
  assert.ok(material.emissiveIntensity > 0, `selected ${kind} glows`);
  material.dispose();
}
const searchMuscle = createTissueMaterial('muscle');
setTissueSelection(searchMuscle, 'muscle', true, 1);
assert.equal(searchMuscle.color.getHex(), SELECTION_COLOR, 'searched muscle uses full cobalt for visibility');
setTissueSelection(searchMuscle, 'muscle', false);
assert.equal(searchMuscle.color.getHex(), TISSUE_COLORS.muscle, 'clearing search restores tissue colour');
searchMuscle.dispose();
setThicknessView(tendon, true);
assert.equal(tendon.userData.thicknessUniform.value, 1);
setThicknessView(tendon, false);
assert.equal(tendon.userData.thicknessUniform.value, 0);
assert.notEqual(tendon.customProgramCacheKey(), muscle.customProgramCacheKey());
const shader = { vertexShader: '#include <common>\n#include <begin_vertex>',
 fragmentShader: '#include <common>\n#include <roughnessmap_fragment>\n#include <opaque_fragment>', uniforms: {} };
tendon.onBeforeCompile(shader);
assert.ok(shader.vertexShader.includes('attribute float _thickness;'));
assert.ok(shader.fragmentShader.includes('vThicknessValid < 0.999'));
assert.equal(shader.uniforms.thicknessView, tendon.userData.thicknessUniform);
tendon.dispose();
console.log('Source tissue families and thickness shader checks passed (11 assertions + selection per tissue).');
