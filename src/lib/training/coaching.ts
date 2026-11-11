import type {
  ExercisePrescription,
  ProgramSession,
  WorkoutSet,
} from "./program";

export type RestClock =
  | { state: "idle" }
  | { state: "running"; endsAtMs: number }
  | { state: "paused"; remainingMs: number };

export function remainingRestSeconds(clock: RestClock, nowMs: number) {
  if (clock.state === "idle") return 0;
  const remainingMs =
    clock.state === "paused" ? clock.remainingMs : clock.endsAtMs - nowMs;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function workoutSetsForExercise(
  exercise: ExercisePrescription,
  sets: WorkoutSet[],
): WorkoutSet[] {
  const recorded = sets.filter((set) => set.exerciseId === exercise.id);
  const results = new Map(recorded.map((set) => [set.setNumber, set]));
  const actualUnit = recorded[0]?.loadUnit;
  const defaultUnit =
    actualUnit && recorded.every((set) => set.loadUnit === actualUnit)
      ? actualUnit
      : exercise.loadUnit;
  return Array.from({ length: exercise.sets }, (_, index) => {
    const setNumber = index + 1;
    return (
      results.get(setNumber) ?? {
        exerciseId: exercise.id,
        setNumber,
        reps: null,
        load: null,
        loadUnit: defaultUnit,
        completed: false,
      }
    );
  });
}

export function mergeWorkoutSets(sets: WorkoutSet[], changes: WorkoutSet[]) {
  const key = (set: WorkoutSet) => `${set.exerciseId}:${set.setNumber}`;
  const pending = new Map(changes.map((set) => [key(set), set]));
  const merged = sets.map((set) => {
    const id = key(set);
    const replacement = pending.get(id);
    pending.delete(id);
    return replacement ?? set;
  });
  return [...merged, ...pending.values()];
}

export function nextIncompleteSet(session: ProgramSession, sets: WorkoutSet[]) {
  for (const exercise of session.exercises) {
    const set = workoutSetsForExercise(exercise, sets).find(
      (result) =>
        !result.completed ||
        result.reps === null ||
        (result.loadUnit !== "bodyweight" && result.load === null),
    );
    if (set) return { exerciseId: set.exerciseId, setNumber: set.setNumber };
  }
  return null;
}
