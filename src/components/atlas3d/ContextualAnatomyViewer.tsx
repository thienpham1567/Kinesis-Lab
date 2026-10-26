"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AtlasLayer, AtlasManifest } from "@/lib/clinical/atlas-3d";
import { atlasStructureName } from "@/lib/clinical/atlas-names";
import {
  completeContextBundle,
  contextForStructure,
  contextSideStructures,
  contextStructures,
  type AnatomyContext,
} from "@/lib/clinical/contextual-anatomy";
import { Icon } from "../WorkspaceUI";
import {
  initialObservation,
  reconcileObservation,
} from "../training/observation-state";
import type { CameraCommand } from "./types";
import { withLoadDeadline } from "./load-deadline";

const Canvas = dynamic(() => import("./Atlas3DCanvas"), {
  ssr: false,
  loading: () => (
    <p role="status" className="p-6 text-sm text-slate">
      Đang mở không gian 3D…
    </p>
  ),
});

export type ContextualAnatomyProps = {
  context: AnatomyContext;
  title: string;
  onNavigate?: (id: string) => void;
};

export function ContextualAnatomyViewer(props: ContextualAnatomyProps) {
  const [manifest, setManifest] = useState<AtlasManifest | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    withLoadDeadline(
      fetch("/anatomy/3d/manifest.json", { signal: controller.signal }).then(
        async (response) => {
          if (!response.ok) throw new Error("Manifest unavailable");
          return response.json() as Promise<AtlasManifest>;
        },
      ),
      15000,
      () => {
        if (!controller.signal.aborted) {
          setFailed(true);
          controller.abort();
        }
      },
    )
      .then((data) => {
        if (!controller.signal.aborted) setManifest(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [retry]);

  if (!manifest)
    return (
      <section
        className="panel space-y-3 p-5"
        aria-label={`3D · ${props.title}`}
      >
        <h3 className="font-semibold text-ink">{props.title}</h3>
        {failed ? (
          <>
            <p role="alert" className="text-sm text-slate">
              Chưa tải được danh mục 3D. Bạn vẫn có thể đọc kiến thức và hình có
              nguồn.
            </p>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setFailed(false);
                setRetry((n) => n + 1);
              }}
            >
              Thử lại 3D
            </button>
          </>
        ) : (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-slate"
          >
            <Icon name="spinner" className="size-4 animate-spin" />
            Đang tải danh mục giải phẫu…
          </p>
        )}
      </section>
    );
  return (
    <ContextualAnatomyPanel
      key={`${props.context.kind}/${props.context.id}`}
      {...props}
      manifest={manifest}
    />
  );
}

function ContextualAnatomyPanel({
  context,
  title,
  onNavigate,
  manifest,
}: ContextualAnatomyProps & { manifest: AtlasManifest }) {
  const related = useMemo(
    () => contextStructures(manifest.structures, context),
    [manifest, context],
  );
  const area = completeContextBundle(manifest, related);
  const [side, setSide] = useState<"both" | "left" | "right">("both");
  const [surroundings, setSurroundings] = useState(false);
  const [layers, setLayers] = useState<Record<AtlasLayer, boolean>>({
    bone: true,
    muscle: context.kind !== "region",
    joint: context.kind === "region",
  });
  const defaultView: CameraCommand["type"] =
    (context.kind === "trigger" &&
      !["pec_minor", "iliopsoas", "tfl_vastus_lateralis"].includes(
        context.id,
      )) ||
    [
      "upper_back_traps",
      "lats_teres",
      "glutes",
      "hamstrings",
      "calves",
      "lumbar",
    ].includes(context.id)
      ? "back-oblique"
      : "front-oblique";
  const [stored, setObservation] = useState(() => ({
    ...initialObservation(context.id, defaultView),
    selectedId: context.kind === "region" ? null : (related[0]?.id ?? null),
  }));
  const relatedIds = new Set(related.map((s) => s.id));
  const areaStructures = manifest.structures.filter(
    (s) => area === "full" || (area && s.areas.includes(area)),
  );
  const sideIds = new Set(
    contextSideStructures(areaStructures, side).map((s) => s.id),
  );
  const hiddenIds = new Set(
    areaStructures
      .filter(
        (s) =>
          !sideIds.has(s.id) ||
          (!surroundings &&
            (context.kind === "region" || s.layer !== "bone") &&
            !relatedIds.has(s.id)),
      )
      .map((s) => s.id),
  );
  const visible = areaStructures.filter(
    (s) => layers[s.layer] && !hiddenIds.has(s.id),
  );
  const visibleIds = new Set(visible.map((s) => s.id));
  const observation = reconcileObservation(
    stored,
    context.id,
    defaultView,
    visibleIds,
  );
  if (observation !== stored) setObservation(observation);
  const selected = visible.find((s) => s.id === observation.selectedId);
  const options = visible;
  const frameIds = new Set(
    related.filter((s) => visibleIds.has(s.id)).map((s) => s.id),
  );
  const send = (type: CameraCommand["type"]) =>
    setObservation((state) => ({
      ...state,
      command: { type, revision: state.command.revision + 1 },
    }));
  function choose(id: string) {
    const structure = visible.find((s) => s.id === id);
    if (!structure) return;
    setObservation((state) => ({
      ...state,
      selectedId: id,
      isolatedId: state.isolatedId ? id : null,
      command: { type: "focus", revision: state.command.revision + 1 },
    }));
    const destination = contextForStructure(structure, context.kind);
    if (destination && destination !== context.id) onNavigate?.(destination);
  }
  function reset() {
    setSide("both");
    setSurroundings(false);
    setLayers({
      bone: true,
      muscle: context.kind !== "region",
      joint: context.kind === "region",
    });
    setObservation((state) => ({
      ...initialObservation(
        context.id,
        defaultView,
        state.command.revision + 1,
      ),
      selectedId: context.kind === "region" ? null : (related[0]?.id ?? null),
    }));
  }
  if (!area)
    return (
      <section className="panel p-4">
        <p className="text-sm text-slate">
          Chưa có cấu trúc 3D được liên kết cho mục này. Hãy tiếp tục xem kiến
          thức và hình nguồn.
        </p>
      </section>
    );
  return (
    <section
      className="panel min-w-0 overflow-hidden"
      aria-label={`3D · ${title}`}
      data-anatomy-context={`${context.kind}/${context.id}`}
    >
      <header className="space-y-2 px-4 py-3">
        <p className="eyebrow">Quan sát cấu trúc · Atlas 3D</p>
        <h3 className="font-display text-base font-semibold text-ink">
          {title}
        </h3>
        <p className="text-xs leading-5 text-slate">
          Kéo để xoay · Cuộn/chụm để phóng to. Chọn cấu trúc trên hình hoặc
          trong danh sách.
        </p>
      </header>
      <div
        className="flex flex-wrap gap-1.5 border-y border-rule bg-canvas px-3 py-2"
        role="group"
        aria-label="Bên cơ thể"
      >
        {(["both", "left", "right"] as const).map((value, index) => (
          <button
            key={value}
            type="button"
            className="button-secondary min-h-10 px-3 text-xs"
            aria-pressed={side === value}
            onClick={() => setSide(value)}
          >
            {["Hai bên", "Bên trái", "Bên phải"][index]}
          </button>
        ))}
      </div>
      <div className="relative h-[360px] min-w-0 bg-surface sm:h-[460px]">
        <Canvas
          bundleUrl={manifest.bundles[area].url}
          structures={manifest.structures}
          layers={layers}
          hiddenIds={hiddenIds}
          frameIds={frameIds}
          isolatedId={observation.isolatedId}
          selectedId={selected?.id ?? null}
          thicknessId={null}
          materialStudy={false}
          showSurfaceLabels={false}
          studyRetry={0}
          onStudyStatus={() => {}}
          muscleOpacity={1}
          quality="auto"
          presentation="light"
          projection="orthographic"
          learningMode
          showStructureLabels={false}
          command={observation.command}
          onSelect={choose}
        />
      </div>
      <div className="space-y-3 border-t border-rule p-3 sm:p-4">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Góc nhìn 3D"
        >
          {(["front", "back", "left", "right"] as const).map((view, index) => (
            <button
              key={view}
              type="button"
              className="button-secondary min-h-10 px-3 text-xs"
              onClick={() => send(view)}
            >
              {["Trước", "Sau", "Trái", "Phải"][index]}
            </button>
          ))}
        </div>
        <label className="field-label text-xs">
          Cấu trúc đang quan sát
          <select
            value={selected?.id ?? ""}
            onChange={(e) => {
              if (e.target.value) choose(e.target.value);
            }}
          >
            <option value="">
              {options.length
                ? "Chọn cấu trúc…"
                : "Không có cấu trúc trong lớp/bên đã chọn"}
            </option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {atlasStructureName(s)}
                {s.side ? ` · ${s.side === "left" ? "trái" : "phải"}` : ""}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-5 text-slate" aria-live="polite">
          {selected
            ? `${atlasStructureName(selected)}${selected.side ? ` · bên ${selected.side === "left" ? "trái" : "phải"}` : ""}`
            : `${options.length} cấu trúc có thể chọn`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="button-secondary min-h-10 text-xs"
            disabled={!selected}
            onClick={() => send("focus")}
          >
            Tập trung
          </button>
          <button
            type="button"
            className="button-secondary min-h-10 text-xs"
            disabled={!selected}
            aria-pressed={Boolean(observation.isolatedId)}
            onClick={() => {
              setObservation((state) => ({
                ...state,
                isolatedId: state.isolatedId ? null : (selected?.id ?? null),
                command: {
                  type: state.isolatedId ? defaultView : "focus",
                  revision: state.command.revision + 1,
                },
              }));
            }}
          >
            {observation.isolatedId ? "Hiện lại ngữ cảnh" : "Cô lập cấu trúc"}
          </button>
          <button
            type="button"
            className="button-secondary min-h-10 text-xs"
            onClick={reset}
          >
            Đặt lại
          </button>
        </div>
        <div className="flex flex-wrap gap-x-4 text-xs text-ink">
          {(["bone", "muscle", "joint"] as const).map((layer, index) => (
            <label key={layer} className="flex min-h-10 items-center gap-2">
              <input
                type="checkbox"
                checked={layers[layer]}
                onChange={(e) =>
                  setLayers((state) => ({
                    ...state,
                    [layer]: e.target.checked,
                  }))
                }
              />
              {["Xương", "Cơ", "Khớp & dây chằng"][index]}
            </label>
          ))}
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={surroundings}
              onChange={(e) => setSurroundings(e.target.checked)}
            />
            Cấu trúc xung quanh
          </label>
        </div>
        <details className="border-t border-rule pt-3 text-xs leading-5 text-slate">
          <summary className="cursor-pointer font-semibold text-ink">
            Nguồn mô hình & phạm vi sử dụng
          </summary>
          <p className="mt-2">
            Mô hình Z-Anatomy · CC BY-SA 4.0. Liên kết theo tên và phân vùng của
            catalog để tra cứu; không xác nhận hình học, số đo, tình trạng đau
            hoặc tổn thương cá nhân.
          </p>
          {context.kind === "trigger" && (
            <p className="mt-2">
              Không hiển thị tọa độ điểm kích hoạt hoặc vùng đau lan khi chưa có
              nguồn ánh xạ cụ thể. Chọn cơ chỉ mở kiến thức tham khảo.
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            <a
              href="/anatomy/3d/ATTRIBUTION.md"
              target="_blank"
              rel="noreferrer"
              className="text-cobalt underline"
            >
              Xuất xứ & giấy phép
            </a>
            <Link
              href={`/atlas?${new URLSearchParams({ area, ...(selected ? { structure: selected.id } : {}) })}`}
              className="text-cobalt underline"
            >
              Mở trong Giải phẫu 3D ↗
            </Link>
          </div>
        </details>
      </div>
    </section>
  );
}
