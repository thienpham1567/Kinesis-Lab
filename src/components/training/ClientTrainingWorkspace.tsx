"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { TrainingPlan } from "@/lib/training/program";
import { TrainingWorkspaceModel } from "@/lib/training/workspace";
import {
  ClientTrainingOverview,
  type TrainingDestination,
} from "./ClientTrainingOverview";
import { ProgramEditor } from "./ProgramEditor";
import { WorkoutRunner } from "./WorkoutRunner";

export function ClientTrainingWorkspace({
  clientId,
  clientGoal,
  destination,
  onNavigate,
}: {
  clientId: string;
  clientGoal: string | null;
  destination: TrainingDestination | null;
  onNavigate: (destination: TrainingDestination) => void;
}) {
  const [pendingStart, setPendingStart] = useState<{
    plan: TrainingPlan;
    sessionId: string;
    date: string;
  } | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
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
      content.current
        ?.querySelector<HTMLElement>(
          `[data-training-destination="${destination}"]`,
        )
        ?.focus({ preventScroll: true });
      moveFocus.current = false;
    }
  }, [destination, state.loaded]);
  function navigate(next: TrainingDestination) {
    moveFocus.current = true;
    onNavigate(next);
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
            <WorkoutRunner model={model} state={state} />
          </div>
        </>
      )}
    </div>
  );
}
