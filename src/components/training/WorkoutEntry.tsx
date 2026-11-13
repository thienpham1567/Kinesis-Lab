"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/WorkspaceUI";
import { nextIncompleteSet, type RestClock } from "@/lib/training/coaching";
import type { ProgramSession, WorkoutInput } from "@/lib/training/program";
import type {
  TrainingWorkspaceModel,
  TrainingWorkspaceState,
} from "@/lib/training/workspace";
import { NumberField, ProgramField } from "./ProgramFields";
import { RestTimer } from "./RestTimer";
import { WorkoutActionBar } from "./WorkoutActionBar";
import { WorkoutExercise } from "./WorkoutExercise";

type Rest = {
  exerciseName: string;
  duration: number;
  clock: RestClock;
  updatedAtMs: number;
};

function focusWorkoutControl(control: HTMLElement) {
  const scrollport = control.closest<HTMLElement>("[data-workspace-scroll]");
  if (scrollport) {
    const viewport = scrollport.getBoundingClientRect();
    const top = control.getBoundingClientRect().top - viewport.top;
    scrollport.scrollBy({
      top: top - viewport.height / 3,
      behavior: "instant",
    });
  } else {
    control.scrollIntoView({ block: "center" });
  }
  control.focus({ preventScroll: true });
}

export function WorkoutEntry({
  model,
  state,
  workout,
  session,
}: {
  model: TrainingWorkspaceModel;
  state: TrainingWorkspaceState;
  workout: WorkoutInput;
  session: ProgramSession;
}) {
  const [compact, setCompact] = useState(false);
  const [rest, setRest] = useState<Rest | null>(null);
  const entry = useRef<HTMLElement>(null);
  const incomplete = nextIncompleteSet(session, workout.sets);
  const saved = state.workouts.some((record) => record.id === workout.id);
  const saveStatus =
    state.busy === "workout"
      ? "Đang lưu…"
      : state.workoutSaveError
        ? "Chưa lưu được"
        : state.workoutDirty || !saved
          ? "Chưa lưu"
          : "Đã lưu";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const heading = entry.current?.querySelector("h2");
      if (heading && !heading.closest("[inert]")) focusWorkoutControl(heading);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!state.workoutDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.workoutDirty]);

  function startRest(exerciseName: string, duration: number) {
    if (duration <= 0) return;
    const now = Date.now();
    setRest({
      exerciseName,
      duration,
      clock: { state: "running", endsAtMs: now + duration * 1000 },
      updatedAtMs: now,
    });
  }

  function focusIncomplete(fromSave = false) {
    const section = entry.current;
    if (!section || section.closest("[inert]")) return;
    const row =
      incomplete &&
      section.querySelector<HTMLElement>(
        `[data-workout-set="${incomplete.exerciseId}:${incomplete.setNumber}"]`,
      );
    const invalid = (fromSave ? section : row)?.querySelector<HTMLInputElement>(
      "input:invalid:not(:disabled)",
    );
    const missing =
      row &&
      Array.from(
        row.querySelectorAll<HTMLInputElement>(
          "input[type=number]:not(:disabled)",
        ),
      ).find((input) => input.value === "");
    const target =
      invalid ||
      missing ||
      row?.querySelector<HTMLInputElement>("input[type=checkbox]");
    if (target) focusWorkoutControl(target);
  }

  async function save(complete: boolean) {
    if (model.getSnapshot().busy) return;
    const result = await model.saveWorkout(complete);
    if (complete && !result)
      window.requestAnimationFrame(() => focusIncomplete(true));
  }

  function revealFocusedInput(event: KeyboardEvent<HTMLElement>) {
    const target = event.target;
    // Moving the scrollport on pointer focus can change the click target.
    if (
      !compact ||
      event.key !== "Tab" ||
      !(target instanceof HTMLElement) ||
      target.closest("[data-workout-actions]")
    )
      return;
    const bar = entry.current?.querySelector("[data-workout-actions]");
    const bounds = target.getBoundingClientRect();
    const barBounds = bar?.getBoundingClientRect();
    if (
      barBounds &&
      bounds.bottom + 8 > barBounds.top &&
      bounds.top < barBounds.bottom
    ) {
      focusWorkoutControl(target);
    }
  }

  return (
    <section
      ref={entry}
      className="panel min-w-0 p-5 sm:p-6"
      aria-label="Ghi nhận buổi tập đang mở"
      onKeyUp={revealFocusedInput}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
        <div className="min-w-0">
          <h2
            data-workout-entry-heading
            tabIndex={-1}
            className="wrap-break-word text-lg font-bold text-ink"
          >
            {session.name}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate">
            {workout.performedAt} ·{" "}
            {workout.status === "completed"
              ? "Đã hoàn thành"
              : "Đang thực hiện"}
            {!compact && ` · ${saveStatus}`}
          </p>
        </div>
        <button
          type="button"
          className={`min-h-11 ${compact ? "button-primary" : "button-secondary"}`}
          aria-pressed={compact}
          onClick={() => setCompact(!compact)}
        >
          <Icon name="clock" className="size-4" />
          Chế độ phòng tập
        </button>
      </div>
      <fieldset
        disabled={!!state.busy}
        className="min-w-0 divide-y divide-rule disabled:opacity-70"
      >
        <legend className="sr-only">Số liệu thực tế từng hiệp</legend>
        {session.exercises.map((exercise, index) => (
          <WorkoutExercise
            key={exercise.id}
            exercise={exercise}
            index={index}
            workout={workout}
            workouts={state.workouts}
            compact={compact}
            onRestStart={startRest}
            onChange={(value) => model.editWorkout(value)}
          />
        ))}
      </fieldset>
      <fieldset
        disabled={!!state.busy}
        className="mt-5 grid min-w-0 gap-4 sm:grid-cols-[180px_1fr]"
      >
        <legend className="sr-only">Cảm nhận buổi tập</legend>
        <NumberField
          label="RPE cả buổi (0–10, tùy chọn)"
          value={workout.rpe}
          nullable
          max={10}
          step={0.5}
          onChange={(rpe) => model.editWorkout({ ...workout, rpe })}
        />
        <ProgramField label="Phản hồi / triệu chứng và ghi chú buổi">
          <textarea
            value={workout.notes}
            maxLength={4000}
            onChange={(event) =>
              model.editWorkout({ ...workout, notes: event.target.value })
            }
          />
        </ProgramField>
      </fieldset>
      {!compact && (
        <p className="mt-4 text-xs leading-6 text-slate">
          Đánh dấu từng hiệp sau khi ghi số lần và tải thực tế. Chỉ kết thúc khi
          tất cả hiệp đã được ghi nhận và xác nhận.
        </p>
      )}
      <WorkoutActionBar
        compact={compact}
        busy={!!state.busy}
        status={saveStatus}
        error={state.workoutSaveError}
        onNext={incomplete ? () => focusIncomplete() : null}
        onSave={(complete) => void save(complete)}
        timer={
          rest && (
            <RestTimer
              {...rest}
              onChange={(clock, updatedAtMs) =>
                setRest({ ...rest, clock, updatedAtMs })
              }
            />
          )
        }
      />
    </section>
  );
}
