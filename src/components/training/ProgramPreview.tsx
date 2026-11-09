import Link from "next/link";
import {
  GOAL_LABELS,
  WEEKDAY_LABELS,
  type ProgramDraft,
} from "@/lib/training/program";
import { UNIT_LABELS } from "./ProgramFields";

/** Complete read-only proposal inspection; never shares editable draft handlers. */
export function ProgramPreview({ program }: { program: ProgramDraft }) {
  const intake = [
    ["Tên chương trình", program.title],
    ["Mục tiêu", GOAL_LABELS[program.goal]],
    ["Chi tiết mục tiêu", program.goalDetail],
    ["Ngày xem lại", program.reviewDate],
    ["Thời lượng chương trình", `${program.weeks} tuần`],
    ["Thời gian mỗi buổi", `${program.sessionMinutes} phút`],
    ["Thiết bị", program.equipment],
    ["Giới hạn / điều cần làm rõ", program.constraints],
    ["Lý do lựa chọn", program.rationale],
    ["Tiến triển và điều chỉnh", program.progression],
  ];
  return (
    <details className="mt-4 border-y border-rule py-3 text-sm text-ink" open>
      <summary className="min-h-8 cursor-pointer font-semibold">
        Xem toàn bộ đề xuất trước khi thay bản đang soạn
      </summary>
      <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {intake.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-medium text-slate">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words leading-6">
              {value || "Chưa ghi"}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 divide-y divide-rule">
        {program.sessions.map((session) => (
          <section key={session.id} className="min-w-0 py-4">
            <h4 className="font-semibold">
              {WEEKDAY_LABELS[session.weekday]} · {session.name}
            </h4>
            <ol className="mt-3 divide-y divide-rule">
              {session.exercises.map((exercise) => (
                <li key={exercise.id} className="min-w-0 py-3">
                  <p className="font-semibold">{exercise.name}</p>
                  {exercise.exerciseId ? (
                    <Link
                      href={`/atlas?tab=hypertrophy&exercise=${encodeURIComponent(exercise.exerciseId)}`}
                      className="inline-flex min-h-11 items-center break-all text-xs text-cobalt underline underline-offset-4"
                    >
                      Tham chiếu Atlas · {exercise.exerciseId}
                    </Link>
                  ) : (
                    <p className="mt-1 text-xs text-slate">
                      Chưa liên kết Atlas
                    </p>
                  )}
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-slate">Hiệp × số lần</dt>
                      <dd className="mt-1">
                        {exercise.sets} × {exercise.repMin}–{exercise.repMax}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate">Đơn vị và tải</dt>
                      <dd className="mt-1">
                        {UNIT_LABELS[exercise.loadUnit]} ·{" "}
                        {exercise.load ?? "Chưa ghi tải ngoài"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate">Nghỉ</dt>
                      <dd className="mt-1">{exercise.restSeconds} giây</dd>
                    </div>
                    <div>
                      <dt className="text-slate">RIR</dt>
                      <dd className="mt-1">{exercise.rir ?? "Chưa ghi"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate">Tempo</dt>
                      <dd className="mt-1">{exercise.tempo || "Chưa ghi"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate">Phương pháp / nhóm</dt>
                      <dd className="mt-1">
                        {exercise.method === "superset"
                          ? `Superset · ${exercise.supersetGroup}`
                          : "Từng bài (straight set)"}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6">
                    <strong>Ghi chú: </strong>
                    {exercise.notes || "Chưa ghi"}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </details>
  );
}
