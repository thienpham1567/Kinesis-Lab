import type { AnatomyRegionId } from "./anatomy-atlas";

export type AtlasLayer = "bone" | "muscle" | "joint";
export type TissueKind = AtlasLayer | "cartilage" | "tendon" | "ligament" | "fat";
export const TISSUE_LABELS: Record<TissueKind, string> = {
  bone: "Xương", muscle: "Cơ", joint: "Mô khớp", cartilage: "Sụn",
  tendon: "Gân", ligament: "Dây chằng", fat: "Mỡ",
};
export type AtlasArea = "full" | "neck" | "upper" | "trunk" | "hip" | "lower";
export type AtlasStructure = {
  id: string;
  english: string;
  latin: string;
  label: string;
  side: "left" | "right" | null;
  layer: AtlasLayer;
  areas: AtlasArea[];
  group: string | null;
  clinicalRegion: string | null;
  surfaces?: { kind: TissueKind; faces: number; sourceMaterials: string[] }[];
  thickness?: {
    method: string;
    units: "m";
    vertices: number;
    validVertices: number;
    min: number;
    p50: number;
    p95: number;
    max: number;
  };
};
export type AtlasManifest = {
  source: { repository: string; commit: string; license: string };
  bundles: Record<
    AtlasArea,
    { url: string; bytes: number; structures: number }
  >;
  structures: AtlasStructure[];
};
export const ATLAS_AREAS: { id: AtlasArea; label: string }[] = [
  { id: "full", label: "Toàn hệ vận động" },
  { id: "neck", label: "Cổ & cột sống cổ" },
  { id: "upper", label: "Vai & chi trên" },
  { id: "trunk", label: "Thân mình & cột sống" },
  { id: "hip", label: "Hông & khung chậu" },
  { id: "lower", label: "Đùi, gối & cẳng chân" },
];
export const ATLAS_LAYERS: { id: AtlasLayer; label: string; color: string }[] =
  [
    { id: "bone", label: "Xương", color: "#d5c7ac" },
    { id: "muscle", label: "Cơ", color: "#b95c62" },
    { id: "joint", label: "Khớp & dây chằng", color: "#74a8a0" },
  ];
export function normalizeAnatomyText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
const ATLAS_REGION_IDS: readonly AnatomyRegionId[] = [
  "cervical",
  "shoulder",
  "thoracic_core",
  "lumbar",
  "hip_pelvis",
  "thigh_hamstring",
  "knee",
  "ankle_foot",
];
/**
 * Shoulder region by English mesh name: muscles that move or stabilise the
 * scapula/clavicle (trapezius included as a whole even though its upper fibres
 * also relate to the neck), the scapula, clavicle and sternoclavicular tissue,
 * and the glenohumeral soft tissue the exporter's name filter missed. The
 * exporter's trunk-height rule tags the trunk-lying ones "thoracic_core" (or
 * "lumbar" for latissimus dorsi), so this rule must run first. Keep in sync with
 * SHOULDER_GIRDLE_NAME in scripts/export_z_anatomy.py.
 */
export const SHOULDER_GIRDLE_NAME_PATTERN =
  /spinatus|subscapular|teres (major|minor)|serratus anterior|pectoralis|latissimus dorsi|scapul|clavic|rhomboid|trapezius|subclavius|glenoid labrum|coraco|transverse humeral/i;
/**
 * Laryngeal and pharyngeal structures (intrinsic laryngeal and pharyngeal
 * muscles, laryngeal cartilages, laryngeal/pharyngeal ligaments and membranes):
 * not part of the cervical spine region, so they carry no region note. Hyoid
 * muscles (sternohyoid, thyrohyoid, omohyoid, geniohyoid, mylohyoid, stylohyoid)
 * deliberately stay "cervical". Keep in sync with LARYNX_PHARYNX_NAME in
 * scripts/export_z_anatomy.py.
 */
export const LARYNX_PHARYNX_NAME_PATTERN =
  /(arytenoid|cricothyroid) muscle|pharyngeal constrictor|palatopharyngeus|stylopharyngeus|salpingopharyngeus|(thyroid|cricoid|arytenoid|corniculate|cuneiform|epiglottic) cartilage|cricopharyngeal ligament|(cricothyroid|thyrohyoid) ligament|quadrangular membrane/i;
/**
 * Clinical region used by the 3D explorer. The manifest value comes from a
 * geometric heuristic; name-based overrides take precedence over it.
 */
export function resolveClinicalRegion(
  structure: Pick<AtlasStructure, "english" | "clinicalRegion" | "areas">,
): AnatomyRegionId | null {
  if (SHOULDER_GIRDLE_NAME_PATTERN.test(structure.english)) return "shoulder";
  if (LARYNX_PHARYNX_NAME_PATTERN.test(structure.english)) return null;
  return ATLAS_REGION_IDS.find((id) => id === structure.clinicalRegion) ?? null;
}
export function searchStructures(
  structures: AtlasStructure[],
  query: string,
  area: AtlasArea,
) {
  const terms = normalizeAnatomyText(query).split(/\s+/).filter(Boolean);
  return structures.filter(
    (s) =>
      (area === "full" || s.areas.includes(area)) &&
      terms.every((term) =>
        normalizeAnatomyText(
          `${s.label} ${s.english} ${s.latin} ${s.side === "left" ? "trái left" : s.side === "right" ? "phải right" : ""}`,
        ).includes(term),
      ),
  );
}
export function isStructureVisible(
  structure: AtlasStructure,
  layers: Record<AtlasLayer, boolean>,
  hidden: ReadonlySet<string>,
  isolated: string | null,
) {
  return (
    layers[structure.layer] &&
    !hidden.has(structure.id) &&
    (!isolated || structure.id === isolated)
  );
}
