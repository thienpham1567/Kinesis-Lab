import Link from "next/link";
import type { MuscleGroupAtlas } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { MUSCLE_GROUP_EVIDENCE } from "@/lib/clinical/evidence-muscle";
import { atlasGroupHref } from "@/lib/clinical/training-atlas";
import { ClinicalEvidencePanel } from "../ClinicalEvidencePanel";
export function MuscleStudyCard({
  muscle,
  compact = false,
}: {
  muscle: MuscleGroupAtlas;
  compact?: boolean;
}) {
  return (
    <section
      className="panel min-w-0 space-y-4 p-4 sm:p-5"
      aria-label={`Giải phẫu ${muscle.name}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Giải phẫu chức năng</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{muscle.name}</h3>
          <p className="mt-1 text-xs italic text-slate">{muscle.latinName}</p>
        </div>
        <Link href={atlasGroupHref(muscle.id)} className="button-secondary">
          Khám phá nhóm cơ 3D ↗
        </Link>
      </header>
      <p className="text-sm leading-6 text-ink">{muscle.summary}</p>
      {!compact && muscle.hypertrophyScience && (
        <div className="rounded-lg border border-rule bg-canvas px-3.5 py-3">
          <p className="text-xs font-semibold text-cobalt">
            Bối cảnh nghiên cứu & ứng dụng
          </p>
          <p className="mt-1 text-xs leading-6 text-ink">
            {muscle.hypertrophyScience}
          </p>
        </div>
      )}
      <ClinicalEvidencePanel evidence={MUSCLE_GROUP_EVIDENCE[muscle.id]} />
      <div className="divide-y divide-rule">
        {muscle.subdivisions.map((s, index) => (
          <details
            key={s.id}
            className="py-3"
            open={compact ? undefined : index === 0}
          >
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              {s.name}
              <span className="mt-0.5 block text-xs font-normal italic text-slate">
                {s.latin}
              </span>
            </summary>
            <dl className="mt-3 space-y-3 text-xs leading-6">
              <div>
                <dt className="font-semibold text-ink">Nguyên ủy → Bám tận</dt>
                <dd className="text-slate">{s.originInsertion}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Chức năng và mô tả</dt>
                <dd className="text-slate">{s.fiberDirection}</dd>
              </div>
              {!compact && (s.lengthenedExercise || s.shortenedExercise) && (
                <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
                  <div className="rounded border border-rule bg-canvas px-3 py-2">
                    <dt className="font-semibold text-ink">
                      Ví dụ ở biên độ cơ kéo dài
                    </dt>
                    <dd className="mt-0.5 text-slate">{s.lengthenedExercise}</dd>
                  </div>
                  <div className="rounded border border-rule bg-canvas px-3 py-2">
                    <dt className="font-semibold text-ink">
                      Ví dụ ở biên độ cơ rút ngắn
                    </dt>
                    <dd className="mt-0.5 text-slate">{s.shortenedExercise}</dd>
                  </div>
                </div>
              )}
              <div>
                <dt className="font-semibold text-ink">Gợi ý huấn luyện</dt>
                <dd className="text-slate">{s.ptCue}</dd>
              </div>
            </dl>
          </details>
        ))}
      </div>
      {!compact && muscle.compensationFixes.length > 0 && (
        <div className="space-y-2.5 border-t border-rule pt-4">
          <p className="text-xs font-semibold text-ink">
            Tình huống cần quan sát & gợi ý điều chỉnh khi dạy
          </p>
          {muscle.compensationFixes.map((fix) => (
            <div
              key={fix.symptom}
              className="rounded-lg border border-rule bg-canvas px-3.5 py-3 text-xs leading-6"
            >
              <p className="font-semibold text-ink">{fix.symptom}</p>
              <p className="mt-1 text-slate">
                <span className="font-medium text-ink">Cơ chế cần xét: </span>
                {fix.biomechanicalCause}
              </p>
              <p className="mt-1 text-slate">
                <span className="font-medium text-cobalt">Gợi ý chỉnh: </span>
                {fix.ptCorrection}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="border-t border-rule pt-3 text-xs leading-5 text-slate">
        Mô tả theo nhóm cơ và tài liệu được liệt kê. Mesh 3D minh họa cấu trúc từ
        mô hình nguồn; không thể hiện điểm bám hoặc đường sợi đo trên từng người.
      </p>
    </section>
  );
}
