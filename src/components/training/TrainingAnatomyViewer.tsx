"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  AtlasArea,
  AtlasLayer,
  AtlasManifest,
} from "@/lib/clinical/atlas-3d";
import type { HypertrophyExercise } from "@/lib/clinical/muscle-hypertrophy-atlas";
import { MUSCLE_GROUP_ATLAS } from "@/lib/clinical/muscle-hypertrophy-atlas";
import {
  atlasGroupHref,
  trainingGroupForStructure,
  trainingHref,
} from "@/lib/clinical/training-atlas";
import type { CameraCommand } from "../atlas3d/types";
import type {
  AtlasPresentation,
  RenderQuality,
} from "../atlas3d/render-policy";
import {
  preferredTrainingView,
  sourceStructureLabel,
  visibleObservationSelection,
} from "@/lib/clinical/training-observation";
import { Icon } from "../WorkspaceUI";
import { initialObservation, reconcileObservation } from "./observation-state";
const Canvas = dynamic(() => import("../atlas3d/Atlas3DCanvas"), {
  ssr: false,
  loading: () => (
    <p
      className="flex min-h-96 items-center justify-center text-sm text-slate"
      role="status"
    >
      Đang mở mô hình giải phẫu…
    </p>
  ),
});
export function TrainingAnatomyViewer({
  exercise,
}: {
  exercise: HypertrophyExercise;
}) {
  const [manifest, setManifest] = useState<AtlasManifest | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [group, setGroup] = useState("all");
  const [bones, setBones] = useState(true);
  const [allMuscles, setAllMuscles] = useState(false);
  const [quality, setQuality] = useState<RenderQuality>("auto");
  const [presentation, setPresentation] = useState<AtlasPresentation>("dark");
  const [storedObservation, setObservation] = useState(() =>
    initialObservation("", "front-oblique"),
  );
  useEffect(() => {
    const controller = new AbortController();
    fetch("/anatomy/3d/manifest.json", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Không tải được danh mục");
        return r.json() as Promise<AtlasManifest>;
      })
      .then((d) => {
        if (!controller.signal.aborted) setManifest(d);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [retry]);
  const activeGroup = exercise.targets.some((t) => t.muscleId === group)
    ? group
    : "all";
  const firstGroup =
    exercise.targets.find((t) => t.role === "primary")?.muscleId ??
    exercise.targets[0].muscleId;
  const area = new URL(
    atlasGroupHref(
      exercise.targets.find((t) => t.muscleId === activeGroup)?.muscleId ??
        firstGroup,
    ),
    "http://localhost",
  ).searchParams.get("area") as AtlasArea;
  const relatedIds = useMemo(
    () => new Set(exercise.targets.map((t) => t.muscleId)),
    [exercise],
  );
  const frameIds = useMemo(
    () =>
      new Set(
        (manifest?.structures ?? [])
          .filter((s) => {
            const g = trainingGroupForStructure(s);
            return (
              (area === "full" || s.areas.includes(area)) &&
              g &&
              (activeGroup === "all" ? relatedIds.has(g) : g === activeGroup)
            );
          })
          .map((s) => s.id),
      ),
    [manifest, area, activeGroup, relatedIds],
  );
  const hiddenIds = useMemo(
    () =>
      new Set(
        (manifest?.structures ?? [])
          .filter(
            (s) => s.layer === "muscle" && !allMuscles && !frameIds.has(s.id),
          )
          .map((s) => s.id),
      ),
    [manifest, allMuscles, frameIds],
  );
  const context = `${exercise.id}/${activeGroup}`;
  const defaultView = preferredTrainingView(
    exercise.targets.find((t) => t.muscleId === activeGroup)?.muscleId ??
      firstGroup,
  );
  const visibleIds = useMemo(
    () =>
      new Set(
        (manifest?.structures ?? [])
          .filter(
            (s) =>
              (area === "full" || s.areas.includes(area)) &&
              !hiddenIds.has(s.id) &&
              (s.layer !== "bone" || bones) &&
              s.layer !== "joint",
          )
          .map((s) => s.id),
      ),
    [manifest, area, hiddenIds, bones],
  );
  const observation = reconcileObservation(
    storedObservation,
    context,
    defaultView,
    visibleIds,
  );
  // Adjust this component's state before its children commit. Unlike masking old
  // state, this prevents an old exercise's isolation from returning on Back.
  if (observation !== storedObservation) setObservation(observation);
  const isolatedId = observation.isolatedId;
  const selected = visibleObservationSelection(manifest?.structures ?? [], {
    area,
    bones,
    hiddenIds,
    selectedId: observation.selectedId,
    isolatedId,
  });
  const selectedGroup = selected ? trainingGroupForStructure(selected) : null;
  const sourceOptions = (manifest?.structures ?? []).filter((s) =>
    frameIds.has(s.id),
  );
  const canvasCommand = observation.command;
  const layers: Record<AtlasLayer, boolean> = {
    bone: bones,
    muscle: true,
    joint: false,
  };
  const send = (type: CameraCommand["type"]) =>
    setObservation((s) => ({
      ...s,
      command: { type, revision: s.command.revision + 1 },
    }));
  const choose = (id: string | null) =>
    setObservation((s) => ({
      ...s,
      selectedId: id,
      isolatedId: s.isolatedId ? id : null,
      command: id
        ? s.command
        : { type: defaultView, revision: s.command.revision + 1 },
    }));
  const restore = () =>
    setObservation((s) =>
      initialObservation(context, defaultView, s.command.revision + 1),
    );
  if (failed)
    return (
      <section className="panel space-y-3 p-6">
        <h4 className="font-semibold text-ink">
          Chưa tải được mô hình giải phẫu
        </h4>
        <p className="text-xs text-slate">
          Bạn vẫn có thể đọc thông tin cơ và bài tập ở bên cạnh.
        </p>
        <button
          className="button-secondary"
          onClick={() => {
            setFailed(false);
            setRetry((n) => n + 1);
          }}
        >
          Thử lại mô hình
        </button>
      </section>
    );
  if (!manifest)
    return (
      <div
        className="panel flex min-h-96 items-center justify-center gap-2 text-sm text-slate"
        role="status"
      >
        <Icon name="spinner" className="size-5 animate-spin" />
        Đang tải danh mục giải phẫu…
      </div>
    );
  return (
    <section
      className="panel min-w-0 overflow-hidden"
      aria-label="Giải phẫu 3D liên quan bài tập"
    >
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="eyebrow">Anatomy study · Z-Anatomy</p>
            <h4 className="mt-1 text-lg font-semibold text-ink">
              Cấu trúc cơ–xương của bài tập
            </h4>
          </div>
          <span className="badge bg-surface text-slate">
            Mô hình giải phẫu tĩnh
          </span>
        </div>
        <label className="field-label">
          Nhóm cơ quan sát
          <select
            value={activeGroup}
            onChange={(e) => {
              setGroup(e.target.value);
            }}
          >
            <option value="all">Các nhóm liên quan trong vùng</option>
            {exercise.targets.map((t) => (
              <option key={t.muscleId} value={t.muscleId}>
                {MUSCLE_GROUP_ATLAS.find((m) => m.id === t.muscleId)?.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-surface/50 px-4 py-3">
        <p className="text-[11px] text-slate" aria-live="polite">
          {isolatedId
            ? "Đang tách riêng cấu trúc"
            : `${sourceOptions.length} cấu trúc cơ trong nhóm quan sát`}
        </p>
        <div
          role="group"
          aria-label="Nền quan sát"
          className="flex gap-1 rounded-lg border border-rule bg-white p-1"
        >
          {(["dark", "light"] as const).map((tone) => (
            <button
              key={tone}
              type="button"
              aria-pressed={presentation === tone}
              onClick={() => setPresentation(tone)}
              className={`min-h-9 rounded-md px-3 text-xs font-medium ${presentation === tone ? "bg-ink text-white" : "text-slate hover:bg-surface"}`}
            >
              {tone === "dark" ? "Nền tối" : "Nền sáng"}
            </button>
          ))}
        </div>
      </div>
      <div
        className="relative h-[440px] min-w-0 bg-surface sm:h-[560px]"
        data-anatomy-exercise={exercise.id}
      >
        <Canvas
          bundleUrl={manifest.bundles[area].url}
          structures={manifest.structures}
          layers={layers}
          hiddenIds={hiddenIds}
          frameIds={frameIds}
          isolatedId={isolatedId}
          selectedId={selected?.id ?? null}
          thicknessId={null}
          materialStudy={false}
          showSurfaceLabels={false}
          studyRetry={0}
          onStudyStatus={() => {}}
          muscleOpacity={1}
          quality={quality}
          presentation={presentation}
          command={canvasCommand}
          onSelect={choose}
        />
      </div>
      <div className="space-y-3 border-t border-rule p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Góc nhìn giải phẫu bài tập"
          >
            {(
              [
                "front-oblique",
                "back-oblique",
                "front",
                "back",
                "left",
                "right",
              ] as const
            ).map((v, i) => (
              <button
                className="button-secondary min-h-10 px-3"
                key={v}
                onClick={() => send(v)}
              >
                {["3/4 trước", "3/4 sau", "Trước", "Sau", "Trái", "Phải"][i]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate">
            Chất lượng
            <select
              className="!min-h-10 !w-auto"
              value={quality}
              onChange={(e) => setQuality(e.target.value as RenderQuality)}
            >
              <option value="auto">Tự động</option>
              <option value="detailed">Chi tiết</option>
              <option value="fast">Nhanh</option>
            </select>
          </label>
        </div>
        <label className="field-label">
          Chọn cấu trúc cơ
          <select
            value={selected && frameIds.has(selected.id) ? selected.id : ""}
            onChange={(e) => choose(e.target.value || null)}
          >
            <option value="">Chọn cơ từ dữ liệu nguồn…</option>
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {sourceStructureLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Quan sát cấu trúc"
        >
          <button
            type="button"
            className="button-secondary min-h-10"
            disabled={!selected}
            onClick={() => send("focus")}
          >
            Tập trung
          </button>
          <button
            type="button"
            className="button-secondary min-h-10"
            disabled={!selected}
            aria-pressed={Boolean(isolatedId)}
            onClick={() => {
              if (selected) {
                setObservation((s) => ({
                  ...s,
                  isolatedId: s.isolatedId ? null : selected.id,
                  command: {
                    type: s.isolatedId ? defaultView : "focus",
                    revision: s.command.revision + 1,
                  },
                }));
              }
            }}
          >
            {isolatedId ? "Thôi tách riêng" : "Tách riêng"}
          </button>
          <button
            type="button"
            className="button-secondary min-h-10"
            onClick={restore}
          >
            Về nhóm cơ
          </button>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink">
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={bones}
              onChange={(e) => setBones(e.target.checked)}
            />
            Xương làm mốc
          </label>
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              checked={allMuscles}
              onChange={(e) => setAllMuscles(e.target.checked)}
            />
            Toàn bộ cơ trong vùng
          </label>
        </div>
        {selected && (
          <div className="rounded-lg border border-cobalt/20 bg-cobalt-soft/40 p-3">
            <p className="text-xs font-semibold text-ink">
              Đang chọn: {selected.label}
            </p>
            <p className="mt-1 text-[11px] text-slate">
              {selected.english}
              {selected.side === "left"
                ? " · trái"
                : selected.side === "right"
                  ? " · phải"
                  : ""}
            </p>
            {selectedGroup && (
              <Link
                className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-cobalt underline"
                href={trainingHref("muscle", selectedGroup)}
              >
                Tra cứu nhóm & bài liên quan →
              </Link>
            )}
          </div>
        )}
        <p className="text-[11px] leading-5 text-slate">
          Kéo để xoay · Cuộn/chụm để phóng to · Nhấp cơ để tra cứu. Các mesh
          được liên kết theo nhóm giáo dục, không phải bản đồ hoạt hóa. Chưa có
          rig vận động hoặc ánh xạ điểm bám được chuyên gia duyệt.
        </p>
      </div>
    </section>
  );
}
