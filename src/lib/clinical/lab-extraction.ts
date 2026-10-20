export type ExtractedMetric = { value: string | number; unit: string; reference_range: string; flag: "low"|"high"|"normal"|"unknown" };
export type LabExtraction = { kind: "blood_lab"|"inbody"; recorded_at: string | null; metrics: Record<string,ExtractedMetric>; ai_summary: string };
const text = (v:unknown,max=180) => typeof v === "string" ? v.trim().slice(0,max) : "";
export function normalizeLabExtraction(raw:unknown): LabExtraction {
  if (!raw || typeof raw !== "object") throw new Error("Kết quả trích xuất không hợp lệ");
  const r = raw as Record<string,unknown>;
  if (r.kind !== "blood_lab" && r.kind !== "inbody") throw new Error("Chưa xác định loại phiếu; cần kiểm tra ảnh gốc");
  const metrics: Record<string,ExtractedMetric> = Object.create(null);
  if (r.metrics && typeof r.metrics === "object" && !Array.isArray(r.metrics)) {
    for (const [name,item] of Object.entries(r.metrics).slice(0,150)) {
      if (!name.trim() || !item || typeof item !== "object" || Array.isArray(item)) continue;
      const m = item as Record<string,unknown>;
      if (!(typeof m.value === "string" && m.value.trim()) && !(typeof m.value === "number" && Number.isFinite(m.value))) continue;
      metrics[text(name,120)] = {
        value: typeof m.value === "number" ? m.value : text(m.value),
        unit: text(m.unit,80), reference_range:text(m.reference_range),
        flag: ["low","high","normal"].includes(String(m.flag)) ? m.flag as ExtractedMetric["flag"] : "unknown",
      };
    }
  }
  if (!Object.keys(metrics).length) throw new Error("Không đọc được chỉ số; hãy kiểm tra phiếu và tải lại ảnh rõ hơn");
  const date = text(r.recorded_at,10);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date;
  return {kind:r.kind,recorded_at:validDate ? date : null,metrics,
    ai_summary:"Bản chép dữ liệu cần đối chiếu tên, giá trị, đơn vị, khoảng tham chiếu, cờ và ngày với phiếu gốc. Không phải diễn giải y khoa hoặc chỉ định tập luyện."};
}
