import type { AtlasStructure } from "./atlas-3d";
import { ATLAS_MUSCULAR_NAMES_VI } from "./atlas-muscular-names.vi";

export type AtlasNamedStructure = Pick<
  AtlasStructure,
  "english" | "label" | "layer"
> &
  Partial<Pick<AtlasStructure, "side" | "latin">>;

export function atlasVietnameseName(
  structure: AtlasNamedStructure,
): string | null {
  return (
    ATLAS_MUSCULAR_NAMES_VI[structure.english] ??
    (structure.label !== structure.english ? structure.label : null)
  );
}

/** Original catalog English remains available for provenance and exact lookup. */
export function atlasSourceName(structure: AtlasNamedStructure): string {
  const vietnamese = atlasVietnameseName(structure);
  return vietnamese
    ? `${vietnamese} · ${structure.english}`
    : structure.english;
}

/** Display grammar only: keep each head/part/belly and all hand/foot qualifiers. */
export function atlasShortEnglishName(structure: AtlasNamedStructure): string {
  const english =
    structure.layer === "muscle"
      ? structure.english.replace(/ muscle$/, "")
      : structure.english;
  const subdivision = english.match(
    /^(.+? (?:heads?|parts?|bell(?:y|ies))) of (.+)$/,
  );
  if (!subdivision) return english;
  const [, detail, parent] = subdivision;
  return `${parent[0].toUpperCase()}${parent.slice(1)} · ${detail[0].toLowerCase()}${detail.slice(1)}`;
}

export function atlasDisplayNames(structure: AtlasNamedStructure) {
  return {
    vietnamese: atlasVietnameseName(structure),
    english: atlasShortEnglishName(structure),
  };
}

/** Concise pair for native options and other plain-text labels. */
export function atlasStructureName(structure: AtlasNamedStructure): string {
  const { vietnamese, english } = atlasDisplayNames(structure);
  return vietnamese ? `${vietnamese} · ${english}` : english;
}
