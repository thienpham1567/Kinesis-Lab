import type { MuscleEvidenceRecord } from "@/lib/clinical/evidence-muscle";
import { ClinicalEvidencePanel } from "../ClinicalEvidencePanel";
export function TrainingGuidancePanel({
  guidance,
}: {
  guidance: MuscleEvidenceRecord & { text: string };
}) {
  return (
    <section
      className="panel min-w-0 space-y-3 p-4 sm:p-5"
      aria-label="Nguyên tắc huấn luyện chung"
    >
      <p className="text-xs leading-5 text-slate">{guidance.text}</p>
      <ClinicalEvidencePanel
        evidence={guidance}
        title="Nguyên tắc chung (ACSM 2026)"
        defaultOpen
      />
    </section>
  );
}
