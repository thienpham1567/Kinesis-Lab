import Image from "next/image";
import { Icon } from "@/components/WorkspaceUI";
import {
  IMAGE_TOPICS,
  IMAGE_LIMIT,
  ILLUSTRATION_LABEL,
  ILLUSTRATION_MODEL_LABEL,
  illustrationModelLabel,
} from "@/lib/illustrations/catalog";
import { dataUrlBlob, downloadBlob } from "@/lib/illustrations/library";
import { IllustrationDetails } from "./IllustrationDetails";
import type { ImageComposer } from "./useImageComposer";
export function ImagePreview({ composer }: { composer: ImageComposer }) {
  const {
    result,
    busy,
    title,
    setTitle,
    caption,
    setCaption,
    saving,
    saved,
    setSaved,
    save,
    disabled,
    editCurrent,
    topic,
  } = composer;
  const sourceLabel = IMAGE_TOPICS.find((t) => t.id === topic)?.label;
  return (
    <div className="min-w-0 space-y-4" aria-busy={busy}>
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">02 · Xem & lưu</p>
        <span className="rounded border border-rule bg-sheet px-2 py-1 font-mono text-[10px] text-slate">
          {ILLUSTRATION_LABEL}
        </span>
      </div>
      {result ? (
        <>
          <div className="overflow-hidden rounded-xl border border-rule bg-canvas">
            <a
              href={result.dataUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Mở ảnh ${illustrationModelLabel(result.receipt.model)} vừa tạo`}
            >
              <Image
                unoptimized
                src={result.dataUrl}
                width={1200}
                height={900}
                alt={`${ILLUSTRATION_LABEL}: ${title}`}
                className="h-auto max-h-[560px] w-full object-contain"
              />
            </a>
          </div>
          <p role="status" className="font-mono text-xs text-cleared">
            {result.receipt.costUsd === null
              ? "API chưa trả chi phí thực tế"
              : `Đã tạo · chi phí thực tế $${result.receipt.costUsd.toFixed(5)}`}
          </p>
          <label className="block text-xs text-slate">
            Tên ảnh
            <input
              value={title}
              maxLength={120}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
              className="mt-1 min-h-11 w-full px-3 text-sm"
            />
          </label>
          <label className="block text-xs text-slate">
            Chú thích đi cùng ảnh
            <textarea
              value={caption}
              maxLength={600}
              onChange={(e) => {
                setCaption(e.target.value);
                setSaved(false);
              }}
              rows={3}
              className="mt-1 w-full px-3 py-2 text-sm leading-6"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || saving || saved}
              onClick={() => {
                void save();
              }}
              className="button-primary"
            >
              {saving
                ? "Đang lưu…"
                : saved
                  ? "Đã lưu thư viện"
                  : "Lưu thư viện"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                void editCurrent();
              }}
              className="button-secondary"
            >
              Dùng ảnh này để chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() =>
                downloadBlob(
                  dataUrlBlob(result.dataUrl),
                  `kinesis-${result.receipt.presetId}.${result.receipt.mediaType === "image/jpeg" ? "jpg" : result.receipt.mediaType === "image/webp" ? "webp" : "png"}`,
                )
              }
              className="button-secondary"
            >
              Tải ảnh
            </button>
          </div>
          {saved && (
            <p role="status" className="text-xs text-cleared">
              Đã lưu trên trình duyệt này. Mở Thư viện để gắn ảnh vào bài
              Movement.
            </p>
          )}
          <IllustrationDetails receipt={result.receipt} />
        </>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-rule-strong bg-canvas px-6 py-12 text-center sm:min-h-96">
          <span className="rounded-xl border border-rule bg-sheet p-4 text-cobalt">
            <Icon name="activity" className="size-8" />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-ink">
            Hình giải phẫu của bạn
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate">
            Chọn vùng cơ thể bên cạnh rồi bấm tạo. Ảnh sẽ xuất hiện ở đây để bạn
            xem, chỉnh sửa và lưu.
          </p>
          <p className="mt-5 font-mono text-[10px] text-cobalt">
            {ILLUSTRATION_MODEL_LABEL.toUpperCase()} / {sourceLabel?.toUpperCase()}
          </p>
        </div>
      )}
      <p className="text-xs leading-5 text-slate">
        {IMAGE_LIMIT} Đối chiếu vị trí, lớp mô và điểm bám trước khi gắn nhãn
        cấu trúc hoặc đưa hình vào bài học.
      </p>
    </div>
  );
}
