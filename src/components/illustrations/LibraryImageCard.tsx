"use client";
import Image from "next/image";
import { useState } from "react";
import {
  IMAGE_TOPICS,
  ILLUSTRATION_LABEL,
  type LibraryImage,
} from "@/lib/illustrations/catalog";
import {
  exportImage,
  exportReceipt,
  updateImage,
} from "@/lib/illustrations/library";
import { useBlobUrl } from "./useImageLibrary";
import { IllustrationDetails } from "./IllustrationDetails";

export function LibraryImageCard({
  image,
  onEdit,
  compact = false,
}: {
  image: LibraryImage;
  onEdit?: (image: LibraryImage) => void;
  compact?: boolean;
}) {
  const url = useBlobUrl(image.blob);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function change(data: Parameters<typeof updateImage>[1]) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await updateImage(image.receipt.id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa lưu thay đổi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-rule bg-sheet">
      <div className="relative flex min-h-40 items-center justify-center bg-canvas">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Mở ảnh: ${image.title}`}
            className="block w-full"
          >
            <Image
              unoptimized
              src={url}
              alt={`${ILLUSTRATION_LABEL}: ${image.title}`}
              width={1200}
              height={900}
              className={`h-auto w-full object-contain ${compact ? "max-h-80" : "max-h-[440px]"}`}
            />
          </a>
        )}
        <span className="absolute bottom-3 left-3 rounded-md border border-rule bg-sheet px-2 py-1 font-mono text-[10px] text-cobalt">
          {ILLUSTRATION_LABEL}
        </span>
      </div>
      <figcaption className="space-y-3 p-4">
        <div>
          <h4 className="text-sm font-semibold text-ink">{image.title}</h4>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate">
            {image.caption}
          </p>
        </div>
        {!compact && !image.deletedAt && (
          <label className="block text-xs text-slate">
            Gắn vào bài Movement
            <select
              aria-label={`Gắn ${image.title} vào bài Movement`}
              disabled={busy}
              value={image.attachedTopicId ?? ""}
              onChange={(e) => {
                void change({
                  attachedTopicId: (e.target.value ||
                    null) as LibraryImage["attachedTopicId"],
                });
              }}
              className="mt-1 min-h-10 w-full px-2 text-sm"
            >
              <option value="">Chỉ giữ trong thư viện</option>
              {IMAGE_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className="button-secondary"
            onClick={() => exportImage(image)}
          >
            Tải ảnh
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => exportReceipt(image)}
          >
            Tải nguồn JSON
          </button>
          {!image.deletedAt && onEdit && (
            <button
              type="button"
              className="button-secondary"
              onClick={() => onEdit(image)}
            >
              Chỉnh sửa ảnh
            </button>
          )}
          {!compact && (
            <button
              type="button"
              disabled={busy}
              className="min-h-10 px-2 text-slate underline underline-offset-2 disabled:opacity-50"
              onClick={() => {
                void change(
                  image.deletedAt
                    ? { deletedAt: null }
                    : {
                        deletedAt: new Date().toISOString(),
                        attachedTopicId: null,
                      },
                );
              }}
            >
              {image.deletedAt ? "Khôi phục" : "Chuyển vào thùng rác"}
            </button>
          )}
        </div>
        {image.attachedTopicId && !image.deletedAt && (
          <p className="text-xs text-cleared" role="status">
            Đã gắn vào{" "}
            {IMAGE_TOPICS.find((t) => t.id === image.attachedTopicId)?.label}{" "}
            trên trình duyệt này.
          </p>
        )}
        {error && (
          <p className="text-xs text-crimson" role="alert">
            {error}
          </p>
        )}
        <IllustrationDetails receipt={image.receipt} />
      </figcaption>
    </figure>
  );
}
