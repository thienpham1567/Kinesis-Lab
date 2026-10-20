export function clampPhase(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function cyclePhase(
  elapsedSeconds: number,
  durationSeconds: number,
  speed: number,
) {
  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    !Number.isFinite(speed) ||
    speed <= 0
  )
    throw new Error("Invalid animation timing");
  const elapsed = Number.isFinite(elapsedSeconds)
    ? Math.max(0, elapsedSeconds)
    : 0;
  return ((elapsed * speed) % durationSeconds) / durationSeconds;
}

export function phaseLabel(value: number) {
  const phase = clampPhase(value);
  if (phase === 0) return "Bắt đầu";
  if (phase === 1) return "Kết thúc";
  if (Math.abs(phase - 0.5) < 0.02) return "Chuyển pha";
  return phase < 0.5 ? "Gập khuỷu" : "Hạ có kiểm soát";
}

export function exportImageRect(
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  if (
    [sourceWidth, sourceHeight, width, height].some(
      (n) => !Number.isFinite(n) || n <= 0,
    ) ||
    height <= 160
  )
    throw new Error("Invalid export dimensions");
  const availableHeight = height - 160;
  const ratio = Math.min(width / sourceWidth, availableHeight / sourceHeight);
  const w = sourceWidth * ratio,
    h = sourceHeight * ratio;
  return {
    x: (width - w) / 2,
    y: 90 + (availableHeight - h) / 2,
    width: w,
    height: h,
  };
}
