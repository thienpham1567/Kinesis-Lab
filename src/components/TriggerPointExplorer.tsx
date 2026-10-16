"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CATEGORY_LABELS,
  PALPATION_FUNDAMENTALS,
  PAIN_SITE_CULPRIT_MAP,
  TRIGGER_POINT_MUSCLES,
  culpritMusclesForSite,
  getPainSite,
  getTriggerPointMuscle,
  type PainSiteId,
  type TriggerPointCategory,
  type TriggerPointMuscle,
  type TriggerPointMuscleId,
} from "@/lib/clinical/trigger-point-atlas";
import type { ScientificReference } from "@/lib/clinical/muscle-hypertrophy-atlas";

type LookupMode = "muscle_to_pain" | "pain_to_muscle" | "handbook";

interface BodyHitZone {
  id: string;
  muscleId: TriggerPointMuscleId;
  view: "anterior" | "posterior";
  d: string;
}

/** Clickable muscle territories on the same 900×1620 OpenStax body plates as Atlas. */
const BODY_HIT_ZONES: BodyHitZone[] = [
  {
    id: "ant-pec",
    muscleId: "pec_minor",
    view: "anterior",
    d: "M 332 315 C 390 305, 510 305, 568 315 L 592 482 C 520 498, 380 498, 308 482 Z",
  },
  {
    id: "ant-serratus-l",
    muscleId: "lats_serratus",
    view: "anterior",
    d: "M 230 460 C 290 450, 320 510, 300 580 L 250 590 C 210 540, 205 490, 230 460 Z",
  },
  {
    id: "ant-psoas-l",
    muscleId: "iliopsoas",
    view: "anterior",
    d: "M 320 600 L 442 610 L 430 780 L 305 760 Z",
  },
  {
    id: "ant-psoas-r",
    muscleId: "iliopsoas",
    view: "anterior",
    d: "M 458 610 L 580 600 L 595 760 L 470 780 Z",
  },
  {
    id: "ant-tfl-l",
    muscleId: "tfl_vastus_lateralis",
    view: "anterior",
    d: "M 285 775 L 442 785 L 432 1145 L 315 1145 Z",
  },
  {
    id: "ant-tfl-r",
    muscleId: "tfl_vastus_lateralis",
    view: "anterior",
    d: "M 458 785 L 615 775 L 585 1145 L 468 1145 Z",
  },
  {
    id: "ant-shin-l",
    muscleId: "soleus_gastroc",
    view: "anterior",
    d: "M 320 1190 L 426 1190 L 418 1530 L 332 1530 Z",
  },
  {
    id: "ant-shin-r",
    muscleId: "soleus_gastroc",
    view: "anterior",
    d: "M 474 1190 L 580 1190 L 568 1530 L 482 1530 Z",
  },
  {
    id: "post-traps",
    muscleId: "upper_trapezius",
    view: "posterior",
    d: "M 355 215 L 545 215 L 555 430 L 495 430 L 450 320 L 405 430 L 345 430 Z",
  },
  {
    id: "post-levator-l",
    muscleId: "levator_scapulae",
    view: "posterior",
    d: "M 345 300 C 385 270, 430 290, 445 340 L 430 400 L 350 400 Z",
  },
  {
    id: "post-levator-r",
    muscleId: "levator_scapulae",
    view: "posterior",
    d: "M 555 300 C 515 270, 470 290, 455 340 L 470 400 L 550 400 Z",
  },
  {
    id: "post-infra-l",
    muscleId: "infraspinatus",
    view: "posterior",
    d: "M 222 330 L 352 345 L 342 465 L 218 450 Z",
  },
  {
    id: "post-infra-r",
    muscleId: "infraspinatus",
    view: "posterior",
    d: "M 548 345 L 678 330 L 682 450 L 558 465 Z",
  },
  {
    id: "post-lats-l",
    muscleId: "lats_serratus",
    view: "posterior",
    d: "M 312 455 L 402 485 L 408 715 L 315 695 Z",
  },
  {
    id: "post-lats-r",
    muscleId: "lats_serratus",
    view: "posterior",
    d: "M 498 485 L 588 455 L 585 695 L 492 715 Z",
  },
  {
    id: "post-ql",
    muscleId: "quadratus_lumborum",
    view: "posterior",
    d: "M 345 600 L 555 600 L 530 750 L 370 750 Z",
  },
  {
    id: "post-glute",
    muscleId: "glute_med_piriformis",
    view: "posterior",
    d: "M 305 735 L 595 735 L 592 920 L 308 920 Z",
  },
  {
    id: "post-calf-l",
    muscleId: "soleus_gastroc",
    view: "posterior",
    d: "M 326 1185 L 438 1185 L 430 1535 L 352 1535 Z",
  },
  {
    id: "post-calf-r",
    muscleId: "soleus_gastroc",
    view: "posterior",
    d: "M 462 1185 L 574 1185 L 548 1535 L 470 1535 Z",
  },
];

function ReferenceChips({ references }: { references: ScientificReference[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {references.map((ref) => (
        <a
          key={ref.url}
          href={ref.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded border border-cobalt/30 bg-sheet px-2 py-0.5 text-[11px] font-medium text-ink transition-colors hover:border-cobalt hover:text-cobalt"
        >
          {ref.pmid && (
            <span className="font-mono font-bold text-cobalt">
              PMID:{ref.pmid}
            </span>
          )}
          <span className="min-w-0 max-w-[320px] truncate">{ref.title}</span>
          <span className="text-cobalt">↗</span>
        </a>
      ))}
    </div>
  );
}

function TravellX({
  x,
  y,
  active,
  dimmed,
}: {
  x: number;
  y: number;
  active: boolean;
  dimmed?: boolean;
}) {
  const size = active ? 16 : 11;
  const color = dimmed ? "#94a3b8" : active ? "#b42318" : "#8f4308";
  return (
    <g>
      {active && (
        <circle
          cx={x}
          cy={y}
          r={28}
          fill="#b42318"
          fillOpacity="0.14"
          stroke="#b42318"
          strokeWidth="2"
        />
      )}
      <line
        x1={x - size}
        y1={y - size}
        x2={x + size}
        y2={y + size}
        stroke={color}
        strokeWidth={active ? 5 : 3.5}
        strokeLinecap="round"
      />
      <line
        x1={x + size}
        y1={y - size}
        x2={x - size}
        y2={y + size}
        stroke={color}
        strokeWidth={active ? 5 : 3.5}
        strokeLinecap="round"
      />
      <circle
        cx={x}
        cy={y}
        r={active ? 5 : 3.5}
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
      />
    </g>
  );
}

export function TriggerPointExplorer({
  initialMode = "muscle_to_pain",
}: {
  initialMode?: LookupMode;
}) {
  const [lookupMode, setLookupMode] = useState<LookupMode>(initialMode);
  const [selectedMuscleId, setSelectedMuscleId] =
    useState<TriggerPointMuscleId>("infraspinatus");
  const [selectedPainSiteId, setSelectedPainSiteId] =
    useState<PainSiteId>("anterior_shoulder");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | TriggerPointCategory
  >("all");
  const [bodySide, setBodySide] = useState<"both" | "anterior" | "posterior">(
    "both",
  );
  const [hoveredMuscleId, setHoveredMuscleId] =
    useState<TriggerPointMuscleId | null>(null);
  const [hoveredPainSiteId, setHoveredPainSiteId] = useState<PainSiteId | null>(
    null,
  );
  const [hoveredNodeLabel, setHoveredNodeLabel] = useState<string | null>(null);

  const activeMuscle = getTriggerPointMuscle(selectedMuscleId);
  const hoveredMuscle = hoveredMuscleId
    ? getTriggerPointMuscle(hoveredMuscleId)
    : null;
  const hoveredPainSite = hoveredPainSiteId
    ? getPainSite(hoveredPainSiteId)
    : null;
  const activePainSite = getPainSite(selectedPainSiteId);
  const painCulprits = useMemo(
    () => culpritMusclesForSite(activePainSite),
    [activePainSite],
  );

  const filteredMuscles = TRIGGER_POINT_MUSCLES.filter(
    (m) => categoryFilter === "all" || m.category === categoryFilter,
  );

  const culpritIds = new Set(painCulprits.map((m) => m.id));

  function selectMuscle(id: TriggerPointMuscleId) {
    const muscle = getTriggerPointMuscle(id);
    setSelectedMuscleId(id);
    setLookupMode("muscle_to_pain");
    if (categoryFilter !== "all" && categoryFilter !== muscle.category) {
      setCategoryFilter("all");
    }
  }

  function renderFigure(side: "anterior" | "posterior", title: string, imageSrc: string) {
    const muscleZones = activeMuscle.referredPain.filter((z) => z.view === side);
    const hitZones = BODY_HIT_ZONES.filter((z) => z.view === side);
    const allNodesOnSide = TRIGGER_POINT_MUSCLES.flatMap((m) =>
      m.nodes
        .filter((n) => n.view === side)
        .map((n) => ({ node: n, muscle: m })),
    );
    const painSitesOnSide = PAIN_SITE_CULPRIT_MAP.filter((p) => p.view === side);

    return (
      <div className="flex flex-col items-center">
        <span className="mb-1.5 font-mono text-[10px] font-bold tracking-wider text-slate">
          {title}
        </span>
        <div className="relative w-full overflow-hidden rounded-md border border-rule bg-white">
          <svg
            viewBox="0 0 900 1620"
            className={`w-full select-none ${bodySide === "both" ? "max-h-[340px]" : "max-h-[520px]"}`}
            role="img"
            aria-label={title}
          >
            <image
              href={imageSrc}
              x="0"
              y="0"
              width="900"
              height="1620"
              preserveAspectRatio="xMidYMid meet"
            />

            {lookupMode === "muscle_to_pain" &&
              hitZones.map((z) => {
                const isSelected = selectedMuscleId === z.muscleId;
                const isHovered = hoveredMuscleId === z.muscleId;
                let fill = "rgba(180, 35, 24, 0.0)";
                let stroke = "rgba(180, 35, 24, 0.0)";
                let strokeWidth = 0;
                if (isSelected) {
                  fill = isHovered
                    ? "rgba(180, 35, 24, 0.22)"
                    : "rgba(180, 35, 24, 0.12)";
                  stroke = "#b42318";
                  strokeWidth = 5;
                } else if (isHovered) {
                  fill = "rgba(180, 35, 24, 0.12)";
                  stroke = "#e11d48";
                  strokeWidth = 3;
                }
                return (
                  <path
                    key={z.id}
                    d={z.d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredMuscleId(z.muscleId);
                      setHoveredNodeLabel(null);
                    }}
                    onMouseLeave={() => setHoveredMuscleId(null)}
                    onClick={() => selectMuscle(z.muscleId)}
                  />
                );
              })}

            {lookupMode === "pain_to_muscle" &&
              painSitesOnSide.map((site) => {
                const isSelected = site.id === selectedPainSiteId;
                const isHovered = hoveredPainSiteId === site.id;
                return (
                  <path
                    key={site.id}
                    d={site.zoneD}
                    fill={
                      isSelected
                        ? "rgba(180, 83, 9, 0.28)"
                        : isHovered
                          ? "rgba(180, 83, 9, 0.16)"
                          : "rgba(180, 83, 9, 0.08)"
                    }
                    stroke={isSelected ? "#8f4308" : "#d97706"}
                    strokeWidth={isSelected ? 5 : 3}
                    strokeLinejoin="round"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPainSiteId(site.id)}
                    onMouseLeave={() => setHoveredPainSiteId(null)}
                    onClick={() => setSelectedPainSiteId(site.id)}
                  aria-pressed={selectedPainSiteId === site.id}
                  />
                );
              })}

            {lookupMode === "muscle_to_pain" &&
              muscleZones.map((zone, i) => (
                <path
                  key={`${side}-ref-${i}`}
                  d={zone.d}
                  fill="rgba(180, 35, 24, 0.18)"
                  stroke="#b42318"
                  strokeWidth="3"
                  strokeDasharray="10 7"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              ))}

            {lookupMode === "muscle_to_pain" &&
              muscleZones.map((zone, i) => (
                <text
                  key={`${side}-lab-${i}`}
                  x={zone.labelX}
                  y={zone.labelY}
                  fontSize="22"
                  fontWeight="800"
                  fill="#b42318"
                  pointerEvents="none"
                >
                  Lan đau
                </text>
              ))}

            {allNodesOnSide.map(({ node, muscle }) => {
              const isCulprit =
                lookupMode === "pain_to_muscle" && culpritIds.has(muscle.id);
              const isSelectedMuscle =
                lookupMode === "muscle_to_pain" &&
                muscle.id === selectedMuscleId;
              const isHovered = hoveredMuscleId === muscle.id;
              const active = isCulprit || isSelectedMuscle || isHovered;
              const dimmed =
                lookupMode === "pain_to_muscle" ? !isCulprit : !isSelectedMuscle;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredMuscleId(muscle.id);
                    setHoveredNodeLabel(`${node.code} · ${node.locationLabel}`);
                  }}
                  onMouseLeave={() => {
                    setHoveredMuscleId(null);
                    setHoveredNodeLabel(null);
                  }}
                  onClick={() => selectMuscle(muscle.id)}
                >
                  <TravellX x={node.x} y={node.y} active={active} dimmed={dimmed && !isHovered} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 px-4 py-3.5">
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-rule bg-canvas p-1 sm:inline-flex sm:w-auto">
          {(
            [
              { id: "muscle_to_pain", label: "Cơ → vùng đau" },
              { id: "pain_to_muscle", label: "Vùng đau → cơ" },
              { id: "handbook", label: "Cẩm nang sờ nắn" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setLookupMode(mode.id)}
                  aria-pressed={lookupMode === mode.id}
              className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
                lookupMode === mode.id
                  ? mode.id === "pain_to_muscle"
                    ? "bg-caution text-white"
                    : mode.id === "handbook"
                      ? "bg-ink text-white"
                      : "bg-crimson text-white"
                  : "text-slate hover:text-ink"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {lookupMode === "muscle_to_pain" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "neck_shoulder", "trunk", "hip_leg"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  aria-pressed={categoryFilter === cat}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? "bg-crimson-soft text-crimson"
                      : "bg-surface text-slate hover:text-ink"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {lookupMode === "muscle_to_pain" && (
        <div className="flex flex-wrap gap-1.5">
          {filteredMuscles.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMuscleId(m.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                m.id === selectedMuscleId
                  ? "border-crimson bg-crimson text-white"
                  : "border-rule bg-sheet text-slate hover:border-crimson hover:text-ink"
              }`}
            >
              {m.shortName}
            </button>
          ))}
        </div>
      )}

      {lookupMode === "pain_to_muscle" && (
        <div className="flex flex-wrap gap-1.5">
          {PAIN_SITE_CULPRIT_MAP.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => setSelectedPainSiteId(site.id)}
                  aria-pressed={selectedPainSiteId === site.id}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                site.id === selectedPainSiteId
                  ? "border-caution bg-caution text-white"
                  : "border-rule bg-sheet text-slate hover:border-caution hover:text-ink"
              }`}
            >
              {site.shortName}
            </button>
          ))}
        </div>
      )}

      {lookupMode === "handbook" ? (
        <HandbookPanel />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-lg border border-rule bg-sheet p-3.5 shadow-xs lg:sticky lg:top-[5.5rem] lg:self-start lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b border-rule pb-2.5">
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-ink">
                  {lookupMode === "pain_to_muscle"
                    ? "Vùng đau (nạn nhân) → Thủ phạm"
                    : "Điểm X & vùng đau quy chiếu"}
                </h2>
                <p className="truncate text-[11px] text-slate">
                  {lookupMode === "pain_to_muscle"
                    ? "Nhấn vùng khách than đau trên hình"
                    : "Nhấn nhóm cơ hoặc dấu X trên hình"}
                </p>
              </div>
              <div className="inline-flex shrink-0 rounded-md border border-rule bg-canvas p-0.5 text-[11px]">
                {(
                  [
                    { id: "both", label: "2 mặt" },
                    { id: "anterior", label: "Trước" },
                    { id: "posterior", label: "Sau" },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setBodySide(v.id)}
                  aria-pressed={bodySide === v.id}
                    className={`rounded px-2 py-0.5 font-semibold ${
                      bodySide === v.id
                        ? "bg-sheet text-ink shadow-2xs"
                        : "text-slate"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2.5 flex min-h-[42px] flex-col justify-center rounded-md bg-surface/80 px-2.5 py-1.5 text-xs">
              {lookupMode === "pain_to_muscle" ? (
                <>
                  <span className="font-display font-bold text-caution">
                    {(hoveredPainSite ?? activePainSite).name}
                  </span>
                  <span className="text-[11px] text-slate">
                    {culpritMusclesForSite(hoveredPainSite ?? activePainSite)
                      .map((m) => m.shortName)
                      .join(" · ")}{" "}
                    là thủ phạm cần sờ
                  </span>
                </>
              ) : hoveredMuscle ? (
                <>
                  <span className="font-display font-bold text-crimson">
                    {hoveredMuscle.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    {hoveredNodeLabel ?? hoveredMuscle.latinName}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display font-bold text-crimson">
                    {activeMuscle.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    {activeMuscle.latinName}
                  </span>
                </>
              )}
            </div>

            <div className="my-2.5 rounded-md border border-rule bg-white p-2">
              <div
                className={`grid gap-2 ${bodySide === "both" ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {(bodySide === "both" || bodySide === "anterior") &&
                  renderFigure(
                    "anterior",
                    "Mặt trước",
                    "/anatomy/muscles-anterior.png",
                  )}
                {(bodySide === "both" || bodySide === "posterior") &&
                  renderFigure(
                    "posterior",
                    "Mặt sau",
                    "/anatomy/muscles-posterior.png",
                  )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-rule pt-2 text-[11px] text-slate">
                <span className="inline-flex items-center gap-1.5 font-semibold text-crimson">
                  <span className="h-2 w-2 rounded-full bg-crimson" />
                  Cơ đang chọn
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-crimson">
                  <span className="font-display text-sm leading-none">✕</span>
                  Nút Trigger Point
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-crimson">
                  <span className="h-2 w-4 rounded-sm border border-dashed border-crimson bg-crimson/20" />
                  Đau quy chiếu
                </span>
                {lookupMode === "pain_to_muscle" && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-caution">
                    <span className="h-2 w-2 rounded-full bg-caution" />
                    Chỗ khách than đau
                  </span>
                )}
                <span>Rê chuột / nhấn trên hình</span>
              </div>
            </div>

            {lookupMode === "muscle_to_pain" && (
              <div className="space-y-1">
                {activeMuscle.nodes.map((n) => (
                  <p key={n.id} className="text-[11px] leading-5 text-slate">
                    <span className="font-mono font-bold text-crimson">
                      {n.code}
                    </span>{" "}
                    · {n.locationLabel} ({n.view === "anterior" ? "trước" : "sau"})
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-rule bg-sheet p-4 shadow-xs sm:p-5">
            {lookupMode === "muscle_to_pain" ? (
              <MuscleClinicalPanel
                muscle={activeMuscle}
                onJumpToPainSite={(id) => {
                  setSelectedPainSiteId(id);
                  setLookupMode("pain_to_muscle");
                }}
              />
            ) : (
              <PainSitePanel
                siteId={selectedPainSiteId}
                onSelectMuscle={selectMuscle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MuscleClinicalPanel({
  muscle,
  onJumpToPainSite,
}: {
  muscle: TriggerPointMuscle;
  onJumpToPainSite: (id: PainSiteId) => void;
}) {
  const relatedSites = PAIN_SITE_CULPRIT_MAP.filter((site) =>
    site.culprits.some((c) => c.muscleId === muscle.id),
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
        <div className="min-w-0 flex-1">
          <span className="rounded bg-crimson-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-crimson">
            {muscle.latinName}
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {muscle.name}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate">
            {muscle.summary}
          </p>
        </div>
        <Link
          href={`/?prompt=${encodeURIComponent(muscle.sampleAiPrompt)}`}
          className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
        >
          Tư vấn phác đồ AI
        </Link>
      </div>

      <div className="space-y-2.5 rounded-md border border-crimson/25 bg-crimson-soft/40 p-3.5 text-xs leading-6 text-ink">
        <div>
          <span className="font-display font-bold text-crimson">
            Cơ chế Integrated Trigger Point Hypothesis:{" "}
          </span>
          {muscle.mechanism}
        </div>
        {muscle.references.length > 0 && (
          <div className="border-t border-crimson/15 pt-2">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase text-crimson">
              Dẫn chứng Travell / PubMed:
            </span>
            <ReferenceChips references={muscle.references} />
          </div>
        )}
      </div>

      {relatedSites.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="self-center text-[11px] font-semibold text-slate">
            Khách hay than:
          </span>
          {relatedSites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => onJumpToPainSite(site.id)}
              className="rounded-full border border-caution/40 bg-caution-soft px-2.5 py-1 text-[11px] font-semibold text-caution hover:border-caution"
            >
              {site.shortName} →
            </button>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          1. Cách PT sờ nắn &amp; cảm nhận
        </h3>
        <div className="grid gap-2 text-xs md:grid-cols-2">
          <PalpationCard label="Tư thế học viên" value={muscle.palpation.clientPosition} />
          <PalpationCard
            label="Kỹ thuật"
            value={muscle.palpation.technique}
            accent
          />
          <PalpationCard label="Mốc xương" value={muscle.palpation.bonyLandmarks} />
          <PalpationCard
            label="Cảm giác dưới ngón"
            value={muscle.palpation.underFingerFeel}
          />
        </div>
        <div className="rounded-md border border-rule bg-canvas/70 px-3 py-2.5 text-xs leading-6 text-ink">
          <strong className="text-crimson">Phản ứng khách (Jump Sign / referred): </strong>
          {muscle.palpation.clientResponse}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          2. Chuỗi cơ liên đới (Key vs Satellite)
        </h3>
        <div className="rounded-lg border border-rule bg-canvas/60 p-4 text-xs leading-6">
          <p>
            <span className="rounded bg-caution-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-caution">
              {muscle.chain.overloadedState}
            </span>
          </p>
          <p className="mt-2 text-slate">{muscle.chain.biomechanicalReason}</p>
          <div className="mt-3 grid gap-2.5 md:grid-cols-2">
            <div className="rounded border border-cleared/30 bg-cleared-soft/50 p-2.5">
              <span className="inline-block rounded bg-cleared px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                CƠ BỊ ỨC CHẾ — PHẢI KÍCH HOẠT
              </span>
              <p className="mt-1.5 font-display font-bold text-ink">
                {muscle.chain.antagonistOrInhibited.muscles}
              </p>
              <p className="mt-1 text-slate">
                {muscle.chain.antagonistOrInhibited.whyRelated}
              </p>
              <p className="mt-1.5 text-ink">
                <strong>Bài kích hoạt: </strong>
                {muscle.chain.antagonistOrInhibited.activationExercise}
              </p>
            </div>
            <div className="rounded border border-rule bg-sheet p-2.5">
              <span className="font-mono text-[10px] font-bold uppercase text-slate">
                Trigger Point vệ tinh
              </span>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-ink">
                {muscle.chain.satelliteTriggerPoints.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          3. Phác đồ khắc phục 4 bước cho PT
        </h3>
        <ol className="grid gap-2.5">
          <ProtocolStep
            n={1}
            title="Giải phóng điểm kích hoạt (SMR / Ischemic Compression)"
            tone="crimson"
          >
            <p>
              <strong>Dụng cụ: </strong>
              {muscle.protocol.step1Release.tool}
            </p>
            <p>
              <strong>Vị trí: </strong>
              {muscle.protocol.step1Release.placement}
            </p>
            <p>
              <strong>Lực &amp; thời gian: </strong>
              {muscle.protocol.step1Release.pressureAndTime}
            </p>
            <p>
              <strong>Pin &amp; Stretch: </strong>
              {muscle.protocol.step1Release.pinAndStretch}
            </p>
          </ProtocolStep>
          <ProtocolStep n={2} title="Mở biên độ thần kinh–cơ" tone="caution">
            <p>{muscle.protocol.step2Mobility}</p>
          </ProtocolStep>
          <ProtocolStep
            n={3}
            title="Kích hoạt cơ bị ức chế (chống tái phát 24h)"
            tone="cleared"
          >
            <p>{muscle.protocol.step3Activation}</p>
          </ProtocolStep>
          <ProtocolStep n={4} title="Tải lại &amp; chỉnh kỹ thuật nâng tạ" tone="cobalt">
            <p>{muscle.protocol.step4LoadCue}</p>
          </ProtocolStep>
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">
          4. Tình huống phòng tạ &amp; chống chỉ định
        </h3>
        <div className="grid gap-2.5 md:grid-cols-2">
          <div className="rounded-md border border-rule bg-canvas/60 p-3 text-xs">
            <p className="font-display font-bold text-ink">Khi nào TrP cháy</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate">
              {muscle.gymTriggers.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-crimson/30 bg-crimson-soft/50 p-3 text-xs">
            <p className="font-display font-bold text-crimson">
              Không được ấn / Red Flags
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink">
              {muscle.contraindications.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function PainSitePanel({
  siteId,
  onSelectMuscle,
}: {
  siteId: PainSiteId;
  onSelectMuscle: (id: TriggerPointMuscleId) => void;
}) {
  const site = getPainSite(siteId);
  const culprits = culpritMusclesForSite(site);

  return (
    <>
      <div className="border-b border-rule pb-4">
        <span className="rounded bg-caution-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-caution">
          Nơi khách chỉ đau ≠ nơi có nút
        </span>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {site.name}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate">
          {site.victimLabel}
        </p>
      </div>

      <div className="space-y-3">
        {site.culprits.map((c) => {
          const muscle = getTriggerPointMuscle(c.muscleId);
          return (
            <button
              key={c.muscleId}
              type="button"
              onClick={() => onSelectMuscle(c.muscleId)}
              className="w-full rounded-lg border border-rule bg-canvas/60 p-4 text-left text-xs transition-colors hover:border-crimson"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-ink">
                  Thủ phạm: {muscle.shortName}
                </h3>
                <span className="font-mono text-[11px] text-crimson">
                  {muscle.latinName}
                </span>
              </div>
              <p className="mt-2 leading-6 text-slate">{c.whyDeceptive}</p>
              <p className="mt-2 font-semibold text-cobalt">
                Mở hồ sơ sờ nắn &amp; phác đồ 4 bước →
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-rule bg-surface/70 p-3.5 text-xs leading-6 text-ink">
        <strong>Quy tắc Travell cho PT: </strong>
        sờ nút thủ phạm, ấn VAS 5–6, hỏi khách có tái hiện ĐÚNG cơn đau họ than
        không. Nếu không tái hiện — không kết luận TrP; sàng lọc khớp, rễ thần
        kinh, red flag.{" "}
        {culprits[0] && (
          <Link
            href={`/?prompt=${encodeURIComponent(culprits[0].sampleAiPrompt)}`}
            className="font-semibold text-cobalt hover:underline"
          >
            Hỏi AI phác đồ cho thủ phạm hàng đầu
          </Link>
        )}
      </div>
    </>
  );
}

function HandbookPanel() {
  const f = PALPATION_FUNDAMENTALS;
  return (
    <div className="space-y-4 rounded-lg border border-rule bg-sheet p-4 shadow-xs sm:p-5">
      <div className="border-b border-rule pb-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {f.title}
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate">
          {f.ptScope}
        </p>
      </div>

      <div className="rounded-md border border-cobalt/25 bg-cobalt-soft/50 p-3.5 text-xs leading-6 text-ink">
        <span className="font-display font-bold text-cobalt">
          Giả thuyết tích hợp (Shah / Simons):{" "}
        </span>
        {f.hypothesis}
      </div>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          4 tiêu chuẩn nhận diện (Delphi 2018)
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {f.diagnosticCriteria.map((c) => (
            <div
              key={c.code}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-display font-bold text-ink">
                <span className="mr-1.5 font-mono text-crimson">{c.code}.</span>
                {c.name}
              </p>
              <p className="mt-1 leading-5 text-slate">{c.feel}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          3 kỹ thuật đặt ngón tay
        </h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {f.techniques.map((t) => (
            <div
              key={t.name}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs leading-5"
            >
              <p className="font-mono text-[11px] font-bold text-cobalt">
                {t.name}
              </p>
              <p className="mt-1.5 text-ink">
                <strong>Khi nào: </strong>
                {t.when}
              </p>
              <p className="mt-1 text-slate">
                <strong>Cách làm: </strong>
                {t.how}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Thang lực ấn an toàn
        </h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {f.pressureScale.map((p) => (
            <div
              key={p.level}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-mono text-[11px] font-bold text-crimson">
                {p.level}
              </p>
              <p className="mt-1 leading-5 text-slate">{p.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-bold text-ink">
          Phân biệt Active TrP · Latent TrP · DOMS · Red Flags
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {f.differentials.map((d) => (
            <div
              key={d.name}
              className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
            >
              <p className="font-display font-bold text-ink">{d.name}</p>
              <p className="mt-1 leading-5 text-slate">{d.vs}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-md border border-cleared/30 bg-cleared-soft/50 p-3.5 text-xs leading-6 text-ink">
        <span className="font-display font-bold text-cleared">
          Foam roll không nghiền mô sẹo:{" "}
        </span>
        {f.smrMechanism}
      </div>

      <div className="border-t border-rule pt-3">
        <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase text-cobalt">
          Nguồn cẩm nang
        </span>
        <ReferenceChips references={f.references} />
      </div>
    </div>
  );
}

function PalpationCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        accent
          ? "border-crimson/30 bg-crimson-soft/40"
          : "border-rule bg-canvas/60"
      }`}
    >
      <p className="font-mono text-[10px] font-bold uppercase text-slate">
        {label}
      </p>
      <p className="mt-1 leading-5 text-ink">{value}</p>
    </div>
  );
}

function ProtocolStep({
  n,
  title,
  tone,
  children,
}: {
  n: number;
  title: string;
  tone: "crimson" | "caution" | "cleared" | "cobalt";
  children: ReactNode;
}) {
  const toneCls = {
    crimson: "border-crimson/30 bg-crimson-soft/40",
    caution: "border-caution/30 bg-caution-soft/50",
    cleared: "border-cleared/30 bg-cleared-soft/50",
    cobalt: "border-cobalt/30 bg-cobalt-soft/50",
  }[tone];
  const badgeCls = {
    crimson: "bg-crimson text-white",
    caution: "bg-caution text-white",
    cleared: "bg-cleared text-white",
    cobalt: "bg-cobalt text-white",
  }[tone];

  return (
    <li className={`rounded-lg border p-3.5 text-xs leading-6 ${toneCls}`}>
      <p className="font-display font-bold text-ink">
        <span
          className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] ${badgeCls}`}
        >
          {n}
        </span>
        {title}
      </p>
      <div className="mt-1.5 space-y-1 text-ink">{children}</div>
    </li>
  );
}
