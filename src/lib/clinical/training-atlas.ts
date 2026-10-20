import type {
  HypertrophyExercise,
  MuscleGroupAtlas,
  MuscleGroupId,
} from "./muscle-hypertrophy-atlas";
import type { AtlasStructure } from "./atlas-3d";
export const TRAINING_ROLE_LABELS = {
  primary: "Chủ vận chính",
  synergist: "Đồng vận",
  stabilizer: "Ổn định",
} as const;
export type TrainingMode = "exercise" | "muscle";
const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
export function filterTrainingExercises(
  exercises: HypertrophyExercise[],
  query: string,
  pattern: string,
) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return exercises.filter(
    (e) =>
      (pattern === "all" || e.pattern === pattern) &&
      terms.every((t) =>
        normalize(`${e.name} ${e.vietnameseName} ${e.equipment}`).includes(t),
      ),
  );
}
export function exercisesForMuscle(
  exercises: HypertrophyExercise[],
  muscleId: MuscleGroupId,
) {
  const order = { primary: 0, synergist: 1, stabilizer: 2 };
  return exercises
    .filter((e) => e.targets.some((t) => t.muscleId === muscleId))
    .sort(
      (a, b) =>
        order[a.targets.find((t) => t.muscleId === muscleId)!.role] -
        order[b.targets.find((t) => t.muscleId === muscleId)!.role],
    );
}
export function resolveTrainingSelection(
  exercises: HypertrophyExercise[],
  muscles: MuscleGroupAtlas[],
  input: {
    exerciseId?: string | null;
    muscleId?: string | null;
    mode?: string | null;
  },
) {
  const exercise =
    exercises.find((e) => e.id === input.exerciseId) ?? exercises[0];
  const muscle =
    muscles.find((m) => m.id === input.muscleId) ??
    muscles.find(
      (m) =>
        m.id === exercise.targets.find((t) => t.role === "primary")?.muscleId,
    ) ??
    muscles[0];
  const mode: TrainingMode =
    input.mode === "muscle" ||
    (!input.exerciseId && muscles.some((m) => m.id === input.muscleId))
      ? "muscle"
      : "exercise";
  return { exercise, muscle, mode };
}
export function trainingHref(mode: TrainingMode, id: string) {
  const q = new URLSearchParams({
    tab: "hypertrophy",
    [mode === "exercise" ? "exercise" : "muscle"]: id,
  });
  return `/atlas?${q}`;
}
export function atlasGroupHref(id: MuscleGroupId) {
  const area =
    id === "glutes"
      ? "hip"
      : ["quads_adductors", "hamstrings", "calves"].includes(id)
        ? "lower"
        : ["abs_obliques", "lats_teres", "upper_back_traps"].includes(id)
          ? "trunk"
          : "upper";
  return `/atlas?${new URLSearchParams({ area, group: id })}`;
}
// Conservative, explicit memberships for teaching links. Legacy catalog regexes
// include thumb/toe adductors and unrelated lower-leg muscles; never trust them
// to select a thigh/calf teaching card. These are app groupings, not activity maps.
const GROUP_MEMBERS: Array<[MuscleGroupId, RegExp]> = [
  ["chest", /\bpectoralis major\b|\bserratus anterior\b/i],
  ["lats_teres", /\blatissimus dorsi\b|\bteres major\b/i],
  [
    "upper_back_traps",
    /\btrapezius\b|\brhomboid\b|\biliocostalis\b|\blongissimus\b|\bspinalis\b/i,
  ],
  ["deltoids", /\bdeltoid\b/i],
  ["biceps_forearm", /\bbiceps brachii\b|\bbrachialis\b|\bbrachioradialis\b/i],
  ["triceps", /\btriceps brachii\b/i],
  [
    "abs_obliques",
    /\brectus abdominis\b|\btransversus abdominis\b|\b(?:external|internal)(?: abdominal)? oblique\b/i,
  ],
  ["glutes", /\bgluteus (?:maximus|medius|minimus)\b/i],
  [
    "quads_adductors",
    /\brectus femoris\b|\bvastus (?:intermedius|lateralis|medialis)\b|\badductor (?:brevis|longus|magnus|minimus)\b|\bgracilis\b/i,
  ],
  ["hamstrings", /\bbiceps femoris\b|\bsemimembranosus\b|\bsemitendinosus\b/i],
  ["calves", /\bgastrocnemius\b|\bsoleus\b/i],
];
export function trainingGroupForStructure(
  structure: Pick<AtlasStructure, "english" | "layer">,
): MuscleGroupId | null {
  return structure.layer === "muscle"
    ? (GROUP_MEMBERS.find(([, pattern]) =>
        pattern.test(structure.english),
      )?.[0] ?? null)
    : null;
}
export function matchingGroupStructures<
  T extends Pick<AtlasStructure, "english" | "layer">,
>(structures: T[], group: string) {
  return structures.filter((s) => trainingGroupForStructure(s) === group);
}
