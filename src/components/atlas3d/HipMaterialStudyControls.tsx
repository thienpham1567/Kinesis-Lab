import type { HipStudySample } from "./hip-material-policy";
import type { StudyStatus } from "./tissue-study-resources";

export default function HipMaterialStudyControls({
  enabled,
  status,
  onEnabled,
  onSample,
  onRetry,
}: {
  enabled: boolean;
  status: StudyStatus;
  onEnabled: (enabled: boolean) => void;
  onSample: (sample: HipStudySample) => void;
  onRetry: () => void;
}) {
  return (
    <section
      className="panel min-w-0 p-4 sm:p-5"
      aria-label="Mẫu vật liệu vùng hông"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Nghiên cứu vật liệu · Vùng hông</p>
          <h3 className="mt-1 text-sm font-semibold text-ink">
            Bề mặt mô phỏng
          </h3>
          <p className="mt-2 max-w-xl text-xs leading-6 text-slate">
            Quan sát cơ–gân và xương–sụn với chi tiết bề mặt, độ bóng ẩm và ánh
            sáng xuyên mô ước lượng.
          </p>
        </div>
        <div
          className="flex gap-1 rounded-lg border border-rule p-1"
          role="group"
          aria-label="So sánh vật liệu"
        >
          {[
            { value: false, label: "Gốc" },
            { value: true, label: "Mô phỏng" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={enabled === option.value}
              className={`min-h-11 rounded-md px-4 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-cobalt ${enabled === option.value ? "bg-cobalt-soft text-cobalt" : "text-slate hover:bg-surface"}`}
              onClick={() => onEnabled(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="button-secondary"
          onClick={() => onSample("muscle")}
        >
          Mẫu cơ mông nhỡ
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => onSample("joint")}
        >
          Mẫu khớp háng
        </button>
        <p className="text-[11px] leading-5 text-slate">
          Đổi Gốc / Mô phỏng giữ nguyên góc nhìn.
        </p>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="mt-3 text-[11px] leading-5 text-slate"
      >
        {enabled && status === "loading" && "Đang tải texture mô phỏng…"}
        {enabled &&
          status === "ready" &&
          "Đang xem vật liệu mô phỏng · Áp dụng cho nhóm cấu trúc mẫu."}
        {enabled && status === "fallback" && (
          <>
            <p>Texture chưa tải được. Đang dùng vật liệu gốc.</p>
            <button
              type="button"
              className="button-secondary mt-2"
              onClick={onRetry}
            >
              Tải lại texture
            </button>
          </>
        )}
      </div>
      <details className="mt-3 border-t border-rule pt-3">
        <summary className="min-h-9 text-xs font-medium text-ink">
          Nguồn & giới hạn của bản mẫu
        </summary>
        <p className="mt-2 max-w-3xl text-[11px] leading-6 text-slate">
          Màu mô minh họa tạo bằng AI; độ nhám và gồ ghề được mô phỏng riêng cho
          từng loại mô. Đây không phải ảnh chụp mô người hay bản đồ hướng sợi cơ
          đo thực tế. Hình dạng và ranh giới cơ–gân–sụn giữ theo
          Z-Anatomy. Hiệu ứng xuyên sáng dùng độ dày lưới ước lượng và thông số
          thị giác thử nghiệm.
        </p>
        <p className="mt-2 text-[11px] leading-6 text-slate">
          Tài liệu đối chiếu hình thể:{" "}
          <a
            className="font-medium text-cobalt underline underline-offset-2"
            href="https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs"
            target="_blank"
            rel="noreferrer"
          >
            OpenStax · cơ vùng hông
          </a>
          {" · "}
          <a
            className="font-medium text-cobalt underline underline-offset-2"
            href="https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints"
            target="_blank"
            rel="noreferrer"
          >
            khớp háng
          </a>
          . Chưa có đánh giá chuyên gia cho độ chính xác của bản mẫu.
        </p>
      </details>
    </section>
  );
}
