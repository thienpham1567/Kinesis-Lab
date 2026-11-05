"use client";

import { useState, type ReactNode } from "react";
import { ContextualAnatomyViewer } from "@/components/atlas3d/ContextualAnatomyViewer";
import {
  ANATOMY_REGIONS,
  type AnatomyRegionId,
} from "@/lib/clinical/anatomy-atlas";

const SHORT: Record<AnatomyRegionId, string> = {
  cervical: "Cột sống cổ",
  shoulder: "Vai",
  thoracic_core: "Thân",
  lumbar: "Thắt lưng",
  hip_pelvis: "Hông & chậu",
  thigh_hamstring: "Đùi",
  knee: "Gối",
  ankle_foot: "Cổ chân & bàn chân",
};

export function MovementAnatomy({
  topicId,
  regions,
  note,
}: {
  topicId: string;
  regions: AnatomyRegionId[];
  note: ReactNode;
}) {
  const [active, setActive] = useState(regions[0]);
  const region = ANATOMY_REGIONS.find((r) => r.id === active);
  return (
    <section
      id={`movement-${topicId}-3d`}
      aria-labelledby={`movement-${topicId}-3d-title`}
      className="scroll-mt-36 space-y-3"
    >
      <h3
        id={`movement-${topicId}-3d-title`}
        className="font-display text-lg font-semibold text-ink"
      >
        Quan sát trên mô hình 3D
      </h3>
      <p className="max-w-xl text-sm leading-6 text-ink">{note}</p>
      {regions.length > 1 ? (
        <div
          className="tab-bar flex flex-wrap"
          role="group"
          aria-label="Vùng giải phẫu"
        >
          {regions.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              onClick={() => setActive(id)}
              className="tab-button px-3"
            >
              {SHORT[id]}
            </button>
          ))}
        </div>
      ) : null}
      <ContextualAnatomyViewer
        context={{ kind: "region", id: active }}
        title={region?.name ?? SHORT[active]}
        onNavigate={(id) => {
          const next = regions.find((r) => r === id);
          if (next) setActive(next);
        }}
      />
    </section>
  );
}
