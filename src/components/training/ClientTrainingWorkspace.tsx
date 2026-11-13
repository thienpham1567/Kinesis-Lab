"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { TrainingPlan } from "@/lib/training/program";
import { TrainingWorkspaceModel } from "@/lib/training/workspace";
import {
  ClientTrainingOverview,
  type TrainingDestination,
} from "./ClientTrainingOverview";
import { ClientProgressReport } from "./ClientProgressReport";
import { ProgramEditor } from "./ProgramEditor";
import { WorkoutRunner } from "./WorkoutRunner";

export function ClientTrainingWorkspace({
  clientId,
  clientGoal,
  destination,
  onNavigate,
  onOpenLegacy,
}: {
  clientId: string;
  clientGoal: string | null;
  destination: TrainingDestination | null;
  onNavigate: (destination: TrainingDestination) => void;
  onOpenLegacy: () => void;
}) {
  const [pendingStart, setPendingStart] = useState<{
    plan: TrainingPlan;
    sessionId: string;
    date: string;
  } | null>(null);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<string | null>(null);
  const [showReportReturn, setShowReportReturn] = useState(false);
  const [reportVisited, setReportVisited] = useState(
    destination === "progress",
  );
  if (destination === "progress" && !reportVisited) setReportVisited(true);
  const pendingDecision = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const moveFocus = useRef<"destination" | "workout" | null>(null);
  const [model] = useState(() => new TrainingWorkspaceModel(clientId));
  const state = useSyncExternalStore(
    model.subscribe,
    model.getSnapshot,
    model.getSnapshot,
  );
  useEffect(() => {
    model.resume();
    void model.load();
    return () => model.dispose();
  }, [model]);
  useEffect(() => {
    if (moveFocus.current && destination && state.loaded) {
      const section = content.current?.querySelector<HTMLElement>(
        `[data-training-destination="${destination}"]`,
      );
      const workoutHeading =
        moveFocus.current === "workout"
          ? section?.querySelector<HTMLElement>("[data-workout-entry-heading]")
          : null;
      const target =
        destination === "progress"
          ? (section?.querySelector<HTMLElement>("#progress-heading") ??
            section)
          : (workoutHeading ?? section);
      if (workoutHeading || destination === "progress") {
        target?.scrollIntoView({ block: "center" });
      }
      target?.focus({ preventScroll: true });
      moveFocus.current = null;
    }
  }, [destination, state.loaded]);
  useEffect(() => {
    if (pendingWorkoutId && destination === "progress")
      pendingDecision.current?.focus();
  }, [pendingWorkoutId, destination]);

  function navigate(
    next: TrainingDestination,
    focus: "destination" | "workout" = "destination",
  ) {
    moveFocus.current = focus;
    onNavigate(next);
  }

  function openReportWorkout(id: string, replace = false) {
    const workout = state.workouts.find((item) => item.id === id);
    if (!workout || state.busy) return;
    if (!model.openWorkout(workout, replace)) {
      setPendingWorkoutId(id);
      return;
    }
    setPendingWorkoutId(null);
    setShowReportReturn(true);
    navigate("workouts", "workout");
  }

  function keepReportDraft() {
    setPendingWorkoutId(null);
    setShowReportReturn(true);
    navigate("workouts", "workout");
  }
  function start(plan: TrainingPlan, sessionId: string, date: string) {
    const session = plan.program.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if (!model.startWorkout(plan, session, date)) {
      setPendingStart({ plan, sessionId, date });
      return;
    }
    navigate("workouts");
  }
  function replacePending() {
    if (!pendingStart) return;
    const session = pendingStart.plan.program.sessions.find(
      (s) => s.id === pendingStart.sessionId,
    );
    if (session)
      model.startWorkout(pendingStart.plan, session, pendingStart.date, true);
    setPendingStart(null);
    navigate("workouts");
  }
  return (
    <div
      ref={content}
      hidden={destination === null}
      inert={destination === null}
      className="space-y-5"
    >
      {pendingStart && (
        <div
          className="rounded-xl border border-caution/30 bg-caution-soft p-4 text-sm text-ink"
          role="alert"
        >
          <p>
            Buổi đang ghi có thay đổi chưa lưu. Bạn có thể mở lại để lưu tiến độ
            hoặc bỏ thay đổi để mở buổi theo lịch.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setPendingStart(null);
                navigate("workouts");
              }}
            >
              Giữ và mở buổi đang ghi
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={replacePending}
            >
              Bỏ thay đổi và mở buổi theo lịch
            </button>
          </div>
        </div>
      )}
      {state.loading && (
        <p className="panel p-5 text-sm text-slate" role="status">
          Đang tải giáo án và buổi tập…
        </p>
      )}
      {state.loadError && (
        <div className="alert-error" role="alert">
          <p>{state.loadError}</p>
          <button
            type="button"
            className="button-secondary mt-3"
            disabled={state.loading}
            onClick={() => {
              void model.load();
            }}
          >
            Thử tải lại giáo án và buổi tập
          </button>
        </div>
      )}
      {state.error && (
        <div className="alert-error" role="alert">
          <p>{state.error}</p>
          <p className="mt-1 text-xs">
            Dữ liệu đang soạn vẫn được giữ. Kiểm tra rồi thử lại thao tác.
          </p>
          {state.questions.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {state.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {state.notice && (
        <p
          role="status"
          className="rounded-xl border border-rule bg-sheet p-4 text-sm text-ink"
        >
          {state.notice}
        </p>
      )}
      {state.loaded && (
        <>
          <div
            data-training-destination="overview"
            tabIndex={-1}
            hidden={destination !== "overview"}
            inert={destination !== "overview"}
          >
            <ClientTrainingOverview
              state={state}
              clientGoal={clientGoal}
              onNavigate={navigate}
              onStart={start}
            />
          </div>
          <div
            data-training-destination="program"
            tabIndex={-1}
            hidden={destination !== "program"}
            inert={destination !== "program"}
          >
            <ProgramEditor model={model} state={state} />
          </div>
          <div
            data-training-destination="workouts"
            tabIndex={-1}
            hidden={destination !== "workouts"}
            inert={destination !== "workouts"}
          >
            {showReportReturn && (
              <button
                type="button"
                className="button-secondary mb-4"
                onClick={() => navigate("progress")}
              >
                Quay lại tiến triển
              </button>
            )}
            <WorkoutRunner model={model} state={state} />
          </div>
          <div
            data-training-destination="progress"
            tabIndex={-1}
            hidden={destination !== "progress"}
            inert={destination !== "progress"}
            className="space-y-4"
          >
            {pendingWorkoutId && (
              <div
                ref={pendingDecision}
                tabIndex={-1}
                className="rounded-xl border border-caution/30 bg-caution-soft p-4 text-sm text-ink"
                role="alert"
              >
                <p>
                  Buổi đang ghi có thay đổi chưa lưu. Bạn có thể mở lại buổi đó
                  để lưu tiến độ hoặc bỏ thay đổi để mở buổi đã chọn.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={keepReportDraft}
                  >
                    Giữ và mở buổi đang ghi
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={!!state.busy}
                    onClick={() => openReportWorkout(pendingWorkoutId, true)}
                  >
                    Bỏ thay đổi và mở buổi đã chọn
                  </button>
                </div>
              </div>
            )}
            {reportVisited && (
              <ClientProgressReport
                clientId={clientId}
                workouts={state.workouts}
                busy={!!state.busy}
                active={destination === "progress"}
                onOpenWorkout={openReportWorkout}
                onOpenLegacy={onOpenLegacy}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
