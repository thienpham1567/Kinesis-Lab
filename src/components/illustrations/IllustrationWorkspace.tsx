"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/WorkspaceUI";
import type {
  LibraryImage,
  MovementTopicId,
} from "@/lib/illustrations/catalog";
import { ImageGenerator } from "./ImageGenerator";
import { LibraryImageCard } from "./LibraryImageCard";
import { useImageLibrary } from "./useImageLibrary";

export function IllustrationWorkspace({
  topicId = "patterns",
}: {
  topicId?: MovementTopicId;
}) {
  const [view, setView] = useState<"create" | "library">("create");
  const [trash, setTrash] = useState(false),
    [edit, setEdit] = useState<LibraryImage | null>(null);
  const [generation, setGeneration] = useState(0);
  const [busy, setBusy] = useState(false);
  const { images, loading, error } = useImageLibrary();
  const top = useRef<HTMLDivElement>(null);
  function editImage(image: LibraryImage) {
    if (busy) return;
    setEdit(image);
    setGeneration((n) => n + 1);
    setView("create");
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  const visible = images.filter((i) => Boolean(i.deletedAt) === trash);
  return (
    <section
      ref={top}
      aria-label="Xưởng minh họa giải phẫu Seedream"
      className="scroll-mt-24 space-y-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-cobalt">Kinesis / Visual Studio</p>
          <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">
            Xưởng minh họa giải phẫu
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate">
            Seedream 5.0 Flash · minh họa cơ, xương, gân và các vùng cơ thể.
            Thư viện giữ ảnh, mô tả và nguồn trên trình
            duyệt này; tải ảnh và JSON để sao lưu.
          </p>
        </div>
        <Link
          href={`/movement${topicId === "patterns" ? "" : `?tab=${topicId}`}#movement-illustrations`}
          className="button-secondary"
        >
          <Icon name="book" className="size-4" />
          Mở bài Movement
        </Link>
      </header>
      <div className="tab-bar flex" aria-label="Tạo ảnh và thư viện">
        <button
          type="button"
          aria-pressed={view === "create"}
          className="tab-button flex-1"
          onClick={() => setView("create")}
        >
          Tạo hình
        </button>
        <button
          type="button"
          aria-pressed={view === "library"}
          className="tab-button flex-1"
          onClick={() => setView("library")}
        >
          Thư viện · {images.filter((i) => !i.deletedAt).length}
        </button>
      </div>
      {/* Keep the active request mounted when browsing the library. */}
      {busy && view === "library" && (
        <p role="status" className="text-xs text-cobalt">
          Ảnh vẫn đang được tạo. Mở Tạo hình để xem kết quả khi hoàn tất.
        </p>
      )}
      <div hidden={view !== "create"}>
        <ImageGenerator
          key={generation}
          topicId={topicId}
          editImage={edit}
          onBusyChange={setBusy}
        />
      </div>
      {view === "library" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate">
              Ảnh chỉ xuất hiện trong Movement sau khi bạn chọn bài để gắn.
            </p>
            <button
              type="button"
              className="button-secondary"
              aria-pressed={trash}
              onClick={() => setTrash((v) => !v)}
            >
              {trash
                ? "Xem ảnh đã lưu"
                : `Thùng rác · ${images.filter((i) => i.deletedAt).length}`}
            </button>
          </div>
          {loading && (
            <p role="status" className="text-sm text-slate">
              Đang đọc thư viện…
            </p>
          )}
          {error && (
            <p role="alert" className="alert-error text-sm">
              {error}
            </p>
          )}
          {!loading && !error && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-rule-strong bg-canvas px-5 py-12 text-center">
              <p className="text-sm font-medium text-ink">
                {trash ? "Thùng rác đang trống" : "Chưa có ảnh trong thư viện"}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate">
                {trash
                  ? "Ảnh chuyển vào đây có thể khôi phục."
                  : "Tạo một hình rồi chọn Lưu thư viện. Xem lại ảnh đã lưu không phát sinh lượt tạo mới."}
              </p>
            </div>
          )}
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {visible.map((image) => (
              <LibraryImageCard
                key={image.receipt.id}
                image={image}
                onEdit={busy ? undefined : editImage}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
