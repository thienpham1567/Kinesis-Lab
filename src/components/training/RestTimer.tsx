"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/WorkspaceUI";
import { remainingRestSeconds, type RestClock } from "@/lib/training/coaching";

export function RestTimer({
  exerciseName,
  duration,
  clock,
  updatedAtMs,
  onChange,
}: {
  exerciseName: string;
  duration: number;
  clock: RestClock;
  updatedAtMs: number;
  onChange: (clock: RestClock, now: number) => void;
}) {
  const [tick, setTick] = useState(updatedAtMs);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const announced = useRef<number | null>(null);
  const seconds = remainingRestSeconds(clock, Math.max(tick, updatedAtMs));
  const deadline = clock.state === "running" ? clock.endsAtMs : null;
  const finished = deadline !== null && seconds === 0;

  useEffect(() => {
    if (deadline === null || finished) return;
    const refresh = () => setTick(Date.now());
    const interval = window.setInterval(refresh, 250);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [deadline, finished]);

  useEffect(() => {
    if (!finished || announced.current === deadline) return;
    announced.current = deadline;
    const context = audio.current;
    if (!sound || context?.state !== "running") return;
    const tone = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    tone.frequency.value = 660;
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    tone.connect(gain).connect(context.destination);
    tone.start(now);
    tone.stop(now + 0.2);
    tone.onended = () => {
      tone.disconnect();
      gain.disconnect();
    };
  }, [deadline, finished, sound]);

  useEffect(
    () => () => {
      const context = audio.current;
      audio.current = null;
      if (context && context.state !== "closed")
        void context.close().catch(() => {});
    },
    [],
  );

  async function toggleSound() {
    if (sound) {
      setSound(false);
      return;
    }
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      await context.resume();
      if (audio.current !== context) return;
      setSound(context.state === "running");
      setSoundError(context.state !== "running");
    } catch {
      setSoundError(true);
    }
  }

  function toggleClock() {
    const now = Date.now();
    if (deadline !== null && !finished) {
      const remainingMs = deadline - now;
      if (remainingMs > 0) onChange({ state: "paused", remainingMs }, now);
      else setTick(now);
      return;
    }
    const remainingMs =
      clock.state === "paused" ? clock.remainingMs : duration * 1000;
    onChange({ state: "running", endsAtMs: now + remainingMs }, now);
  }

  const readout = clock.state === "idle" ? duration : seconds;
  const minutes = Math.floor(readout / 60);
  const display = `${String(minutes).padStart(2, "0")}:${String(readout % 60).padStart(2, "0")}`;
  const running = deadline !== null && !finished;
  return (
    <div className="space-y-1 border-b border-rule pb-2">
      <div className="flex items-baseline justify-between gap-2">
        <p
          className="truncate text-xs font-medium text-ink"
          title={exerciseName}
        >
          Nghỉ · {exerciseName}
        </p>
        <span role="status" className="shrink-0 text-xs font-medium text-ink">
          {finished
            ? "Hết giờ nghỉ"
            : clock.state === "paused"
              ? "Đang tạm dừng"
              : ""}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span
          role="timer"
          aria-label="Thời gian nghỉ còn lại"
          className="font-mono text-lg font-semibold tabular-nums text-ink sm:text-xl"
        >
          {display}
        </span>
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            className="button-secondary min-h-11 min-w-11 px-1.5"
            aria-label={running ? "Tạm dừng" : undefined}
            onClick={toggleClock}
          >
            {clock.state === "paused"
              ? "Tiếp tục"
              : running
                ? "Dừng"
                : "Bắt đầu"}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => onChange({ state: "idle" }, Date.now())}
            aria-label="Đặt lại giờ nghỉ"
            title="Đặt lại giờ nghỉ"
          >
            <Icon name="refresh" className="size-4" />
          </button>
          <label className="flex min-h-11 items-center gap-1 px-0.5 text-xs font-medium text-ink">
            <input
              type="checkbox"
              className="size-4 accent-cobalt"
              checked={sound}
              onChange={() => void toggleSound()}
            />
            Âm báo
          </label>
        </div>
      </div>
      {soundError && (
        <p role="status" className="text-xs text-ink">
          Trình duyệt chưa phát được âm báo.
        </p>
      )}
    </div>
  );
}
