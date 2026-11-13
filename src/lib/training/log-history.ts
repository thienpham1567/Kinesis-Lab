import type { TrainingRecord } from "@/lib/training-log";

export async function fetchTrainingLogHistory(
  clientId: string,
  signal?: AbortSignal,
): Promise<TrainingRecord[]> {
  const response = await fetch(
    `/api/training-log?client_id=${encodeURIComponent(clientId)}`,
    { signal, cache: "no-store" },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Không thể truy cập nhật ký tập.");
  if (!Array.isArray(data.records))
    throw new Error("Máy chủ trả về lịch sử không hợp lệ.");
  return data.records;
}
