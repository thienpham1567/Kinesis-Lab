"use client";

import { useId, useState } from "react";
import type { ExerciseInstructionMediaAsset } from "@/lib/clinical/exercise-instruction-types";

/**
 * Optional clip for an instruction card. The 16:9 frame is reserved in every
 * state so opening a card never shifts fields the PT is typing in. Playing a
 * clip is not recorded as viewing or mastering the technique.
 */
export function ExerciseInstructionMedia({
  media,
  title,
}: {
  media: ExerciseInstructionMediaAsset | null;
  title: string;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const statusId = useId();

  if (!media) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-rule bg-surface p-3 text-center">
        <p className="text-xs text-slate">Chưa có video cho thẻ này</p>
      </div>
    );
  }

  return (
    <figure className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-rule bg-surface">
        {failed ? (
          <div
            role="alert"
            id={statusId}
            className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center"
          >
            <p className="text-xs text-ink">
              Không tải được video. Nội dung hướng dẫn bằng chữ vẫn dùng được.
            </p>
            <button
              type="button"
              className="button-secondary min-h-11 px-3"
              onClick={() => {
                setFailed(false);
                setAttempt((n) => n + 1);
              }}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <video
            key={attempt}
            className="size-full object-contain"
            controls
            preload="none"
            playsInline
            poster={media.poster}
            aria-label={`Video minh họa ${title}`}
            onError={() => setFailed(true)}
          >
            {/* A failed <source> fires `error` on itself and does not bubble to <video>. */}
            <source
              src={media.src}
              type="video/mp4"
              onError={() => setFailed(true)}
            />
            <track
              kind="captions"
              src={media.captions}
              srcLang="vi"
              label="Tiếng Việt"
              default
            />
          </video>
        )}
      </div>
      <figcaption className="text-xs leading-5 text-slate">
        {media.credit} · {media.license} ·{" "}
        <a
          href={media.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-cobalt underline underline-offset-2"
        >
          Nguồn video ↗
        </a>
      </figcaption>
    </figure>
  );
}
