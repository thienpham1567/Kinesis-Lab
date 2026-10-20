"use client";
import { useState } from "react";
import type { HypertrophyExercise } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { TrainingAnatomyViewer } from "../TrainingAnatomyViewer";
import { CableCurlStudy } from "./CableCurlStudy";

export function CurlExercisePreview({
  exercise,
}: {
  exercise: HypertrophyExercise;
}) {
  const [mode, setMode] = useState<"motion" | "static">("motion");
  return (
    <div className="min-w-0 space-y-3">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Cách xem bài cuốn tay trước"
      >
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
        <CableCurlStudy />
      ) : (
        <TrainingAnatomyViewer exercise={exercise} />
      )}
    </div>
  );
}
