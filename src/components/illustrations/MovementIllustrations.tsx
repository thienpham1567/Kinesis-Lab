"use client";
import { useState } from "react";
import type { MovementTopicId } from "@/lib/illustrations/catalog";
import { IllustrationWorkspace } from "./IllustrationWorkspace";
import { LibraryImageCard } from "./LibraryImageCard";
import { useImageLibrary } from "./useImageLibrary";

export function MovementIllustrations({
  topicId,
}: {
  topicId: MovementTopicId;
}) {
  const { images, error } = useImageLibrary();
  const [open, setOpen] = useState(false);
  const attached = images.filter(
    (i) => !i.deletedAt && i.attachedTopicId === topicId,
  );
  return (
    <section
      id="movement-illustrations"
      aria-label="Hình minh họa của bạn"
      className="panel scroll-mt-24 space-y-4 p-4 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-cobalt">Minh họa bổ sung / AI</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">
            Hình minh họa của bạn
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate">
            Ảnh trong thư viện trình duyệt được gắn vào bài này. Nguồn gốc của
            hình nghiên cứu và hình giáo trình ở trên vẫn được ghi riêng.
          </p>
        </div>
        <button
          type="button"
          className="button-secondary"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Thu gọn xưởng minh họa" : "Tạo hình / Quản lý thư viện"}
        </button>
      </header>
      {error && (
        <p role="alert" className="text-xs text-crimson">
          {error}
        </p>
      )}
      {attached.length > 0 ? (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {attached.map((image) => (
            <LibraryImageCard key={image.receipt.id} image={image} compact />
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-canvas p-4 text-xs leading-5 text-slate">
          Chưa gắn ảnh AI vào bài này. Mở xưởng minh họa để tạo ảnh hoặc chọn
          ảnh đã lưu.
        </p>
      )}
      <div hidden={!open} className="border-t border-rule pt-5">
        <IllustrationWorkspace topicId={topicId} />
      </div>
    </section>
  );
}
