import { getAtlasCorrections, type AtlasCorrection } from "@/lib/clinical/atlas-catalog";
import { TISSUE_LABELS, type AtlasStructure, type TissueKind } from "@/lib/clinical/atlas-3d";
import { ANATOMY_REGIONS } from "@/lib/clinical/anatomy-atlas";

function dateLabel(date: string) {
  return date.split("-").reverse().join("/");
}

function sideLabel(side: string | null | undefined) {
  return side === "left" ? "Bên trái" : side === "right" ? "Bên phải" : "Không phân bên trong dữ liệu nguồn";
}

function regionLabel(region: string | null | undefined) {
  return ANATOMY_REGIONS.find(({ id }) => id === region)?.name ?? "Chưa gắn vùng học";
}

/** Keep the recorded reading limits without exposing internal audit file paths. */
function readingScope(correction: AtlasCorrection, access: string) {
  if (correction.basis === "paired-source-placement") {
    return "Đối chiếu vị trí và cấu trúc đối bên trong cùng mô hình Z-Anatomy. Không so với mẫu giải phẫu độc lập; không phải phép đo y khoa.";
  }
  if (correction.basis === "university-terminology-entry") {
    return "Đọc mục tên liên quan trong nội dung HTML đầy đủ của trường. Chỉ đối chiếu cách viết Latin; không xác nhận hình học mô hình.";
  }
  return access
    .replace(/\s*Báo cáo:.*$/u, "")
    .replace(/\bbone\b/gu, "Hệ xương")
    .replaceAll("thứ tự một-based", "đếm từ trang đầu tài liệu")
    .replaceAll("từng vertex", "từng điểm trên bề mặt mô hình")
    .replaceAll("GLB", "mô hình 3D")
    .replaceAll("taxonomy", "phân loại")
    .replaceAll("entry", "mục tên")
    .replaceAll("work in progress", "đang được biên soạn")
    .replaceAll("Abstract do publisher lập chỉ mục", "Tóm tắt được nhà xuất bản lập chỉ mục");
}

function correctionRows(correction: AtlasCorrection, structure: AtlasStructure) {
  const { changes, expected } = correction;
  const original = structure.sourceMetadata;
  const rows: { label: string; before: string; after: string; tissue?: boolean }[] = [];
  if (changes.latin !== undefined) rows.push({
    label: "Tên Latin", before: original?.latin ?? expected.latin ?? "Chưa có tên Latin", after: changes.latin,
  });
  if (changes.side !== undefined) rows.push({
    label: "Bên", before: sideLabel(original ? original.side : expected.side), after: sideLabel(changes.side),
  });
  if (changes.clinicalRegion !== undefined) rows.push({
    label: "Vùng học liên quan", before: regionLabel(original ? original.clinicalRegion : expected.clinicalRegion), after: regionLabel(changes.clinicalRegion),
  });
  if (changes.anatomicalTissueLabel !== undefined) rows.push({
    label: "Mô / cấu trúc đã đối chiếu",
    before: (expected.surfaceKinds ?? []).map((kind) => TISSUE_LABELS[kind as TissueKind]).filter(Boolean).join(", "),
    after: structure.anatomicalTissueLabel ?? changes.anatomicalTissueLabel,
    tissue: true,
  });
  return rows;
}

export function AtlasCatalogCorrectionDetails({ structure }: { structure: AtlasStructure }) {
  const corrections = getAtlasCorrections(structure.id)
    .filter(({ id }) => structure.correctionIds?.includes(id));
  if (!corrections.length) return null;

  return (
    <section className="min-w-0 space-y-3 rounded-lg border border-rule bg-canvas p-3 text-xs leading-6 text-slate" aria-label="Hiệu chỉnh catalog có nguồn">
      <h4 className="font-semibold text-ink">Hiệu chỉnh catalog có nguồn</h4>
      {corrections.map((correction) => (
        <div key={correction.id} className="min-w-0 space-y-3 border-t border-rule pt-3">
          {correctionRows(correction, structure).map((row) => (
            <div key={row.label} className="space-y-2">
              <h5 className="font-semibold text-ink">{row.label}</h5>
              <dl className="space-y-2 break-words">
                <div>
                  <dt>{row.tissue ? "Nhãn vật liệu trong mô hình nguồn" : "Dữ liệu nguồn nguyên bản"}</dt>
                  <dd className="text-ink">{row.before}</dd>
                </div>
                <div className="border-l-2 border-cobalt pl-2">
                  <dt>{row.tissue ? "Danh tính đã đối chiếu trong tài liệu" : "Hiển thị sau hiệu chỉnh"}</dt>
                  <dd className={`font-medium text-ink ${row.label === "Tên Latin" ? "italic" : ""}`}>{row.after}</dd>
                </div>
              </dl>
            </div>
          ))}
          <p>Đối chiếu ngày {dateLabel(correction.checkedAt)}. {readingScope(correction, correction.access)}</p>
          <ul className="space-y-3">
            {correction.sources.map((source) => (
              <li key={source.url} className="min-w-0 break-words">
                <a href={source.url} target="_blank" rel="noreferrer" className="inline-block min-h-11 py-2 font-semibold text-cobalt underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt">
                  {source.title} ↗
                </a>
                <p>Đã đọc {dateLabel(source.checkedAt)} · {readingScope(correction, source.access)}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="border-t border-rule pt-2">
        Hiệu chỉnh này chỉ áp dụng cho cấu trúc đang chọn. Nhóm hiển thị và vật liệu nguồn vẫn được giữ riêng; không xác nhận hình học, phân lớp mô học hay mọi cấu trúc cùng nhóm. Chưa có đánh giá độc lập của chuyên gia được ghi nhận.
      </p>
    </section>
  );
}
