"use client";

import {
  localTrainingDate,
  nextScheduledSession,
} from "@/lib/training/schedule";
import { useState } from "react";
import { WorkoutEntry } from "./WorkoutEntry";
import {
  PLAN_STATUS_LABELS,
  WEEKDAY_LABELS,
  type TrainingPlan,
  type TrainingWorkout,
} from "@/lib/training/program";
import {
  type TrainingWorkspaceModel,
  type TrainingWorkspaceState,
} from "@/lib/training/workspace";
import { ProgramField } from "./ProgramFields";

export function WorkoutRunner({
  model,
  state,
}: {
  model: TrainingWorkspaceModel;
  state: TrainingWorkspaceState;
}) {
  const [planId, setPlanId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [dateOverride, setDateOverride] = useState<string | null>(null);
  const [replaceAction, setReplaceAction] = useState<
    | { plan: TrainingPlan; sessionId: string; date: string }
    | { workout: TrainingWorkout }
    | null
  >(null);
  const savedPlan =
    state.plans.find((p) => p.id === planId) ??
    state.plans.find((p) => p.id === state.workout?.plan_id) ??
    state.plans.find((p) => p.status === "active") ??
    state.plans[0];
  const session =
    savedPlan?.program.sessions.find((s) => s.id === sessionId) ??
    savedPlan?.program.sessions.find(
      (s) => s.id === state.workout?.session_id,
    ) ??
    savedPlan?.program.sessions[0];
  const scheduled =
    savedPlan && session
      ? nextScheduledSession(
          {
            ...savedPlan,
            program: { ...savedPlan.program, sessions: [session] },
          },
          state.workouts,
        )
      : null;
  const date = dateOverride ?? scheduled?.date ?? localTrainingDate();
  function start() {
    if (!savedPlan || !session || !date) return;
    if (!model.startWorkout(savedPlan, session, date))
      setReplaceAction({ plan: savedPlan, sessionId: session.id, date });
  }
  function reopen(workout: TrainingWorkout) {
    if (!model.openWorkout(workout)) setReplaceAction({ workout });
  }
  function replace() {
    if (!replaceAction) return;
    if ("workout" in replaceAction)
      model.openWorkout(replaceAction.workout, true);
    else {
      const session = replaceAction.plan.program.sessions.find(
        (s) => s.id === replaceAction.sessionId,
      );
      if (session)
        model.startWorkout(
          replaceAction.plan,
          session,
          replaceAction.date,
          true,
        );
    }
    setReplaceAction(null);
  }
  return (
    <div className="space-y-6">
      <section
        className="panel min-w-0 p-5 sm:p-6"
        aria-label="Bắt đầu buổi tập"
      >
        <h2 className="text-lg font-bold text-ink">Buổi tập</h2>
        <p className="mt-1 text-xs leading-6 text-slate">
          Chọn buổi từ phiên bản đã lưu. Tải và số lần thực tế do bạn ghi; ứng
          dụng không tự đề xuất tải an toàn.
        </p>
        {savedPlan ? (
          <form
            className="mt-5 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <ProgramField label="Phiên bản giáo án cho buổi tập">
              <select
                value={savedPlan.id}
                disabled={!!state.busy}
                onChange={(e) => {
                  setPlanId(e.target.value);
                  setSessionId("");
                }}
              >
                {state.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    v{p.revision} · {p.program.title} ·{" "}
                    {PLAN_STATUS_LABELS[p.status]}
                  </option>
                ))}
              </select>
            </ProgramField>
            <ProgramField label="Buổi trong giáo án">
              <select
                value={session?.id ?? ""}
                disabled={!!state.busy}
                onChange={(e) => setSessionId(e.target.value)}
              >
                {savedPlan.program.sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {WEEKDAY_LABELS[s.weekday]} · {s.name}
                  </option>
                ))}
              </select>
            </ProgramField>
            <ProgramField label="Ngày thực hiện">
              <input
                type="date"
                required
                value={date}
                disabled={!!state.busy}
                onChange={(e) => setDateOverride(e.target.value)}
              />
            </ProgramField>
            <button
              className="button-primary"
              type="submit"
              disabled={!!state.busy}
            >
              Mở buổi tập
            </button>
          </form>
        ) : (
          <p className="mt-5 text-sm text-ink">
            Lưu một phiên bản trong Chương trình trước khi ghi buổi tập.
          </p>
        )}
        {replaceAction && (
          <div
            className="mt-5 rounded-xl border border-caution/30 bg-caution-soft p-4 text-sm text-ink"
            role="alert"
          >
            <p>
              Buổi đang mở có dữ liệu chưa lưu. Lưu tiến độ trước hoặc xác nhận
              bỏ thay đổi để mở bản khác.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setReplaceAction(null)}
              >
                Giữ buổi đang ghi
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={replace}
              >
                Bỏ thay đổi và mở buổi đã chọn
              </button>
            </div>
          </div>
        )}
      </section>
      {state.workout && state.prescription && (
        <WorkoutEntry
          key={state.workout.id}
          model={model}
          state={state}
          workout={state.workout}
          session={state.prescription}
        />
      )}
      <section
        className="panel min-w-0 p-5 sm:p-6"
        aria-label="Lịch sử buổi tập"
      >
        <h2 className="text-lg font-bold text-ink">Lịch sử thực hiện</h2>
        {state.workouts.length ? (
          <ul className="mt-4 divide-y divide-rule">
            {[...state.workouts]
              .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
              .map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-ink"
                >
                  <div>
                    <p className="font-semibold">
                      {w.performedAt} · {w.prescription.name}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      {w.status === "completed"
                        ? "Hoàn thành"
                        : "Đang thực hiện"}{" "}
                      · {w.sets.filter((s) => s.completed).length}/
                      {w.sets.length} hiệp xác nhận
                    </p>
                  </div>
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={!!state.busy}
                    onClick={() => reopen(w)}
                    aria-label={`Mở lại ${w.prescription.name} ngày ${w.performedAt}`}
                  >
                    Mở lại bản ghi
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate">
            Chưa có buổi tập được lưu. Mở buổi từ giáo án để bắt đầu ghi nhận.
          </p>
        )}
      </section>
    </div>
  );
}
