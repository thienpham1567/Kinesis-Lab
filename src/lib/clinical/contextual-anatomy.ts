import type { AnatomyRegionId } from "./anatomy-atlas";
import type { AtlasArea, AtlasManifest, AtlasStructure } from "./atlas-3d";
import type { PainSiteId, TriggerPointMuscleId } from "./trigger-point-atlas";
import { matchingGroupStructures, trainingGroupForStructure } from "./training-atlas";

export type AnatomyContext = {
  kind: "trigger" | "training" | "region";
  id: string;
};

// Exact source-catalog names connect existing teaching cards to source structures.
// Group membership is navigation metadata, not validated anatomy, activity or pain causality.
// Grouped trigger cards include all their named components, including pectoralis
// major subdivisions and tibialis anterior; no point or referral coordinates are inferred.
const TRIGGER_MEMBERS: Record<TriggerPointMuscleId, readonly string[]> = {
  upper_trapezius: ["Descending part of trapezius muscle"],
  levator_scapulae: ["Levator scapulae"],
  infraspinatus: ["Infraspinatus muscle", "Teres minor muscle"],
  pec_minor: [
    "Pectoralis minor muscle",
    "Abdominal part of pectoralis major muscle",
    "Clavicular head of pectoralis major muscle",
    "Sternocostal head of pectoralis major muscle",
  ],
  lats_serratus: ["Latissimus dorsi muscle", "Serratus anterior muscle"],
  quadratus_lumborum: ["Quadratus lumborum muscle"],
  iliopsoas: ["Psoas major", "Iliacus muscle"],
  glute_med_piriformis: ["Gluteus medius muscle", "Gluteus minimus muscle", "Piriformis muscle"],
  tfl_vastus_lateralis: ["Tensor fasciae latae", "Vastus lateralis muscle"],
  soleus_gastroc: [
    "Soleus muscle",
    "Lateral head of gastrocnemius",
    "Medial head of gastrocnemius",
    "Tibialis anterior muscle",
  ],
};

const REGION_IDS: readonly AnatomyRegionId[] = [
  "cervical", "shoulder", "thoracic_core", "lumbar", "hip_pelvis",
  "thigh_hamstring", "knee", "ankle_foot",
];

const PAIN_REGIONS: Record<PainSiteId, AnatomyRegionId> = {
  anterior_shoulder: "shoulder",
  neck_temple: "cervical",
  between_scapulae: "thoracic_core",
  low_back: "lumbar",
  glute_posterior_thigh: "hip_pelvis",
  lateral_knee: "knee",
  heel_foot: "ankle_foot",
  anterior_hip: "hip_pelvis",
};

function isRegion(id: string | null): id is AnatomyRegionId {
  return id !== null && REGION_IDS.includes(id as AnatomyRegionId);
}

export function contextStructures(
  structures: AtlasStructure[],
  context: AnatomyContext,
): AtlasStructure[] {
  switch (context.kind) {
    case "trigger": {
      if (!Object.hasOwn(TRIGGER_MEMBERS, context.id)) return [];
      const names = TRIGGER_MEMBERS[context.id as TriggerPointMuscleId];
      return structures.filter(s => s.layer === "muscle" && names.includes(s.english));
    }
    case "training":
      return matchingGroupStructures(structures, context.id);
    case "region":
      return isRegion(context.id)
        ? structures.filter(s => s.clinicalRegion === context.id)
        : [];
    default:
      return [];
  }
}

export function contextForStructure(
  structure: AtlasStructure,
  kind: AnatomyContext["kind"],
): string | null {
  switch (kind) {
    case "trigger":
      return structure.layer === "muscle"
        ? Object.entries(TRIGGER_MEMBERS).find(([, names]) => names.includes(structure.english))?.[0] ?? null
        : null;
    case "training":
      return trainingGroupForStructure(structure);
    case "region":
      return isRegion(structure.clinicalRegion) ? structure.clinicalRegion : null;
    default:
      return null;
  }
}

export function completeContextBundle(
  manifest: AtlasManifest,
  structures: AtlasStructure[],
): AtlasArea | null {
  if (structures.length === 0) return null;
  const catalog = new Map(manifest.structures.map(s => [s.id, s]));
  const candidates = Object.entries(manifest.bundles) as Array<
    [AtlasArea, AtlasManifest["bundles"][AtlasArea]]
  >;
  return candidates
    .filter(([area]) => structures.every(s => {
      const source = catalog.get(s.id);
      return source !== undefined && (area === "full" || source.areas.includes(area));
    }))
    .sort((a, b) => a[1].bytes - b[1].bytes)[0]?.[0] ?? null;
}

export function contextSideStructures(
  structures: AtlasStructure[],
  side: "both" | "left" | "right",
): AtlasStructure[] {
  return side === "both" ? structures : structures.filter(s => s.side === null || s.side === side);
}

// A symptom selection opens a neutral region. It does not identify a pain source.
export function triggerPainRegion(siteId: string): string | null {
  return Object.hasOwn(PAIN_REGIONS, siteId) ? PAIN_REGIONS[siteId as PainSiteId] : null;
}
