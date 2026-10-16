import assert from "node:assert/strict";
import * as THREE from "three";
import {
  isHipStudyStructure,
  HIP_STUDY_SAMPLES,
} from "../src/components/atlas3d/hip-material-policy.ts";
import { TissueStudyResources } from "../src/components/atlas3d/tissue-study-resources.ts";
import {
  createTissueMaterial,
  setTissueStudy,
  scatteringWeight,
} from "../src/components/atlas3d/tissue-materials.ts";

assert.equal(isHipStudyStructure("za-98cfd2e47395"), true);
assert.equal(isHipStudyStructure("za-cc11824f98a0"), true);
assert.equal(
  isHipStudyStructure("za-98e8733790d1"),
  false,
  "gluteus maximus stays on original materials",
);
assert.equal(HIP_STUDY_SAMPLES.muscle.ids.length, 1);
assert.equal(HIP_STUDY_SAMPLES.joint.ids.length, 3);
assert.ok(
  HIP_STUDY_SAMPLES.joint.ids.includes(HIP_STUDY_SAMPLES.joint.selectedId),
);

let requests = [];
const statuses = [];
const resources = new TissueStudyResources(
  (status) => statuses.push(status),
  (load, error) => requests.push({ load, error }),
);
assert.equal(requests.length, 0, "disabled study does not load textures");
resources.setEnabled(true);
resources.setEnabled(true);
assert.equal(
  requests.length,
  1,
  "one in-flight request shared by all study meshes",
);
assert.equal(
  resources.uniforms.studyEnabled.value,
  0,
  "original materials while texture loads",
);
resources.setEnabled(false);
const tex = new THREE.Texture();
let disposed = 0;
tex.addEventListener("dispose", () => disposed++);
requests[0].load(tex);
assert.equal(
  resources.uniforms.studyEnabled.value,
  0,
  "late loaded texture does not enable a disabled study",
);
resources.setEnabled(true);
assert.equal(resources.uniforms.studyEnabled.value, 1);
assert.equal(resources.uniforms.studyAlbedo.value, tex);
assert.equal(tex.colorSpace, THREE.SRGBColorSpace);
assert.equal(tex.wrapS, THREE.MirroredRepeatWrapping);

const material = createTissueMaterial("muscle", true, resources.uniforms);
const originalRoughness = material.roughness;
setTissueStudy(material, "muscle", true);
assert.ok(material.roughness < originalRoughness);
assert.ok(material.clearcoat > 0);
setTissueStudy(material, "muscle", false);
assert.equal(material.roughness, originalRoughness);
assert.equal(material.clearcoat, 0);
assert.equal(scatteringWeight(0.01, 0, 1), 0);
assert.equal(scatteringWeight(0.01, 1, 0.5), 0);
assert.equal(scatteringWeight(0, 1, 1), 0);
assert.ok(scatteringWeight(0.002, 1, 1) > scatteringWeight(0.05, 1, 1));
const shader = {
  uniforms: {},
  vertexShader: THREE.ShaderLib.physical.vertexShader,
  fragmentShader: THREE.ShaderLib.physical.fragmentShader,
};
material.onBeforeCompile(shader);
assert.ok(shader.fragmentShader.includes("studyAlbedo"));
assert.ok(shader.fragmentShader.includes("studyScattering"));
assert.ok(shader.fragmentShader.includes("opacity >= 0.999"));
assert.ok(
  shader.fragmentShader.indexOf("vThicknessValid < 0.999") >
    shader.fragmentShader.indexOf("studyScattering"),
  "heatmap overrides simulated lighting",
);
assert.notEqual(
  material.customProgramCacheKey(),
  createTissueMaterial("muscle", true).customProgramCacheKey(),
);
const tendon = createTissueMaterial("tendon", true, resources.uniforms);
const tendonShader = {
  uniforms: {},
  vertexShader: THREE.ShaderLib.physical.vertexShader,
  fragmentShader: THREE.ShaderLib.physical.fragmentShader,
};
tendon.onBeforeCompile(tendonShader);
assert.ok(
  !tendonShader.fragmentShader.includes("void studyScattering"),
  "no muscle scattering on tendon",
);
resources.dispose();
assert.equal(disposed, 1);
let late;
const pending = new TissueStudyResources(
  () => {},
  (load) => (late = load),
);
pending.setEnabled(true);
pending.dispose();
const lateTex = new THREE.Texture();
let lateDisposal = 0;
lateTex.addEventListener("dispose", () => lateDisposal++);
late(lateTex);
assert.equal(lateDisposal, 1, "texture arriving after unmount is disposed");
const fallback = new TissueStudyResources(
  () => {},
  (load, error) => {
    requests.push({ load, error });
  },
);
fallback.setEnabled(true);
requests.at(-1).error();
assert.equal(fallback.status, "fallback");
assert.equal(fallback.uniforms.studyEnabled.value, 0);
fallback.retry();
assert.equal(fallback.status, "loading");
fallback.dispose();
material.dispose();
tendon.dispose();
console.log(
  "Hip material study checks passed: eligibility, sample policy, texture ownership, profile restore, scattering and heatmap priority.",
);

const { readFileSync } = await import("node:fs");
const { createHash } = await import("node:crypto");
const manifest = JSON.parse(
  readFileSync(new URL("../public/anatomy/3d/manifest.json", import.meta.url)),
);
assert.equal(
  manifest.structures.filter((s) => isHipStudyStructure(s.id)).length,
  8,
);
const provenance = JSON.parse(
  readFileSync(
    new URL("../public/anatomy/3d/textures/PROVENANCE.json", import.meta.url),
  ),
);
const asset = readFileSync(
  new URL(
    "../public/anatomy/3d/textures/muscle-simulated-v1.webp",
    import.meta.url,
  ),
);
assert.equal(
  createHash("sha256").update(asset).digest("hex"),
  provenance.sha256,
);
assert.equal(provenance.photographic, false);
assert.equal(provenance.measuredAnatomicalData, false);
assert.ok(
  asset.length < 256 * 1024,
  "prototype texture transfer stays below 256KB",
);
console.log(
  "Texture provenance, eight-structure scope and transfer budget checks passed.",
);
