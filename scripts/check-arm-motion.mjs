import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const motion = await import("../src/components/training/curl/arm-motion.ts");
const policy = await import("../src/components/training/curl/motion-policy.ts");
const info = JSON.parse(
  readFileSync("public/anatomy/3d/motion/cable-curl-left.json", "utf8"),
);

for (const [matrix, name] of [
  [motion.LEFT_ARM_MATRIX, "LeftArm"],
  [motion.LEFT_FOREARM_MATRIX, "LeftForeArm"],
]) {
  const source = info.rig.sourceRefs[name].matrix;
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      assert.equal(matrix[row][col], source[row][col]);
}

assert.equal(policy.phaseLabel(0.25), "Gập khuỷu");
function near(actual, expected) {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++) assert.ok(Math.abs(actual[i] - expected[i]) < 1e-6);
}
near(motion.gltfWorldAxis("forearm", [1, 0, 0], -1), [-1, 0, 0]);
near(motion.gltfWorldAxis("upper", [0, -1, 0], 1), [0, 0, 1]);
near(motion.gltfWorldAxis("upper", [1, 0, 0], 1), [1, 0, 0]);

for (const id of ["cable-lateral-raise", "overhead-cable-triceps"]) {
  for (const phase of [0, 0.25, 0.5, 0.75, 1, NaN]) {
    const swings = motion.poseSwings(id, phase);
    assert.equal(swings.length, 2);
    for (const swing of swings) {
      assert.ok(swing.bone === "upper" || swing.bone === "forearm");
      assert.ok(Number.isFinite(swing.degrees) && Math.abs(swing.degrees) <= 180);
      const len = Math.hypot(...swing.worldAxis);
      assert.ok(Math.abs(len - 1) < 1e-9);
    }
  }
  assert.equal(motion.armPhaseLabel(id, 0), "Bắt đầu");
  assert.equal(motion.armPhaseLabel(id, 0.5), "Chuyển pha");
  assert.equal(motion.armPhaseLabel(id, 1), "Kết thúc");
  assert.equal(motion.armPhaseLabel(id, NaN), "Bắt đầu");
}

assert.equal(motion.armPhaseLabel("cable-lateral-raise", 0.25), "Dạng vai");
assert.equal(motion.armPhaseLabel("cable-lateral-raise", 0.75), "Hạ có kiểm soát");
assert.equal(motion.armPhaseLabel("overhead-cable-triceps", 0.25), "Duỗi khuỷu");
assert.equal(
  motion.armPhaseLabel("overhead-cable-triceps", 0.75),
  "Gập lại có kiểm soát",
);
assert.equal(motion.poseSwings("cable-lateral-raise", 0)[0].degrees, 12);
assert.equal(motion.poseSwings("cable-lateral-raise", 0.5)[0].degrees, 75);
assert.equal(motion.poseSwings("overhead-cable-triceps", 0.5)[1].degrees, 25);
assert.equal(motion.poseSwings("overhead-cable-triceps", 0)[0].degrees, 150);
assert.equal(
  motion.armHighlights("cable-lateral-raise", "Acromial part of deltoid muscle"),
  true,
);
assert.equal(
  motion.armHighlights("cable-lateral-raise", "Lateral head of triceps brachii"),
  false,
);
assert.equal(
  motion.armHighlights("overhead-cable-triceps", "Long head of triceps brachii"),
  true,
);
assert.equal(motion.armMotionFor("bayesian-incline-curl"), null);
assert.equal(motion.armMotionFor("incline-db-press"), null);

const buf = readFileSync("public/anatomy/3d/motion/cable-curl-left.glb");
const gltf = await new GLTFLoader().parseAsync(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  "/anatomy/3d/motion/",
);
gltf.scene.updateMatrixWorld(true);
const bones = {};
gltf.scene.traverse((node) => {
  if (node.name === "upper" || node.name === "forearm") bones[node.name] = node;
});
const rest = {};
for (const name of motion.ARM_BONES) {
  rest[name] = {
    quaternion: bones[name].quaternion.clone(),
    rotation: new THREE.Matrix4().extractRotation(bones[name].matrixWorld),
  };
}
function place(name, degrees, worldAxis) {
  const local = new THREE.Vector3(...worldAxis).transformDirection(
    rest[name].rotation.clone().invert(),
  );
  const q = motion.poseQuaternion(
    rest[name].quaternion.toArray(),
    local.toArray(),
    degrees,
  );
  bones[name].quaternion.set(q[0], q[1], q[2], q[3]);
}
const world = motion.gltfWorldAxis("forearm", [1, 0, 0], -1);
const local = new THREE.Vector3(...world).transformDirection(
  rest.forearm.rotation.clone().invert(),
);
for (const [degrees, time] of [
  [10, 0],
  [60, 1.5],
  [110, 3],
]) {
  const expected = motion.poseQuaternion(
    rest.forearm.quaternion.toArray(),
    local.toArray(),
    degrees,
  );
  const mixer = new THREE.AnimationMixer(gltf.scene);
  mixer.clipAction(gltf.animations[0]).play();
  mixer.setTime(time);
  const got = bones.forearm.quaternion.toArray();
  for (let i = 0; i < 4; i++) assert.ok(Math.abs(expected[i] - got[i]) < 1e-3);
  mixer.stopAllAction();
  bones.forearm.quaternion.copy(rest.forearm.quaternion);
}

place("upper", 75, motion.gltfWorldAxis("upper", [0, -1, 0], 1));
place("forearm", 18, world);
gltf.scene.updateMatrixWorld(true);
const abducted = bones.forearm.getWorldPosition(new THREE.Vector3());
assert.ok(abducted.x > 0.35 && abducted.y > 1.25);

bones.upper.quaternion.copy(rest.upper.quaternion);
bones.forearm.quaternion.copy(rest.forearm.quaternion);
place("upper", 150, motion.gltfWorldAxis("upper", [1, 0, 0], 1));
place("forearm", 25, world);
gltf.scene.updateMatrixWorld(true);
const raised = bones.forearm.getWorldPosition(new THREE.Vector3());
assert.ok(raised.y > 1.55 && raised.x < 0.35);

console.log(
  "Arm motion: recorded axes, finite angles, phase labels, curl hinge and two display poses passed.",
);
