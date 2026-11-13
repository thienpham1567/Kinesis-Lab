"use client";

import { useMemo, useState } from "react";
import { trainingExerciseName } from "@/lib/training-log";
import type { LoadUnit, TrainingWorkout } from "@/lib/training/program";
import {
  externalLoadSummary,
  progressDate,
  progressNumber,
  rowChartValue,
  quickProgressRange,
  summarizeProgress,
  type ProgressGroup,
  type ProgressRange,
  type ProgressRow,
} from "@/lib/training/progress";
import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { LegacyProgressHistory } from "./LegacyProgressHistory";

const PERIODS = [
  ["4", "4 tuần"],
  ["12", "12 tuần"],
  ["all", "Toàn bộ"],
  ["custom", "Tùy chọn"],
] as const;
type Period = (typeof PERIODS)[number][0];
const UNBOUNDED: ProgressRange = { from: null, to: null };
const UNIT_LABELS: Record<LoadUnit, string> = {
  kg: "Tải ngoài",
  bodyweight: "Trọng lượng cơ thể",
  assisted: "Trợ lực",
};

function describeLoad(unit: LoadUnit, load: number | null) {
  if (unit === "bodyweight") return UNIT_LABELS.bodyweight;
  if (load === null)
    return "Chưa ghi " + UNIT_LABELS[unit].toLocaleLowerCase("vi");
  return (
    progressNumber.format(load) + (unit === "assisted" ? " kg trợ lực" : " kg")
  );
}

function groupLabel(group: ProgressGroup) {
  return [
    group.name,
    UNIT_LABELS[group.unit],
    group.method === "superset" ? "Superset" : "Hiệp thường",
    group.tempo ? "Tempo " + group.tempo : "Chưa ghi tempo",
    group.catalogId ? trainingExerciseName(group.catalogId) : "Bài tự nhập",
  ].join(" · ");
}

function ProgressResult({ row, unit }: { row: ProgressRow; unit: LoadUnit }) {
  const load = unit === "kg" ? externalLoadSummary(row.sets) : null;
  const reps =
    unit === "bodyweight" && row.sets.every((set) => set.reps !== null)
      ? row.sets.reduce((sum, set) => sum + (set.reps ?? 0), 0)
      : null;
  const value = rowChartValue(row, unit);
  return (
    <>
      <p className="font-semibold">{row.sets.length} hiệp xác nhận</p>
      <ul className="mt-1 space-y-1">
        {row.sets.map((set) => (
          <li key={set.setNumber}>
            Hiệp {set.setNumber} ·{" "}
            {set.reps === null ? "Chưa ghi số lần" : set.reps + " lần"} ·{" "}
            {describeLoad(unit, set.load)}
          </li>
        ))}
      </ul>
      {load && load.value !== null && (
        <p className="mt-2 text-slate">
          Tổng tải ngoài × số lần: {progressNumber.format(load.value)} kg × lần
          {load.measuredSets < row.sets.length &&
            ` (từ ${load.measuredSets}/${row.sets.length} hiệp)`}
        </p>
      )}
      {reps !== null && (
        <p className="mt-2 text-slate">
          Tổng {progressNumber.format(reps)} lần
        </p>
      )}
      {value === null && row.status === "completed" && unit !== "assisted" && (
        <p className="mt-1 text-slate">Thiếu số liệu để đưa lên biểu đồ.</p>
      )}
    </>
  );
}

function ProgressTable({
  groups,
  busy,
  onOpenWorkout,
}: {
  groups: ProgressGroup[];
  busy: boolean;
  onOpenWorkout: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.key} className="min-w-0 space-y-2">
          <h4 className="wrap-anywhere text-sm font-bold text-ink">
            {groupLabel(group)}
          </h4>
          <div className="min-w-0 border-y border-rule">
            <table className="w-full table-fixed border-collapse wrap-anywhere text-left text-xs leading-5 text-ink sm:text-sm sm:leading-6">
              <caption className="sr-only">Bảng {groupLabel(group)}</caption>
              <colgroup>
                <col className="w-[29%]" />
                <col className="w-[29%]" />
                <col className="w-[42%]" />
              </colgroup>
              <thead className="bg-surface text-ink">
                <tr>
                  <th scope="col" className="px-1.5 py-2 font-semibold sm:px-3">
                    Buổi tập
                  </th>
                  <th scope="col" className="px-1.5 py-2 font-semibold sm:px-3">
                    Theo giáo án buổi đó
                  </th>
                  <th scope="col" className="px-1.5 py-2 font-semibold sm:px-3">
                    Kết quả đã ghi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {group.rows.map((row) => (
                  <tr key={row.workoutId + "/" + row.exerciseId}>
                    <th
                      scope="row"
                      className="px-1.5 py-3 align-top font-normal sm:px-3"
                    >
                      <time
                        dateTime={row.performedAt}
                        className="font-semibold"
                      >
                        {progressDate(row.performedAt)}
                      </time>
                      <p className="wrap-anywhere">{row.sessionName}</p>
                      <p className="text-slate">
                        {row.status === "completed"
                          ? "Đã hoàn thành"
                          : "Đang thực hiện"}
                      </p>
                      <button
                        type="button"
                        className="mt-1 min-h-11 rounded-md text-left font-semibold text-cobalt underline underline-offset-4 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => onOpenWorkout(row.workoutId)}
                        aria-label={`Mở buổi gốc · ${row.sessionName} · ${progressDate(row.performedAt)}`}
                      >
                        Mở buổi gốc
                      </button>
                    </th>
                    <td className="px-1.5 py-3 align-top sm:px-3">
                      {row.planned.sets} hiệp ×{" "}
                      {row.planned.repMin === row.planned.repMax
                        ? row.planned.repMin
                        : `${row.planned.repMin}–${row.planned.repMax}`}{" "}
                      lần
                      <p>
                        {describeLoad(row.planned.loadUnit, row.planned.load)}
                      </p>
                    </td>
                    <td className="px-1.5 py-3 align-top sm:px-3">
                      <ProgressResult row={row} unit={group.unit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function ProgressPeriodPicker({
  period,
  custom,
  invalid,
  onPeriodChange,
  onCustomChange,
}: {
  period: Period;
  custom: ProgressRange;
  invalid: boolean;
  onPeriodChange: (period: Period) => void;
  onCustomChange: (range: ProgressRange) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-ink">Khoảng ngày</legend>
      <div className="grid grid-cols-2 gap-2 min-[460px]:flex min-[460px]:flex-wrap">
        {PERIODS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={period === value ? "button-primary" : "button-secondary"}
            aria-pressed={period === value}
            onClick={() => onPeriodChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="grid max-w-lg gap-3 sm:grid-cols-2">
          <label className="field-label min-w-0">
            Ngày bắt đầu
            <input
              type="date"
              className="min-w-0 w-full"
              value={custom.from ?? ""}
              aria-invalid={invalid}
              onChange={(event) =>
                onCustomChange({ ...custom, from: event.target.value || null })
              }
            />
          </label>
          <label className="field-label min-w-0">
            Ngày kết thúc
            <input
              type="date"
              className="min-w-0 w-full"
              value={custom.to ?? ""}
              aria-invalid={invalid}
              onChange={(event) =>
                onCustomChange({ ...custom, to: event.target.value || null })
              }
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}

function ProgressResults({
  groups,
  selected,
  onSelect,
  busy,
  onOpenWorkout,
}: {
  groups: ProgressGroup[];
  selected: string;
  onSelect: (key: string) => void;
  busy: boolean;
  onOpenWorkout: (id: string) => void;
}) {
  const group = groups.find(({ key }) => key === selected);
  return (
    <section className="space-y-4" aria-labelledby="progress-results-heading">
      <h3 id="progress-results-heading" className="font-semibold text-ink">
        Kết quả theo bài
      </h3>
      <label className="field-label block min-w-0 max-w-xl">
        Nhóm bài và loại tải
        <select
          className="min-w-0 w-full text-sm"
          value={group?.key ?? ""}
          onChange={(event) => onSelect(event.target.value)}
        >
          <option value="">Tất cả nhóm bài</option>
          {groups.map((item) => (
            <option key={item.key} value={item.key}>
              {groupLabel(item)}
            </option>
          ))}
        </select>
      </label>
      <details className="border-b border-rule pb-2 text-sm leading-6 text-slate">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">
          Cách đọc số liệu
        </summary>
        <p>
          Tải ngoài × số lần được tính từng hiệp có đủ hai giá trị, rồi cộng
          theo dòng bài. Bảng giữ các hiệp đã xác nhận và đối chiếu với bản chụp
          giáo án của từng buổi.
        </p>
        <p className="mt-2">
          Biểu đồ dùng kết quả đủ số liệu từ buổi hoàn thành. Các điểm chỉ so
          sánh thông số đã ghi. Cấu hình thiết bị có thể khác giữa các buổi.
        </p>
      </details>
      {group ? (
        <ExerciseProgressChart group={group} />
      ) : (
        <p className="text-sm text-slate">
          Chọn một nhóm bài để xem biểu đồ của nhóm đó.
        </p>
      )}
      <ProgressTable
        groups={group ? [group] : groups}
        busy={busy}
        onOpenWorkout={onOpenWorkout}
      />
    </section>
  );
}

export function ClientProgressReport({
  clientId,
  workouts,
  busy,
  active,
  onOpenWorkout,
  onOpenLegacy,
}: {
  clientId: string;
  workouts: readonly TrainingWorkout[];
  busy: boolean;
  active: boolean;
  onOpenWorkout: (id: string) => void;
  onOpenLegacy: () => void;
}) {
  const [period, setPeriod] = useState<Period>("4");
  const [custom, setCustom] = useState(() => quickProgressRange(4));
  const [selected, setSelected] = useState("");
  const [showLegacy, setShowLegacy] = useState(false);
  const range = useMemo(() => {
    if (period === "custom") return custom;
    if (period === "all") return UNBOUNDED;
    return quickProgressRange(period === "4" ? 4 : 12);
  }, [period, custom]);
  const { summary, error } = useMemo(() => {
    try {
      return { summary: summarizeProgress(workouts, range), error: "" };
    } catch (error) {
      return {
        summary: null,
        error:
          error instanceof Error ? error.message : "Khoảng ngày không hợp lệ.",
      };
    }
  }, [range, workouts]);
  const rangeLabel =
    period === "all" || (!range.from && !range.to)
      ? "Toàn bộ ngày đã ghi"
      : [
          range.from && `Từ ngày ${progressDate(range.from)}`,
          range.to && `${range.from ? "đến" : "Đến"} ${progressDate(range.to)}`,
        ]
          .filter(Boolean)
          .join(" ");

  return (
    <div className="space-y-5">
      <section
        className="panel min-w-0 space-y-5 p-4 sm:p-6"
        aria-labelledby="progress-heading"
      >
        <h2
          id="progress-heading"
          tabIndex={-1}
          className="text-lg font-bold text-ink"
        >
          Tiến triển tập luyện
        </h2>
        <ProgressPeriodPicker
          period={period}
          custom={custom}
          invalid={!!error}
          onPeriodChange={setPeriod}
          onCustomChange={setCustom}
        />
        {error && (
          <p role="alert" className="text-sm text-crimson">
            {error}
          </p>
        )}
        {summary && (
          <>
            <p className="text-sm text-slate">{rangeLabel}</p>
            <dl className="grid gap-3 border-y border-rule py-3 text-sm sm:grid-cols-3">
              {[
                [summary.completedWorkouts, "Buổi đã hoàn thành"],
                [summary.inProgressWorkouts, "Buổi đang thực hiện"],
                [summary.confirmedSets, "Hiệp xác nhận trong các buổi đã lưu"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-3 sm:block"
                >
                  <dt className="text-slate">{label}</dt>
                  <dd className="text-xl font-bold tabular-nums text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {summary.groups.length === 0 && (
              <p className="text-sm text-slate">
                {!workouts.length
                  ? "Chưa có buổi tập được lưu."
                  : !summary.completedWorkouts && !summary.inProgressWorkouts
                    ? "Không có buổi tập trong khoảng ngày này."
                    : "Các buổi trong khoảng ngày này chưa có hiệp đủ dữ liệu để hiển thị."}
              </p>
            )}
            {summary.groups.length > 0 && (
              <ProgressResults
                groups={summary.groups}
                selected={selected}
                onSelect={setSelected}
                busy={busy}
                onOpenWorkout={onOpenWorkout}
              />
            )}
          </>
        )}
      </section>
      <section
        className="panel min-w-0 p-4 sm:p-6"
        aria-label="Nhật ký tập luyện trước đây"
      >
        <h3>
          <button
            type="button"
            className="button-secondary text-left"
            aria-expanded={showLegacy}
            aria-controls="progress-legacy"
            onClick={() => setShowLegacy(!showLegacy)}
          >
            Nhật ký tập luyện trước đây
          </button>
        </h3>
        <div id="progress-legacy" hidden={!showLegacy}>
          {showLegacy && active && summary && (
            <LegacyProgressHistory
              clientId={clientId}
              range={range}
              onOpenLegacy={onOpenLegacy}
            />
          )}
          {showLegacy && error && (
            <p className="text-sm text-slate">
              Sửa khoảng ngày để xem nhật ký.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
