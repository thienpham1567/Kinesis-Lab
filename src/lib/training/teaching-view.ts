import { getExerciseInstruction } from "@/lib/clinical/exercise-instructions";
import { HYPERTROPHY_EXERCISES } from "@/lib/clinical/muscle-hypertrophy-atlas";
import type {
  ExercisePrescription,
  ProgramSession,
  TrainingWorkout,
} from "./program";

export type TeachingOrigin =
  | { kind: "exercise"; exerciseId: string; instructionVersion: number }
  | { kind: "plan"; planId: string; revision: number; sessionId: string }
  | {
      kind: "workout";
      workoutId: string;
      planId: string;
      sessionId: string;
      performedAt: string;
    };

type SessionOrigin = Exclude<TeachingOrigin, { kind: "exercise" }>;
type TeachingPrescription = Pick<
  ExercisePrescription,
  | "sets"
  | "repMin"
  | "repMax"
  | "load"
  | "loadUnit"
  | "restSeconds"
  | "rir"
  | "tempo"
  | "method"
  | "supersetGroup"
>;
export type TeachingExercise = {
  id: string;
  name: string;
  exerciseId: string | null;
  planned: TeachingPrescription | null;
};
export type TeachingView = {
  origin: TeachingOrigin;
  title: string;
  exercises: TeachingExercise[];
  personalReminder: string;
};

export function createSessionTeachingView(
  origin: SessionOrigin,
  session: ProgramSession,
): TeachingView | null {
  if (session.id !== origin.sessionId) return null;
  const source: SessionOrigin =
    origin.kind === "plan"
      ? {
          kind: "plan",
          planId: origin.planId,
          revision: origin.revision,
          sessionId: origin.sessionId,
        }
      : {
          kind: "workout",
          workoutId: origin.workoutId,
          planId: origin.planId,
          sessionId: origin.sessionId,
          performedAt: origin.performedAt,
        };

  return {
    origin: source,
    title: session.name,
    exercises: session.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      exerciseId: exercise.exerciseId,
      planned: {
        sets: exercise.sets,
        repMin: exercise.repMin,
        repMax: exercise.repMax,
        load: exercise.load,
        loadUnit: exercise.loadUnit,
        restSeconds: exercise.restSeconds,
        rir: exercise.rir,
        tempo: exercise.tempo,
        method: exercise.method,
        supersetGroup: exercise.supersetGroup,
      },
    })),
    personalReminder: "",
  };
}

export function createSavedWorkoutTeachingView(
  workoutId: string,
  saved: readonly TrainingWorkout[],
) {
  const workout = saved.find((item) => item.id === workoutId);
  if (!workout) return null;
  return createSessionTeachingView(
    {
      kind: "workout",
      workoutId: workout.id,
      planId: workout.plan_id,
      sessionId: workout.session_id,
      performedAt: workout.performedAt,
    },
    workout.prescription,
  );
}

export function createExerciseTeachingView(
  exerciseId: string,
): TeachingView | null {
  const card = getExerciseInstruction(exerciseId);
  const exercise = HYPERTROPHY_EXERCISES.find((item) => item.id === exerciseId);
  if (!card || !exercise) return null;
  return {
    origin: { kind: "exercise", exerciseId, instructionVersion: card.version },
    title: exercise.vietnameseName,
    exercises: [
      {
        id: exerciseId,
        name: exercise.vietnameseName,
        exerciseId,
        planned: null,
      },
    ],
    personalReminder: "",
  };
}

export function teachingOriginLabel(origin: TeachingOrigin) {
  switch (origin.kind) {
    case "exercise":
      return `Thẻ hướng dẫn · phiên bản ${origin.instructionVersion}`;
    case "plan":
      return `Theo giáo án đã lưu · phiên bản ${origin.revision}`;
    case "workout":
      return `Theo bản chụp buổi đã lưu · ${origin.performedAt.split("-").reverse().join("/")}`;
  }
}
