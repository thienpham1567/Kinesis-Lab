"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HYPERTROPHY_EXERCISES,
  MUSCLE_GROUP_ATLAS,
  type HypertrophyExercise,
  type MuscleGroupAtlas,
  type MuscleGroupId,
} from "@/lib/clinical/muscle-hypertrophy-atlas";

interface MyologyZone {
  id: string;
  muscleId: MuscleGroupId;
  shortTag: string;
  vnLabel: string;
  latinLabel: string;
  d: string;
  pinX: number;
  pinY: number;
}

const ANTERIOR_MYOLOGY_ZONES: MyologyZone[] = [
  {
    id: "m-ant-delt-l",
    muscleId: "deltoids",
    shortTag: "Vai Trước & Giữa",
    vnLabel: "Cơ Delta Trước & Giữa (Anterior & Lateral Deltoid)",
    latinLabel: "M. Deltoideus (pars clavicularis & acromialis)",
    d: "M 220 315 C 255 292, 315 298, 338 325 L 322 455 C 272 460, 218 435, 206 392 Z",
    pinX: 266,
    pinY: 376,
  },
  {
    id: "m-ant-delt-r",
    muscleId: "deltoids",
    shortTag: "Vai Trước & Giữa",
    vnLabel: "Cơ Delta Trước & Giữa (Anterior & Lateral Deltoid)",
    latinLabel: "M. Deltoideus (pars clavicularis & acromialis)",
    d: "M 562 325 C 585 298, 645 292, 680 315 L 694 392 C 682 435, 628 460, 578 455 Z",
    pinX: 634,
    pinY: 376,
  },
  {
    id: "m-ant-chest",
    muscleId: "chest",
    shortTag: "Ngực Trên/Giữa/Dưới",
    vnLabel: "Cơ Ngực Lớn (3 Bó: Đòn, Ức-Sườn, Bụng) & Cơ Răng Trước",
    latinLabel: "M. Pectoralis major & M. Serratus anterior",
    d: "M 332 315 C 390 305, 510 305, 568 315 L 592 482 C 520 498, 380 498, 308 482 Z",
    pinX: 450,
    pinY: 402,
  },
  {
    id: "m-ant-biceps-l",
    muscleId: "biceps_forearm",
    shortTag: "Tay Trước & Cẳng Tay",
    vnLabel: "Cơ Nhị Đầu (Đầu Dài/Ngắn), Cơ Cánh Tay & Cẳng Tay",
    latinLabel: "M. Biceps brachii, Brachialis & Brachioradialis",
    d: "M 195 455 L 282 465 L 185 835 L 95 815 Z",
    pinX: 205,
    pinY: 590,
  },
  {
    id: "m-ant-biceps-r",
    muscleId: "biceps_forearm",
    shortTag: "Tay Trước & Cẳng Tay",
    vnLabel: "Cơ Nhị Đầu (Đầu Dài/Ngắn), Cơ Cánh Tay & Cẳng Tay",
    latinLabel: "M. Biceps brachii, Brachialis & Brachioradialis",
    d: "M 618 465 L 705 455 L 805 815 L 715 835 Z",
    pinX: 695,
    pinY: 590,
  },
  {
    id: "m-ant-abs",
    muscleId: "abs_obliques",
    shortTag: "Bụng 6 Múi & Cơ Chéo",
    vnLabel: "Cơ Thẳng Bụng (6 Múi), Cơ Chéo Bụng Trong/Ngoài & Cơ Ngang Bụng",
    latinLabel: "M. Rectus abdominis & Mm. Obliqui abdominis",
    d: "M 312 485 L 588 485 L 598 760 C 525 785, 375 785, 302 760 Z",
    pinX: 450,
    pinY: 615,
  },
  {
    id: "m-ant-quads-l",
    muscleId: "quads_adductors",
    shortTag: "Đùi Trước & Cơ Khép",
    vnLabel: "Cơ Tứ Đầu Đùi (4 Đầu: Rectus Femoris, Vastus) & Cơ Khép Đùi",
    latinLabel: "M. Quadriceps femoris & Mm. Adductores",
    d: "M 285 775 L 442 785 L 432 1145 L 315 1145 Z",
    pinX: 368,
    pinY: 965,
  },
  {
    id: "m-ant-quads-r",
    muscleId: "quads_adductors",
    shortTag: "Đùi Trước & Cơ Khép",
    vnLabel: "Cơ Tứ Đầu Đùi (4 Đầu: Rectus Femoris, Vastus) & Cơ Khép Đùi",
    latinLabel: "M. Quadriceps femoris & Mm. Adductores",
    d: "M 458 785 L 615 775 L 585 1145 L 468 1145 Z",
    pinX: 532,
    pinY: 965,
  },
  {
    id: "m-ant-shin-l",
    muscleId: "calves",
    shortTag: "Cơ Chày Trước & Mác",
    vnLabel: "Cơ Chày Trước (Tibialis Anterior), Cơ Mác & Bụng Chân Trong",
    latinLabel: "M. Tibialis anterior & M. Fibularis longus",
    d: "M 320 1190 L 426 1190 L 418 1530 L 332 1530 Z",
    pinX: 375,
    pinY: 1355,
  },
  {
    id: "m-ant-shin-r",
    muscleId: "calves",
    shortTag: "Cơ Chày Trước & Mác",
    vnLabel: "Cơ Chày Trước (Tibialis Anterior), Cơ Mác & Bụng Chân Trong",
    latinLabel: "M. Tibialis anterior & M. Fibularis longus",
    d: "M 474 1190 L 580 1190 L 568 1530 L 482 1530 Z",
    pinX: 525,
    pinY: 1355,
  },
];

const POSTERIOR_MYOLOGY_ZONES: MyologyZone[] = [
  {
    id: "m-post-traps",
    muscleId: "upper_back_traps",
    shortTag: "Cơ Thang, Trám & Dựng Sống",
    vnLabel: "Cơ Thang (Trên/Giữa/Dưới), Cơ Trám & Cột Cơ Dựng Sống",
    latinLabel: "M. Trapezius, Mm. Rhomboidei & M. Erector spinae",
    d: "M 355 215 L 545 215 L 555 520 L 495 725 L 405 725 L 345 520 Z",
    pinX: 450,
    pinY: 395,
  },
  {
    id: "m-post-delt-l",
    muscleId: "deltoids",
    shortTag: "Vai Sau & Chóp Xoay",
    vnLabel: "Cơ Delta Sau (Posterior Deltoid), Cơ Dưới Gai & Tròn Bé",
    latinLabel: "M. Deltoideus (pars spinalis) & M. Infraspinatus",
    d: "M 222 330 L 352 345 L 342 465 L 218 450 Z",
    pinX: 282,
    pinY: 395,
  },
  {
    id: "m-post-delt-r",
    muscleId: "deltoids",
    shortTag: "Vai Sau & Chóp Xoay",
    vnLabel: "Cơ Delta Sau (Posterior Deltoid), Cơ Dưới Gai & Tròn Bé",
    latinLabel: "M. Deltoideus (pars spinalis) & M. Infraspinatus",
    d: "M 548 345 L 678 330 L 682 450 L 558 465 Z",
    pinX: 618,
    pinY: 395,
  },
  {
    id: "m-post-triceps-l",
    muscleId: "triceps",
    shortTag: "Tay Sau 3 Đầu (Triceps)",
    vnLabel: "Cơ Tam Đầu Cánh Tay (Đầu Dài, Đầu Ngoài & Đầu Trong)",
    latinLabel: "M. Triceps brachii (Caput longum, laterale, mediale)",
    d: "M 205 460 L 295 475 L 255 685 L 175 665 Z",
    pinX: 238,
    pinY: 565,
  },
  {
    id: "m-post-triceps-r",
    muscleId: "triceps",
    shortTag: "Tay Sau 3 Đầu (Triceps)",
    vnLabel: "Cơ Tam Đầu Cánh Tay (Đầu Dài, Đầu Ngoài & Đầu Trong)",
    latinLabel: "M. Triceps brachii (Caput longum, laterale, mediale)",
    d: "M 605 475 L 695 460 L 725 665 L 645 685 Z",
    pinX: 662,
    pinY: 565,
  },
  {
    id: "m-post-lats-l",
    muscleId: "lats_teres",
    shortTag: "Cơ Xô & Cơ Tròn Lớn",
    vnLabel: "Cơ Lưng Rộng — Cơ Xô (Bó Ngực & Bó Chậu) & Cơ Tròn Lớn",
    latinLabel: "M. Latissimus dorsi & M. Teres major",
    d: "M 312 455 L 402 485 L 408 715 L 315 695 Z",
    pinX: 356,
    pinY: 575,
  },
  {
    id: "m-post-lats-r",
    muscleId: "lats_teres",
    shortTag: "Cơ Xô & Cơ Tròn Lớn",
    vnLabel: "Cơ Lưng Rộng — Cơ Xô (Bó Ngực & Bó Chậu) & Cơ Tròn Lớn",
    latinLabel: "M. Latissimus dorsi & M. Teres major",
    d: "M 498 485 L 588 455 L 585 695 L 492 715 Z",
    pinX: 544,
    pinY: 575,
  },
  {
    id: "m-post-glutes",
    muscleId: "glutes",
    shortTag: "Mông Lớn, Nhỡ & Bé",
    vnLabel:
      "Cơ Mông Lớn (Maximus), Mông Nhỡ (Medius — Upper Shelf) & Mông Bé",
    latinLabel: "M. Gluteus maximus, medius & minimus",
    d: "M 305 735 L 595 735 L 592 920 L 308 920 Z",
    pinX: 450,
    pinY: 828,
  },
  {
    id: "m-post-hams-l",
    muscleId: "hamstrings",
    shortTag: "Gân Kheo (4 Đầu)",
    vnLabel:
      "Nhóm Cơ Gân Kheo (Biceps Femoris Long/Short Head, Semitendinosus, Semimembranosus)",
    latinLabel: "Mm. Ischiocrurales (Hamstrings)",
    d: "M 312 925 L 438 925 L 432 1145 L 332 1145 Z",
    pinX: 378,
    pinY: 1025,
  },
  {
    id: "m-post-hams-r",
    muscleId: "hamstrings",
    shortTag: "Gân Kheo (4 Đầu)",
    vnLabel:
      "Nhóm Cơ Gân Kheo (Biceps Femoris Long/Short Head, Semitendinosus, Semimembranosus)",
    latinLabel: "Mm. Ischiocrurales (Hamstrings)",
    d: "M 462 925 L 588 925 L 568 1145 L 468 1145 Z",
    pinX: 522,
    pinY: 1025,
  },
  {
    id: "m-post-calves-l",
    muscleId: "calves",
    shortTag: "Bụng Chân & Cơ Dép",
    vnLabel:
      "Cơ Bụng Chân (Gastrocnemius), Cơ Dép (Soleus) & Gân Gót Achilles",
    latinLabel: "M. Triceps surae (Gastrocnemius, Soleus) & Tendo calcaneus",
    d: "M 326 1185 L 438 1185 L 430 1535 L 352 1535 Z",
    pinX: 382,
    pinY: 1325,
  },
  {
    id: "m-post-calves-r",
    muscleId: "calves",
    shortTag: "Bụng Chân & Cơ Dép",
    vnLabel:
      "Cơ Bụng Chân (Gastrocnemius), Cơ Dép (Soleus) & Gân Gót Achilles",
    latinLabel: "M. Triceps surae (Gastrocnemius, Soleus) & Tendo calcaneus",
    d: "M 462 1185 L 574 1185 L 548 1535 L 470 1535 Z",
    pinX: 518,
    pinY: 1325,
  },
];

const CATEGORY_LABELS: Record<"all" | MuscleGroupAtlas["category"], string> = {
  all: "Tất cả (11)",
  upper_push: "Đẩy trên",
  upper_pull: "Kéo trên",
  arms_core: "Tay & Core",
  lower_body: "Thân dưới",
};

const MUSCLE_SHORT_NAME: Record<MuscleGroupId, string> = {
  chest: "Ngực",
  lats_teres: "Xô",
  upper_back_traps: "Lưng trên",
  deltoids: "Vai",
  biceps_forearm: "Tay trước",
  triceps: "Tay sau",
  abs_obliques: "Bụng",
  glutes: "Mông",
  quads_adductors: "Đùi trước",
  hamstrings: "Gân kheo",
  calves: "Bắp chân",
};

export function MuscleHypertrophyExplorer() {
  const [lookupMode, setLookupMode] = useState<"muscle_to_ex" | "ex_to_muscle">(
    "muscle_to_ex",
  );
  const [selectedMuscleId, setSelectedMuscleId] =
    useState<MuscleGroupId>("chest");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    HYPERTROPHY_EXERCISES[0].id,
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | MuscleGroupAtlas["category"]
  >("all");
  const [patternFilter, setPatternFilter] = useState<
    "all" | HypertrophyExercise["pattern"]
  >("all");
  const [hoveredZone, setHoveredZone] = useState<MyologyZone | null>(null);
  const [zoomedPlate, setZoomedPlate] = useState(false);
  const [selectedPlateIndex, setSelectedPlateIndex] = useState(0);
  const [bodySide, setBodySide] = useState<"both" | "anterior" | "posterior">("both");

  useEffect(() => {
    if (!zoomedPlate) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomedPlate(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomedPlate]);

  const activeMuscle =
    MUSCLE_GROUP_ATLAS.find((m) => m.id === selectedMuscleId) ??
    MUSCLE_GROUP_ATLAS[0];
  const musclePlates = [
    {
      src: activeMuscle.plateSrc,
      title: activeMuscle.plateTitle,
      credit: activeMuscle.plateCredit,
      label: activeMuscle.plateLabel,
      description: activeMuscle.plateDescription,
      sourceUrl: activeMuscle.plateSourceUrl,
    },
    ...(activeMuscle.additionalPlates ?? []),
  ];
  const activePlate = musclePlates[selectedPlateIndex] ?? musclePlates[0];
  const activeExercise =
    HYPERTROPHY_EXERCISES.find((e) => e.id === selectedExerciseId) ??
    HYPERTROPHY_EXERCISES[0];

  const filteredMuscles = MUSCLE_GROUP_ATLAS.filter(
    (m) => categoryFilter === "all" || m.category === categoryFilter,
  );
  const filteredExercises = HYPERTROPHY_EXERCISES.filter(
    (e) => patternFilter === "all" || e.pattern === patternFilter,
  );

  function selectMuscle(id: MuscleGroupId) {
    const muscle = MUSCLE_GROUP_ATLAS.find((m) => m.id === id);
    if (!muscle) return;
    if (categoryFilter !== "all" && categoryFilter !== muscle.category) {
      setCategoryFilter("all");
    }
    setSelectedMuscleId(id);
    setSelectedPlateIndex(0);
    setLookupMode("muscle_to_ex");
  }

  function selectExercise(id: string) {
    const exercise = HYPERTROPHY_EXERCISES.find((e) => e.id === id);
    if (!exercise) return;
    if (patternFilter !== "all" && patternFilter !== exercise.pattern) {
      setPatternFilter("all");
    }
    setSelectedExerciseId(id);
    setLookupMode("ex_to_muscle");
  }

  function selectCategoryFilter(category: typeof categoryFilter) {
    setCategoryFilter(category);
    if (category !== "all" && activeMuscle.category !== category) {
      const firstMuscle = MUSCLE_GROUP_ATLAS.find((m) => m.category === category);
      if (firstMuscle) {
        setSelectedMuscleId(firstMuscle.id);
        setSelectedPlateIndex(0);
      }
    }
  }

  function selectPatternFilter(pattern: typeof patternFilter) {
    setPatternFilter(pattern);
    if (pattern !== "all" && activeExercise.pattern !== pattern) {
      const firstExercise = HYPERTROPHY_EXERCISES.find((e) => e.pattern === pattern);
      if (firstExercise) setSelectedExerciseId(firstExercise.id);
    }
  }

  const muscleExercises = HYPERTROPHY_EXERCISES.map((ex) => {
    const match = ex.targets.find((t) => t.muscleId === activeMuscle.id);
    return match ? { exercise: ex, target: match } : null;
  })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.target.activationPct - a.target.activationPct);

  function renderMyologyFigure(
    side: "anterior" | "posterior",
    zones: MyologyZone[],
    title: string,
    imageSrc: string,
  ) {
    const seenMuscles = new Set<MuscleGroupId>();
    const badgeZones = zones.filter((z) => {
      if (seenMuscles.has(z.muscleId)) return false;
      seenMuscles.add(z.muscleId);
      return true;
    });

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

            {/* Sculpted Anatomical Region Overlays */}
            {zones.map((z) => {
              const isHovered = hoveredZone?.muscleId === z.muscleId;

              let fill = "rgba(14, 77, 164, 0.0)";
              let stroke = "rgba(14, 77, 164, 0.0)";
              let strokeWidth = 0;

              if (lookupMode === "ex_to_muscle") {
                const exTarget = activeExercise.targets.find(
                  (t) => t.muscleId === z.muscleId,
                );
                if (exTarget?.role === "primary") {
                  fill = isHovered
                    ? "rgba(185, 28, 28, 0.28)"
                    : "rgba(185, 28, 28, 0.16)";
                  stroke = "#b91c1c";
                  strokeWidth = 5;
                } else if (exTarget?.role === "synergist") {
                  fill = isHovered
                    ? "rgba(180, 83, 9, 0.24)"
                    : "rgba(180, 83, 9, 0.14)";
                  stroke = "#d97706";
                  strokeWidth = 4;
                } else if (exTarget?.role === "stabilizer") {
                  fill = isHovered
                    ? "rgba(13, 70, 150, 0.22)"
                    : "rgba(13, 70, 150, 0.12)";
                  stroke = "#0d4696";
                  strokeWidth = 4;
                } else if (isHovered) {
                  fill = "rgba(13, 70, 150, 0.1)";
                  stroke = "#2563eb";
                  strokeWidth = 3;
                }
              } else {
                const isSelected = selectedMuscleId === z.muscleId;
                if (isSelected) {
                  fill = isHovered
                    ? "rgba(13, 70, 150, 0.22)"
                    : "rgba(13, 70, 150, 0.12)";
                  stroke = "#0d4696";
                  strokeWidth = 5;
                } else if (isHovered) {
                  fill = "rgba(37, 99, 235, 0.12)";
                  stroke = "#2563eb";
                  strokeWidth = 3;
                }
              }

              return (
                <path
                  key={`${side}-${z.id}`}
                  d={z.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredZone(z)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => selectMuscle(z.muscleId)}
                />
              );
            })}

            {/* Clean Non-Obscuring Anatomical Target Pins */}
            {badgeZones.map((z) => {
              const isSelectedMuscle =
                lookupMode === "muscle_to_ex" && selectedMuscleId === z.muscleId;
              const exTarget =
                lookupMode === "ex_to_muscle"
                  ? activeExercise.targets.find((t) => t.muscleId === z.muscleId)
                  : undefined;
              const isHovered = hoveredZone?.muscleId === z.muscleId;
              const isActive = isSelectedMuscle || Boolean(exTarget) || isHovered;

              let pinColor = "#475569";
              if (exTarget?.role === "primary") pinColor = "#b91c1c";
              else if (exTarget?.role === "synergist") pinColor = "#d97706";
              else if (exTarget?.role === "stabilizer" || isSelectedMuscle)
                pinColor = "#0e4da4";
              else if (isHovered) pinColor = "#2563eb";

              return (
                <g
                  key={`pin-${side}-${z.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredZone(z)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => selectMuscle(z.muscleId)}
                >
                  {isActive && (
                    <circle
                      cx={z.pinX}
                      cy={z.pinY}
                      r={exTarget ? 36 : 28}
                      fill={pinColor}
                      fillOpacity="0.16"
                      stroke={pinColor}
                      strokeWidth="3"
                    />
                  )}
                  <circle
                    cx={z.pinX}
                    cy={z.pinY}
                    r={exTarget ? 24 : isActive ? 14 : 9}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  {exTarget && (
                    <text
                      x={z.pinX}
                      y={z.pinY + 6}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="800"
                      fill="#ffffff"
                    >
                      {exTarget.activationPct}
                    </text>
                  )}
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
      {/* Top Control Bar: Bidirectional Mode Switch */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rule bg-sheet px-3 py-2.5 shadow-xs">
        <div className="inline-flex flex-wrap gap-1 rounded-md border border-rule bg-canvas p-0.5">
          <button
            type="button"
            onClick={() => setLookupMode("muscle_to_ex")}
            className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
              lookupMode === "muscle_to_ex"
                ? "bg-cobalt text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Chọn cơ → bài tập
          </button>
          <button
            type="button"
            onClick={() => setLookupMode("ex_to_muscle")}
            className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${
              lookupMode === "ex_to_muscle"
                ? "bg-crimson text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            Chọn bài → bản đồ nhiệt
          </button>
        </div>

        {lookupMode === "muscle_to_ex" ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                "all",
                "upper_push",
                "upper_pull",
                "arms_core",
                "lower_body",
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategoryFilter(cat)}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? "bg-cobalt-soft text-cobalt"
                    : "bg-surface text-slate hover:text-ink"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              ["all", "Push", "Pull", "Legs & Glutes", "Arms & Core"] as const
            ).map((pat) => (
              <button
                key={pat}
                type="button"
                onClick={() => selectPatternFilter(pat)}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  patternFilter === pat
                    ? "bg-crimson-soft text-crimson"
                    : "bg-surface text-slate hover:text-ink"
                }`}
              >
                {pat === "all" ? `Tất cả (${HYPERTROPHY_EXERCISES.length})` : pat}
              </button>
            ))}
          </div>
        )}
      </div>

      {lookupMode === "muscle_to_ex" && (
        <div className="flex flex-wrap gap-1.5">
          {filteredMuscles.map((m) => {
            const isSelected = m.id === selectedMuscleId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMuscle(m.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "border-cobalt bg-cobalt text-white"
                    : "border-rule bg-sheet text-slate hover:border-cobalt hover:text-ink"
                }`}
              >
                {MUSCLE_SHORT_NAME[m.id]}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        {/* Left Column: Interactive Anatomical Myology & Heatmap */}
        <div className="rounded-lg border border-rule bg-sheet p-3.5 shadow-xs lg:sticky lg:top-[4.25rem] lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-rule pb-2.5">
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-ink">
                  {lookupMode === "ex_to_muscle"
                    ? "Bản đồ nhiệt kích hoạt"
                    : "Bản đồ hệ cơ"}
                </h2>
                <p className="truncate text-[11px] text-slate">
                  {lookupMode === "ex_to_muscle"
                    ? activeExercise.vietnameseName
                    : "Nhấn vào nhóm cơ trên hình"}
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
                    className={`rounded px-2 py-0.5 font-semibold ${
                      bodySide === v.id ? "bg-sheet text-ink shadow-2xs" : "text-slate"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Hover / Active Readout */}
            <div className="mt-2.5 flex min-h-[42px] flex-col justify-center rounded-md bg-surface/80 px-2.5 py-1.5 text-xs">
              {hoveredZone ? (
                <>
                  <span className="font-display font-bold text-cobalt">
                    {hoveredZone.vnLabel}
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    {hoveredZone.latinLabel}
                  </span>
                </>
              ) : lookupMode === "ex_to_muscle" ? (
                <>
                  <span className="font-display font-bold text-crimson">
                    {activeExercise.name}
                  </span>
                  <span className="text-[11px] text-slate">
                    {activeExercise.resistanceProfile}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display font-bold text-ink">
                    {activeMuscle.name}
                  </span>
                  <span className="font-mono text-[11px] text-cobalt">
                    {activeMuscle.latinName}
                  </span>
                </>
              )}
            </div>

            {/* Dual Anterior & Posterior Figures */}
            <div className="my-2.5 rounded-md border border-rule bg-white p-2">
              <div
                className={`grid gap-2 ${bodySide === "both" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
              >
                {(bodySide === "both" || bodySide === "anterior") &&
                  renderMyologyFigure(
                    "anterior",
                    ANTERIOR_MYOLOGY_ZONES,
                    "Mặt trước",
                    "/anatomy/muscles-anterior.png",
                  )}
                {(bodySide === "both" || bodySide === "posterior") &&
                  renderMyologyFigure(
                    "posterior",
                    POSTERIOR_MYOLOGY_ZONES,
                    "Mặt sau",
                    "/anatomy/muscles-posterior.png",
                  )}
              </div>

              {/* Non-obscuring Active Target Chips below the anatomical figures */}
              {lookupMode === "ex_to_muscle" ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-rule pt-2.5">
                  {activeExercise.targets.map((t) => {
                    const chipCls =
                      t.role === "primary"
                        ? "bg-crimson text-white"
                        : t.role === "synergist"
                          ? "bg-amber-600 text-white"
                          : "bg-cobalt text-white";
                    return (
                      <button
                        key={t.muscleId}
                        type="button"
                        onClick={() => selectMuscle(t.muscleId)}
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold transition-opacity hover:opacity-90 ${chipCls}`}
                      >
                        <span className="font-mono">{t.activationPct}%</span>
                        <span>{MUSCLE_SHORT_NAME[t.muscleId] ?? t.muscleId}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-rule pt-2 text-[11px] text-slate">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-cobalt">
                    <span className="h-2 w-2 rounded-full bg-cobalt" />
                    {MUSCLE_SHORT_NAME[activeMuscle.id]} · {activeMuscle.subdivisions.length} bó
                  </span>
                  <span>Rê chuột để xem tên Latin</span>
                </div>
              )}
              {lookupMode === "ex_to_muscle" && (
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-rule pt-2 text-[11px] text-slate">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-crimson">
                    <span className="h-2 w-2 rounded-full bg-crimson" />
                    Chủ vận
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-caution">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Đồng vận
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-cobalt">
                    <span className="h-2 w-2 rounded-full bg-cobalt" />
                    Ổn định
                  </span>
                </div>
              )}
            </div>

            {lookupMode === "ex_to_muscle" && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate">
                  Chọn bài tập
                </p>
                <div className="grid max-h-[220px] gap-1 overflow-y-auto pr-1">
                  {filteredExercises.map((ex) => {
                    const isSelected = ex.id === selectedExerciseId;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => selectExercise(ex.id)}
                        className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? "border-crimson bg-crimson-soft/70 font-semibold text-crimson"
                            : "border-rule bg-canvas/60 text-ink hover:border-cobalt/40"
                        }`}
                      >
                        <span className="truncate font-display font-bold">
                          {ex.vietnameseName}
                        </span>
                        <span className="ml-2 shrink-0 font-mono text-[10px] text-slate">
                          {ex.pattern}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Muscle Sub-divisions OR Exercise Heatmap Analysis */}
        <div className="space-y-4 rounded-lg border border-rule bg-sheet p-4 shadow-xs sm:p-5">
          {lookupMode === "muscle_to_ex" ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
                <div className="min-w-0 flex-1">
                  <span className="rounded bg-cobalt-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-cobalt">
                    {activeMuscle.latinName}
                  </span>
                  <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    {activeMuscle.name}
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate">
                    {activeMuscle.summary}
                  </p>
                </div>

                <Link
                  href={`/?prompt=${encodeURIComponent(activeMuscle.sampleAiPrompt)}`}
                  className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
                >
                  Thiết kế giáo án
                </Link>
              </div>

              {/* Hypertrophy Biomechanics Principle + Peer-Reviewed Citations */}
              <div className="space-y-2.5 rounded-md border border-cobalt/25 bg-cobalt-soft/50 p-3.5 text-xs leading-6 text-ink">
                <div>
                  <span className="font-display font-bold text-cobalt">
                    Cơ sinh học Tối ưu Phì đại Cơ (Hypertrophy Biomechanics):{" "}
                  </span>
                  {activeMuscle.hypertrophyScience}
                </div>

                {activeMuscle.references.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-cobalt/15 pt-2">
                    <span className="font-mono text-[10px] font-bold uppercase text-cobalt">
                      Dẫn chứng PubMed / Y văn:
                    </span>
                    {activeMuscle.references.map((ref) => (
                      <a
                        key={ref.url}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded border border-cobalt/30 bg-sheet px-2 py-0.5 text-[11px] font-medium text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                      >
                        {ref.pmid && (
                          <span className="font-mono font-bold text-cobalt">
                            PMID:{ref.pmid}
                          </span>
                        )}
                        <span className="truncate max-w-[320px]">
                          {ref.title}
                        </span>
                        <span className="text-cobalt">↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Textbook anatomy plates, with explicit dissection layers. */}
              <div className="rounded-lg border border-rule bg-surface/50 p-4">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
                      HÌNH GIẢI PHẪU
                    </span>
                    <h3 className="font-display text-sm font-bold text-ink">
                      {activePlate.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomedPlate(true)}
                    className="rounded border border-rule bg-sheet px-2.5 py-1 text-xs font-medium text-ink hover:border-cobalt hover:text-cobalt"
                  >
                    Phóng to hình giải phẫu ⤢
                  </button>
                </div>
                {musclePlates.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-2" aria-label="Lớp giải phẫu">
                    {musclePlates.map((plate, index) => (
                      <button
                        key={plate.src}
                        type="button"
                        aria-pressed={selectedPlateIndex === index}
                        onClick={() => setSelectedPlateIndex(index)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                          selectedPlateIndex === index
                            ? "border-cobalt bg-cobalt-soft text-cobalt"
                            : "border-rule bg-sheet text-slate hover:text-ink"
                        }`}
                      >
                        {plate.label}
                      </button>
                    ))}
                  </div>
                )}
                {activePlate.description && (
                  <p className="mb-3 text-xs leading-relaxed text-slate">
                    {activePlate.description}
                  </p>
                )}
                <div
                  onClick={() => setZoomedPlate(true)}
                  className="flex cursor-zoom-in items-center justify-center rounded-md border border-rule bg-white p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePlate.src}
                    alt={activePlate.title}
                    className="max-h-[340px] w-auto object-contain"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate">
                  Nguồn:{" "}
                  <strong className="text-ink">{activePlate.credit}</strong>
                  {activePlate.sourceUrl && (
                    <a
                      href={activePlate.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-cobalt underline"
                    >
                      Xem nguồn ↗
                    </a>
                  )}
                </p>
              </div>

              {/* 1. Detailed Muscle Sub-divisions (Heads / Fiber Bundles) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-ink">
                    1. Phân tách từng Bó cơ / Đầu cơ (Sub-divisions) & Hồ sơ Kháng lực
                  </h3>
                  <span className="font-mono text-[11px] text-slate">
                    Lengthened (Giãn) vs. Shortened (Co rút)
                  </span>
                </div>

                <div className="grid gap-3">
                  {activeMuscle.subdivisions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-lg border border-rule bg-canvas/60 p-4 text-xs"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
                        <h4 className="font-display text-sm font-bold text-ink">
                          {sub.name}
                        </h4>
                        <span className="font-mono text-xs font-semibold text-cobalt">
                          {sub.latin}
                        </span>
                      </div>

                      <div className="mt-2.5 grid gap-2 text-slate md:grid-cols-2">
                        <p>
                          <strong className="text-ink">
                            Nguyên ủy → Bám tận:
                          </strong>{" "}
                          {sub.originInsertion}
                        </p>
                        <p>
                          <strong className="text-ink">
                            Hướng thớ cơ & Góc kéo:
                          </strong>{" "}
                          {sub.fiberDirection}
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                        <div className="rounded border border-cobalt/30 bg-cobalt-soft/50 p-2.5">
                          <span className="inline-block rounded bg-cobalt px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            TỐI ƯU Ở VỊ TRÍ KÉO GIÃN (LENGTHENED)
                          </span>
                          <p className="mt-1.5 font-display font-bold text-ink">
                            {sub.lengthenedExercise}
                          </p>
                        </div>

                        <div className="rounded border border-cleared/30 bg-cleared-soft/50 p-2.5">
                          <span className="inline-block rounded bg-cleared px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            TỐI ƯU Ở ĐỈNH CO RÚT (SHORTENED)
                          </span>
                          <p className="mt-1.5 font-display font-bold text-ink">
                            {sub.shortenedExercise}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 rounded border border-rule bg-sheet px-3 py-2 text-ink">
                        <span className="font-semibold text-cobalt">
                          Khẩu lệnh PT (Coaching Cue):{" "}
                        </span>
                        {sub.ptCue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Interactive Exercise List targeting this Muscle */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-ink">
                    2. Các Bài tập Tác động vào {activeMuscle.name}
                  </h3>
                  <span className="text-xs text-slate">
                    Nhấn vào bất kỳ bài tập nào để bật{" "}
                    <strong>Bản đồ Nhiệt Cơ (Heatmap)</strong>
                  </span>
                </div>

                <div className="grid gap-2.5 md:grid-cols-2">
                  {muscleExercises.map(({ exercise, target }) => (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => selectExercise(exercise.id)}
                      className="flex flex-col justify-between rounded-md border border-rule bg-canvas/50 p-3.5 text-left text-xs transition-all hover:border-crimson hover:bg-sheet"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold text-white ${
                              target.role === "primary"
                                ? "bg-crimson"
                                : target.role === "synergist"
                                  ? "bg-amber-600"
                                  : "bg-cobalt"
                            }`}
                          >
                            {target.role === "primary"
                              ? `CHỦ VẬN CHÍNH • ${target.activationPct}%`
                              : target.role === "synergist"
                                ? `ĐỒNG VẬN PHỤ • ${target.activationPct}%`
                                : `GIỮ ỔN ĐỊNH • ${target.activationPct}%`}
                          </span>
                          <span className="font-mono text-[10px] text-cobalt">
                            Xem Heatmap →
                          </span>
                        </div>

                        <p className="mt-2 font-display text-sm font-bold text-ink">
                          {exercise.name}
                        </p>
                        <p className="font-medium text-slate">
                          {exercise.vietnameseName}
                        </p>
                        <p className="mt-1.5 text-ink">
                          <strong>Bó cơ đích:</strong> {target.targetedHeads}
                        </p>
                        <p className="mt-1 text-slate">
                          {target.biomechanicalWhy}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Common Compensation Mistakes & PT Corrections */}
              <div className="space-y-2.5">
                <h3 className="font-display text-base font-bold text-ink">
                  3. Chẩn đoán Tập Sai Cơ (Compensation) & Cách PT Chỉnh Kỹ thuật
                </h3>
                <div className="grid gap-3">
                  {activeMuscle.compensationFixes.map((fix) => (
                    <div
                      key={fix.symptom}
                      className="grid gap-3 rounded-md border border-rule bg-canvas/40 p-3.5 text-xs md:grid-cols-2"
                    >
                      <div className="rounded border border-crimson/25 bg-crimson-soft/40 p-2.5">
                        <span className="inline-block rounded bg-crimson px-1.5 py-0.5 text-[10px] font-bold text-white">
                          HIỆN TƯỢNG ĐỀN BÙ SAI CƠ
                        </span>
                        <p className="mt-1.5 font-display font-bold text-ink">
                          {fix.symptom}
                        </p>
                        <p className="mt-1 text-slate">
                          <strong>Nguyên nhân cơ sinh học:</strong>{" "}
                          {fix.biomechanicalCause}
                        </p>
                      </div>

                      <div className="rounded border border-cleared/30 bg-cleared-soft/40 p-2.5">
                        <span className="inline-block rounded bg-cleared px-1.5 py-0.5 text-[10px] font-bold text-white">
                          CÁCH PT CHỈNH KỸ THUẬT
                        </span>
                        <p className="mt-1.5 leading-5 text-ink">
                          {fix.ptCorrection}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Exercise -> Muscle Heatmap Analysis View */
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-crimson-soft px-2.5 py-0.5 font-mono text-xs font-bold text-crimson">
                      {activeExercise.pattern} • {activeExercise.equipment}
                    </span>
                    <span className="rounded bg-cobalt-soft px-2.5 py-0.5 font-mono text-xs font-semibold text-cobalt">
                      {activeExercise.resistanceProfile}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
                    {activeExercise.name} — {activeExercise.vietnameseName}
                  </h2>
                </div>

                <Link
                  href={`/?prompt=${encodeURIComponent(
                    `Phân tích kỹ thuật cơ sinh học, các bó cơ tham gia và cách sửa lỗi cho bài tập ${activeExercise.name} (${activeExercise.vietnameseName}).`,
                  )}`}
                  className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
                >
                  Hỏi AI chuyên sâu bài tập này
                </Link>
              </div>

              {/* Execution & Common Mistake */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-cleared/30 bg-cleared-soft/40 p-3.5 text-xs">
                  <span className="inline-block rounded bg-cleared px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    THIẾT LẬP & KỸ THUẬT CHUẨN PT
                  </span>
                  <p className="mt-2 leading-5 text-ink">
                    {activeExercise.setupAndExecution}
                  </p>
                </div>

                <div className="rounded-md border border-crimson/30 bg-crimson-soft/40 p-3.5 text-xs">
                  <span className="inline-block rounded bg-crimson px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    LỖI SAI LÀM MẤT TẢI CƠ ĐÍCH
                  </span>
                  <p className="mt-2 leading-5 text-ink">
                    {activeExercise.commonMistake}
                  </p>
                </div>
              </div>

              {/* Muscle Activation Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-ink">
                    Phân tích Mức độ Huy động từng Nhóm cơ & Bó cơ trong bài tập
                  </h3>
                  <span className="text-xs text-slate">
                    Nhấn vào thẻ cơ bất kỳ để mở giải phẫu chi tiết bó cơ đó
                  </span>
                </div>

                <div className="grid gap-3">
                  {activeExercise.targets.map((t) => {
                    const muscleMeta = MUSCLE_GROUP_ATLAS.find(
                      (m) => m.id === t.muscleId,
                    );
                    const barColor =
                      t.role === "primary"
                        ? "bg-crimson"
                        : t.role === "synergist"
                          ? "bg-amber-500"
                          : "bg-cobalt";

                    return (
                      <div
                        key={t.muscleId}
                        className="rounded-lg border border-rule bg-canvas/60 p-4 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span
                              className={`mr-2 inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold text-white ${barColor}`}
                            >
                              {t.role === "primary"
                                ? "CHỦ VẬN CHÍNH (PRIMARY AGONIST)"
                                : t.role === "synergist"
                                  ? "ĐỒNG VẬN PHỤ (SYNERGIST)"
                                  : "GIỮ ỔN ĐỊNH ĐỘNG (STABILIZER)"}
                            </span>
                            <span className="font-display text-sm font-bold text-ink">
                              {muscleMeta?.name ?? t.muscleId}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => selectMuscle(t.muscleId)}
                            className="rounded border border-cobalt/30 bg-cobalt-soft px-2.5 py-1 font-semibold text-cobalt hover:opacity-90"
                          >
                            Xem giải phẫu các bó cơ này →
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${t.activationPct}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-xs font-bold text-ink">
                            {t.activationPct}%
                          </span>
                        </div>

                        <p className="mt-2 text-ink">
                          <strong>Bó cơ chịu tải chính:</strong>{" "}
                          {t.targetedHeads}
                        </p>
                        <p className="mt-1 text-slate">
                          <strong>Lý giải cơ sinh học:</strong>{" "}
                          {t.biomechanicalWhy}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Medical Dissection Plate */}
      {zoomedPlate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomedPlate(false)}
        >
          <div
            className="max-h-[92vh] max-w-5xl overflow-auto rounded-lg border border-rule bg-sheet p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  {activePlate.title}
                </h4>
                <p className="text-xs text-slate">{activePlate.credit}</p>
                <a
                  href={activePlate.src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cobalt underline"
                >
                  Xem ảnh ở độ phân giải gốc ↗
                </a>
              </div>
              <button
                type="button"
                onClick={() => setZoomedPlate(false)}
                className="rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-crimson-soft hover:text-crimson"
              >
                Đóng (ESC)
              </button>
            </div>
            {activePlate.description && (
              <p className="mb-3 text-xs leading-relaxed text-slate">
                {activePlate.description}
              </p>
            )}
            <div className="flex justify-center bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePlate.src}
                alt={activePlate.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
