import type { EvidenceRecord } from "@/lib/clinical/evidence-types";
export function ClinicalEvidencePanel({
  evidence,
  title = "Nguồn và giới hạn áp dụng",
  defaultOpen,
}: {
  evidence: EvidenceRecord | undefined;
  title?: string;
  defaultOpen?: boolean;
}) {
  if (!evidence) return null;
  return (
    <details
      className="rounded-lg border border-cobalt/20 bg-cobalt-soft/30 p-3 text-xs leading-5 text-ink"
      data-evidence-status={evidence.status}
      open={defaultOpen}
    >
      <summary className="cursor-pointer font-semibold text-cobalt">
        {title}{" "}
        <span className="ml-1 font-normal text-slate">
          ·{" "}
          {evidence.status === "source-only"
            ? "Dữ liệu nguồn"
            : evidence.status === "limited"
              ? "Đối chiếu có giới hạn"
              : "Đã đối chiếu tài liệu"}
        </span>
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-slate">Phát biểu được đối chiếu với các nguồn bên dưới; xem phạm vi đọc và giới hạn áp dụng của từng mục.</p>
        <ul className="list-disc space-y-1 pl-4">
          {evidence.supportedClaims.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="rounded border border-caution/25 bg-sheet p-2.5">
          <p className="font-semibold">Giới hạn</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {evidence.limitations.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <ol className="list-decimal space-y-2 pl-4">
          {evidence.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-cobalt underline"
              >
                {s.title} ↗
              </a>
              <span className="block text-slate">
                Kiểm tra {s.checkedAt} · {s.access}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
