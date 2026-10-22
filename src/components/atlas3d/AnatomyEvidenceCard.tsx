import { getAnatomyEvidence } from "@/lib/clinical/anatomy-evidence.mjs";

export default function AnatomyEvidenceCard({
  structureId,
}: {
  structureId: string;
}) {
  const record = getAnatomyEvidence(structureId);
  if (!record) return null;
  const entries = Object.entries(record.sources),
    numbers = new Map(entries.map(([id], i) => [id, i + 1]));
  return (
    <section
      className="mt-5 border-t border-rule pt-4"
      aria-label="Giải phẫu có nguồn của cơ mông nhỡ"
    >
      <p className="eyebrow">Giải phẫu có nguồn</p>
      <p className="mt-2 text-[11px] leading-5 text-slate">
        Đối chiếu tài liệu:{" "}
        {record.review.literatureCheckedAt.split("-").reverse().join("/")}. Các nguồn
        mô tả giải phẫu đại thể; không xác nhận tọa độ điểm bám hoặc hướng sợi trên mesh.
      </p>
      <dl className="mt-3 space-y-3 text-xs leading-6">
        {record.facts.map((fact) => (
          <div key={fact.id}>
            <dt className="font-semibold text-ink">{fact.label}</dt>
            <dd className="text-slate">
              {fact.text}{" "}
              {fact.sources.map((id) => (
                <a
                  key={id}
                  href={record.sources[id as keyof typeof record.sources].url}
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
        <ol className="mt-2 space-y-2 text-[11px] leading-5">
          {entries.map(([id, source]) => (
            <li key={id}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-cobalt underline underline-offset-2"
              >
                [{numbers.get(id)}] {source.label}
              </a>
              <p className="mt-0.5 text-slate">
                Đối chiếu {source.checkedAt}: {source.access}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] leading-6 text-slate">
          {record.architectureNote}{" "}
          {record.architectureSources.map((id) => (
            <a
              key={id}
              href={record.sources[id as keyof typeof record.sources].url}
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-cobalt underline underline-offset-2"
              aria-label={"Nguồn " + numbers.get(id) + " về cấu trúc cơ và gân"}
            >
              [{numbers.get(id)}]
            </a>
          ))}
        </p>
        <p className="mt-2 text-[11px] leading-6 text-slate">
          {record.fiberMapping.reason} Nhãn 3D chỉ chỉ vùng vật liệu của mô hình
          nguồn, không xác nhận điểm nguyên ủy, bám tận hay độ dày mô thật.
        </p>
      </details>
    </section>
  );
}
