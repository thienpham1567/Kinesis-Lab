import { useId } from "react";
import {
  progressDate,
  progressNumber,
  rowChartValue,
  type ProgressGroup,
} from "@/lib/training/progress";

export function ExerciseProgressChart({ group }: { group: ProgressGroup }) {
  const id = useId();
  if (group.unit === "assisted") {
    return (
      <p className="text-sm text-slate">
        Xem mức trợ lực và số lần của từng hiệp trong bảng.
      </p>
    );
  }

  const points = group.rows.toReversed().flatMap((row) => {
    const value = rowChartValue(row, group.unit);
    return value === null ? [] : [{ row, value }];
  });
  if (points.length < 2) {
    return (
      <p className="text-sm text-slate">
        Cần ít nhất hai dòng kết quả đủ số liệu từ buổi đã hoàn thành để vẽ biểu
        đồ.
      </p>
    );
  }

  const metric =
    group.unit === "kg" ? "Tổng tải ngoài × số lần" : "Tổng số lần thực hiện";
  const unit = group.unit === "kg" ? "kg × lần" : "lần";
  const max = points.reduce(
    (highest, point) => Math.max(highest, point.value),
    2,
  );
  const step = Math.ceil(max / 2);
  const ticks = [0, step, step * 2];
  // UTC here measures the interval between date labels without shifting either date.
  const day = (date: string) => Date.parse(date + "T00:00:00Z");
  const start = day(points[0].row.performedAt);
  const end = day(points[points.length - 1].row.performedAt);
  const x = (date: string) =>
    start === end ? 191 : 64 + ((day(date) - start) / (end - start)) * 254;
  const y = (value: number) => 126 - (value / ticks[2]) * 104;

  return (
    <figure className="min-w-0 max-w-xl space-y-2">
      <figcaption className="text-sm font-semibold text-ink">
        {metric} ({unit})
      </figcaption>
      <svg
        className="block w-full text-slate"
        viewBox="0 0 360 158"
        role="img"
        aria-labelledby={id + "-title " + id + "-description"}
      >
        <title id={id + "-title"}>
          {metric} của {group.name}
        </title>
        <desc id={id + "-description"}>
          Mỗi điểm là kết quả của một dòng bài trong buổi đã hoàn thành. Bảng
          bên dưới có ngày, giá trị và bản ghi gốc.
        </desc>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1="59"
              x2="333"
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--rule-strong)"
              strokeDasharray={tick === 0 ? undefined : "3 3"}
            />
            <text
              x="53"
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="12"
              fill="currentColor"
            >
              {progressNumber.format(tick)}
            </text>
          </g>
        ))}
        {points.map(({ row, value }) => (
          <circle
            key={row.workoutId + "/" + row.exerciseId}
            cx={x(row.performedAt)}
            cy={y(value)}
            r="4.5"
            fill="var(--cobalt)"
            stroke="var(--sheet)"
            strokeWidth="1"
          >
            <title>
              {progressDate(row.performedAt)} · {progressNumber.format(value)}{" "}
              {unit}
            </title>
          </circle>
        ))}
        {Array.from(
          new Set([
            points[0].row.performedAt,
            points[points.length - 1].row.performedAt,
          ]),
        ).map((date) => (
          <text
            key={date}
            x={x(date)}
            y="149"
            textAnchor={
              start === end ? "middle" : day(date) === start ? "start" : "end"
            }
            fontSize="12"
            fill="currentColor"
          >
            {progressDate(date)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
