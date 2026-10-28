import { atlasVietnameseName, atlasShortEnglishName } from "./atlas-names";

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
  sourceMetadata?: {
    english: string;
    latin: string;
    side: "left" | "right" | null;
    clinicalRegion: string | null;
  };
  correctionIds?: string[];
  anatomicalTissueLabel?: string;
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
    { id: "bone", label: "Hệ xương", color: "#d5c7ac" },
    { id: "muscle", label: "Hệ cơ–gân", color: "#b95c62" },
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
          `${atlasVietnameseName(s) ?? ""} ${atlasShortEnglishName(s)} ${s.label} ${s.english} ${s.latin} ${s.sourceMetadata?.latin ?? ""} ${s.side === "left" ? "trái left" : s.side === "right" ? "phải right" : ""}`,
        ).includes(term),
      ),
  );
}

export type AtlasSearchResult = {
  kind: "idle" | "missing" | "ambiguous" | "match";
  results: AtlasStructure[];
  targets: AtlasStructure[];
  area: AtlasArea;
};

/** Search source names globally; never substitute an entire training group. */
export function resolveAtlasSearch(
  structures: AtlasStructure[],
  query: string,
  area: AtlasArea,
): AtlasSearchResult {
  if (!query.trim())
    return { kind: "idle", results: searchStructures(structures, "", area), targets: [], area };
  const found = searchStructures(structures, query, "full");
  const normalizedQuery = normalizeAnatomyText(query).replace(/\s+/g, " ");
  // A complete catalog name wins over incidental matches such as Brachialis
  // inside Coracobrachialis, or Vietnamese syllables appearing in other words.
  const exact = found.filter((structure) => {
    const names = [atlasVietnameseName(structure), atlasShortEnglishName(structure), structure.english, structure.latin, structure.label]
      .filter((name): name is string => !!name)
      .flatMap((name) => [name, name.split(" · ")[0]])
      .map((name) => normalizeAnatomyText(name).replace(/\s+/g, " "));
    const sides = structure.side === "left" ? ["trai", "left"] : structure.side === "right" ? ["phai", "right"] : [];
    return names.some((name) => name === normalizedQuery || sides.some((side) =>
      `${name} ${side}` === normalizedQuery || `${side} ${name}` === normalizedQuery,
    ));
  });
  const results = exact.length ? exact : found;
  if (!results.length) return { kind: "missing", results, targets: [], area };
  // Named heads/parts in the source catalog can share a parent name. This is
  // display-name grammar, not an inferred anatomical or functional grouping.
  const families = new Set(results.map((structure) =>
    `${structure.layer}:${normalizeAnatomyText(atlasShortEnglishName(structure).split(" · ")[0])}`,
  ));
  if (families.size !== 1 || normalizeAnatomyText(query).length < 2)
    return { kind: "ambiguous", results, targets: [], area };
  return { kind: "match", results, targets: results, area: "full" };
}

/** Colour only search targets; retain the body and show deep targets as an overlay. */
export function atlasSearchAppearance(
  structure: Pick<AtlasStructure, "id" | "layer">,
  selectedId: string | null,
  searchTargetIds: ReadonlySet<string> | undefined,
  muscleOpacity: number,
) {
  if (searchTargetIds?.size) {
    const highlighted = searchTargetIds.has(structure.id);
    return { highlighted, opacity: highlighted ? 1 : structure.layer === "muscle" ? muscleOpacity : 1, overlay: highlighted };
  }
  return {
    highlighted: structure.id === selectedId,
    opacity: structure.layer === "muscle" ? muscleOpacity : 1,
    overlay: false,
  };
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
