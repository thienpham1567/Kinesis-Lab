import type { LoadUnit } from "@/lib/training/program";
export class ProgramError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ProgramError";
  }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProgramError("Dữ liệu phải là đối tượng JSON.");
  return value as Record<string, unknown>;
}
export function identifier(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value)
  )
    throw new ProgramError("Mã bản ghi không hợp lệ.");
  return value;
}
export function text(value: unknown, max: number, required = false): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new ProgramError(`Văn bản không hợp lệ (tối đa ${max} ký tự).`);
  return value.trim();
}
export function number(
  value: unknown,
  min: number,
  max: number,
  integer = false,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new ProgramError(
      `Giá trị phải ${integer ? "là số nguyên" : "là số"} từ ${min} đến ${max} (giới hạn lưu trữ).`,
    );
  return value;
}
export function calendarDate(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000") ||
    !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw new ProgramError("Ngày không hợp lệ; dùng YYYY-MM-DD.");
  return value;
}
export function loadUnit(value: unknown): LoadUnit {
  if (value !== "kg" && value !== "bodyweight" && value !== "assisted")
    throw new ProgramError("Đơn vị tải không hợp lệ.");
  return value;
}
export function loadValue(
  value: unknown,
  unit: LoadUnit,
  optional = false,
): number | null {
  if (unit === "bodyweight") {
    if (value != null)
      throw new ProgramError("Trọng lượng cơ thể: để trống tải ngoài.");
    return null;
  }
  if (value == null && optional) return null;
  return number(value, 0, 2000);
}
export function unique(values: (string | number)[]) {
  if (new Set(values).size !== values.length)
    throw new ProgramError("Mã bản ghi hoặc ngày trong tuần bị trùng.");
}
export function array(value: unknown, min: number, max: number): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max)
    throw new ProgramError(`Danh sách cần ${min}–${max} mục.`);
  return value;
}
