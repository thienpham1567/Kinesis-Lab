"use client";

import Link from "next/link";
import type {
  ExercisePrescription,
  TrainingWorkout,
  WorkoutInput,
  WorkoutSet,
} from "@/lib/training/program";
import { previousExerciseResult } from "@/lib/training/workspace";
import { NumberField, UNIT_LABELS, UnitField } from "./ProgramFields";

export function WorkoutExercise({
  exercise,
  index,
  workout,
  workouts,
  onChange,
}: {
  exercise: ExercisePrescription;
  index: number;
  workout: WorkoutInput;
  workouts: TrainingWorkout[];
  onChange: (workout: WorkoutInput) => void;
}) {
  const sets = workout.sets.filter((set) => set.exerciseId === exercise.id);
  const actualUnit = sets[0]?.loadUnit ?? exercise.loadUnit;
  const prior = previousExerciseResult(
    { ...exercise, loadUnit: actualUnit },
    workouts,
    workout.id,
    workout.performedAt,
  );
  function changeSet(setNumber: number, patch: Partial<WorkoutSet>) {
    onChange({
      ...workout,
      sets: workout.sets.map((s) =>
        s.exerciseId === exercise.id && s.setNumber === setNumber
          ? { ...s, ...patch }
          : s,
      ),
    });
  }
  return (
    <section
      className="min-w-0 py-5"
      aria-label={`Bài ${index + 1} · ${exercise.name}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink">
          {index + 1}. {exercise.name}
        </h3>
        {exercise.exerciseId && (
          <Link
            href={`/atlas?tab=hypertrophy&exercise=${encodeURIComponent(exercise.exerciseId)}`}
            className="inline-flex min-h-11 items-center text-xs text-cobalt underline underline-offset-4"
          >
            Mở tham chiếu Atlas
          </Link>
        )}
      </div>
      <p className="mt-1 text-xs leading-6 text-ink">
        Kế hoạch: {exercise.sets} hiệp × {exercise.repMin}–{exercise.repMax} lần
        · {UNIT_LABELS[exercise.loadUnit]}
        {exercise.load !== null ? ` ${exercise.load}` : ""} · Nghỉ{" "}
        {exercise.restSeconds}s ·{" "}
        {exercise.method === "superset"
          ? `Superset nhóm ${exercise.supersetGroup}`
          : "Từng bài"}
        {exercise.rir !== null ? ` · RIR ${exercise.rir}` : ""}
        {exercise.tempo ? ` · Tempo ${exercise.tempo}` : ""}
      </p>
      {exercise.notes && (
        <p className="mt-1 text-xs leading-6 text-slate">{exercise.notes}</p>
      )}
      <p className="mt-2 text-xs leading-6 text-slate">
        {prior
          ? `Lần trước cùng tên / tham chiếu và đơn vị (${prior.workout.performedAt}): ${prior.sets.map((s) => `${s.reps} lần${s.load !== null ? ` × ${s.load} kg` : ""}`).join("; ")}. ${UNIT_LABELS[actualUnit]}.`
          : "Chưa có kết quả trước tương đồng về tên bài, tham chiếu và đơn vị tải."}
      </p>
      <div className="mt-4 max-w-sm">
        <UnitField
          context={`Bài ${index + 1} · ${exercise.name} · Thực tế`}
          value={actualUnit}
          onChange={(loadUnit) =>
            onChange({
              ...workout,
              sets: workout.sets.map((s) =>
                s.exerciseId === exercise.id
                  ? { ...s, loadUnit, load: null, completed: false }
                  : s,
              ),
            })
          }
        />
      </div>
      <div className="mt-4 space-y-3">
        {sets.map((set) => {
          const context = `${exercise.name} · Hiệp ${set.setNumber} thực tế`;
          return (
            <div
              key={set.setNumber}
              className="grid items-end gap-3 rounded-xl border border-rule bg-canvas p-3 sm:grid-cols-[70px_1fr_1fr_1fr]"
            >
              <p className="self-center text-xs font-semibold text-ink">
                Hiệp {set.setNumber}
              </p>
              <NumberField
                label="Số lần thực tế"
                context={context}
                value={set.reps}
                nullable
                max={1000}
                onChange={(reps) =>
                  changeSet(set.setNumber, { reps, completed: false })
                }
              />
              <NumberField
                label={
                  actualUnit === "assisted"
                    ? "Trợ lực thực tế (kg)"
                    : "Tải ngoài thực tế (kg)"
                }
                context={context}
                value={set.load}
                nullable
                max={2000}
                step={0.1}
                disabled={actualUnit === "bodyweight"}
                onChange={(load) =>
                  changeSet(set.setNumber, { load, completed: false })
                }
              />
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={set.completed}
                  onChange={(e) =>
                    changeSet(set.setNumber, { completed: e.target.checked })
                  }
                />
                <span>
                  <span className="sr-only">{context} · </span>Đã hoàn thành
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
