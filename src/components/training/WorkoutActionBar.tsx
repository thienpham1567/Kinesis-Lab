import type { ReactNode } from "react";
import { Icon } from "@/components/WorkspaceUI";

export function WorkoutActionBar({
  compact,
  busy,
  status,
  error,
  timer,
  onNext,
  onSave,
}: {
  compact: boolean;
  busy: boolean;
  status: "Đang lưu…" | "Chưa lưu được" | "Chưa lưu" | "Đã lưu";
  error: string;
  timer: ReactNode;
  onNext: (() => void) | null;
  onSave: (complete: boolean) => void;
}) {
  return (
    <div
      className={compact ? "workout-action-bar space-y-2" : "mt-4 space-y-3"}
      data-workout-actions
    >
      {timer}
      {error && (
        <p className="text-xs leading-5 text-crimson" role="alert">
          {error}
        </p>
      )}
      {compact && (
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2">
          <p
            role="status"
            className="flex items-center gap-1.5 text-xs font-semibold text-ink"
          >
            {status === "Đã lưu" && (
              <Icon name="check" className="size-4 text-cleared" />
            )}
            {status}
          </p>
          {onNext && (
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-ink underline underline-offset-4 disabled:opacity-60"
              disabled={busy}
              onClick={onNext}
            >
              Đến hiệp chưa xong
              <Icon name="arrow-right" className="size-3.5" />
            </button>
          )}
        </div>
      )}
      <div
        className={
          compact
            ? "flex flex-wrap gap-2 [&>button]:flex-1"
            : "flex flex-wrap gap-3"
        }
      >
        <button
          className="button-secondary min-h-11"
          type="button"
          disabled={busy}
          onClick={() => onSave(false)}
        >
          {status === "Đang lưu…" && !compact ? status : "Lưu tiến độ"}
        </button>
        <button
          className="button-primary min-h-11"
          type="button"
          disabled={busy}
          onClick={() => onSave(true)}
          aria-label="Lưu và hoàn thành buổi"
        >
          {compact ? "Hoàn thành" : "Lưu và hoàn thành buổi"}
        </button>
      </div>
    </div>
  );
}
