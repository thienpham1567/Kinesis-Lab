"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Icon } from "@/components/WorkspaceUI";
import { getExerciseInstruction } from "@/lib/clinical/exercise-instructions";
import {
  mergeWorkoutSets,
  workoutSetsForExercise,
} from "@/lib/training/coaching";
import type {
  ExercisePrescription,
  TrainingWorkout,
  WorkoutInput,
  WorkoutSet,
} from "@/lib/training/program";
import { previousExerciseResult } from "@/lib/training/workspace";
import { ExerciseInstructionCard } from "./ExerciseInstructionCard";
import { NumberField, UNIT_LABELS, UnitField } from "./ProgramFields";

export function WorkoutExercise({
  exercise,
  index,
  workout,
  workouts,
  compact,
  onRestStart,
  onChange,
}: {
  exercise: ExercisePrescription;
  index: number;
  workout: WorkoutInput;
  workouts: TrainingWorkout[];
  compact: boolean;
  onRestStart: (exerciseName: string, duration: number) => void;
  onChange: (workout: WorkoutInput) => void;
}) {
  const instruction = getExerciseInstruction(exercise.exerciseId);
  const [showInstruction, setShowInstruction] = useState(false);
  const instructionButton = useRef<HTMLButtonElement>(null);
  const instructionId = useId();
  function closeInstruction() {
    setShowInstruction(false);
    instructionButton.current?.focus();
  }
  const sets = workoutSetsForExercise(exercise, workout.sets);
  const actualUnit = sets[0]?.loadUnit ?? exercise.loadUnit;
  const prior = previousExerciseResult(
    { ...exercise, loadUnit: actualUnit },
    workouts,
    workout.id,
    workout.performedAt,
  );
  function changeSet(setNumber: number, patch: Partial<WorkoutSet>) {
    const set = sets[setNumber - 1];
    onChange({
      ...workout,
      sets: mergeWorkoutSets(workout.sets, [{ ...set, ...patch }]),
    });
  }
  return (
    <section
      className="@container min-w-0 py-5"
      aria-label={`Bài ${index + 1} · ${exercise.name}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 wrap-break-word text-sm font-bold text-ink">
          {index + 1}. {exercise.name}
        </h3>
        {compact && exercise.restSeconds > 0 && (
          <button
            type="button"
            className="button-secondary min-h-11 px-2"
            aria-label={`Bắt đầu nghỉ ${exercise.restSeconds} giây · ${exercise.name}`}
            onClick={() => onRestStart(exercise.name, exercise.restSeconds)}
          >
            <Icon name="clock" className="size-4" />
            Nghỉ {exercise.restSeconds} giây
          </button>
        )}
        {!compact && exercise.exerciseId && (
          <Link
            href={`/atlas?tab=hypertrophy&exercise=${encodeURIComponent(exercise.exerciseId)}`}
            className="inline-flex min-h-11 items-center text-xs text-cobalt underline underline-offset-4"
          >
            Mở tham chiếu Atlas
          </Link>
        )}
        {instruction ? (
          <button
            type="button"
            ref={instructionButton}
            className="button-secondary min-h-11 px-2"
            aria-expanded={showInstruction}
            aria-controls={instructionId}
            onClick={() =>
              showInstruction ? closeInstruction() : setShowInstruction(true)
            }
          >
            <Icon name="book" className="size-4" />
            {showInstruction ? "Ẩn hướng dẫn" : "Xem hướng dẫn"}
          </button>
        ) : null}
      </div>
      {instruction && showInstruction && (
        <div id={instructionId} className="mt-3">
          <ExerciseInstructionCard
            card={instruction}
            exerciseName={exercise.name}
            headingId={`${instructionId}-heading`}
          />
          <button
            type="button"
            className="button-secondary mt-2 min-h-11 px-3"
            onClick={closeInstruction}
          >
            Đóng hướng dẫn
          </button>
        </div>
      )}
      {!instruction && (
        <p className="mt-1 text-xs leading-5 text-slate">
          Chưa có thẻ hướng dẫn cho bài này; dùng tham chiếu Atlas hoặc ghi chú giáo án.
        </p>
      )}
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
              sets: mergeWorkoutSets(
                workout.sets,
                sets.map((s) => ({
                  ...s,
                  loadUnit,
                  load: null,
                  completed: false,
                })),
              ),
            })
          }
        />
      </div>
      <div
        className={
          compact
            ? "mt-3 divide-y divide-rule border-y border-rule"
            : "mt-4 space-y-3"
        }
      >
        {sets.map((set) => {
          const context = `${exercise.name} · Hiệp ${set.setNumber} thực tế`;
          return (
            <div
              key={set.setNumber}
              data-workout-set={`${exercise.id}:${set.setNumber}`}
              className={
                compact
                  ? "grid grid-cols-2 items-end gap-x-3 gap-y-1 py-2 @min-[570px]:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  : "grid items-end gap-3 rounded-xl border border-rule bg-canvas p-3 sm:grid-cols-[70px_1fr_1fr_1fr]"
              }
            >
              <p
                className={`self-center text-xs font-semibold text-ink ${compact ? "col-span-full @min-[570px]:col-auto" : ""}`}
              >
                Hiệp {set.setNumber}
              </p>
              <NumberField
                label={compact ? "Số lần" : "Số lần thực tế"}
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
                  set.loadUnit === "assisted"
                    ? compact
                      ? "Trợ lực (kg)"
                      : "Trợ lực thực tế (kg)"
                    : compact
                      ? "Tải ngoài (kg)"
                      : "Tải ngoài thực tế (kg)"
                }
                context={context}
                value={set.load}
                nullable
                max={2000}
                step={0.1}
                disabled={set.loadUnit === "bodyweight"}
                onChange={(load) =>
                  changeSet(set.setNumber, { load, completed: false })
                }
              />
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium text-ink ${compact ? "col-span-full @min-[570px]:col-auto" : ""}`}
              >
                <input
                  type="checkbox"
                  className={compact ? "size-5 accent-cobalt" : "size-5"}
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
