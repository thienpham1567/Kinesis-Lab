"use client";

import Link from "next/link";
import { useState } from "react";
import type { LandingPreview } from "@/lib/landing-data";
import { Icon } from "./WorkspaceUI";

export function LandingRegionPreview({
  previews,
}: {
  previews: LandingPreview[];
}) {
  const [selected, setSelected] = useState(previews[0].id);
  const preview = previews.find((p) => p.id === selected) ?? previews[0];

  return (
    <div className="landing-demo">
      <div
        className="landing-region-picker"
        role="group"
        aria-label="Chọn vùng cơ thể"
      >
        {previews.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={selected === p.id}
            aria-controls="landing-region-content"
            onClick={() => setSelected(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <article
        id="landing-region-content"
        className="landing-region-content"
        aria-labelledby="landing-region-title"
      >
        <div
          className="landing-demo-heading"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="landing-eyebrow">Kiến thức nền · {preview.label}</p>
          <h3 id="landing-region-title">{preview.title}</h3>
        </div>
        <div className="landing-demo-columns">
          <div>
            <p className="landing-demo-fact">{preview.fact}</p>
            <div className="landing-demo-citations">
              {preview.sources.map((source) => (
                <div key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <Icon name="external" className="size-3.5 shrink-0" />
                  </a>
                  <p>
                    Đối chiếu {source.checkedAt.split("-").reverse().join("/")}
                  </p>
                </div>
              ))}
            </div>
            <Link href={`#nguon-${preview.id}`} className="landing-text-link">
              Xem phạm vi đọc nguồn{" "}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <div className="landing-demo-next">
            <p className="landing-eyebrow">Tiếp tục trong app</p>
            <Link
              href={preview.atlasHref}
              prefetch={false}
              className="landing-demo-destination"
            >
              <Icon name="atlas" />
              <span>Mở vùng {preview.label.toLowerCase()} trong Atlas 3D</span>
              <Icon name="arrow-right" className="size-4 shrink-0" />
            </Link>
            <Link
              href={preview.exerciseHref}
              prefetch={false}
              className="landing-demo-destination"
            >
              <Icon name="activity" />
              <span>{preview.exerciseName}</span>
              <Icon name="arrow-right" className="size-4 shrink-0" />
            </Link>
            <p className="landing-demo-limit">
              Bài tập là ví dụ tra cứu, không phải chỉ định cho người đang đau.
              Mô hình 3D không xác nhận số đo hay tình trạng cá nhân.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
