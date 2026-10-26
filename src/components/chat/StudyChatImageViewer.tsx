"use client";

import { useEffect, useRef, useState } from "react";
import { downloadBlob } from "@/lib/illustrations/library";
import { clampZoom } from "@/lib/chat/image-client";

export function StudyChatImageViewer({
  open,
  src,
  title,
  blob,
  onClose,
}: {
  open: boolean;
  src?: string;
  title: string;
  blob?: Blob | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  function fit() {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }

  function close() {
    fit();
    onClose();
  }

  return (
    <dialog
      ref={dialog}
      className="study-chat-image-viewer"
      onClose={close}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-rule px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{title}</p>
        <button type="button" className="min-h-10 min-w-10 rounded-lg px-2 text-sm" onClick={() => setZoom((z) => clampZoom(z - 25))}>
          −
        </button>
        <button type="button" className="min-h-10 rounded-lg px-2 text-sm" onClick={() => setZoom(100)}>
          100%
        </button>
        <button type="button" className="min-h-10 min-w-10 rounded-lg px-2 text-sm" onClick={() => setZoom((z) => clampZoom(z + 25))}>
          +
        </button>
        <button type="button" className="min-h-10 rounded-lg px-2 text-sm" onClick={fit}>
          Vừa màn hình
        </button>
        <button
          type="button"
          className="min-h-10 rounded-lg px-2 text-sm"
          onClick={() => {
            const name = `${title.slice(0, 40) || "hinh-minh-hoa"}.png`;
            if (blob) downloadBlob(blob, name);
            else if (src)
              void fetch(src)
                .then((res) => res.blob())
                .then((file) => downloadBlob(file, name));
          }}
          disabled={!blob && !src}
        >
          Tải ảnh gốc
        </button>
        <button type="button" className="min-h-10 rounded-lg px-2 text-sm" onClick={close}>
          Đóng
        </button>
      </div>
      <div
        className="study-chat-image-stage"
        onWheel={(event) => {
          event.preventDefault();
          setZoom((z) => clampZoom(z + (event.deltaY > 0 ? -25 : 25)));
        }}
        onPointerDown={(event) => {
          if (zoom <= 100) return;
          drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setPan({
            x: drag.current.panX + event.clientX - drag.current.x,
            y: drag.current.panY + event.clientY - drag.current.y,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            }}
          />
        ) : (
          <p className="p-6 text-sm text-slate">Không còn dữ liệu ảnh để mở lớn.</p>
        )}
      </div>
    </dialog>
  );
}
