"use client";
import dynamic from "next/dynamic";
import { resolveAtlasManifest } from "@/lib/clinical/atlas-catalog";
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
import {
  preferredTrainingView,
  visibleObservationSelection,
} from "@/lib/clinical/training-observation";
import { Icon } from "../WorkspaceUI";
import { initialObservation, reconcileObservation } from "./observation-state";
import { AtlasStructureName, AtlasSourceNames } from "../atlas3d/AtlasStructureName";
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
      .then(resolveAtlasManifest)
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
  const person = Boolean(manifest?.bundles.full);
  const viewArea: AtlasArea = person ? "full" : area;
  const relatedIds = useMemo(
    () => new Set(exercise.targets.map((t) => t.muscleId)),
    [exercise],
  );
  const markedIds = useMemo(
    () =>
      new Set(
        (manifest?.structures ?? [])
          .filter((s) => {
            const g = trainingGroupForStructure(s);
            if (!g) return false;
            return activeGroup === "all" ? relatedIds.has(g) : g === activeGroup;
          })
          .map((s) => s.id),
      ),
    [manifest, activeGroup, relatedIds],
  );
  const frameIds = useMemo(
    () =>
      person
        ? markedIds
        : new Set(
            [...markedIds].filter((id) => {
              const structure = manifest?.structures.find((s) => s.id === id);
              return structure
                ? area === "full" || structure.areas.includes(area)
                : false;
            }),
          ),
    [person, markedIds, manifest, area],
  );
  const hiddenIds = useMemo(
    () =>
      person
        ? new Set<string>()
        : new Set(
            (manifest?.structures ?? [])
              .filter(
                (s) =>
                  s.layer === "muscle" && !allMuscles && !frameIds.has(s.id),
              )
              .map((s) => s.id),
          ),
    [person, manifest, allMuscles, frameIds],
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
              (viewArea === "full" || s.areas.includes(viewArea)) &&
              !hiddenIds.has(s.id) &&
              (s.layer !== "bone" || bones) &&
              s.layer !== "joint",
          )
          .map((s) => s.id),
      ),
    [manifest, viewArea, hiddenIds, bones],
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
  const selected = visibleObservationSelection(manifest?.structures ?? [], {
    area: viewArea,
    bones,
    hiddenIds,
    selectedId: observation.selectedId,
    isolatedId: null,
  });
  const selectedGroup = selected ? trainingGroupForStructure(selected) : null;
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
      <div className="border-b border-rule bg-sheet">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="min-w-0 flex-1 basis-40 break-words text-sm font-semibold leading-6 text-ink">
            {selected ? (
              <AtlasStructureName structure={selected} />
            ) : (
              "Chọn một cấu trúc để bắt đầu"
            )}
          </p>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Góc nhìn giải phẫu bài tập"
          >
            {(
              [
                ["front", "Trước"],
                ["back", "Sau"],
                ["left", "Trái"],
                ["right", "Phải"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                className="button-secondary"
                onClick={() => send(type)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="icon-button"
              aria-label="Đặt lại góc nhìn"
              onClick={() => send("reset")}
            >
              <Icon name="refresh" className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule px-4 py-2">
          <label className="flex min-h-11 min-w-0 max-w-full flex-wrap items-center gap-2 text-xs font-medium text-ink">
            Nhóm cơ
            <select
              className="!min-h-11 !w-auto min-w-0 max-w-full"
              value={activeGroup}
              onChange={(e) => {
                setGroup(e.target.value);
              }}
            >
              <option value="all">
                {person ? "Các nhóm của bài" : "Các nhóm liên quan trong vùng"}
              </option>
              {exercise.targets.map((t) => (
                <option key={t.muscleId} value={t.muscleId}>
                  {MUSCLE_GROUP_ATLAS.find((m) => m.id === t.muscleId)?.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium text-ink">
            <input
              type="checkbox"
              checked={bones}
              onChange={(e) => setBones(e.target.checked)}
              className="size-4 accent-cobalt"
            />
            Xương làm mốc
          </label>
          {!person && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium text-ink">
              <input
                type="checkbox"
                checked={allMuscles}
                onChange={(e) => setAllMuscles(e.target.checked)}
                className="size-4 accent-cobalt"
              />
              Toàn bộ cơ trong vùng
            </label>
          )}
        </div>
      </div>
      <div
        className={
          person
            ? "relative h-[clamp(12rem,62svh,40rem)] min-w-0 bg-surface"
            : "relative h-[clamp(12rem,62svh,27.5rem)] min-w-0 bg-surface sm:h-[clamp(12rem,62svh,35rem)]"
        }
        data-anatomy-exercise={exercise.id}
      >
        <Canvas
          bundleUrl={manifest.bundles[viewArea].url}
          structures={manifest.structures}
          layers={layers}
          hiddenIds={hiddenIds}
          frameIds={person ? undefined : frameIds}
          searchTargetIds={person && markedIds.size ? markedIds : undefined}
          isolatedId={null}
          selectedId={selected?.id ?? null}
          thicknessId={null}
          materialStudy={false}
          showSurfaceLabels={false}
          studyRetry={0}
          onStudyStatus={() => {}}
          muscleOpacity={1}
          quality="detailed"
          presentation="dark"
          command={canvasCommand}
          onSelect={choose}
        />
      </div>
      {selected && (
        <div className="space-y-1 border-t border-rule px-4 py-3">
          <AtlasSourceNames structure={selected} />
          {selectedGroup && (
            <Link
              className="inline-flex min-h-9 items-center text-xs font-semibold text-cobalt underline"
              href={trainingHref("muscle", selectedGroup)}
            >
              Tra cứu nhóm & bài liên quan →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
