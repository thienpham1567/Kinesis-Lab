"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasLearningInspector } from "./AtlasLearningInspector";
import {
  RegionLearningOverview,
  RegionLearningSources,
} from "./RegionLearningOverview";
import { RegionLearningRail } from "./RegionLearningRail";
import { atlasAreaHref, regionLearningSteps } from "./region-learning";
import { EmptyState, Icon } from "@/components/WorkspaceUI";
import { AtlasStructureName } from "./AtlasStructureName";
import { AtlasTerminologySources } from "./AtlasTerminologySources";
import {
  ATLAS_AREAS,
  ATLAS_LAYERS,
  isStructureVisible,
  resolveAtlasSearch,
  searchStructures,
  type AtlasArea,
  type AtlasLayer,
  type AtlasManifest,
  type AtlasStructure,
} from "@/lib/clinical/atlas-3d";
import { MUSCLE_GROUP_ATLAS } from "@/lib/clinical/muscle-hypertrophy-atlas";
import type { RenderQuality } from "./render-policy";
import type { CameraCommand } from "./types";
import AnatomyEvidenceCard from "./AnatomyEvidenceCard";
import { MuscleStudyCard } from "@/components/training/MuscleStudyCard";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import { getCatalogEvidence } from "@/lib/clinical/evidence-registry";
import {
  matchingGroupStructures,
  trainingGroupForStructure,
  trainingHref,
} from "@/lib/clinical/training-atlas";
import HipMaterialStudyControls from "./HipMaterialStudyControls";
import { HIP_STUDY_SAMPLES, type HipStudySample } from "./hip-material-policy";
import type { StudyStatus } from "./tissue-study-resources";

const Atlas3DCanvas = dynamic(() => import("./Atlas3DCanvas"), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[480px] items-center justify-center gap-3 text-sm text-slate"
      role="status"
    >
      <Icon name="spinner" className="size-5 animate-spin" />
      Đang mở không gian 3D…
    </div>
  ),
});

const DEFAULT_LAYERS: Record<AtlasLayer, boolean> = {
  bone: true,
  muscle: true,
  joint: false,
};
const CAMERA_VIEWS = [
  { type: "front", label: "Trước" },
  { type: "back", label: "Sau" },
  { type: "left", label: "Trái" },
  { type: "right", label: "Phải" },
] as const;

function validArea(value?: string | null): AtlasArea {
  return ATLAS_AREAS.find((entry) => entry.id === value)?.id ?? "full";
}

function sideLabel(structure: AtlasStructure) {
  return structure.side === "left"
    ? "Bên trái"
    : structure.side === "right"
      ? "Bên phải"
      : "Đường giữa / không phân bên";
}

function thicknessMillimeters(meters: number) {
  return meters < 0.0001 ? "<0.1" : (meters * 1000).toFixed(1);
}

export default function Atlas3DExplorer({
  initialArea,
  initialStructure,
  initialGroup,
}: {
  initialArea?: string | null;
  initialStructure?: string | null;
  initialGroup?: string | null;
}) {
  const [learning, setLearning] = useState<{
    enabled: boolean;
    step: number;
    labels: boolean;
    projection: "perspective" | "orthographic";
  }>({ enabled: true, step: 0, labels: true, projection: "orthographic" });
  const [manifest, setManifest] = useState<AtlasManifest | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [area, setArea] = useState<AtlasArea>(() => validArea(initialArea));
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thicknessId, setThicknessId] = useState<string | null>(null);
  const [quality, setQuality] = useState<RenderQuality>("auto");
  const [showSurfaceLabels, setShowSurfaceLabels] = useState(true);
  const [materialStudy, setMaterialStudy] = useState(false);
  const [studyStatus, setStudyStatus] = useState<StudyStatus>("idle");
  const [studyRetry, setStudyRetry] = useState(0);
  const [muscleOpacity, setMuscleOpacity] = useState(1);
  const [query, setQuery] = useState("");
  const [searchTargetIds, setSearchTargetIds] = useState<ReadonlySet<string>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchFocused = useRef(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchContainer = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);
  const [limit, setLimit] = useState(80);
  const [command, setCommand] = useState<CameraCommand>({
    type: "front",
    revision: 0,
  });
  const [shareStatus, setShareStatus] = useState("");
  const [manualShareUrl, setManualShareUrl] = useState("");
  const appliedRoute = useRef<string | null>(null);

  useEffect(() => {
    const routeKey = JSON.stringify([
      validArea(initialArea),
      initialStructure ?? null,
      initialGroup ?? null,
      retry,
    ]);
    // Native history updates also reach useSearchParams. A locally applied region
    // must not trigger a second manifest fetch that wipes a subsequent selection.
    if (appliedRoute.current === routeKey) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const controller = new AbortController();
    fetch("/anatomy/3d/manifest.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Manifest unavailable");
        return response.json() as Promise<AtlasManifest>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = null;
        searchFocused.current = false;
        appliedRoute.current = routeKey;
        const nextArea = validArea(initialArea);
        const focusGroup = MUSCLE_GROUP_ATLAS.find(
          (g) => g.id === initialGroup,
        );
        const groupStructures = focusGroup
          ? matchingGroupStructures(data.structures, focusGroup.id).filter(
              (s) => nextArea === "full" || s.areas.includes(nextArea),
            )
          : [];
        const initial =
          data.structures.find(
            (structure) =>
              structure.id === initialStructure &&
              (nextArea === "full" || structure.areas.includes(nextArea)),
          ) ?? groupStructures[0];
        setManifest(data);
        setQuery("");
        setSearchTargetIds(new Set());
        setLearning((current) => ({ ...current, step: 0 }));
        setArea(nextArea);
        setSelectedId(initial?.id ?? null);
        setThicknessId(null);
        setMaterialStudy(false);
        setStudyStatus("idle");
        setFocusedGroupId(groupStructures.length ? focusGroup!.id : null);
        setHiddenIds(
          groupStructures.length
            ? new Set(
                data.structures
                  .filter(
                    (s) =>
                      s.layer !== "bone" &&
                      !(trainingGroupForStructure(s) === focusGroup!.id),
                  )
                  .map((s) => s.id),
              )
            : new Set(),
        );
        setIsolatedId(null);
        setLayers({
          ...DEFAULT_LAYERS,
          ...(initial ? { [initial.layer]: true } : {}),
        });
        setCommand((current) => ({
          type: initial ? "focus" : "front-oblique",
          revision: current.revision + 1,
        }));
        setLoadError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });
    return () => controller.abort();
  }, [initialArea, initialStructure, initialGroup, retry]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    if (!suggestionsOpen) return;
    function dismissSuggestions(event: PointerEvent) {
      if (event.target instanceof Node && !searchContainer.current?.contains(event.target))
        setSuggestionsOpen(false);
    }
    document.addEventListener("pointerdown", dismissSuggestions);
    return () => document.removeEventListener("pointerdown", dismissSuggestions);
  }, [suggestionsOpen]);

  const search = useMemo(
    () => resolveAtlasSearch(manifest?.structures ?? [], query, area),
    [manifest, query, area],
  );
  const results = search.results;
  const areaStructures = useMemo(
    () => searchStructures(manifest?.structures ?? [], "", area),
    [manifest, area],
  );
  const visibleCount = areaStructures.filter((structure) =>
    isStructureVisible(structure, layers, hiddenIds, isolatedId),
  ).length;
  const selected = manifest?.structures.find(
    (structure) => structure.id === selectedId,
  );
  const muscleGroup = MUSCLE_GROUP_ATLAS.find(
    (entry) => selected && entry.id === trainingGroupForStructure(selected),
  );
  const selectedVisible =
    selected && isStructureVisible(selected, layers, hiddenIds, isolatedId);

  const learningActive = learning.enabled;
  const areaLabel =
    ATLAS_AREAS.find((entry) => entry.id === area)?.label ?? "Atlas giải phẫu";
  const learningSteps = useMemo(
    () => regionLearningSteps(area, manifest?.structures ?? []),
    [area, manifest],
  );

  function sendCommand(type: CameraCommand["type"]) {
    setCommand((current) => ({ type, revision: current.revision + 1 }));
  }

  function cancelSearch() {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = null;
  }

  function closeSuggestions(restoreFocus = false) {
    // Focus first: onFocus may open suggestions, so the final update closes them.
    if (restoreFocus) searchInput.current?.focus();
    setSuggestionsOpen(false);
  }

  function clearSearchTargets() {
    cancelSearch();
    searchFocused.current = false;
    setSearchTargetIds(new Set());
  }

  function focusSearchTargets(targets: AtlasStructure[], nextArea: AtlasArea) {
    if (!targets.length) return;
    cancelSearch();
    searchFocused.current = true;
    setSearchTargetIds(new Set(targets.map((structure) => structure.id)));
    setSelectedId(targets[0].id);
    setThicknessId(null);
    setMaterialStudy(false);
    setFocusedGroupId(null);
    setHiddenIds(new Set());
    setIsolatedId(null);
    setLayers({ ...DEFAULT_LAYERS, ...Object.fromEntries(targets.map((structure) => [structure.layer, true])) });
    setMuscleOpacity(1);
    setShareStatus("");
    setManualShareUrl("");
    if (nextArea !== area) {
      appliedRoute.current = JSON.stringify([nextArea, null, null, retry]);
      window.history.replaceState(null, "", atlasAreaHref(window.location.href, nextArea));
      setArea(nextArea);
    }
    sendCommand("search");
  }

  function searchFor(value: string, immediate = false) {
    cancelSearch();
    setQuery(value);
    setLimit(80);
    setSearchTargetIds(new Set());
    setSelectedId(null);
    setThicknessId(null);
    setIsolatedId(null);
    setHiddenIds(new Set());
    const result = resolveAtlasSearch(manifest?.structures ?? [], value, area);
    if (result.kind === "match") {
      if (immediate) focusSearchTargets(result.targets, result.area);
      else searchTimer.current = setTimeout(() => focusSearchTargets(result.targets, result.area), 300);
    } else if (searchFocused.current) {
      searchFocused.current = false;
      sendCommand("reset");
    }
  }

  function selectStructure(id: string) {
    const structure = manifest?.structures.find((entry) => entry.id === id);
    if (!structure) return;
    closeSuggestions(!!searchContainer.current?.contains(document.activeElement));
    cancelSearch();
    if (query.trim()) {
      focusSearchTargets([structure], "full");
      return;
    }
    setSelectedId(id);
    setThicknessId((current) => (current === id ? current : null));
    setLayers((current) => ({ ...current, [structure.layer]: true }));
    setHiddenIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setIsolatedId((current) => (current ? id : null));
    setShareStatus("");
    setManualShareUrl("");
    if (learningActive) sendCommand("focus");
  }

  function changeArea(nextArea: AtlasArea) {
    clearSearchTargets();
    appliedRoute.current = JSON.stringify([nextArea, null, null, retry]);
    window.history.replaceState(
      null,
      "",
      atlasAreaHref(window.location.href, nextArea),
    );
    setArea(nextArea);
    setFocusedGroupId(null);
    setSelectedId(null);
    setThicknessId(null);
    setMaterialStudy(false);
    setStudyStatus("idle");
    setHiddenIds(new Set());
    setIsolatedId(null);
    setQuery("");
    setLimit(80);
    setShareStatus("");
    setManualShareUrl("");
    setLearning((current) => ({ ...current, step: 0 }));
    setLayers(DEFAULT_LAYERS);
    setMuscleOpacity(1);
    sendCommand("front-oblique");
  }

  function restoreVisibility() {
    const wasSearching = searchFocused.current;
    clearSearchTargets();
    setQuery("");
    if (wasSearching) {
      setSelectedId(null);
      sendCommand("reset");
    }
    setFocusedGroupId(null);
    setLayers(DEFAULT_LAYERS);
    setHiddenIds(new Set());
    setIsolatedId(null);
  }

  function openStudySample(sample: HipStudySample) {
    clearSearchTargets();
    const preset = HIP_STUDY_SAMPLES[sample];
    const ids: ReadonlySet<string> = new Set(preset.ids);
    setMaterialStudy(true);
    setThicknessId(null);
    setSelectedId(preset.selectedId);
    setLayers({ bone: true, muscle: true, joint: true });
    setHiddenIds(
      new Set(
        (manifest?.structures ?? [])
          .filter((s) => !ids.has(s.id))
          .map((s) => s.id),
      ),
    );
    setIsolatedId(sample === "muscle" ? preset.selectedId : null);
    setMuscleOpacity(1);
    setQuery(sample === "muscle" ? "Cơ mông nhỡ" : "");
    setShareStatus("");
    setManualShareUrl("");
    sendCommand(sample === "muscle" ? "muscle" : "hip");
  }

  function applyLearningStep(index: number) {
    const step = learningSteps[index];
    if (!step || !manifest) return;
    clearSearchTargets();
    const target = step.structureId
      ? manifest.structures.find(
          (structure) =>
            structure.id === step.structureId &&
            (area === "full" || structure.areas.includes(area)),
        )
      : undefined;
    setLearning((current) => ({ ...current, enabled: true, step: index }));
    setLayers({ ...step.layers });
    setHiddenIds(new Set());
    setIsolatedId(target?.id ?? null);
    setSelectedId(target?.id ?? null);
    setThicknessId(null);
    setMaterialStudy(false);
    setMuscleOpacity(1);
    setFocusedGroupId(null);
    setQuery("");
    setLimit(80);
    setShareStatus("");
    setManualShareUrl("");
    sendCommand(target || !step.structureId ? step.camera : "reset");
  }

  async function shareSelection() {
    if (!selected) return;
    const url = new URL("/atlas", window.location.origin);
    url.searchParams.set("tab", "3d");
    url.searchParams.set("area", area);
    url.searchParams.set("structure", selected.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Đã sao chép liên kết cấu trúc.");
      setManualShareUrl("");
    } catch {
      setManualShareUrl(url.toString());
      setShareStatus("Chọn và sao chép liên kết bên dưới.");
    }
  }

  if (loadError) {
    return (
      <div className="panel">
        <EmptyState icon="alert" title="Chưa tải được danh mục giải phẫu">
          <p>Kiểm tra kết nối rồi thử mở lại hệ vận động 3D.</p>
        </EmptyState>
        <div className="flex justify-center pb-8">
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setLoadError(false);
              setRetry((current) => current + 1);
            }}
          >
            <Icon name="refresh" className="size-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div
        className="panel flex min-h-80 items-center justify-center gap-3 p-6 text-sm text-slate"
        role="status"
      >
        <Icon name="spinner" className="size-5 animate-spin" />
        Đang tải danh mục hệ vận động…
      </div>
    );
  }

  const bundle = manifest.bundles[area];
  const prompt = selected
    ? `Giải thích giải phẫu và vai trò vận động của ${selected.english}${selected.latin ? ` (${selected.latin})` : ""}${selected.side === "left" ? " bên trái" : selected.side === "right" ? " bên phải" : ""}. Liên hệ với nhóm cơ và các bài tập trong phạm vi PT. Đây là yêu cầu tra cứu cấu trúc, chưa có hồ sơ hay triệu chứng học viên.`
    : "";

  const structureList = (
    <>
      <ul
        className="max-h-80 overflow-y-auto overscroll-contain p-2"
        aria-label="Cấu trúc giải phẫu"
      >
        {results.slice(0, limit).map((structure) => {
          const visible = isStructureVisible(
            structure,
            layers,
            hiddenIds,
            isolatedId,
          );
          return (
            <li key={structure.id}>
              <button
                type="button"
                aria-pressed={searchTargetIds.has(structure.id) || structure.id === selectedId}
                onClick={() => selectStructure(structure.id)}
                className={`my-0.5 flex min-h-11 w-full min-w-0 items-start gap-2 rounded-lg border px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt ${searchTargetIds.has(structure.id) || structure.id === selectedId ? "border-cobalt bg-cobalt-soft text-cobalt" : "border-transparent text-ink hover:bg-surface"}`}
              >
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${visible ? "bg-cleared" : "bg-rule-strong"}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words">
                  <span className="block text-xs font-semibold leading-5">
                    <AtlasStructureName structure={structure} />
                  </span>
                  <span className="block text-xs leading-5 text-slate">
                    {sideLabel(structure)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {results.length === 0 && (
          <li className="px-3 py-7 text-center text-xs leading-6 text-slate">
            Thử tên Việt, Anh hoặc Latin khác.
          </li>
        )}
      </ul>
      {results.length > limit && (
        <div className="border-t border-rule p-3">
          <button
            type="button"
            className="button-secondary w-full"
            onClick={() => setLimit((current) => current + 80)}
          >
            Hiện thêm {Math.min(80, results.length - limit)} cấu trúc
          </button>
        </div>
      )}
    </>
  );
  const searchPanel = (
    <div className={learningActive ? "overflow-hidden" : "panel overflow-hidden"}>
      <div className="border-b border-rule p-4">
        <h3 className="text-sm font-semibold text-ink">Danh mục cấu trúc</h3>
        <p className="mt-1 text-xs text-slate">{results.length} kết quả{query.trim() ? ` cho “${query.trim()}”` : " trong vùng"}</p>
      </div>
      {structureList}
    </div>
  );
  const knowledgePanel = (
    <div
      className={learningActive ? "min-w-0" : "panel p-4"}
      aria-live="polite"
    >
      {selected ? (
        <div className="min-w-0 space-y-4 break-words">
          <div>
            <p className="eyebrow">Cấu trúc đã chọn</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
              <AtlasStructureName structure={selected} />
            </h3>
            <dl className="mt-3 space-y-2 text-xs leading-5">
              <div>
                <dt className="text-slate">Tên nguồn · English</dt>
                <dd className="font-medium text-ink">{selected.english}</dd>
              </div>
              {selected.latin && (
                <div>
                  <dt className="text-slate">Latin</dt>
                  <dd className="italic text-ink">{selected.latin}</dd>
                </div>
              )}
              <div>
                <dt className="sr-only">Phân lớp và bên</dt>
                <dd className="text-slate">
                  {
                    ATLAS_LAYERS.find((layer) => layer.id === selected.layer)
                      ?.label
                  }{" "}
                  · {sideLabel(selected)}
                </dd>
              </div>
            </dl>
          </div>
          <AtlasTerminologySources key={selected.english} english={selected.english} />
          {!learningActive && (
            <ClinicalEvidencePanel
              evidence={getCatalogEvidence(selected.id)}
              title="Nguồn mô hình & phạm vi đối chiếu"
            />
          )}
          <AnatomyEvidenceCard structureId={selected.id} />
          {muscleGroup && (
            <div className="space-y-3">
              <Link
                href={trainingHref("muscle", muscleGroup.id)}
                className="button-primary w-full"
              >
                Giải phẫu nhóm & bài tập liên quan →
              </Link>
              <MuscleStudyCard muscle={muscleGroup} compact />
            </div>
          )}
          <div className="border-t border-rule pt-3">
            <p className="text-xs font-semibold text-ink">
              Độ dày ước lượng từ hình học
            </p>
            {selected.thickness ? (
              <>
                <p className="mt-2 text-xs leading-5 text-slate">
                  Trung vị {thicknessMillimeters(selected.thickness.p50)} mm ·
                  Khoảng {thicknessMillimeters(selected.thickness.min)}–
                  {thicknessMillimeters(selected.thickness.max)} mm. Tính được{" "}
                  {(
                    (selected.thickness.validVertices /
                      selected.thickness.vertices) *
                    100
                  ).toFixed(1)}
                  % đỉnh lưới.
                </p>
                <button
                  type="button"
                  className="button-secondary mt-3 w-full"
                  disabled={!selectedVisible && thicknessId !== selected.id}
                  aria-pressed={thicknessId === selected.id}
                  onClick={() =>
                    setThicknessId((current) =>
                      current === selected.id ? null : selected.id,
                    )
                  }
                >
                  {thicknessId === selected.id
                    ? "Tắt bản đồ độ dày"
                    : "Xem bản đồ độ dày"}
                </button>
                <p className="mt-2 text-xs leading-5 text-slate">
                  Ước lượng khoảng cách đến mặt đối diện của lưới 3D. Không phải
                  số đo mô thật; không thể hiện bề dày lớp sụn hay gân riêng.
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs leading-5 text-slate">
                Chưa có bản đồ cho cấu trúc này. Hiện có 10 mẫu vùng hông.
              </p>
            )}
          </div>
          {!learningActive && (
            <details className="border-t border-rule pt-3">
              <summary className="min-h-9 text-xs font-semibold text-ink">
                Kiến thức nền theo vùng học · {areaLabel}
              </summary>
              <div className="mt-3">
                <RegionLearningOverview
                  key={area}
                  area={area}
                  areaLabel={areaLabel}
                  selfCheck={false}
                />
              </div>
            </details>
          )}
          <div className="space-y-2 border-t border-rule pt-3">
            <Link
              href={`/consult?prompt=${encodeURIComponent(prompt)}`}
              className="button-primary w-full text-center"
            >
              <Icon name="message" className="size-4" />
              Hỏi trợ lý về cấu trúc
            </Link>
            <button
              type="button"
              className="button-secondary w-full"
              onClick={shareSelection}
            >
              <Icon name="external" className="size-4" />
              Sao chép liên kết
            </button>
            {shareStatus && (
              <p className="text-xs leading-5 text-slate" role="status">
                {shareStatus}
              </p>
            )}
            {manualShareUrl && (
              <label className="field-label">
                Liên kết cấu trúc
                <input
                  type="text"
                  readOnly
                  value={manualShareUrl}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </label>
            )}
          </div>
          <a
            href={manifest.source.repository}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 text-xs text-cobalt"
          >
            Nguồn mô hình Z-Anatomy
            <Icon name="external" className="size-3" />
          </a>
        </div>
      ) : (
        <div className="py-2 text-center">
          <Icon name="target" className="mx-auto size-6 text-cobalt" />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            Chọn một cấu trúc
          </h3>
          <p className="mt-2 text-xs leading-6 text-slate">
            Chạm vào mô hình hoặc chọn tên trong danh mục để đọc tên giải phẫu
            và ngữ cảnh PT.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="atlas-learning-studio"
      className="min-w-0 scroll-mt-24 space-y-4"
      aria-label="Atlas 3D hệ vận động"
    >
      {focusedGroupId && (
        <div
          className="panel flex flex-wrap items-start justify-between gap-3 border-cobalt/25 bg-cobalt-soft/40 p-4"
          role="status"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              Đang xem nhóm:{" "}
              {MUSCLE_GROUP_ATLAS.find((g) => g.id === focusedGroupId)?.name}
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate">
              Giữ xương làm mốc và hiện các mesh thuộc nhóm. Nhóm do app tổ
              chức; không là bản đồ hoạt hóa hoặc xác nhận từng vị trí bám.
            </p>
          </div>
          <button
            type="button"
            className="button-secondary"
            onClick={restoreVisibility}
          >
            Hiện lại các lớp
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-rule bg-sheet px-4 py-3">
        <div className="min-w-0 flex-1 basis-64">
          <p className="eyebrow text-cobalt">Atlas / Learning Studio</p>
          <label className="field-label mt-2 block max-w-md">
            Vùng học giải phẫu
            <select
              value={area}
              onChange={(event) => changeArea(validArea(event.target.value))}
            >
              {ATLAS_AREAS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="button-secondary"
          aria-pressed={learningActive}
          onClick={() => {
            if (!learning.enabled) applyLearningStep(learning.step);
            else {
              setLearning((current) => ({ ...current, enabled: false }));
              restoreVisibility();
              sendCommand("reset");
            }
          }}
        >
          {learningActive
            ? "Chuyển sang khám phá tự do"
            : "Mở bàn học theo bước"}
        </button>
      </div>
      <div
        ref={searchContainer}
        role="search"
        aria-label="Tìm cấu trúc trên mô hình 3D"
        className="relative z-20 min-w-0 rounded-xl border border-cobalt/30 bg-sheet p-4 sm:p-5"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            closeSuggestions(true);
          }
        }}
      >
        <h3 className="text-sm font-semibold text-ink">Tìm cơ trên mô hình 3D</h3>
        <label htmlFor="atlas-structure-search" className="sr-only">Tên Việt, Anh hoặc Latin</label>
        <div className="input-with-icon mt-2">
          <Icon name="search" className="size-5 text-cobalt" />
          <input
            ref={searchInput}
            id="atlas-structure-search"
            type="search"
            className="min-h-12 border-cobalt/40 text-base"
            placeholder="Tên cơ, ví dụ: Internal Oblique"
            aria-describedby="atlas-search-status"
            value={query}
            onFocus={() => setSuggestionsOpen(true)}
            onClick={() => setSuggestionsOpen(true)}
            onChange={(event) => {
              setSuggestionsOpen(true);
              searchFor(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                searchFor(query, true);
                setSuggestionsOpen(false);
              }
            }}
          />
        </div>
        <p id="atlas-search-status" className="mt-2 text-xs leading-5 text-slate" aria-live="polite">
          {search.kind === "missing"
            ? `Không tìm thấy “${query.trim()}” trong mô hình 3D.`
            : searchTargetIds.size
              ? `Đang tô xanh ${searchTargetIds.size} cấu trúc trên toàn bộ cơ thể 3D. Cơ sâu được tô màu xuyên lớp che.`
              : query.trim()
                ? `${results.length} kết quả · ${search.kind === "ambiguous" ? "Chọn tên bên dưới để định vị." : "Nhấn Enter để xem trên 3D."}`
                : "Tra tên Việt, Anh hoặc Latin để tô màu cơ trên toàn bộ cơ thể 3D."}
        </p>
        {suggestionsOpen && query.trim() && results.length > 0 && (
          <div
            className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border border-rule bg-sheet shadow-lg [&_ul]:max-h-56"
            aria-label="Gợi ý tìm kiếm cấu trúc"
          >
            <div className="flex items-center justify-between gap-3 border-b border-rule px-3 py-1">
              <p className="text-xs font-semibold text-slate">{results.length} kết quả</p>
              <button type="button" className="min-h-11 px-2 text-xs font-medium text-cobalt" onClick={() => closeSuggestions(true)}>Ẩn gợi ý</button>
            </div>
            {structureList}
          </div>
        )}
      </div>
      <details
        className="panel overflow-hidden"
        open={learningActive ? undefined : true}
      >
        <summary className="min-h-12 cursor-pointer px-4 py-3 text-xs font-semibold text-slate">
          Vùng hiển thị, lớp cấu trúc & chất lượng
        </summary>
        <div className="border-t border-rule p-4 sm:p-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(200px,1fr)_auto] sm:items-end">
            <label className="field-label min-w-0">
              Vùng giải phẫu
              <select
                value={area}
                onChange={(event) => changeArea(validArea(event.target.value))}
              >
                {ATLAS_AREAS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Góc nhìn mô hình"
            >
              {CAMERA_VIEWS.map((view) => (
                <button
                  key={view.type}
                  type="button"
                  className="button-secondary min-h-11 px-3"
                  onClick={() => sendCommand(view.type)}
                >
                  {view.label}
                </button>
              ))}
              <button
                type="button"
                className="icon-button min-h-11 min-w-11"
                title="Đặt lại góc nhìn"
                aria-label="Đặt lại góc nhìn"
                onClick={() => sendCommand("reset")}
              >
                <Icon name="refresh" className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-3">
            <fieldset className="flex flex-wrap gap-x-4 gap-y-1">
              <legend className="sr-only">Lớp cấu trúc</legend>
              {ATLAS_LAYERS.map((layer) => (
                <label
                  key={layer.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium text-ink"
                >
                  <input
                    type="checkbox"
                    checked={layers[layer.id]}
                    onChange={(event) =>
                      setLayers((current) => ({
                        ...current,
                        [layer.id]: event.target.checked,
                      }))
                    }
                    className="size-4 accent-cobalt"
                  />
                  {layer.label}
                </label>
              ))}
            </fieldset>
            <div className="flex min-h-11 min-w-0 flex-wrap items-center gap-3 text-xs text-slate">
              <label htmlFor="atlas-muscle-opacity">Độ đậm cơ</label>
              <input
                id="atlas-muscle-opacity"
                type="range"
                min="15"
                max="100"
                step="5"
                value={Math.round(muscleOpacity * 100)}
                onChange={(event) =>
                  setMuscleOpacity(Number(event.target.value) / 100)
                }
                className="!min-h-11 !w-28 !border-0 !bg-transparent !p-0 accent-cobalt"
              />
              <output
                htmlFor="atlas-muscle-opacity"
                className="w-8 font-mono text-ink"
              >
                {Math.round(muscleOpacity * 100)}%
              </output>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-3">
            <label className="flex min-h-11 flex-wrap items-center gap-3 text-xs font-medium text-ink">
              Chất lượng hình ảnh
              <select
                value={quality}
                onChange={(event) =>
                  setQuality(event.target.value as RenderQuality)
                }
                className="min-h-11 !w-auto !min-w-32 px-3 py-2"
              >
                <option value="auto">Tự động</option>
                <option value="fast">Nhanh</option>
                <option value="detailed">Chi tiết</option>
              </select>
            </label>
          </div>
        </div>
      </details>

      <div
        className={`grid min-w-0 items-start gap-4 ${learningActive ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "xl:grid-cols-[minmax(0,1fr)_300px]"}`}
      >
        <div className="min-w-0 space-y-3">
          <div className="panel min-w-0 overflow-hidden">
            {learningActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-sheet px-4 py-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="eyebrow text-cobalt">
                    {String(learning.step + 1).padStart(2, "0")} /{" "}
                    {learningSteps[learning.step].short}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold leading-6 text-ink">
                    {selected
                      ? <AtlasStructureName structure={selected} />
                      : "Chọn một cấu trúc để bắt đầu"}
                  </p>
                </div>
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Công cụ bàn học 3D"
                >
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setLearning((current) => ({
                        ...current,
                        projection:
                          current.projection === "orthographic"
                            ? "perspective"
                            : "orthographic",
                      }))
                    }
                    aria-pressed={learning.projection === "orthographic"}
                  >
                    {learning.projection === "orthographic"
                      ? "Trực giao"
                      : "Phối cảnh"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setLearning((current) => ({
                        ...current,
                        labels: !current.labels,
                      }))
                    }
                    aria-pressed={learning.labels}
                  >
                    Nhãn
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => sendCommand("front")}
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => sendCommand("back")}
                  >
                    Sau
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Đặt lại góc nhìn bàn học"
                    onClick={() => sendCommand("reset")}
                  >
                    <Icon name="refresh" className="size-4" />
                  </button>
                </div>
              </div>
            )}
            <div
              className={`relative bg-surface ${learningActive ? "h-[58svh] min-h-[360px] max-h-[680px] sm:min-h-[420px]" : "min-h-[480px] sm:min-h-[620px]"}`}
            >
              <Atlas3DCanvas
                bundleUrl={bundle.url}
                structures={manifest.structures}
                layers={layers}
                hiddenIds={hiddenIds}
                isolatedId={isolatedId}
                selectedId={selectedId}
                searchTargetIds={searchTargetIds}
                thicknessId={thicknessId}
                materialStudy={area === "hip" && materialStudy}
                showSurfaceLabels={
                  area === "hip" &&
                  showSurfaceLabels &&
                  (!learningActive || learning.labels)
                }
                studyRetry={studyRetry}
                onStudyStatus={setStudyStatus}
                muscleOpacity={muscleOpacity}
                quality={quality}
                learningMode={learningActive}
                projection={
                  learningActive ? learning.projection : "perspective"
                }
                showStructureLabels={learning.labels}
                command={command}
                onSelect={selectStructure}
              />
              {thicknessId && selectedVisible && (
                <div className="absolute inset-x-3 bottom-3 rounded-lg border border-rule bg-sheet/95 p-3 text-xs text-ink">
                  <p className="font-semibold">
                    Độ dày ước lượng · cấu trúc đã chọn
                  </p>
                  <div
                    className="mt-2 h-2 rounded-full bg-[linear-gradient(to_right,#0946d2,#05dfe9,#ffbd34,#d12b27)]"
                    aria-hidden="true"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[10px]">
                    <span>0 mm</span>
                    <span>50 mm</span>
                    <span>100+ mm</span>
                  </div>
                  <p className="mt-1 text-xs text-slate">
                    Thang màu định tính · Xám: chưa tính được
                  </p>
                </div>
              )}
              {visibleCount === 0 && (
                <div
                  className="absolute inset-x-4 bottom-4 rounded-xl border border-rule bg-sheet p-4 text-center text-sm text-slate"
                  role="status"
                >
                  <p>Không có cấu trúc nào đang hiển thị.</p>
                  <button
                    type="button"
                    className="button-secondary mt-3"
                    onClick={restoreVisibility}
                  >
                    Khôi phục hiển thị
                  </button>
                </div>
              )}
            </div>
            <div className="border-t border-rule px-4 py-3 text-xs leading-5 text-slate">
              <p>
                Kéo để xoay · Cuộn / chụm để thu phóng · Nhấp đúp để xem sát bề
                mặt
              </p>
            </div>
            <div
              className="flex flex-wrap gap-2 border-t border-rule p-3"
              role="group"
              aria-label="Thao tác với cấu trúc đã chọn"
            >
              <button
                type="button"
                className="button-secondary"
                disabled={!selected || !selectedVisible}
                onClick={() => sendCommand("focus")}
              >
                <Icon name="target" className="size-4" />
                Tập trung
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={!selected || !selectedVisible}
                onClick={() => sendCommand("detail")}
              >
                {learningActive ? "Cận cảnh" : "Cận cảnh bề mặt"}
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={!selected}
                aria-pressed={Boolean(selected && isolatedId === selected.id)}
                onClick={() => {
                  if (!selected) return;
                  // Preserve the searched family when toggling isolation; a
                  // re-selection would reset isolation before this toggle.
                  setLayers((current) => ({ ...current, [selected.layer]: true }));
                  setHiddenIds((current) => {
                    const next = new Set(current);
                    next.delete(selected.id);
                    return next;
                  });
                  setIsolatedId((current) =>
                    current === selected.id ? null : selected.id,
                  );
                  sendCommand("focus");
                }}
              >
                Tách riêng
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={!selected}
                onClick={() => {
                  if (!selected) return;
                  setHiddenIds((current) => {
                    const next = new Set(current);
                    if (next.has(selected.id)) next.delete(selected.id);
                    else next.add(selected.id);
                    return next;
                  });
                }}
              >
                {selected && hiddenIds.has(selected.id)
                  ? "Hiện cấu trúc"
                  : learningActive
                    ? "Ẩn"
                    : "Ẩn cấu trúc"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={restoreVisibility}
              >
                {learningActive ? "Khôi phục" : "Khôi phục lớp"}
              </button>
            </div>
          </div>

          {learningActive && (
            <RegionLearningRail
              step={learning.step}
              steps={learningSteps}
              areaLabel={areaLabel}
              onStep={applyLearningStep}
            />
          )}
        </div>

        {learningActive ? (
          <AtlasLearningInspector
            key={`${area}-${learning.step}`}
            defaultTab={searchTargetIds.size ? "structures" : learning.step === 3 ? "knowledge" : "overview"}
            overview={
              <RegionLearningOverview
                area={area}
                areaLabel={areaLabel}
                selfCheck={learning.step === 4}
              />
            }
            structures={searchPanel}
            knowledge={knowledgePanel}
            sources={
              <RegionLearningSources
                area={area}
                areaLabel={areaLabel}
                selectedId={selectedId}
                selectedEnglish={selected?.english ?? null}
              />
            }
          />
        ) : (
          <aside
            className="min-w-0 space-y-4"
            aria-label="Danh mục và thông tin cấu trúc"
          >
            {searchPanel}
            {knowledgePanel}
          </aside>
        )}
      </div>
      {area === "hip" && (
        <details className="panel overflow-hidden">
          <summary className="min-h-12 cursor-pointer px-4 py-3 text-xs font-semibold text-slate">
            Vật liệu mô phỏng & mẫu quan sát cận cảnh
          </summary>
          <div className="p-3">
            <HipMaterialStudyControls
              enabled={materialStudy}
              status={studyStatus}
              onEnabled={setMaterialStudy}
              onSample={openStudySample}
              onRetry={() => setStudyRetry((value) => value + 1)}
              showLabels={showSurfaceLabels}
              onLabels={setShowSurfaceLabels}
            />
          </div>
        </details>
      )}
      <p className="px-1 text-xs leading-6 text-slate">
        Mô hình: Z-Anatomy / BodyParts3D · CC BY-SA 4.0. Tên cơ hiển thị Việt /
        Anh; tên Anh giữ theo nguồn. Tên Việt là chuyển ngữ của app.{" "}
        <a
          href="/anatomy/3d/ATTRIBUTION.md"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-cobalt underline underline-offset-2"
        >
          Nguồn & giấy phép
        </a>
        {" · "}
        <a
          href="/anatomy/3d/TERMINOLOGY.md"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-cobalt underline underline-offset-2"
        >
          Nguồn tên song ngữ
        </a>
      </p>
    </section>
  );
}
