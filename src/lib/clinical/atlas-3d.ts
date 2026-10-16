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
