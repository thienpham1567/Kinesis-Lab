import type { ReactNode } from "react";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import type { LoadUnit, ProgramSourceContext } from "@/lib/training/program";

export const UNIT_LABELS: Record<LoadUnit, string> = {
  kg: "Tải ngoài (kg)",
  bodyweight: "Trọng lượng cơ thể",
  assisted: "Trợ lực (kg)",
};
export function ProgramField({
  label,
  context,
  children,
}: {
  label: string;
  context?: string;
  children: ReactNode;
}) {
  return (
    <label className="field-label block min-w-0 text-xs font-medium text-ink">
      {context && <span className="sr-only">{context} · </span>}
      {label}
      <span className="mt-1.5 block [&_input]:min-h-11 [&_input]:w-full [&_input]:px-3 [&_input]:py-2 [&_select]:min-h-11 [&_select]:w-full [&_select]:px-3 [&_select]:py-2 [&_textarea]:min-h-20 [&_textarea]:w-full [&_textarea]:px-3 [&_textarea]:py-2">
        {children}
      </span>
    </label>
  );
}
export function NumberField({
  label,
  context,
  value,
  onChange,
  nullable = false,
  min = 0,
  max,
  step = 1,
  disabled = false,
}: {
  label: string;
  context?: string;
  value: number | null;
  onChange: (n: number | null) => void;
  nullable?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <ProgramField label={label} context={context}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(
            e.target.value === "" && nullable ? null : Number(e.target.value),
          )
        }
      />
    </ProgramField>
  );
}
export function UnitField({
  value,
  onChange,
  context,
}: {
  value: LoadUnit;
  onChange: (unit: LoadUnit) => void;
  context: string;
}) {
  return (
    <ProgramField label="Đơn vị tải" context={context}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LoadUnit)}
      >
        {Object.entries(UNIT_LABELS).map(([unit, label]) => (
          <option key={unit} value={unit}>
            {label}
          </option>
        ))}
      </select>
    </ProgramField>
  );
}
export function ProgramSources({
  context,
}: {
  context: ProgramSourceContext | null;
}) {
  return (
    <details className="rounded-xl border border-rule bg-canvas p-4 text-xs leading-6 text-ink">
      <summary className="min-h-8 cursor-pointer font-semibold">
        Nguồn và giới hạn giáo án
      </summary>
      <p className="mt-2">
        Các giá trị thiết lập có thể sửa; không phải liều tập đã được xác nhận
        an toàn cho cá nhân. PT cần đối chiếu hồ sơ, triệu chứng và khả năng
        thực hiện trực tiếp.
      </p>
      {context ? (
        <>
          <p className="mt-2">{context.notice}</p>
          <p className="mt-2">
            Đây là các nguồn đã cung cấp cho mô hình. Chúng không xác nhận từng
            câu, biến thể hoặc mức tải trong giáo án. Chưa có người đánh giá độc
            lập được ghi nhận.
          </p>
          <div className="mt-3 space-y-3">
            {Object.entries(context.records).map(([id, evidence]) => (
              <ClinicalEvidencePanel
                key={id}
                evidence={evidence}
                title={`Nguồn ngữ cảnh · ${id}`}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-2">
          Bản soạn thủ công chưa có ngữ cảnh nguồn AI được lưu. Có thể liên kết
          từng bài với Atlas để đọc nguồn của mục đó.
        </p>
      )}
    </details>
  );
}
