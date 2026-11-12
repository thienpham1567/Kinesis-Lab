"use client";

import {
  GOAL_LABELS,
  WEEKDAY_LABELS,
  type TrainingPlan,
} from "@/lib/training/program";
import { nextScheduledSession } from "@/lib/training/schedule";
import type { TrainingWorkspaceState } from "@/lib/training/workspace";

export type TrainingDestination = "overview" | "program" | "workouts";
export function ClientTrainingOverview({
  state,
  clientGoal,
  onNavigate,
  onStart,
}: {
  state: TrainingWorkspaceState;
  clientGoal: string | null;
  onNavigate: (destination: TrainingDestination) => void;
  onStart: (plan: TrainingPlan, sessionId: string, date: string) => void;
}) {
  const active = state.plans.find((plan) => plan.status === "active");
  const next = active ? nextScheduledSession(active, state.workouts) : null;
  const completed = state.workouts.filter(
    (workout) => workout.status === "completed",
  ).length;
  return (
    <section className="panel p-5 sm:p-6" aria-label="Tổng quan tập luyện">
      <h2 className="text-lg font-bold text-ink">Hướng tập luyện hiện tại</h2>
      <dl className="mt-5 divide-y divide-rule wrap-anywhere text-sm text-ink">
        <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="text-slate">Mục tiêu học viên</dt>
          <dd>{clientGoal || "Chưa ghi mục tiêu trong hồ sơ."}</dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="text-slate">Giáo án đang áp dụng</dt>
          <dd>
            {active
              ? `${active.program.title} · v${active.revision} · ${GOAL_LABELS[active.program.goal]}`
              : "Chưa có giáo án đang áp dụng. Soạn và lưu một phiên bản để bắt đầu."}
          </dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="text-slate">Buổi kế tiếp theo lịch tuần</dt>
          <dd>
            {next
              ? `${WEEKDAY_LABELS[next.session.weekday]} · ${next.date} · ${next.session.name} · ${next.session.exercises.length} bài`
              : "Thiết lập lịch tuần trong chương trình tập luyện."}
          </dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="text-slate">Buổi đã hoàn thành</dt>
          <dd>{completed} buổi được ghi nhận thực tế</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        {active && next ? (
          <button
            type="button"
            className="button-primary"
            onClick={() => onStart(active, next.session.id, next.date)}
          >
            Mở buổi tập theo lịch
          </button>
        ) : (
          <button
            type="button"
            className="button-primary"
            onClick={() => onNavigate("program")}
          >
            Soạn chương trình tập luyện
          </button>
        )}
        <button
          type="button"
          className="button-secondary"
          onClick={() => onNavigate("workouts")}
        >
          Xem buổi tập và lịch sử
        </button>
      </div>
      {active && (
        <p className="mt-4 text-xs leading-6 text-slate">
          Lịch tuần là kế hoạch. Chọn lại ngày thực hiện trong buổi tập khi cần;
          ứng dụng không tự xác nhận đã tập.
        </p>
      )}
    </section>
  );
}
