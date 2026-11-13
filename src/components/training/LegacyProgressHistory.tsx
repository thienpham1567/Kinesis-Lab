"use client";

import { useEffect, useState } from "react";
import { trainingExerciseName, type TrainingRecord } from "@/lib/training-log";
import { fetchTrainingLogHistory } from "@/lib/training/log-history";
import {
  filterLegacyProgress,
  progressDate,
  progressNumber,
  type ProgressRange,
} from "@/lib/training/progress";

type LegacyResult = { records: TrainingRecord[] } | { error: string };

export function LegacyProgressHistory({
  clientId,
  range,
  onOpenLegacy,
}: {
  clientId: string;
  range: ProgressRange;
  onOpenLegacy: () => void;
}) {
  const [result, setResult] = useState<LegacyResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchTrainingLogHistory(clientId, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted)
          setResult({
            records: records.filter((record) => record.client_id === clientId),
          });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            error:
              error instanceof Error
                ? error.message
                : "Không tải được nhật ký.",
          });
      });
    return () => controller.abort();
  }, [clientId, attempt]);

  const records =
    result && "records" in result
      ? filterLegacyProgress(result.records, range)
      : [];
  return (
    <div className="space-y-3 pb-1 text-sm leading-6 text-ink">
      <p className="text-slate">
        Mỗi mục là một bài trong nhật ký độc lập. Các mục này được xem riêng với
        buổi tập theo giáo án.
      </p>
      {result === null && <p role="status">Đang tải nhật ký…</p>}
      {result && "error" in result && (
        <div className="space-y-2">
          <p role="alert">{result.error}</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setResult(null);
              setAttempt((previous) => previous + 1);
            }}
          >
            Thử tải lại nhật ký
          </button>
        </div>
      )}
      {result && "records" in result && records.length === 0 && (
        <p>
          {result.records.length
            ? "Không có mục nhật ký trong khoảng ngày này."
            : "Chưa có nhật ký độc lập."}
        </p>
      )}
      {records.length > 0 && (
        <ul className="divide-y divide-rule border-y border-rule">
          {records.map((record) => (
            <li key={record.id} className="wrap-anywhere py-3">
              <time dateTime={record.recorded_at} className="text-slate">
                {progressDate(record.recorded_at)}
              </time>
              <p className="font-semibold">
                {trainingExerciseName(record.exercise_id)}
              </p>
              <p>
                {record.sets} hiệp × {record.reps} lần
                {record.load_unit === "bodyweight"
                  ? " · Trọng lượng cơ thể"
                  : record.load === null
                    ? " · Chưa ghi tải"
                    : ` · ${progressNumber.format(record.load)} kg ${record.load_unit === "assisted" ? "trợ lực" : "tải ngoài"}`}
              </p>
              {record.rpe !== null && <p>RPE tự báo cáo {record.rpe}/10</p>}
              {record.feedback && (
                <p className="whitespace-pre-wrap text-slate">
                  {record.feedback}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="button-secondary" onClick={onOpenLegacy}>
        Mở nhật ký tập luyện
      </button>
    </div>
  );
}
