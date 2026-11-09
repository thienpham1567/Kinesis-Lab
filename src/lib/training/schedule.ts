import type { TrainingPlan, TrainingWorkout } from "./program";

export function localTrainingDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Weekly calendar occurrence only; completed sessions are never presented as upcoming. */
export function nextScheduledSession(
  plan: TrainingPlan,
  workouts: TrainingWorkout[],
  today = localTrainingDate(),
) {
  const [year, month, day] = today.split("-").map(Number);
  // Noon local time avoids midnight transitions; calendar arithmetic keeps local dates.
  const start = new Date(year, month - 1, day, 12);
  for (let offset = 0; offset < 366; offset++) {
    const occurrence = new Date(start);
    occurrence.setDate(start.getDate() + offset);
    const date = localTrainingDate(occurrence);
    const session = plan.program.sessions.find(
      (s) =>
        s.weekday === occurrence.getDay() &&
        !workouts.some(
          (w) =>
            w.plan_id === plan.id &&
            w.session_id === s.id &&
            w.performedAt === date &&
            w.status === "completed",
        ),
    );
    if (session) return { session, date };
  }
  return null;
}
