import type { TrainingRecord } from "@/lib/training-log";
import type {
  ExercisePrescription,
  LoadUnit,
  TrainingWorkout,
  WorkoutSet,
} from "./program";
import { localTrainingDate } from "./schedule";
import { calendarDate } from "./validation";

export type ProgressRange = { from: string | null; to: string | null };

export type ProgressSet = {
  workoutId: string;
  performedAt: string;
  exerciseId: string;
  name: string;
  setNumber: number;
  loadUnit: LoadUnit;
  reps: number | null;
  load: number | null;
};

export type ProgressRow = {
  workoutId: string;
  performedAt: string;
  sessionName: string;
  exerciseId: string;
  status: TrainingWorkout["status"];
  planned: ExercisePrescription;
  sets: ProgressSet[];
};

export type ProgressGroup = {
  key: string;
  name: string;
  catalogId: string | null;
  unit: LoadUnit;
  method: ExercisePrescription["method"];
  tempo: string;
  rows: ProgressRow[];
};

export type ProgressSummary = {
  completedWorkouts: number;
  inProgressWorkouts: number;
  confirmedSets: number;
  completedWorkoutSets: ProgressSet[];
  groups: ProgressGroup[];
};

function normalizeName(name: string) {
  return name
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("vi");
}

export function exerciseComparisonKey(
  exercise: ExercisePrescription,
  unit: LoadUnit,
) {
  const name = normalizeName(exercise.name);
  return JSON.stringify([
    exercise.exerciseId,
    name,
    unit,
    exercise.method,
    exercise.tempo.trim(),
  ]);
}

function inRange(date: string, { from, to }: ProgressRange) {
  return (from === null || date >= from) && (to === null || date <= to);
}

export function validateProgressRange({ from, to }: ProgressRange) {
  if (from !== null) calendarDate(from);
  if (to !== null) calendarDate(to);
  if (from !== null && to !== null && from > to) {
    throw new RangeError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
  }
}

export function quickProgressRange(
  weeks: 4 | 12,
  today = localTrainingDate(),
): ProgressRange {
  const [year, month, day] = calendarDate(today).split("-").map(Number);
  const start = new Date(0);
  start.setFullYear(year, month - 1, day);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  return { from: localTrainingDate(start), to: today };
}

export function filterLegacyProgress(
  records: readonly TrainingRecord[],
  range: ProgressRange,
) {
  validateProgressRange(range);
  return records
    .filter((record) => inRange(record.recorded_at, range))
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
}

function externalLoadForSet(
  set: Pick<WorkoutSet, "loadUnit" | "load" | "reps">,
) {
  const { load, reps, loadUnit } = set;
  if (loadUnit !== "kg" || load === null || reps === null) return null;
  if (!Number.isFinite(load) || !Number.isFinite(reps)) return null;
  return load * reps;
}

export function externalLoadRepetitions(
  sets: readonly Pick<WorkoutSet, "loadUnit" | "load" | "reps" | "completed">[],
) {
  return sets.reduce(
    (total, set) =>
      total + (set.completed ? (externalLoadForSet(set) ?? 0) : 0),
    0,
  );
}

export function externalLoadSummary(sets: readonly ProgressSet[]) {
  let measuredSets = 0;
  let total = 0;
  for (const set of sets) {
    const value = externalLoadForSet(set);
    if (value === null) continue;
    measuredSets++;
    total += value;
  }
  return { measuredSets, value: measuredSets ? total : null };
}

export function summarizeProgress(
  workouts: readonly TrainingWorkout[],
  range: ProgressRange,
): ProgressSummary {
  validateProgressRange(range);
  const summary: ProgressSummary = {
    completedWorkouts: 0,
    inProgressWorkouts: 0,
    confirmedSets: 0,
    completedWorkoutSets: [],
    groups: [],
  };
  const groups = new Map<string, ProgressGroup>();
  const ordered = workouts
    .filter((workout) => inRange(workout.performedAt, range))
    .sort(
      (a, b) =>
        b.performedAt.localeCompare(a.performedAt) || a.id.localeCompare(b.id),
    );

  for (const workout of ordered) {
    if (workout.status === "completed") summary.completedWorkouts++;
    else summary.inProgressWorkouts++;
    const exercises = new Map(
      workout.prescription.exercises.map((exercise) => [exercise.id, exercise]),
    );
    const rows = new Map<string, ProgressRow>();

    for (const set of workout.sets) {
      if (!set.completed) continue;
      summary.confirmedSets++;
      const exercise = exercises.get(set.exerciseId);
      if (!exercise) continue;
      const recorded: ProgressSet = {
        workoutId: workout.id,
        performedAt: workout.performedAt,
        exerciseId: exercise.id,
        name: exercise.name,
        setNumber: set.setNumber,
        loadUnit: set.loadUnit,
        reps: set.reps,
        load: set.load,
      };
      if (workout.status === "completed")
        summary.completedWorkoutSets.push(recorded);
      const key = exerciseComparisonKey(exercise, set.loadUnit);
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          name: exercise.name,
          catalogId: exercise.exerciseId,
          unit: set.loadUnit,
          method: exercise.method,
          tempo: exercise.tempo,
          rows: [],
        };
        groups.set(key, group);
      }
      const rowKey = JSON.stringify([key, exercise.id]);
      let row = rows.get(rowKey);
      if (!row) {
        row = {
          workoutId: workout.id,
          performedAt: workout.performedAt,
          sessionName: workout.prescription.name,
          exerciseId: exercise.id,
          status: workout.status,
          planned: exercise,
          sets: [],
        };
        rows.set(rowKey, row);
        group.rows.push(row);
      }
      row.sets.push(recorded);
    }
    for (const row of rows.values())
      row.sets.sort((a, b) => a.setNumber - b.setNumber);
  }
  summary.groups = Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "vi"),
  );
  return summary;
}

export const progressNumber = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

export function progressDate(date: string) {
  return date.split("-").reverse().join("/");
}

export function rowChartValue(row: ProgressRow, unit: ProgressGroup["unit"]) {
  if (row.status !== "completed") return null;
  if (unit === "kg") {
    const { value, measuredSets } = externalLoadSummary(row.sets);
    return measuredSets === row.sets.length ? value : null;
  }
  if (
    unit === "bodyweight" &&
    row.sets.every((set) => set.reps !== null && Number.isFinite(set.reps))
  ) {
    return row.sets.reduce((total, set) => total + (set.reps ?? 0), 0);
  }
  return null;
}
