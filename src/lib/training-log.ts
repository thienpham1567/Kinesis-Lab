import { HYPERTROPHY_EXERCISES } from "@/lib/clinical/muscle-hypertrophy-atlas";

export type TrainingLoadUnit = "kg" | "bodyweight" | "assisted";

/** One reported exercise entry. These values are observations, never clearance or a prescription. */
export type TrainingInput = {
  client_id: string;
  recorded_at: string;
  exercise_id: string;
  sets: number;
  reps: number;
  load: number | null;
  load_unit: TrainingLoadUnit;
  /** Optional self-reported session effort on the displayed 0–10 scale. */
  rpe: number | null;
  feedback: string;
};

export type TrainingRecord = TrainingInput & { id: string; created_at: string };

export class TrainingLogError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "TrainingLogError";
  }
}

export function validateTrainingClientId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value)) {
    throw new TrainingLogError("Thiếu hoặc sai mã học viên (client_id).");
  }
  return value;
}

function finiteNumber(value: unknown, min: number, max: number, label: string, integer = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new TrainingLogError(`${label}: nhập ${integer ? "số nguyên" : "số"} từ ${min} đến ${max}.`);
  }
  return value;
}

export function validateTrainingInput(value: unknown): TrainingInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TrainingLogError("Dữ liệu nhật ký phải là một đối tượng JSON.");
  }
  const body = value as Record<string, unknown>;
  const client_id = validateTrainingClientId(body.client_id);
  const date = body.recorded_at;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith("0000") || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new TrainingLogError("Ngày tập không hợp lệ; dùng định dạng YYYY-MM-DD.");
  }
  if (typeof body.exercise_id !== "string" || !HYPERTROPHY_EXERCISES.some((exercise) => exercise.id === body.exercise_id)) {
    throw new TrainingLogError("Chọn một bài tập có trong Atlas.");
  }
  const load_unit = body.load_unit;
  if (load_unit !== "kg" && load_unit !== "bodyweight" && load_unit !== "assisted") {
    throw new TrainingLogError("Đơn vị tải phải là kg, bodyweight hoặc assisted.");
  }
  if (load_unit === "bodyweight" && body.load != null) {
    throw new TrainingLogError("Bài dùng trọng lượng cơ thể: để trống tải ngoài.");
  }
  if (body.feedback != null && (typeof body.feedback !== "string" || body.feedback.length > 2000)) {
    throw new TrainingLogError("Phản hồi phải là văn bản tối đa 2.000 ký tự.");
  }
  return {
    client_id,
    recorded_at: date,
    exercise_id: body.exercise_id,
    sets: finiteNumber(body.sets, 1, 100, "Số hiệp", true),
    reps: finiteNumber(body.reps, 1, 1000, "Số lần mỗi hiệp", true),
    load: load_unit === "bodyweight" ? null : finiteNumber(body.load, 0, 2000, "Tải (kg)"),
    load_unit,
    rpe: body.rpe == null ? null : finiteNumber(body.rpe, 0, 10, "RPE tự báo cáo"),
    feedback: typeof body.feedback === "string" ? body.feedback.trim() : "",
  };
}

export function trainingExerciseName(exerciseId: string): string {
  const exercise = HYPERTROPHY_EXERCISES.find((item) => item.id === exerciseId);
  return exercise ? `${exercise.name} · ${exercise.vietnameseName}` : exerciseId;
}

export function trainingAtlasHref(exerciseId: string): string {
  return `/atlas?tab=hypertrophy&exercise=${encodeURIComponent(exerciseId)}`;
}
