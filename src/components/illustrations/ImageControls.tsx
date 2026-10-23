import Image from "next/image";
import { useId } from "react";
import { Icon } from "@/components/WorkspaceUI";
import {
  IMAGE_TOPICS,
  IMAGE_PRESETS,
  ILLUSTRATION_MODEL_LABEL,
  anatomySources,
  type MovementTopicId,
  type PresetId,
  type Resolution,
  type AspectRatio,
} from "@/lib/illustrations/catalog";
import type { ImageComposer } from "./useImageComposer";
export function ImageControls({ composer }: { composer: ImageComposer }) {
  const id = useId();
  const {
    status,
    statusError,
    topic,
    setTopic,
    preset,
    setPreset,
    prompt,
    setPrompt,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    reference,
    parentId,
    busy,
    preparing,
    error,
    disabled,
    generate,
    chooseFile,
    inputRef,
    removeReference,
    retryConnection,
  } = composer;
  return (
    <div className="space-y-4 rounded-xl border border-rule bg-canvas p-4">
      <div>
        <p className="eyebrow text-cobalt">01 · Mô tả hình</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">
          Vẽ giải phẫu cơ thể
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate">
          Chọn vùng cơ thể, rồi mô tả cấu trúc, góc nhìn và lớp mô cần thấy.
          Có thể thêm ảnh render Atlas làm tham chiếu.
        </p>
      </div>
      <label
        className="block text-xs font-medium text-slate"
        htmlFor={`${id}-topic`}
      >
        Ngữ cảnh sử dụng trong Movement
      </label>
      <select
        id={`${id}-topic`}
        value={topic}
        disabled={disabled}
        onChange={(e) => setTopic(e.target.value as MovementTopicId)}
        className="min-h-11 w-full px-3 text-sm"
      >
        {IMAGE_TOPICS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <label
        className="block text-xs font-medium text-slate"
        htmlFor={`${id}-preset`}
      >
        Vùng giải phẫu
      </label>
      <select
        id={`${id}-preset`}
        value={preset}
        disabled={disabled}
        onChange={(e) => setPreset(e.target.value as PresetId)}
        className="min-h-11 w-full px-3 text-sm"
      >
        {IMAGE_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <label
        className="block text-xs font-medium text-slate"
        htmlFor={`${id}-prompt`}
      >
        {parentId ? "Bạn muốn chỉnh chi tiết nào?" : "Mô tả thêm (tùy chọn)"}
      </label>
      <textarea
        id={`${id}-prompt`}
        value={prompt}
        disabled={disabled}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        maxLength={1600}
        placeholder={
          parentId
            ? "Ví dụ: giữ nguyên cấu trúc và góc nhìn, chỉ đổi nền sang trắng."
            : "Ví dụ: cánh tay phải nhìn trước, tập trung cơ nhị đầu và gân, không chữ."
        }
        className="w-full resize-y px-3 py-2 text-sm leading-6"
      />
      <p className="text-[11px] leading-5 text-slate">
        Mô tả và ảnh đã chọn sẽ gửi qua OpenRouter/Seed khi bạn bấm tạo. Chỉ dùng
        ảnh có quyền sử dụng; giữ thông tin học viên và xét nghiệm ngoài mô tả
        này.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate">
          Độ phân giải
          <select
            value={resolution}
            disabled={disabled}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="mt-1 min-h-11 w-full px-2 text-sm"
          >
            <option value="1K">1K · bản nháp</option>
            <option value="2K">2K · chi tiết hơn</option>
          </select>
        </label>
        <label className="text-xs text-slate">
          Tỷ lệ
          <select
            value={aspectRatio}
            disabled={disabled}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="mt-1 min-h-11 w-full px-2 text-sm"
          >
            {["1:1", "4:3", "3:4", "16:9"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-lg border border-dashed border-rule-strong bg-sheet p-3">
        <label
          htmlFor={`${id}-reference`}
          className="text-xs font-semibold text-cobalt"
        >
          Ảnh tham chiếu (tùy chọn)
        </label>
        <p className="mt-1 text-[11px] leading-5 text-slate">
          Dùng ảnh giải phẫu có quyền sử dụng để hướng dẫn cấu trúc. Model vẫn
          có thể thay đổi chi tiết của ảnh tham chiếu.
        </p>
        <input
          ref={inputRef}
          id={`${id}-reference`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={(e) => {
            void chooseFile(e.target.files?.[0]);
          }}
          className="mt-2 block w-full min-w-0 text-xs text-slate file:mr-2 file:rounded file:border-0 file:bg-cobalt-soft file:px-2 file:py-2 file:text-cobalt"
        />
        {reference && (
          <div className="mt-3 flex items-start gap-3">
            <Image
              unoptimized
              src={reference.dataUrl}
              width={72}
              height={72}
              alt="Ảnh sẽ dùng làm tham chiếu"
              className="size-16 rounded object-contain"
            />
            <div className="min-w-0">
              <p className="break-words text-xs text-slate">
                {reference.name}
                {parentId ? " · ảnh trước đang chỉnh sửa" : ""}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={removeReference}
                className="mt-1 min-h-9 text-xs text-cobalt underline"
              >
                Bỏ ảnh tham chiếu
              </button>
            </div>
          </div>
        )}
      </div>
      <details className="text-xs leading-5 text-slate">
        <summary className="cursor-pointer font-medium text-cobalt">
          Nguồn ngữ cảnh giải phẫu
        </summary>
        <ul className="mt-2 space-y-2">
          {anatomySources(preset).map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="text-cobalt underline underline-offset-2">
                {source.title} ↗
              </a>
              <p className="mt-1 text-[11px]">Đối chiếu {source.checkedAt} · {source.access}</p>
            </li>
          ))}
        </ul>
      </details>
      <div className="rounded-lg bg-cobalt-soft p-3 text-xs leading-5 text-cobalt">
        <p className="font-semibold">{ILLUSTRATION_MODEL_LABEL} · 1 ảnh / lượt</p>
        <p>
          {status
            ? `Ước tính phần ảnh: $${status.prices[resolution].toFixed(3)} · ${status.livePrice ? "giá vừa đọc từ OpenRouter" : `giá tham khảo ${status.priceCheckedAt}`}`
            : "Đang đọc giá và kết nối…"}
        </p>
      </div>
      {status && !status.enabled && (
        <p role="status" className="alert-error text-xs">
          Máy chủ chưa có OPENROUTER_API_KEY. Thêm khóa vào cấu hình máy chủ để
          tạo ảnh.
        </p>
      )}
      {statusError && (
        <p role="alert" className="text-xs text-crimson">
          {statusError}{" "}
          <button
            type="button"
            onClick={retryConnection}
            className="min-h-9 font-semibold underline"
          >
            Kiểm tra lại kết nối
          </button>
        </p>
      )}
      <button
        type="button"
        disabled={disabled || !status?.enabled}
        onClick={() => {
          void generate();
        }}
        className="button-primary w-full justify-center"
      >
        <Icon
          name={disabled ? "spinner" : "plus"}
          className={`size-4 ${disabled ? "animate-spin" : ""}`}
        />
        {busy
          ? "Đang tạo ảnh…"
          : preparing
            ? "Đang chuẩn bị ảnh…"
            : parentId
              ? "Tạo bản chỉnh sửa"
              : "Tạo hình minh họa"}
      </button>
      {busy && (
        <p role="status" className="text-xs leading-5 text-slate">
          Giữ tab mở để nhận ảnh. Yêu cầu đang xử lý; mỗi lượt hoàn tất có thể
          phát sinh phí.
        </p>
      )}
      {error && (
        <p role="alert" className="alert-error break-words text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
