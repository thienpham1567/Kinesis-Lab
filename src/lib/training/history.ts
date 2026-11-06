import type { TrainingHistory } from "@/lib/training/repository";
/** A bounded factual observation summary; no inferred safe-load or personal treatment guidance. */
export function trainingHistorySummary(history: TrainingHistory): string {
  const legacy = history.legacy.slice(0, 8).map((r) => ({
    date: r.recorded_at,
    exercise: r.exercise_id,
    sets: r.sets,
    reps: r.reps,
    load: r.load,
    unit: r.load_unit,
    rpe: r.rpe,
    feedback: r.feedback.slice(0, 300),
  }));
  const workouts = history.workouts.slice(0, 6).map((w) => ({
    date: w.performedAt,
    status: w.status,
    rpe: w.rpe,
    notes: w.notes.slice(0, 300),
    exercises: w.prescription.exercises.slice(0, 12).map((e) => ({
      name: e.name,
      atlasId: e.exerciseId,
      planned: {
        sets: e.sets,
        repMin: e.repMin,
        repMax: e.repMax,
        load: e.load,
        unit: e.loadUnit,
      },
      actual: w.sets
        .filter((s) => s.exerciseId === e.id)
        .slice(0, 12)
        .map((s) => ({
          set: s.setNumber,
          reps: s.reps,
          load: s.load,
          unit: s.loadUnit,
          completed: s.completed,
        })),
    })),
  }));
  const summary = { legacy, workouts, truncated: false };
  let serialized = JSON.stringify(summary);
  while (serialized.length > 16000) {
    summary.truncated = true;
    if (summary.workouts.length > 1) summary.workouts.pop();
    else if (summary.workouts[0]?.exercises.length)
      summary.workouts[0].exercises.pop();
    else if (summary.legacy.length) summary.legacy.pop();
    else break;
    serialized = JSON.stringify(summary);
  }
  return `NHẬT KÝ TẬP GẦN ĐÂY (tự báo cáo; không xác nhận khả năng tập an toàn; mỗi bài hiển thị tối đa 12 hiệp)\n${serialized}`;
}
