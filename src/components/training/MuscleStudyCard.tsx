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
              <div>
                <dt className="font-semibold text-ink">Gợi ý huấn luyện</dt>
                <dd className="text-slate">{s.ptCue}</dd>
              </div>
            </dl>
          </details>
        ))}
      </div>
      <p className="border-t border-rule pt-3 text-[11px] leading-5 text-slate">
        Mô tả theo nhóm cơ và tài liệu được liệt kê. Mesh 3D minh họa cấu trúc từ
        mô hình nguồn; không thể hiện điểm bám hoặc đường sợi đo trên từng người.
      </p>
    </section>
  );
}
