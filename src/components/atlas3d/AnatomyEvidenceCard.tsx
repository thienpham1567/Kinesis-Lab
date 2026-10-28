import { getStructureAnatomyEvidence } from "@/lib/clinical/structure-anatomy-evidence";

export default function AnatomyEvidenceCard({
  structureId,
}: {
  structureId: string;
}) {
  const record = getStructureAnatomyEvidence(structureId);
  if (!record) return null;
  const sources = new Map(record.sources.map((source) => [source.id, source]));
  const numbers = new Map(record.sources.map((source, i) => [source.id, i + 1]));
  return (
    <section
      className="mt-5 border-t border-rule pt-4"
      aria-label={`Giải phẫu có nguồn của ${record.name}`}
    >
      <p className="eyebrow">Giải phẫu có nguồn · {record.name}</p>
      <p className="mt-2 text-xs leading-5 text-slate">
        Đối chiếu tài liệu:{" "}
        {record.literatureCheckedAt.split("-").reverse().join("/")}. Các nguồn
        mô tả giải phẫu đại thể; không xác nhận tọa độ điểm bám hoặc hướng sợi trên mesh.
      </p>
      <dl className="mt-3 space-y-3 text-xs leading-6">
        {record.claims.map((fact) => (
          <div key={fact.id}>
            <dt className="font-semibold text-ink">{fact.label}</dt>
            <dd className="text-slate">
              {fact.text}{" "}
              {fact.sourceIds.map((id) => (
                <a
                  key={id}
                  href={sources.get(id)!.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 font-mono text-cobalt underline underline-offset-2"
                  aria-label={"Nguồn " + numbers.get(id) + " cho " + fact.label}
                >
                  [{numbers.get(id)}]
                </a>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <details className="mt-4 border-t border-rule pt-3">
        <summary className="min-h-9 text-xs font-semibold text-ink">
          Nguồn & phạm vi đối chiếu
        </summary>
        <ol className="mt-2 space-y-2 text-xs leading-5">
          {record.sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-cobalt underline underline-offset-2"
              >
                [{numbers.get(source.id)}] {source.title}
              </a>
              <p className="mt-0.5 text-slate">
                Đối chiếu {source.checkedAt}: {source.access}
              </p>
            </li>
          ))}
        </ol>
        {record.architectureNote && !!record.architectureSources?.length && (
          <p className="mt-3 text-xs leading-6 text-slate">
            {record.architectureNote}{" "}
            {record.architectureSources.map((id) => (
              <a
                key={id}
                href={sources.get(id)!.url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-cobalt underline underline-offset-2"
                aria-label={"Nguồn " + numbers.get(id) + " về cấu trúc cơ và gân"}
              >
                [{numbers.get(id)}]
              </a>
            ))}
          </p>
        )}
        <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-6 text-slate">
          {record.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-6 text-slate">
          {record.fiberMapping.reason} Nhãn 3D chỉ chỉ vùng vật liệu của mô hình
          nguồn, không xác nhận điểm nguyên ủy, bám tận hay độ dày mô thật.
        </p>
      </details>
    </section>
  );
}
