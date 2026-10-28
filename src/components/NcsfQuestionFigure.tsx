"use client";

import Image from "next/image";
import { useState } from "react";

export function NcsfQuestionFigure({ chapter, page, alt }: { chapter: number; page: number; alt: string }) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = `/api/ncsf/figure?chapter=${chapter}&page=${page}`;

  return (
    <figure className="my-3 min-w-0 max-w-full overflow-hidden rounded-lg border border-rule bg-sheet">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-3 py-2 text-sm">
        <span className="font-semibold text-ink">Hình / bảng · Chương {chapter}, trang {page}</span>
        <button type="button" className="button-secondary min-h-10" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>
          {expanded ? "Thu nhỏ hình" : "Phóng to hình"}
        </button>
      </figcaption>
      {failed ? (
        <div className="space-y-2 p-4 text-sm" role="alert">
          <p>Không tải được hình. Hãy thử lại hoặc đăng nhập lại để xem hình trước khi trả lời.</p>
          <button type="button" className="button-secondary" onClick={() => setFailed(false)}>Tải lại hình</button>
        </div>
      ) : (
        <div className="max-h-[42rem] w-full min-w-0 overflow-auto p-2" tabIndex={0} aria-label={`Khung hình có thể cuộn: ${alt}`}>
          {/* Authentication cookies must reach our route directly, bypassing the image optimizer. */}
          <Image unoptimized loading="lazy" src={src} alt={alt} width={1131} height={1600} onError={() => setFailed(true)}
            className={expanded ? "h-auto w-[70rem] max-w-none" : "mx-auto h-auto w-full max-w-3xl"} />
        </div>
      )}
    </figure>
  );
}
