import { useState } from "react";
import { LEARNING_REGIONS } from "./region-learning";
import type { AtlasArea } from "@/lib/clinical/atlas-3d";
import {
  ANATOMY_REGIONS,
  REGION_FOUNDATIONS,
} from "@/lib/clinical/anatomy-atlas";
import { ANATOMY_REGION_EVIDENCE } from "@/lib/clinical/evidence-anatomy";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import { getCatalogEvidence } from "@/lib/clinical/evidence-registry";
import { AtlasTerminologySources } from "./AtlasTerminologySources";

export function RegionLearningOverview({
  area,
  areaLabel,
  selfCheck,
}: {
  area: AtlasArea;
  areaLabel: string;
  selfCheck: boolean;
}) {
  const [answer, setAnswer] = useState(false);
  const config = LEARNING_REGIONS[area];
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs text-cobalt">01 / {areaLabel}</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-ink">
          Đọc cấu trúc qua từng lớp.
        </h3>
        <p className="mt-2 text-xs leading-6 text-slate">
          Tra tên ở thanh tìm kiếm phía trên mô hình. Chọn một bước bên dưới
          để quan sát theo lớp, hoặc mở Kiến thức để đọc về cấu trúc đã chọn.
        </p>
      </div>
      <div className="space-y-4 border-t border-rule pt-4">
        <h4 className="text-sm font-semibold text-ink">
          Kiến thức nền có nguồn
        </h4>
        {config.scope && (
          <p className="text-xs leading-6 text-slate">{config.scope}</p>
        )}
        {config.regions.map((regionId) => {
          const evidence = ANATOMY_REGION_EVIDENCE[regionId];
          return (
            <section key={regionId} className="space-y-3">
              <h5 className="text-xs font-semibold text-ink">
                {ANATOMY_REGIONS.find((region) => region.id === regionId)?.name}
              </h5>
              {REGION_FOUNDATIONS[regionId].map((fact, index) => (
                <div key={fact.text} className="flex items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs text-cobalt">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs leading-6 text-slate">
                    {fact.text}{" "}
                    {fact.sourceRefs.map((ref) => (
                      <a
                        key={ref}
                        href={evidence.sources[ref - 1].url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-cobalt underline underline-offset-2"
                        aria-label={`Nguồn ${ref} cho ${regionId}, kiến thức nền ${index + 1}`}
                      >
                        [{ref}]
                      </a>
                    ))}
                  </p>
                </div>
              ))}
            </section>
          );
        })}
        <p className="text-xs leading-5 text-slate">
          Đối chiếu tài liệu: 22/10/2026. Nguồn mô tả giải phẫu đại thể; không
          xác nhận từng vị trí trên mesh.
        </p>
      </div>
      <div className="rounded-lg border border-rule bg-canvas p-3">
        <p className="text-xs font-semibold text-ink">
          {selfCheck ? "Đến lượt bạn" : "Một câu hỏi trước khi tiếp tục"}
        </p>
        <p className="mt-2 text-xs leading-6 text-slate">
          Ẩn lớp cơ để thấy xương có đồng nghĩa hình học và điểm bám trên mô
          hình đã được xác nhận chính xác không?
        </p>
        <button
          type="button"
          className="mt-2 min-h-11 text-xs font-semibold text-cobalt underline underline-offset-4"
          aria-expanded={answer}
          onClick={() => setAnswer((value) => !value)}
        >
          {answer ? "Ẩn giải thích" : "Xem giải thích"}
        </button>
        {answer && (
          <p className="mt-1 text-xs leading-6 text-slate">
            Ẩn lớp chỉ thay đổi hiển thị. Tên và hình học đến từ dữ liệu nguồn;
            kiến thức cần đối chiếu tài liệu, còn vị trí điểm bám cần dữ liệu
            tương ứng. Các link nguồn trong bàn học ghi rõ phạm vi đã đọc.
          </p>
        )}
      </div>
    </div>
  );
}

export function RegionLearningSources({
  area,
  areaLabel,
  selectedId,
  selectedEnglish,
}: {
  area: AtlasArea;
  areaLabel: string;
  selectedId: string | null;
  selectedEnglish: string | null;
}) {
  const regions = LEARNING_REGIONS[area].regions;
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-ink">
        Nguồn kiến thức · {areaLabel}
      </h3>
      {selectedEnglish && (
        <AtlasTerminologySources key={selectedEnglish} english={selectedEnglish} expanded />
      )}
      {regions.map((regionId) => {
        const evidence = ANATOMY_REGION_EVIDENCE[regionId];
        const refs = [
          ...new Set(
            REGION_FOUNDATIONS[regionId].flatMap((fact) => fact.sourceRefs),
          ),
        ];
        return (
          <section
            key={regionId}
            className="space-y-3 border-b border-rule pb-4"
          >
            <h4 className="text-xs font-semibold text-ink">
              {ANATOMY_REGIONS.find((region) => region.id === regionId)?.name}
            </h4>
            <ol className="space-y-4">
              {refs.map((ref) => {
                const source = evidence.sources[ref - 1];
                return (
                  <li key={source.url} className="text-xs leading-6 text-slate">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-cobalt underline underline-offset-2"
                    >
                      [{ref}] {source.title} ↗
                    </a>
                    <p className="mt-1">
                      Đối chiếu {source.checkedAt} · {source.access}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <div className="text-xs leading-6 text-slate">
        <a
          href="/anatomy/3d/TERMINOLOGY.md"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cobalt underline underline-offset-2"
        >
          Tên Việt / English · nguồn & phạm vi chuyển ngữ ↗
        </a>
        <p className="mt-1">
          Tên Anh giữ theo mô hình nguồn. Tên Việt là phần chuyển ngữ hiển thị
          của app; không phải bản dịch chính thức của FIPAT và không xác nhận vị
          trí trên mesh.
        </p>
      </div>
      {selectedId && (
        <ClinicalEvidencePanel
          evidence={getCatalogEvidence(selectedId)}
          title="Nguồn cấu trúc đã chọn"
        />
      )}
      <a
        href="/anatomy/3d/ATTRIBUTION.md"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center text-xs font-semibold text-cobalt underline underline-offset-2"
      >
        Z-Anatomy / BodyParts3D · Nguồn & giấy phép ↗
      </a>
      <p className="text-xs leading-6 text-slate">
        Nhãn bám vào bề mặt mesh để đọc tên cấu trúc. Vị trí nhãn không phải mốc
        nguyên ủy, bám tận hoặc số đo mô.
      </p>
    </div>
  );
}
