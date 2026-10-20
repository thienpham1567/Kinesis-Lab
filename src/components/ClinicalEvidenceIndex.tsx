"use client";

import { useMemo, useState } from "react";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import {
  EVIDENCE_INDEX,
  EVIDENCE_DOMAIN_LABELS,
  normalizeEvidenceQuery,
  type EvidenceDomain,
} from "@/lib/clinical/evidence-registry";
import type { EvidenceRecord } from "@/lib/clinical/evidence-types";

const STATUS_LABELS: Record<EvidenceRecord["status"], string> = {
  "literature-reviewed": "Đã đối chiếu tài liệu",
  limited: "Đối chiếu có giới hạn",
  "source-only": "Chỉ truy xuất nguồn dữ liệu",
};
const searchable = EVIDENCE_INDEX.map((entry) => ({
  entry,
  text: normalizeEvidenceQuery([
    entry.id, entry.label, EVIDENCE_DOMAIN_LABELS[entry.domain],
    ...entry.evidence.sources.flatMap((source) => [source.title, source.url]),
  ].join(" ")),
}));
const catalogCount = EVIDENCE_INDEX.filter((entry) => entry.domain === "catalog").length;
const scopedCount = EVIDENCE_INDEX.length - catalogCount;

export function ClinicalEvidenceIndex() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<EvidenceDomain | "all">("all");
  const [status, setStatus] = useState<EvidenceRecord["status"] | "all">("all");
  const [visible, setVisible] = useState(12);
  const results = useMemo(() => {
    const terms = normalizeEvidenceQuery(query).split(" ").filter(Boolean);
    return searchable.filter(({ entry, text }) =>
      (domain === "all" || entry.domain === domain) &&
      (status === "all" || entry.evidence.status === status) &&
      terms.every((term) => text.includes(term)),
    ).map(({ entry }) => entry);
  }, [query, domain, status]);

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="clinical-evidence-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">NGUỒN & PHẠM VI / EVIDENCE COVERAGE</p>
          <h2 id="clinical-evidence-heading" className="mt-2 text-xl font-semibold text-ink">Đối chiếu nội dung đang có trong app</h2>
        </div>
        <span className="badge">Chờ chuyên gia duyệt</span>
      </div>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-slate">
        {scopedCount} mục có nguồn và phạm vi đối chiếu: giải phẫu vùng, nhóm cơ, bài tập, trigger point, vùng đau minh họa, bài học, ROM, sàng lọc, thuốc, xét nghiệm và trợ lý.
        {" "}{catalogCount.toLocaleString("vi-VN")} cấu trúc 3D chỉ có truy xuất nguồn và phép so tên với TA2.csv dẫn xuất; 884 cặp tên tiếng Anh/Latin khớp chuỗi. Đây không phải kiểm định giải phẫu hay chẩn đoán.
      </p>
      <p className="mt-2 max-w-4xl text-xs leading-5 text-slate">
        “Đã đối chiếu tài liệu” ghi nhận nguồn đã đọc. “Đối chiếu có giới hạn” giữ rõ phần chưa được hỗ trợ hoặc chỉ là quy ước của app. Tất cả đang chờ chuyên gia độc lập duyệt nội dung, bản dịch và ánh xạ 3D; người duyệt chưa được ghi nhận. Mở từng mục để xem phát biểu, giới hạn truy cập và ngày kiểm tra. PDF của bạn và kết quả PubMed bên dưới không tự có trạng thái đối chiếu này.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_240px]">
        <label className="min-w-0">
          <span className="field-label">Tìm nội dung hoặc tên nguồn</span>
          <input type="search" className="min-h-11 w-full px-3 text-sm" value={query} placeholder="VD: gluteus, ROM, insulin, Z-Anatomy…" onChange={(event) => { setQuery(event.target.value); setVisible(12); }} />
        </label>
        <label className="min-w-0">
          <span className="field-label">Nhóm nội dung</span>
          <select className="min-h-11 w-full px-3 text-sm" value={domain} onChange={(event) => { setDomain(event.target.value as EvidenceDomain | "all"); setVisible(12); }}>
            <option value="all">Tất cả nhóm</option>
            {Object.entries(EVIDENCE_DOMAIN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="min-w-0">
          <span className="field-label">Phạm vi đối chiếu</span>
          <select className="min-h-11 w-full px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value as EvidenceRecord["status"] | "all"); setVisible(12); }}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-4 text-xs text-slate" role="status">{results.length.toLocaleString("vi-VN")} mục phù hợp · đang hiển thị {Math.min(visible, results.length)}</p>
      {results.length === 0 ? <p className="mt-4 rounded-lg bg-canvas p-4 text-sm text-slate">Không có mục phù hợp. Thử tên cơ, vùng hoặc nguồn khác.</p> : (
        <ul className="mt-4 space-y-3">
          {results.slice(0, visible).map((entry) => (
            <li key={entry.id} className="min-w-0 rounded-lg border border-rule p-3 sm:p-4">
              <p className="text-xs text-slate">{EVIDENCE_DOMAIN_LABELS[entry.domain]} · {STATUS_LABELS[entry.evidence.status]}</p>
              <h3 className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{entry.label}</h3>
              <p className="mb-3 mt-1 break-all font-mono text-[10px] text-slate">{entry.id}</p>
              <ClinicalEvidencePanel evidence={entry.evidence} />
            </li>
          ))}
        </ul>
      )}
      {results.length > visible && <button type="button" className="button-secondary mt-4" onClick={() => setVisible((current) => current + 12)}>Xem thêm 12 mục</button>}
    </section>
  );
}
