"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ANATOMY_REGIONS,
  matchClientIssuesToRegions,
  type AnatomyRegion,
  type AnatomyRegionId,
} from "@/lib/clinical/anatomy-atlas";
import type { Client } from "@/lib/types";
import { JointDiagramSvg } from "./JointDiagramSvg";

const GROUP_LABELS: Record<"all" | AnatomyRegion["group"], string> = {
  all: "Tất cả vùng (8)",
  spine_core: "Cột sống & Cơ lõi",
  upper_limb: "Đai vai & Chi trên",
  lower_limb: "Khung chậu & Chi dưới",
};

interface InteractiveZone {
  id: string;
  regionId: AnatomyRegionId;
  vnLabel: string;
  latinLabel: string;
  shortTag: string;
  /** SVG path or rect in 900x1620 coordinate space */
  d: string;
  /** Pin coordinate for anatomical callout */
  pinX: number;
  pinY: number;
  /** Label anchor coordinate */
  labelX: number;
  labelY: number;
  align: "left" | "right" | "center";
}

const ANTERIOR_ZONES: InteractiveZone[] = [
  {
    id: "ant-cervical",
    regionId: "cervical",
    vnLabel: "Cơ Ức – Đòn – Chũm & Cơ Bậc thang cổ",
    latinLabel: "M. Sternocleidomastoideus & Scaleni",
    shortTag: "Cổ & Cơ bậc thang",
    d: "M 365 215 C 395 205, 505 205, 535 215 L 560 305 C 510 320, 390 320, 340 305 Z",
    pinX: 450,
    pinY: 265,
    labelX: 155,
    labelY: 235,
    align: "left",
  },
  {
    id: "ant-shoulder-l",
    regionId: "shoulder",
    vnLabel: "Cơ Delta trước – giữa & Khớp Cùng – Đòn",
    latinLabel: "M. Deltoideus (pars clavicularis & acromialis)",
    shortTag: "Vai & Delta",
    d: "M 225 320 C 255 295, 315 300, 340 325 L 325 460 C 275 465, 220 440, 208 395 Z",
    pinX: 268,
    pinY: 380,
    labelX: 135,
    labelY: 355,
    align: "left",
  },
  {
    id: "ant-shoulder-r",
    regionId: "shoulder",
    vnLabel: "Cơ Delta trước – giữa & Khớp Cùng – Đòn",
    latinLabel: "M. Deltoideus (pars clavicularis & acromialis)",
    shortTag: "Vai & Delta",
    d: "M 560 325 C 585 300, 645 295, 675 320 L 692 395 C 680 440, 625 465, 575 460 Z",
    pinX: 632,
    pinY: 380,
    labelX: 765,
    labelY: 355,
    align: "right",
  },
  {
    id: "ant-chest",
    regionId: "thoracic_core",
    vnLabel: "Cơ Ngực lớn, Ngực bé & Cơ Răng trước",
    latinLabel: "M. Pectoralis major & M. Serratus anterior",
    shortTag: "Ngực & Răng trước",
    d: "M 335 318 C 390 308, 510 308, 565 318 L 595 475 C 520 492, 380 492, 305 475 Z",
    pinX: 385,
    pinY: 405,
    labelX: 765,
    labelY: 445,
    align: "right",
  },
  {
    id: "ant-core",
    regionId: "thoracic_core",
    vnLabel: "Cơ Thẳng bụng, Chéo bụng trong/ngoài & Cơ Ngang bụng",
    latinLabel: "M. Rectus abdominis, Obliquus & Transversus",
    shortTag: "Hộp Cơ Lõi (Core)",
    d: "M 310 480 L 590 480 L 598 720 C 525 745, 375 745, 302 720 Z",
    pinX: 450,
    pinY: 595,
    labelX: 145,
    labelY: 585,
    align: "left",
  },
  {
    id: "ant-hip-l",
    regionId: "hip_pelvis",
    vnLabel: "Cơ Thắt lưng – Chậu (Iliopsoas), Căng mạc đùi (TFL) & Lược",
    latinLabel: "M. Iliopsoas, Tensor fasciae latae & Pectineus",
    shortTag: "Gập Háng & TFL",
    d: "M 295 725 L 442 738 L 435 865 L 285 855 Z",
    pinX: 355,
    pinY: 795,
    labelX: 135,
    labelY: 790,
    align: "left",
  },
  {
    id: "ant-hip-r",
    regionId: "hip_pelvis",
    vnLabel: "Cơ Thắt lưng – Chậu (Iliopsoas), Căng mạc đùi (TFL) & Lược",
    latinLabel: "M. Iliopsoas, Tensor fasciae latae & Pectineus",
    shortTag: "Gập Háng & TFL",
    d: "M 458 738 L 605 725 L 615 855 L 465 865 Z",
    pinX: 545,
    pinY: 795,
    labelX: 765,
    labelY: 790,
    align: "right",
  },
  {
    id: "ant-thigh-l",
    regionId: "thigh_hamstring",
    vnLabel: "Cơ Tứ đầu đùi (Rectus femoris, Vastus) & Nhóm cơ Khép đùi",
    latinLabel: "M. Quadriceps femoris & Mm. Adductores",
    shortTag: "Tứ đầu & Cơ khép",
    d: "M 285 860 L 438 868 L 432 1095 L 325 1095 Z",
    pinX: 365,
    pinY: 975,
    labelX: 135,
    labelY: 975,
    align: "left",
  },
  {
    id: "ant-thigh-r",
    regionId: "thigh_hamstring",
    vnLabel: "Cơ Tứ đầu đùi (Rectus femoris, Vastus) & Nhóm cơ Khép đùi",
    latinLabel: "M. Quadriceps femoris & Mm. Adductores",
    shortTag: "Tứ đầu & Cơ khép",
    d: "M 462 868 L 615 860 L 575 1095 L 468 1095 Z",
    pinX: 535,
    pinY: 975,
    labelX: 765,
    labelY: 975,
    align: "right",
  },
  {
    id: "ant-knee-l",
    regionId: "knee",
    vnLabel: "Khớp Chè – Đùi, Xương bánh chè, Gân bánh chè & Sụn chêm",
    latinLabel: "Articulatio genus, Patella & Lig. patellae",
    shortTag: "Khớp Gối & Bánh chè",
    d: "M 328 1098 L 432 1098 L 428 1210 L 325 1210 Z",
    pinX: 380,
    pinY: 1152,
    labelX: 145,
    labelY: 1152,
    align: "left",
  },
  {
    id: "ant-knee-r",
    regionId: "knee",
    vnLabel: "Khớp Chè – Đùi, Xương bánh chè, Gân bánh chè & Sụn chêm",
    latinLabel: "Articulatio genus, Patella & Lig. patellae",
    shortTag: "Khớp Gối & Bánh chè",
    d: "M 468 1098 L 572 1098 L 575 1210 L 472 1210 Z",
    pinX: 520,
    pinY: 1152,
    labelX: 755,
    labelY: 1152,
    align: "right",
  },
  {
    id: "ant-ankle-l",
    regionId: "ankle_foot",
    vnLabel: "Cơ Chày trước, Cơ Mác dài & Khớp Cổ chân – Bàn chân",
    latinLabel: "M. Tibialis anterior, Fibularis & Talocruralis",
    shortTag: "Chày trước & Cổ chân",
    d: "M 320 1215 L 426 1215 L 420 1575 L 330 1575 Z",
    pinX: 375,
    pinY: 1385,
    labelX: 145,
    labelY: 1385,
    align: "left",
  },
  {
    id: "ant-ankle-r",
    regionId: "ankle_foot",
    vnLabel: "Cơ Chày trước, Cơ Mác dài & Khớp Cổ chân – Bàn chân",
    latinLabel: "M. Tibialis anterior, Fibularis & Talocruralis",
    shortTag: "Chày trước & Cổ chân",
    d: "M 474 1215 L 580 1215 L 570 1575 L 480 1575 Z",
    pinX: 525,
    pinY: 1385,
    labelX: 755,
    labelY: 1385,
    align: "right",
  },
];

const POSTERIOR_ZONES: InteractiveZone[] = [
  {
    id: "post-cervical",
    regionId: "cervical",
    vnLabel: "Cột sống Cổ (C1–C7), Cơ Thang bó trên & Cơ Nâng vai",
    latinLabel: "Vertebrae cervicales, M. Trapezius descendens & Levator scapulae",
    shortTag: "Cổ C1–C7 & Cơ Thang trên",
    d: "M 355 205 L 545 205 L 588 345 L 312 345 Z",
    pinX: 450,
    pinY: 278,
    labelX: 755,
    labelY: 255,
    align: "right",
  },
  {
    id: "post-shoulder-l",
    regionId: "shoulder",
    vnLabel: "Nhóm cơ Chóp xoay (Dưới gai, Tròn bé), Tròn lớn & Delta sau",
    latinLabel: "M. Infraspinatus, Teres minor/major & Deltoideus spinalis",
    shortTag: "Chóp xoay & Bả vai",
    d: "M 225 335 L 372 345 L 362 505 L 218 485 Z",
    pinX: 295,
    pinY: 412,
    labelX: 140,
    labelY: 395,
    align: "left",
  },
  {
    id: "post-shoulder-r",
    regionId: "shoulder",
    vnLabel: "Nhóm cơ Chóp xoay (Dưới gai, Tròn bé), Tròn lớn & Delta sau",
    latinLabel: "M. Infraspinatus, Teres minor/major & Deltoideus spinalis",
    shortTag: "Chóp xoay & Bả vai",
    d: "M 528 345 L 675 335 L 682 485 L 538 505 Z",
    pinX: 605,
    pinY: 412,
    labelX: 760,
    labelY: 395,
    align: "right",
  },
  {
    id: "post-thoracic",
    regionId: "thoracic_core",
    vnLabel: "Cột sống Ngực (T1–T12), Cơ Thang giữa/dưới, Cơ Trám & Xô trên",
    latinLabel: "M. Trapezius, Mm. Rhomboidei & M. Latissimus dorsi",
    shortTag: "Lưng trên & Cơ Xô",
    d: "M 365 348 L 535 348 L 568 558 L 332 558 Z",
    pinX: 450,
    pinY: 455,
    labelX: 140,
    labelY: 485,
    align: "left",
  },
  {
    id: "post-lumbar",
    regionId: "lumbar",
    vnLabel: "Cột sống Thắt lưng (L1–S1), Cân ngực – thắt lưng, Cơ Dựng sống & Đa chân",
    latinLabel: "Columna lumbalis, Fascia thoracolumbalis, Erector spinae & Multifidus",
    shortTag: "Thắt lưng L1–S1",
    d: "M 328 562 L 572 562 L 582 738 L 318 738 Z",
    pinX: 450,
    pinY: 648,
    labelX: 760,
    labelY: 648,
    align: "right",
  },
  {
    id: "post-glute",
    regionId: "hip_pelvis",
    vnLabel: "Cơ Mông lớn, Cơ Mông nhỡ & Nhóm cơ Xoay ngoài sâu (Cơ Hình lê)",
    latinLabel: "M. Gluteus maximus, Gluteus medius & M. Piriformis",
    shortTag: "Cơ Mông & Khung chậu",
    d: "M 305 742 L 595 742 L 592 918 L 308 918 Z",
    pinX: 515,
    pinY: 828,
    labelX: 760,
    labelY: 828,
    align: "right",
  },
  {
    id: "post-hamstring-l",
    regionId: "thigh_hamstring",
    vnLabel: "Nhóm cơ Gân kheo (Nhị đầu đùi, Bán gân & Bán màng)",
    latinLabel: "M. Biceps femoris, Semitendinosus & Semimembranosus",
    shortTag: "Gân kheo (Hamstrings)",
    d: "M 312 922 L 438 922 L 432 1105 L 332 1105 Z",
    pinX: 378,
    pinY: 1012,
    labelX: 140,
    labelY: 1012,
    align: "left",
  },
  {
    id: "post-hamstring-r",
    regionId: "thigh_hamstring",
    vnLabel: "Nhóm cơ Gân kheo (Nhị đầu đùi, Bán gân & Bán màng)",
    latinLabel: "M. Biceps femoris, Semitendinosus & Semimembranosus",
    shortTag: "Gân kheo (Hamstrings)",
    d: "M 462 922 L 588 922 L 568 1105 L 468 1105 Z",
    pinX: 522,
    pinY: 1012,
    labelX: 760,
    labelY: 1012,
    align: "right",
  },
  {
    id: "post-knee-l",
    regionId: "knee",
    vnLabel: "Hố khoeo chân (Popliteal fossa), Bao khớp sau & Dây chằng chéo sau",
    latinLabel: "Fossa poplitea & Lig. cruciatum posterius (PCL)",
    shortTag: "Hố khoeo & PCL",
    d: "M 332 1108 L 432 1108 L 436 1198 L 330 1198 Z",
    pinX: 382,
    pinY: 1152,
    labelX: 140,
    labelY: 1152,
    align: "left",
  },
  {
    id: "post-knee-r",
    regionId: "knee",
    vnLabel: "Hố khoeo chân (Popliteal fossa), Bao khớp sau & Dây chằng chéo sau",
    latinLabel: "Fossa poplitea & Lig. cruciatum posterius (PCL)",
    shortTag: "Hố khoeo & PCL",
    d: "M 468 1108 L 568 1108 L 570 1198 L 464 1198 Z",
    pinX: 518,
    pinY: 1152,
    labelX: 760,
    labelY: 1152,
    align: "right",
  },
  {
    id: "post-calf-l",
    regionId: "ankle_foot",
    vnLabel: "Cơ Bụng chân (Gastrocnemius), Cơ Dép (Soleus) & Gân gót Achilles",
    latinLabel: "M. Triceps surae (Gastrocnemius, Soleus) & Tendo calcaneus",
    shortTag: "Bắp chân & Gân Achilles",
    d: "M 326 1202 L 438 1202 L 432 1575 L 360 1575 Z",
    pinX: 386,
    pinY: 1365,
    labelX: 140,
    labelY: 1365,
    align: "left",
  },
  {
    id: "post-calf-r",
    regionId: "ankle_foot",
    vnLabel: "Cơ Bụng chân (Gastrocnemius), Cơ Dép (Soleus) & Gân gót Achilles",
    latinLabel: "M. Triceps surae (Gastrocnemius, Soleus) & Tendo calcaneus",
    shortTag: "Bắp chân & Gân Achilles",
    d: "M 462 1202 L 574 1202 L 540 1575 L 468 1575 Z",
    pinX: 514,
    pinY: 1365,
    labelX: 760,
    labelY: 1365,
    align: "right",
  },
];

export function BodyMapExplorer({
  client,
  clients = [],
  onSelectClient,
  mode = "full",
  onAskRegion,
}: {
  client?: Client | null;
  clients?: Client[];
  onSelectClient?: (clientId: string) => void;
  mode?: "full" | "client";
  onAskRegion?: (prompt: string, region: AnatomyRegion) => void;
}) {
  const clientAlerts = matchClientIssuesToRegions(client);
  const firstAlertRegion =
    (Object.keys(clientAlerts)[0] as AnatomyRegionId | undefined) ?? "lumbar";

  const [selectedId, setSelectedId] = useState<AnatomyRegionId>(firstAlertRegion);
  const [hoveredZone, setHoveredZone] = useState<InteractiveZone | null>(null);
  const [groupFilter, setGroupFilter] = useState<"all" | AnatomyRegion["group"]>("all");
  const [bodySide, setBodySide] = useState<"both" | "anterior" | "posterior" | "openstax">("both");

  const activeRegion =
    ANATOMY_REGIONS.find((r) => r.id === selectedId) ?? ANATOMY_REGIONS[3];
  const activeAlert = clientAlerts[activeRegion.id];

  const filteredRegions = ANATOMY_REGIONS.filter(
    (r) => groupFilter === "all" || r.group === groupFilter,
  );

  function renderAnatomicalFigure(
    side: "anterior" | "posterior",
    zones: InteractiveZone[],
    title: string,
    imageSrc: string,
  ) {
    // Pick one representative zone per regionId for the pin badge so we don't duplicate left/right badges
    const seenRegions = new Set<AnatomyRegionId>();
    const badgeZones = zones.filter((z) => {
      if (seenRegions.has(z.regionId)) return false;
      seenRegions.add(z.regionId);
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
            className="max-h-[450px] w-full select-none"
            role="img"
            aria-label={title}
          >
            {/* High-Resolution Medical Anatomical Muscle Illustration */}
            <image
              href={imageSrc}
              x="0"
              y="0"
              width="900"
              height="1620"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Interactive Muscle Group Zones */}
            {zones.map((z) => {
              const isSelected = selectedId === z.regionId;
              const isHovered = hoveredZone?.id === z.id || hoveredZone?.regionId === z.regionId;
              const alert = clientAlerts[z.regionId];

              let fill = "rgba(14, 77, 164, 0.0)";
              let stroke = "rgba(14, 77, 164, 0.0)";
              let strokeWidth = 0;

              if (alert?.severity === "crimson") {
                fill = isSelected || isHovered ? "rgba(185, 28, 28, 0.42)" : "rgba(220, 38, 38, 0.26)";
                stroke = "#b91c1c";
                strokeWidth = isSelected ? 6 : 4;
              } else if (alert?.severity === "caution") {
                fill = isSelected || isHovered ? "rgba(180, 83, 9, 0.38)" : "rgba(245, 158, 11, 0.22)";
                stroke = "#d97706";
                strokeWidth = isSelected ? 6 : 4;
              } else if (isSelected) {
                fill = isHovered ? "rgba(14, 77, 164, 0.42)" : "rgba(14, 77, 164, 0.30)";
                stroke = "#0e4da4";
                strokeWidth = 6;
              } else if (isHovered) {
                fill = "rgba(37, 99, 235, 0.25)";
                stroke = "#2563eb";
                strokeWidth = 4;
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
                  onClick={() => setSelectedId(z.regionId)}
                />
              );
            })}

            {/* Anatomical Pin Markers & Callout Lines */}
            {badgeZones.map((z) => {
              const isSelected = selectedId === z.regionId;
              const isHovered = hoveredZone?.regionId === z.regionId;
              const alert = clientAlerts[z.regionId];
              const pinColor =
                alert?.severity === "crimson"
                  ? "#b91c1c"
                  : alert?.severity === "caution"
                    ? "#d97706"
                    : isSelected
                      ? "#0e4da4"
                      : isHovered
                        ? "#2563eb"
                        : "#334155";

              return (
                <g
                  key={`pin-${side}-${z.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredZone(z)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => setSelectedId(z.regionId)}
                >
                  {(isSelected || alert) && (
                    <circle
                      cx={z.pinX}
                      cy={z.pinY}
                      r={isSelected ? 34 : 26}
                      fill={pinColor}
                      fillOpacity="0.22"
                      stroke={pinColor}
                      strokeWidth="3"
                    />
                  )}
                  <circle
                    cx={z.pinX}
                    cy={z.pinY}
                    r={isSelected ? 17 : alert ? 14 : 11}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                  />
                  {alert && (
                    <text
                      x={z.pinX}
                      y={z.pinY + 6}
                      textAnchor="middle"
                      fontSize="18"
                      fontWeight="800"
                      fill="#ffffff"
                    >
                      !
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
      {mode === "full" && (
        <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "spine_core", "upper_limb", "lower_limb"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupFilter(g)}
                aria-pressed={groupFilter === g}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  groupFilter === g
                    ? "bg-cobalt text-white"
                    : "bg-surface text-slate hover:text-ink"
                }`}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {clients.length > 0 && onSelectClient && (
              <label className="flex min-w-0 flex-col gap-2 text-xs text-slate sm:flex-row sm:items-center">
                <span>Áp bệnh án học viên:</span>
                <select
                  aria-label="Áp bệnh án học viên lên bản đồ giải phẫu"
                  value={client?.id ?? ""}
                  onChange={(e) => {
                    onSelectClient(e.target.value);
                    const found = clients.find((c) => c.id === e.target.value);
                    const alerts = matchClientIssuesToRegions(found);
                    const first = Object.keys(alerts)[0] as AnatomyRegionId | undefined;
                    if (first) setSelectedId(first);
                  }}
                  className="min-h-10 w-full max-w-full px-2.5 py-1 text-xs font-medium text-ink sm:w-auto"
                >
                  <option value="">Chế độ Học chuẩn (Không gắn học viên)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.orthopedic_issues?.length ?? 0} điểm đau)
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="inline-flex flex-wrap rounded-md border border-rule bg-canvas p-0.5 text-xs">
              {(
                [
                  { id: "both", label: "2 Mặt" },
                  { id: "anterior", label: "Mặt Trước" },
                  { id: "posterior", label: "Mặt Sau" },
                  { id: "openstax", label: "Bóc tách Cơ Nông/Sâu" },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setBodySide(v.id)}
                  aria-pressed={bodySide === v.id}
                  className={`rounded px-2.5 py-1 font-medium ${
                    bodySide === v.id ? "bg-sheet text-ink shadow-2xs" : "text-slate"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        {/* Left column: Authentic Anatomical Muscular System Explorer */}
        <div className="min-w-0 rounded-lg border border-rule bg-sheet p-3.5 shadow-xs lg:sticky lg:top-[5.5rem] lg:self-start lg:max-h-[calc(100dvh-6.25rem)] lg:overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h2 className="font-display text-sm font-bold text-ink">
                  Bản đồ cơ – gân – khớp
                </h2>
                <p className="text-[11px] text-slate">
                  Nhấn vào vùng trên hình để mở giải phẫu
                </p>
              </div>
              {client && (
                <span className="rounded bg-crimson-soft px-2 py-0.5 text-[11px] font-semibold text-crimson">
                  {Object.keys(clientAlerts).length} vùng lưu ý
                </span>
              )}
            </div>

            {mode === "client" && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase text-slate">
                  Chế độ xem hình:
                </span>
                <div className="inline-flex flex-wrap rounded-md border border-rule bg-canvas p-0.5 text-[11px]">
                  {(
                    [
                      { id: "both", label: "2 Mặt" },
                      { id: "anterior", label: "Mặt Trước" },
                      { id: "posterior", label: "Mặt Sau" },
                      { id: "openstax", label: "Cơ Nông/Sâu" },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setBodySide(v.id)}
                      aria-pressed={bodySide === v.id}
                      className={`rounded px-2 py-0.5 font-medium ${
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
            )}

            {/* Live Hovered / Selected Muscle Readout */}
            <div className="mt-3 flex min-h-[48px] flex-col justify-center rounded-md border border-rule bg-surface/80 px-3 py-2 text-xs">
              {hoveredZone ? (
                <>
                  <span className="font-display font-bold text-cobalt">
                    {hoveredZone.vnLabel}
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    {hoveredZone.latinLabel}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display font-bold text-ink">
                    Đang xem: {activeRegion.name}
                  </span>
                  <span className="font-mono text-[11px] text-cobalt">
                    {activeRegion.latinName}
                  </span>
                </>
              )}
            </div>

            {/* Real Medical Muscular System Illustration with Interactive Zones */}
            <div className="my-3 rounded-md border border-rule bg-canvas/60 p-3">
              {bodySide === "openstax" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate">
                    <span className="font-mono font-bold text-cobalt">
                      OPENSTAX FIG 11.5 — CƠ NÔNG (PHẢI) VS. CƠ SÂU (TRÁI)
                    </span>
                    <a
                      href="/anatomy/full-body-muscles-openstax.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-cobalt underline"
                    >
                      Mở ảnh gốc phân giải cao ↗
                    </a>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto rounded border border-rule bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/anatomy/full-body-muscles-openstax.jpg"
                      alt="OpenStax Figure 11.5 Anterior and Posterior Views of Muscles"
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`grid gap-2.5 ${
                    bodySide === "both" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {(bodySide === "both" || bodySide === "anterior") &&
                    renderAnatomicalFigure(
                      "anterior",
                      ANTERIOR_ZONES,
                      "MẶT TRƯỚC (ANTERIOR)",
                      "/anatomy/muscles-anterior.png",
                    )}

                  {(bodySide === "both" || bodySide === "posterior") &&
                    renderAnatomicalFigure(
                      "posterior",
                      POSTERIOR_ZONES,
                      "MẶT SAU (POSTERIOR)",
                      "/anatomy/muscles-posterior.png",
                    )}
                </div>
              )}

              {/* Color Legend */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 border-t border-rule pt-2 text-[11px] text-slate">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cobalt" />
                  Đang xem giải phẫu
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-crimson" />
                  Bệnh lý / Điểm đau
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Cần chỉnh biên độ
                </span>
              </div>
            </div>

            {/* Clickable Region List */}
            <div className="grid grid-cols-2 gap-1.5">
              {filteredRegions.map((r) => {
                const alert = clientAlerts[r.id];
                const isSelected = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex items-center justify-between rounded border px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "border-cobalt bg-cobalt-soft font-semibold text-cobalt"
                        : alert
                          ? "border-caution/40 bg-caution-soft/60 font-medium text-ink"
                          : "border-rule bg-canvas/60 text-slate hover:text-ink"
                    }`}
                  >
                    <span className="line-clamp-2">{r.name}</span>
                    {alert && (
                      <span className="ml-1.5 h-2 w-2 shrink-0 rounded-full bg-crimson" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Deep Anatomical & Biomechanical Card */}
        <div className="space-y-4 rounded-lg border border-rule bg-sheet p-5 shadow-xs">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-cobalt-soft px-2.5 py-0.5 font-mono text-xs font-semibold text-cobalt">
                  {activeRegion.latinName}
                </span>
                {activeAlert && (
                  <span className="rounded bg-crimson-soft px-2.5 py-0.5 text-xs font-semibold text-crimson">
                    Vùng tổn thương của {client?.name}
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
                {activeRegion.name}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {activeRegion.summary}
              </p>
            </div>

            {onAskRegion ? (
              <button
                type="button"
                onClick={() => onAskRegion(activeRegion.sampleAiPrompt, activeRegion)}
                className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
              >
                Hỏi AI chuyên sâu vùng này
              </button>
            ) : (
              <Link
                href={`/?prompt=${encodeURIComponent(activeRegion.sampleAiPrompt)}${
                  client?.id ? `&clientId=${encodeURIComponent(client.id)}` : ""
                }`}
                className="rounded-md bg-cobalt px-4 py-2 font-display text-xs font-semibold text-white hover:opacity-95"
              >
                Đưa vào Bàn Tư vấn AI
              </Link>
            )}
          </div>

          {/* Client Specific Injury Overlay if present */}
          {activeAlert && (
            <div className="rounded-md border border-crimson/30 bg-crimson-soft/50 p-3.5 text-xs">
              <p className="font-display font-bold text-crimson">
                Dữ liệu Bệnh án Thực tế của {client?.name} tại vùng này:
              </p>
              {activeAlert.matchedConditions.length > 0 && (
                <p className="mt-1 text-ink">
                  <span className="font-semibold">Chẩn đoán y khoa:</span>{" "}
                  {activeAlert.matchedConditions.join(" • ")}
                </p>
              )}
              {activeAlert.matchedIssues.map((iss, idx) => (
                <div key={`${iss.region}-${idx}`} className="mt-1.5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-crimson/20 bg-sheet p-2">
                    <span className="font-semibold text-crimson">Cử động gây đau (Pain Triggers):</span>
                    <p className="mt-0.5 text-ink">{iss.painTriggers || "Chưa ghi nhận"}</p>
                  </div>
                  <div className="rounded border border-cleared/30 bg-sheet p-2">
                    <span className="font-semibold text-cleared">Biên độ & Bài tập an toàn (Safe ROM):</span>
                    <p className="mt-0.5 text-ink">{iss.safeRom || "Chưa ghi nhận"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 1. Authentic Medical Textbook & Atlas Illustration */}
          <JointDiagramSvg key={activeRegion.id} regionId={activeRegion.id} />

          {/* Biomechanics Key Callout */}
          <div className="rounded-md border border-cobalt/25 bg-cobalt-soft/50 p-3.5 text-xs leading-6 text-ink">
            <span className="font-display font-bold text-cobalt">
              Nguyên lý Cơ sinh học Cốt lõi (Key Biomechanics):{" "}
            </span>
            {activeRegion.biomechanicsKey}
          </div>

          {/* 2. Anatomical Structures (Origin - Insertion - Action) */}
          <div className="space-y-2">
            <h3 className="font-display text-sm font-bold text-ink">
              1. Cấu trúc Giải phẫu: Nguyên ủy – Bám tận – Chức năng
            </h3>
            <div className="grid gap-2.5 md:grid-cols-3">
              {activeRegion.structures.map((st) => (
                <div
                  key={st.name}
                  className="rounded-md border border-rule bg-canvas/60 p-3 text-xs"
                >
                  <p className="font-display font-bold text-ink">{st.name}</p>
                  <p className="font-mono text-[11px] text-cobalt">{st.latin}</p>
                  <p className="mt-1.5 text-slate">
                    <strong className="text-ink">Đường đi:</strong> {st.originInsertion}
                  </p>
                  <p className="mt-1 text-slate">
                    <strong className="text-ink">Chức năng:</strong> {st.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Screening Tests & Red Flags */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-rule bg-canvas/50 p-3.5 text-xs">
              <h3 className="font-display font-bold text-ink">
                2. Nghiệm pháp Sàng lọc Vận động tại Phòng tập
              </h3>
              <ul className="mt-2 space-y-2">
                {activeRegion.screeningTests.map((t) => (
                  <li key={t.name}>
                    <p className="font-semibold text-cobalt">• {t.name}</p>
                    <p className="mt-0.5 text-slate">{t.purpose}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-crimson/30 bg-crimson-soft/40 p-3.5 text-xs">
              <h3 className="font-display font-bold text-crimson">
                3. Dấu hiệu Cờ Đỏ (Red Flags) — Dừng tập & Chuyển khám BS
              </h3>
              <ul className="mt-2 space-y-1.5 text-ink">
                {activeRegion.redFlags.map((rf) => (
                  <li key={rf} className="leading-5">
                    • {rf}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Exercise Modification Matrix (Avoid vs Rehab Alternative) */}
          <div className="space-y-2">
            <h3 className="font-display text-sm font-bold text-ink">
              4. Ma trận Chuyển đổi Bài tập (Contraindicated vs. Rehab Regression)
            </h3>
            <div className="grid gap-3">
              {activeRegion.protocols.map((p) => (
                <div
                  key={p.avoid}
                  className="grid gap-3 rounded-md border border-rule bg-canvas/40 p-3.5 text-xs md:grid-cols-2"
                >
                  <div className="rounded border border-crimson/25 bg-crimson-soft/40 p-2.5">
                    <span className="inline-block rounded bg-crimson px-1.5 py-0.5 text-[10px] font-bold text-white">
                      TRÁNH / THẬN TRỌNG CAO
                    </span>
                    <p className="mt-1.5 font-display font-bold text-ink">{p.avoid}</p>
                    <p className="mt-1 text-slate">{p.whyAvoid}</p>
                  </div>

                  <div className="rounded border border-cleared/30 bg-cleared-soft/40 p-2.5">
                    <span className="inline-block rounded bg-cleared px-1.5 py-0.5 text-[10px] font-bold text-white">
                      PHỤC HỒI & THAY THẾ AN TOÀN
                    </span>
                    <p className="mt-1.5 font-display font-bold text-ink">
                      {p.rehabAlternative}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-cleared">
                      {p.cuesAndTempo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
