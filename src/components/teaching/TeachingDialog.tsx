"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  teachingOriginLabel,
  type TeachingView,
} from "@/lib/training/teaching-view";
import { TeachingExercise } from "./TeachingExercise";
import { TeachingHandout } from "./TeachingHandout";

function TeachingEditor({
  view,
  onChange,
}: {
  view: TeachingView;
  onChange: (view: TeachingView) => void;
}) {
  return (
    <div className="space-y-4 border-b border-rule pb-5">
      <p className="text-sm leading-relaxed text-slate">
        Kiểm tra tiêu đề, tên bài và lời nhắc trước khi in. Sửa tiêu đề nếu tên
        buổi có thông tin riêng.
      </p>
      <label className="field-label block">
        Tiêu đề trình bày
        <input
          className="min-h-11 w-full"
          value={view.title}
          maxLength={180}
          onChange={(event) => onChange({ ...view, title: event.target.value })}
        />
      </label>
      <label className="field-label block">
        Lời nhắc riêng (tùy chọn, tối đa 500 ký tự)
        <textarea
          className="min-h-20 w-full"
          rows={2}
          maxLength={500}
          value={view.personalReminder}
          onChange={(event) =>
            onChange({ ...view, personalReminder: event.target.value })
          }
        />
      </label>
    </div>
  );
}

export function TeachingDialog({
  initialView,
  portalRoot,
  onClose,
}: {
  initialView: TeachingView;
  portalRoot: HTMLElement;
  onClose: () => void;
}) {
  const [view, setView] = useState(initialView);
  const [preview, setPreview] = useState(false);
  const [index, setIndex] = useState(0);
  const [showMedia, setShowMedia] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState("");
  const [printNotice, setPrintNotice] = useState("");
  const ownsFullscreen = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLHeadingElement>(null);
  const slide = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const exercise = view.exercises[index];
  const multiple = view.exercises.length > 1;

  useEffect(() => {
    const document = portalRoot.ownerDocument;
    const element = dialog.current;
    const update = () => {
      if (document.fullscreenElement !== portalRoot)
        ownsFullscreen.current = false;
      setFullscreen(ownsFullscreen.current);
    };
    document.addEventListener("fullscreenchange", update);
    if (element && !element.open) {
      element.showModal();
      (slide.current ?? stage.current)?.focus({ preventScroll: true });
    }
    return () => {
      document.removeEventListener("fullscreenchange", update);
      if (ownsFullscreen.current && document.fullscreenElement === portalRoot) {
        ownsFullscreen.current = false;
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [portalRoot]);

  function pauseMedia() {
    dialog.current?.querySelectorAll("video").forEach((video) => video.pause());
  }

  function changeExercise(next: number) {
    if (next < 0 || next >= view.exercises.length || index === next) return;
    pauseMedia();
    setIndex(next);
    body.current?.scrollTo({ top: 0 });
    slide.current?.focus({ preventScroll: true });
  }

  function onStageKey(event: KeyboardEvent<HTMLElement>) {
    if (
      event.target instanceof Element &&
      event.target.closest(
        "input, textarea, select, video, button, a, [contenteditable]",
      )
    )
      return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (!multiple) return;
    event.preventDefault();
    changeExercise(index + (event.key === "ArrowRight" ? 1 : -1));
  }

  async function toggleFullscreen() {
    const element = dialog.current;
    if (!element) return;
    const document = portalRoot.ownerDocument;
    setFullscreenNotice("");
    try {
      if (ownsFullscreen.current) {
        await document.exitFullscreen();
        return;
      }
      await portalRoot.requestFullscreen();
      if (!element.open || !element.isConnected) {
        if (document.fullscreenElement === portalRoot)
          await document.exitFullscreen();
        return;
      }
      ownsFullscreen.current = document.fullscreenElement === portalRoot;
      setFullscreen(ownsFullscreen.current);
    } catch {
      if (element.open)
        setFullscreenNotice(
          "Không mở được toàn màn hình. Bạn vẫn có thể tiếp tục trình bày trong cửa sổ này.",
        );
    }
  }

  function togglePreview() {
    setPrintNotice("");
    pauseMedia();
    setPreview(!preview);
    body.current?.scrollTo({ top: 0 });
  }

  function printHandout() {
    const posters = dialog.current?.querySelectorAll<HTMLImageElement>(
      ".teaching-print-root img",
    );
    if (posters && Array.from(posters).some((image) => !image.complete)) {
      setPrintNotice("Hình minh họa đang tải. Thử in lại khi hình đã hiện.");
      return;
    }
    setPrintNotice("");
    portalRoot.ownerDocument.defaultView?.print();
  }

  const displayed = {
    ...view,
    title:
      view.title.trim() ||
      (view.origin.kind === "exercise"
        ? "Hướng dẫn bài tập"
        : "Hướng dẫn buổi tập"),
  };
  return createPortal(
    <dialog
      ref={dialog}
      className="teaching-dialog"
      data-fullscreen={fullscreen}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={pauseMedia}
    >
      <div className="teaching-controls flex flex-wrap items-center gap-2 border-b border-rule px-4 py-3 sm:px-6">
        <h2
          id={titleId}
          className="mr-auto min-w-40 flex-1 text-sm font-semibold text-ink"
        >
          {preview ? "Xem trước bản in" : "Trình bày cho học viên"}
        </h2>
        <button
          type="button"
          className="button-secondary"
          onClick={togglePreview}
        >
          {preview ? "Về trình bày" : "Xem trước và in"}
        </button>
        <button
          type="button"
          className="button-secondary"
          aria-pressed={fullscreen}
          onClick={() => void toggleFullscreen()}
        >
          {fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            pauseMedia();
            dialog.current?.close();
          }}
        >
          Đóng
        </button>
      </div>
      {fullscreenNotice && (
        <p
          role="status"
          className="teaching-controls border-b border-rule px-4 py-2 text-sm text-ink sm:px-6"
        >
          {fullscreenNotice}
        </p>
      )}
      <div ref={body} className="teaching-body">
        {preview ? (
          <div className="teaching-controls mx-auto max-w-3xl p-4 sm:p-6">
            <TeachingEditor view={view} onChange={setView} />
          </div>
        ) : (
          <section
            aria-label="Nội dung trình bày"
            onKeyDown={onStageKey}
            className="teaching-controls mx-auto max-w-5xl space-y-5 p-4 sm:p-7"
          >
            <header className="space-y-2">
              <p className="text-sm text-slate">
                {teachingOriginLabel(view.origin)}
              </p>
              <h3
                tabIndex={-1}
                ref={stage}
                className="wrap-anywhere text-2xl font-bold leading-tight text-ink sm:text-3xl"
              >
                {displayed.title}
              </h3>
            </header>
            {multiple && (
              <div
                ref={slide}
                tabIndex={0}
                role="group"
                aria-label="Đổi bài bằng phím mũi tên trái hoặc phải"
                className="w-fit rounded-md text-sm text-slate"
              >
                <p role="status">
                  Bài {index + 1} / {view.exercises.length}
                </p>
              </div>
            )}
            {exercise ? (
              <TeachingExercise
                key={index}
                exercise={exercise}
                showName={view.origin.kind !== "exercise"}
                showMedia={showMedia}
                showSources={showSources}
              />
            ) : (
              <p className="text-slate">
                Buổi này chưa có bài tập trong bản đã lưu.
              </p>
            )}
            {view.personalReminder.trim() && (
              <p className="whitespace-pre-wrap wrap-anywhere border-t border-rule pt-3 text-ink">
                {view.personalReminder.trim()}
              </p>
            )}
          </section>
        )}
        {preview && (
          <div className="teaching-print-root mx-auto max-w-3xl px-4 pb-4 sm:px-6 sm:pb-6">
            <style>
              {"@media print { @page { size: A4; margin: 14mm; } }"}
            </style>
            <TeachingHandout view={displayed} />
          </div>
        )}
      </div>
      {preview ? (
        <div className="teaching-controls flex flex-wrap items-center justify-end gap-2 border-t border-rule px-4 py-3 sm:px-6">
          {printNotice && (
            <p role="status" className="mr-auto text-sm text-slate">
              {printNotice}
            </p>
          )}
          <button
            type="button"
            className="button-primary"
            onClick={printHandout}
          >
            In / Lưu PDF
          </button>
        </div>
      ) : (
        <div className="teaching-controls flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3 sm:px-6">
          {multiple && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="button-secondary"
                disabled={index === 0}
                onClick={() => changeExercise(index - 1)}
              >
                Bài trước
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={index === view.exercises.length - 1}
                onClick={() => changeExercise(index + 1)}
              >
                Bài tiếp
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-cobalt"
                checked={showMedia}
                onChange={(event) => {
                  if (!event.target.checked) pauseMedia();
                  setShowMedia(event.target.checked);
                }}
              />
              Minh họa
            </label>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-cobalt"
                checked={showSources}
                onChange={(event) => setShowSources(event.target.checked)}
              />
              Nguồn chi tiết
            </label>
          </div>
        </div>
      )}
    </dialog>,
    portalRoot,
  );
}
