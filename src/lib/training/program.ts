import {
  ProgramError,
  object,
  identifier,
  text,
  number,
  calendarDate,
  loadUnit,
  loadValue,
  unique,
  array,
} from "@/lib/training/validation";
export {
  ProgramError,
  object,
  identifier,
  calendarDate,
} from "@/lib/training/validation";
import { HYPERTROPHY_EXERCISES } from "@/lib/clinical/muscle-hypertrophy-atlas";
import type { MuscleEvidenceRecord } from "@/lib/clinical/evidence-muscle";
export type TrainingGoal =
  "strength" | "hypertrophy" | "fat_loss" | "general_fitness";
export type PlanStatus = "draft" | "active" | "archived";
export type LoadUnit = "kg" | "bodyweight" | "assisted";
export type ExercisePrescription = {
  id: string;
  exerciseId: string | null;
  name: string;
  sets: number;
  repMin: number;
  repMax: number;
  load: number | null;
  loadUnit: LoadUnit;
  restSeconds: number;
  rir: number | null;
  tempo: string;
  method: "straight" | "superset";
  supersetGroup: string;
  notes: string;
};
export type ProgramSession = {
  id: string;
  name: string;
  weekday: number;
  exercises: ExercisePrescription[];
};
export type ProgramDraft = {
  title: string;
  goal: TrainingGoal;
  goalDetail: string;
  reviewDate: string | null;
  weeks: number;
  sessionMinutes: number;
  equipment: string;
  constraints: string;
  rationale: string;
  progression: string;
  sessions: ProgramSession[];
};
export type ProgramSourceContext = {
  kind: "curated-model-context";
  exerciseIds: string[];
  records: Record<string, MuscleEvidenceRecord>;
  reviewedBy: null;
  notice: string;
};
export type TrainingPlan = {
  id: string;
  client_id: string;
  revision: number;
  status: PlanStatus;
  program: ProgramDraft;
  source_context: ProgramSourceContext | null;
  created_at: string;
};
export type WorkoutSet = {
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  load: number | null;
  loadUnit: LoadUnit;
  completed: boolean;
};
export type WorkoutInput = {
  id: string;
  client_id: string;
  plan_id: string;
  session_id: string;
  performedAt: string;
  status: "in_progress" | "completed";
  sets: WorkoutSet[];
  rpe: number | null;
  notes: string;
};
export type TrainingWorkout = WorkoutInput & {
  prescription: ProgramSession;
  created_at: string;
  updated_at: string;
};
export const GOAL_LABELS: Record<TrainingGoal, string> = {
  strength: "Sức mạnh",
  hypertrophy: "Tăng cơ",
  fat_loss: "Giảm mỡ",
  general_fitness: "Thể lực tổng quát",
};
export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Bản nháp",
  active: "Đang áp dụng",
  archived: "Đã lưu trữ",
};
export const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
export function validateProgramDraft(
  value: unknown,
  options: { ai?: boolean } = {},
): ProgramDraft {
  const p = object(value);
  if (typeof p.goal !== "string" || !Object.hasOwn(GOAL_LABELS, p.goal))
    throw new ProgramError("Mục tiêu không hợp lệ.");
  const sessions = array(p.sessions, 1, 7).map((value) => {
    const s = object(value);
    const exercises = array(s.exercises, 1, 12).map((value) => {
      const e = object(value);
      const unit = loadUnit(e.loadUnit);
      const exerciseId =
        e.exerciseId == null || e.exerciseId === ""
          ? null
          : identifier(e.exerciseId);
      if (
        (exerciseId &&
          !HYPERTROPHY_EXERCISES.some((item) => item.id === exerciseId)) ||
        (options.ai && !exerciseId)
      )
        throw new ProgramError(
          "Chọn mã bài tập có trong Atlas; AI không được tạo mã hoặc bài tùy chỉnh.",
        );
      if (
        options.ai &&
        !HYPERTROPHY_EXERCISES.some(
          (item) =>
            item.id === exerciseId &&
            e.name === `${item.name} · ${item.vietnameseName}`,
        )
      )
        throw new ProgramError(
          "Tên bài AI phải giữ nguyên tên Atlas, không tự tạo biến thể.",
        );
      const repMin = number(e.repMin, 1, 1000, true);
      const repMax = number(e.repMax, repMin, 1000, true);
      if (e.method !== "straight" && e.method !== "superset")
        throw new ProgramError("Phương pháp tập không hợp lệ.");
      const supersetGroup = text(e.supersetGroup, 50);
      if (e.method === "superset" && !supersetGroup)
        throw new ProgramError("Superset cần nhóm rõ ràng.");
      return {
        id: identifier(e.id),
        exerciseId,
        name: text(e.name, 180, true),
        sets: number(e.sets, 1, 100, true),
        repMin,
        repMax,
        load: loadValue(e.load, unit, true),
        loadUnit: unit,
        restSeconds: number(e.restSeconds, 0, 3600, true),
        rir: e.rir == null ? null : number(e.rir, 0, 10),
        tempo: text(e.tempo, 80),
        method: e.method,
        supersetGroup: e.method === "straight" ? "" : supersetGroup,
        notes: text(e.notes, 2000),
      } as ExercisePrescription;
    });
    unique(exercises.map((e) => e.id));
    for (const e of exercises)
      if (
        e.method === "superset" &&
        exercises.filter(
          (other) =>
            other.method === "superset" &&
            other.supersetGroup === e.supersetGroup,
        ).length < 2
      )
        throw new ProgramError("Nhóm superset cần ít nhất hai bài.");
    return {
      id: identifier(s.id),
      name: text(s.name, 120, true),
      weekday: number(s.weekday, 0, 6, true),
      exercises,
    };
  });
  unique(sessions.map((s) => s.id));
  unique(sessions.map((s) => s.weekday));
  unique(sessions.flatMap((s) => s.exercises.map((e) => e.id)));
  return {
    title: text(p.title, 160, true),
    goal: p.goal as TrainingGoal,
    goalDetail: text(p.goalDetail, 2000),
    reviewDate:
      p.reviewDate == null || p.reviewDate === ""
        ? null
        : calendarDate(p.reviewDate),
    weeks: number(p.weeks, 1, 104, true),
    sessionMinutes: number(p.sessionMinutes, 1, 360, true),
    equipment: text(p.equipment, 2000),
    constraints: text(p.constraints, 4000),
    rationale: text(p.rationale, 4000),
    progression: text(p.progression, 4000),
    sessions,
  };
}
/** Editable setup values only; these are not individual safe-dose recommendations. */
export function createExercisePrescription(): ExercisePrescription {
  return {
    id: crypto.randomUUID(),
    exerciseId: null,
    name: "",
    sets: 3,
    repMin: 8,
    repMax: 12,
    load: null,
    loadUnit: "bodyweight",
    restSeconds: 90,
    rir: null,
    tempo: "",
    method: "straight",
    supersetGroup: "",
    notes: "",
  };
}
export function createProgramSession(weekday = 1): ProgramSession {
  return {
    id: crypto.randomUUID(),
    name: "Buổi tập",
    weekday,
    exercises: [createExercisePrescription()],
  };
}
export function createProgramDraft(): ProgramDraft {
  return {
    title: "",
    goal: "general_fitness",
    goalDetail: "",
    reviewDate: null,
    weeks: 4,
    sessionMinutes: 45,
    equipment: "",
    constraints: "",
    rationale: "",
    progression: "",
    sessions: [createProgramSession()],
  };
}
export function createWorkoutInput(
  plan: Pick<TrainingPlan, "id" | "client_id">,
  session: ProgramSession,
  performedAt: string,
): WorkoutInput {
  return {
    id: crypto.randomUUID(),
    client_id: plan.client_id,
    plan_id: plan.id,
    session_id: session.id,
    performedAt,
    status: "in_progress",
    sets: session.exercises.flatMap((e) =>
      Array.from({ length: e.sets }, (_, i) => ({
        exerciseId: e.id,
        setNumber: i + 1,
        reps: null,
        load: null,
        loadUnit: e.loadUnit,
        completed: false,
      })),
    ),
    rpe: null,
    notes: "",
  };
}
export function validateWorkoutInput(
  value: unknown,
  session: ProgramSession,
): WorkoutInput {
  const w = object(value);
  if (w.status !== "in_progress" && w.status !== "completed")
    throw new ProgramError("Trạng thái buổi tập không hợp lệ.");
  if (w.session_id !== session.id)
    throw new ProgramError("Buổi tập không khớp giáo án.", 409);
  const sets = array(w.sets, 0, 1200).map((value) => {
    const s = object(value);
    const exerciseId = identifier(s.exerciseId);
    const e = session.exercises.find((e) => e.id === exerciseId);
    if (!e) throw new ProgramError("Bài thực hiện không khớp chỉ định.", 409);
    const setNumber = number(s.setNumber, 1, e.sets, true);
    if (typeof s.completed !== "boolean")
      throw new ProgramError("Cần xác nhận trạng thái từng hiệp.");
    const unit = loadUnit(s.loadUnit);
    return {
      exerciseId,
      setNumber,
      completed: s.completed,
      reps: s.reps == null ? null : number(s.reps, 0, 1000, true),
      load: loadValue(s.load, unit, !s.completed),
      loadUnit: unit,
    };
  });
  unique(sets.map((s) => `${s.exerciseId}:${s.setNumber}`));
  if (sets.some((s) => s.completed && s.reps == null))
    throw new ProgramError("Hiệp hoàn thành cần số lần thực hiện.");
  if (
    w.status === "completed" &&
    (sets.length !== session.exercises.reduce((n, e) => n + e.sets, 0) ||
      sets.some((s) => !s.completed))
  )
    throw new ProgramError(
      "Cần ghi nhận và hoàn thành tất cả hiệp trước khi kết thúc buổi tập.",
    );
  return {
    id: identifier(w.id),
    client_id: identifier(w.client_id),
    plan_id: identifier(w.plan_id),
    session_id: identifier(w.session_id),
    performedAt: calendarDate(w.performedAt),
    status: w.status,
    sets,
    rpe: w.rpe == null ? null : number(w.rpe, 0, 10),
    notes: text(w.notes, 4000),
  };
}
