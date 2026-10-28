import {
  ATLAS_TERMINOLOGY_SOURCES,
  ATLAS_TERMINOLOGY_STATUS_LABELS,
  atlasTerminologyReferenceUrl,
  getAtlasTerminologyComparison,
} from "@/lib/clinical/atlas-terminology-evidence";

export function AtlasTerminologySources({
  english,
  expanded = false,
}: {
  english: string;
  expanded?: boolean;
}) {
  const comparison = getAtlasTerminologyComparison(english);
  if (!comparison) return null;

  return (
    <section
      className="min-w-0 space-y-2 rounded-lg border border-rule bg-canvas p-3 text-xs leading-6 text-slate"
      aria-label={`Đối chiếu tên Việt: ${english}`}
      data-terminology-status={comparison.status}
    >
      <h4 className="font-semibold text-ink">Đối chiếu tên Việt</h4>
      <p className="break-words font-medium text-ink">{english}</p>
      <p>
        {ATLAS_TERMINOLOGY_STATUS_LABELS[comparison.status]} ·{" "}
        {comparison.checkedAt.split("-").reverse().join("/")}
      </p>
      {comparison.note && <p>{comparison.note}</p>}
      {comparison.references.length > 0 ? (
        <details open={expanded}>
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-cobalt">
            Tài liệu và tên đã đọc ({comparison.references.length})
          </summary>
          <ul className="mt-1 space-y-4">
            {comparison.references.map((reference) => {
              const source = ATLAS_TERMINOLOGY_SOURCES[reference.sourceId];
              return (
                <li key={`${reference.sourceId}-${reference.page ?? reference.locator}`}>
                  <a
                    href={atlasTerminologyReferenceUrl(reference)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-cobalt underline underline-offset-2"
                  >
                    {source.title} · {reference.page === null
                      ? reference.locator
                      : `trang PDF ${reference.page}`} ↗
                  </a>
                  <p className="mt-1 text-ink">Tên trong nguồn: {reference.sourceTerm}.</p>
                  {reference.sourceEnglishTerm && (
                    <p className="mt-1 text-ink" lang="en">{reference.sourceEnglishTerm}</p>
                  )}
                  {reference.rowId && (
                    <p>Dòng {reference.rowId} · SNOMED CT {reference.snomedCt}</p>
                  )}
                  <p>Đã đọc nguồn: {source.checkedAt.split("-").reverse().join("/")}</p>
                  <p>{source.access}</p>
                  <p className="mt-1">{source.hostNote}</p>
                </li>
              );
            })}
          </ul>
        </details>
      ) : (
        <p>Tên Việt hiện là chuyển ngữ biên soạn của app. Giữ English bên cạnh để tra cứu.</p>
      )}
      <p className="border-t border-rule pt-2">
        Hồ sơ ngày {comparison.checkedAt} chỉ đối chiếu thuật ngữ;
        không xác nhận nhãn, hình học hay điểm bám trên mô hình.
      </p>
      <a
        href="/anatomy/3d/TERMINOLOGY.md"
        target="_blank"
        rel="noreferrer"
        className="inline-block min-h-11 py-2 font-semibold text-cobalt underline underline-offset-2"
      >
        Bảng đối chiếu đầy đủ và phạm vi đọc ↗
      </a>
    </section>
  );
}
