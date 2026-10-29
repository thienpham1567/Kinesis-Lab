export const ARM_BONES = ["upper", "forearm"] as const;
export type ArmBone = (typeof ARM_BONES)[number];
export type ArmExerciseId = "cable-lateral-raise" | "overhead-cable-triceps";

type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

export const LEFT_ARM_MATRIX: Matrix3 = [
  [-0.984110414981842, 0.17754477262496948, -0.0021150708198547363],
  [0.00862845778465271, 0.03592140972614288, -0.9993173480033875],
  [-0.17734766006469727, -0.9834569096565247, -0.03688269853591919],
];

export const LEFT_FOREARM_MATRIX: Matrix3 = [
  [0.008938606828451157, 0.13895805180072784, 0.9902578592300415],
  [-0.9814861416816711, -0.18825654685497284, 0.035276468843221664],
  [0.1913243681192398, -0.9722399115562439, 0.134702667593956],
];

type Swing = {
  bone: ArmBone;
  armatureAxis: readonly [number, number, number];
  sign: 1 | -1;
  fromDegrees: number;
  toDegrees: number;
};

type ArmMotion = {
  title: string;
  eyebrow: string;
  going: string;
  returning: string;
  marker: string;
  pattern: RegExp;
  swings: readonly Swing[];
};

const MOTIONS: Record<ArmExerciseId, ArmMotion> = {
  "cable-lateral-raise": {
    title: "Dạng vai — tham chiếu nâng vai ngang",
    eyebrow: "Mô phỏng dạng vai · Chuyển động được dựng",
    going: "Dạng vai",
    returning: "Hạ có kiểm soát",
    marker: "Đánh dấu cơ delta",
    pattern: /deltoid/i,
    swings: [
      {
        bone: "upper",
        armatureAxis: [0, -1, 0],
        sign: 1,
        fromDegrees: 12,
        toDegrees: 75,
      },
      {
        bone: "forearm",
        armatureAxis: [1, 0, 0],
        sign: -1,
        fromDegrees: 18,
        toDegrees: 18,
      },
    ],
  },
  "overhead-cable-triceps": {
    title: "Duỗi khuỷu — tham chiếu cáp qua đầu",
    eyebrow: "Mô phỏng duỗi khuỷu · Chuyển động được dựng",
    going: "Duỗi khuỷu",
    returning: "Gập lại có kiểm soát",
    marker: "Đánh dấu cơ tam đầu",
    pattern: /triceps brachii/i,
    swings: [
      {
        bone: "upper",
        armatureAxis: [1, 0, 0],
        sign: 1,
        fromDegrees: 150,
        toDegrees: 150,
      },
      {
        bone: "forearm",
        armatureAxis: [1, 0, 0],
        sign: -1,
        fromDegrees: 105,
        toDegrees: 25,
      },
    ],
  },
};

export function armMotionFor(id: string) {
  if (id === "cable-lateral-raise" || id === "overhead-cable-triceps")
    return MOTIONS[id];
  return null;
}

export function boneLocalAxis(
  matrix: Matrix3,
  armatureAxis: readonly [number, number, number],
): [number, number, number] {
  const x =
    matrix[0][0] * armatureAxis[0] +
    matrix[1][0] * armatureAxis[1] +
    matrix[2][0] * armatureAxis[2];
  const y =
    matrix[0][1] * armatureAxis[0] +
    matrix[1][1] * armatureAxis[1] +
    matrix[2][1] * armatureAxis[2];
  const z =
    matrix[0][2] * armatureAxis[0] +
    matrix[1][2] * armatureAxis[1] +
    matrix[2][2] * armatureAxis[2];
  const len = Math.hypot(x, y, z);
  if (!(len > 1e-8) || !Number.isFinite(len))
    throw new Error("Trục xoay không xác định.");
  return [x / len, y / len, z / len];
}

export function gltfWorldAxis(
  bone: ArmBone,
  armatureAxis: readonly [number, number, number],
  sign: 1 | -1,
): [number, number, number] {
  const matrix = bone === "upper" ? LEFT_ARM_MATRIX : LEFT_FOREARM_MATRIX;
  const local = boneLocalAxis(matrix, armatureAxis);
  let x = 0;
  let y = 0;
  let z = 0;
  for (let col = 0; col < 3; col++) {
    x += matrix[0][col] * local[col];
    y += matrix[1][col] * local[col];
    z += matrix[2][col] * local[col];
  }
  const len = Math.hypot(x, y, z);
  if (!(len > 1e-8)) throw new Error("Trục xoay không xác định.");
  return [(sign * x) / len, (sign * z) / len, (sign * -y) / len];
}

function clampPhase(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function displayAngle(from: number, to: number, phase: number) {
  if (!Number.isFinite(from) || !Number.isFinite(to))
    throw new Error("Góc hiển thị không hữu hạn.");
  const lift = (1 - Math.cos(2 * Math.PI * clampPhase(phase))) / 2;
  return from + (to - from) * lift;
}

export function displayPhaseLabel(
  phase: number,
  going: string,
  returning: string,
) {
  const p = clampPhase(phase);
  if (p === 0) return "Bắt đầu";
  if (p === 1) return "Kết thúc";
  if (p === 0.5) return "Chuyển pha";
  return p < 0.5 ? going : returning;
}

export function armPhaseLabel(id: ArmExerciseId, phase: number) {
  const motion = MOTIONS[id];
  return displayPhaseLabel(phase, motion.going, motion.returning);
}

export function armHighlights(id: ArmExerciseId, english: string) {
  return MOTIONS[id].pattern.test(english);
}

export function authoredRange(id: ArmExerciseId): [number, number] {
  const swing =
    MOTIONS[id].swings.find((item) => item.fromDegrees !== item.toDegrees) ??
    MOTIONS[id].swings[0];
  return [
    Math.min(swing.fromDegrees, swing.toDegrees),
    Math.max(swing.fromDegrees, swing.toDegrees),
  ];
}

export function poseSwings(id: ArmExerciseId, phase: number) {
  return MOTIONS[id].swings.map((swing) => ({
    bone: swing.bone,
    worldAxis: gltfWorldAxis(swing.bone, swing.armatureAxis, swing.sign),
    degrees: displayAngle(swing.fromDegrees, swing.toDegrees, phase),
  }));
}

export function poseQuaternion(
  rest: readonly [number, number, number, number],
  axis: readonly [number, number, number],
  degrees: number,
): [number, number, number, number] {
  const len = Math.hypot(axis[0], axis[1], axis[2]);
  if (!(len > 1e-8) || !Number.isFinite(degrees))
    throw new Error("Góc hiển thị không hữu hạn.");
  const half = (degrees * Math.PI) / 360;
  const s = Math.sin(half);
  const x = (axis[0] / len) * s;
  const y = (axis[1] / len) * s;
  const z = (axis[2] / len) * s;
  const w = Math.cos(half);
  const [rx, ry, rz, rw] = rest;
  return [
    rw * x + rx * w + ry * z - rz * y,
    rw * y - rx * z + ry * w + rz * x,
    rw * z + rx * y - ry * x + rz * w,
    rw * w - rx * x - ry * y - rz * z,
  ];
}
