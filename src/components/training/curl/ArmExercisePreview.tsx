"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { HypertrophyExercise } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { TrainingAnatomyViewer } from "../TrainingAnatomyViewer";
import {
  armMotionFor,
  armPhaseLabel,
  authoredRange,
  type ArmExerciseId,
} from "./arm-motion";
import type { ArmPlayback, ArmStage, ArmStructure, ArmView } from "./arm-stage";

const VIEWS: { id: ArmView; label: string }[] = [
  { id: "oblique", label: "Góc chéo" },
  { id: "front", label: "Phía trước" },
  { id: "side", label: "Bên cạnh" },
];

function ArmMotionStudy({ exerciseId }: { exerciseId: ArmExerciseId }) {
  const controlId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ArmStage | null>(null);
  const motion = armMotionFor(exerciseId)!;
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [playback, setPlayback] = useState<ArmPlayback>({ phase: 0, playing: false });
  const [view, setView] = useState<ArmView>("oblique");
  const [highlight, setHighlight] = useState(true);
  const range = authoredRange(exerciseId);

  useEffect(() => {
    const controller = new AbortController();
    const host = hostRef.current;
    let stage: ArmStage | null = null;
    const load = async () => {
      try {
        const response = await fetch("/anatomy/3d/motion/cable-curl-left.json", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Source unavailable.");
        const data: {
          status: string;
          reviewedBy: null;
          assetSha256: string;
          structures: ArmStructure[];
        } = await response.json();
        if (
          data.status !== "experimental-simulation" ||
          data.reviewedBy !== null ||
          !/^[a-f0-9]{64}$/.test(data.assetSha256) ||
          !Array.isArray(data.structures)
        ) {
          throw new Error("Source unavailable.");
        }
        const { ArmStage: Stage } = await import("./arm-stage");
        if (controller.signal.aborted || !host) return;
        stage = new Stage(host, exerciseId, (state) => {
          if (controller.signal.aborted) return;
          setPlayback(state);
        });
        stageRef.current = stage;
        await stage.load(
          `/anatomy/3d/motion/cable-curl-left.glb?v=${data.assetSha256}`,
          data.structures,
        );
        if (controller.signal.aborted) return;
        stage.setHighlight(true);
        setLoadState("ready");
      } catch {
        if (controller.signal.aborted) return;
        stage?.dispose();
        if (stageRef.current === stage) stageRef.current = null;
        stage = null;
        setLoadState("error");
      }
    };
    void load();
    return () => {
      controller.abort();
      stage?.dispose();
      if (stageRef.current === stage) stageRef.current = null;
    };
  }, [attempt, exerciseId]);

  const ready = loadState === "ready";
  return (
    <section className="panel overflow-hidden" aria-labelledby={`${controlId}-title`}>
      <header className="space-y-3 border-b border-rule p-4 sm:p-5">
        <p className="eyebrow">{motion.eyebrow}</p>
        <h3 id={`${controlId}-title`} className="text-lg font-semibold text-ink sm:text-xl">
          {motion.title}
        </h3>
        <p className="max-w-3xl text-sm leading-6 text-slate">
          Tay trái từ mô hình Z-Anatomy. Góc là quy ước hiển thị, không phải tầm vận động cá nhân, số đo EMG hay biên độ được chỉ định.
        </p>
      </header>
      <div className="relative border-b border-rule bg-canvas">
        <div
          ref={hostRef}
          className="relative h-[360px] w-full sm:h-[460px]"
          aria-label="Mô hình giải phẫu tay trái chuyển động"
        />
        {loadState !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas p-6 text-center">
            {loadState === "loading" ? (
              <p role="status" className="text-sm text-slate">Đang tải mô hình giải phẫu…</p>
            ) : (
              <div role="alert" className="space-y-3">
                <p className="text-sm text-ink">Chưa thể tải mô hình. Kiểm tra kết nối rồi thử lại.</p>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setLoadState("loading");
                    setPlayback({ phase: 0, playing: false });
                    setView("oblique");
                    setHighlight(true);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Tải lại mô hình
                </button>
              </div>
            )}
          </div>
        )}
        {ready && (
          <p className="pointer-events-none absolute left-3 top-3 rounded-md border border-rule bg-sheet/95 px-2 py-1 font-mono text-[10px] text-slate">
            Z-Anatomy · Tay trái · {armPhaseLabel(exerciseId, playback.phase)}
          </p>
        )}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <fieldset disabled={!ready} className="min-w-0 space-y-4 disabled:opacity-60">
          <legend className="sr-only">Điều khiển chuyển động và góc nhìn</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="button-primary"
              onClick={() => {
                if (playback.playing) stageRef.current?.pause();
                else stageRef.current?.play();
              }}
            >
              {playback.playing ? "Tạm dừng" : "Phát chuyển động"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                stageRef.current?.seek(0);
                stageRef.current?.play();
              }}
            >
              Phát lại
            </button>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <label className="font-medium text-ink" htmlFor={`${controlId}-phase`}>
                Pha chuyển động
              </label>
              <output htmlFor={`${controlId}-phase`} className="font-mono text-slate">
                {armPhaseLabel(exerciseId, playback.phase)} · {Math.round(playback.phase * 100)} / 100
              </output>
            </div>
            <input
              id={`${controlId}-phase`}
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={playback.phase * 100}
              className="w-full accent-cobalt"
              onChange={(event) => {
                stageRef.current?.pause();
                stageRef.current?.seek(Number(event.target.value) / 100);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Góc nhìn">
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={view === item.id}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${view === item.id ? "border-cobalt bg-cobalt-soft text-cobalt" : "border-rule bg-sheet text-slate"}`}
                  onClick={() => {
                    setView(item.id);
                    stageRef.current?.setView(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-ink">
              <input
                type="checkbox"
                checked={highlight}
                className="size-4 accent-cobalt"
                onChange={(event) => {
                  setHighlight(event.target.checked);
                  stageRef.current?.setHighlight(event.target.checked);
                }}
              />
              {motion.marker}
            </label>
          </div>
        </fieldset>
        <p className="text-xs leading-5 text-slate">
          Một chu kỳ hiển thị dài 6 giây, góc quy ước {range[0]}–{range[1]}°. Không vẽ máy hay cáp. Màu chỉ để nhận cơ, không phải mức hoạt hóa. Trọng số biến dạng là ước lượng hiển thị trên cánh tay trái.
        </p>
      </div>
    </section>
  );
}

export function ArmExercisePreview({
  exercise,
}: {
  exercise: HypertrophyExercise;
}) {
  const motion = armMotionFor(exercise.id);
  const [mode, setMode] = useState<"motion" | "static">("motion");
  if (!motion) return <TrainingAnatomyViewer exercise={exercise} />;
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Cách xem ${exercise.vietnameseName}`}>
        <button
          className={mode === "motion" ? "button-primary" : "button-secondary"}
          aria-pressed={mode === "motion"}
          onClick={() => setMode("motion")}
        >
          Bản mẫu chuyển động
        </button>
        <button
          className={mode === "static" ? "button-primary" : "button-secondary"}
          aria-pressed={mode === "static"}
          onClick={() => setMode("static")}
        >
          Quan sát giải phẫu tĩnh
        </button>
      </div>
      {mode === "motion" ? (
        <ArmMotionStudy exerciseId={exercise.id as ArmExerciseId} />
      ) : (
        <TrainingAnatomyViewer exercise={exercise} />
      )}
    </div>
  );
}
