import type { AtlasStructure } from "./atlas-3d";
import { ATLAS_MUSCULAR_NAMES_VI } from "./atlas-muscular-names.vi";

export function atlasVietnameseName(structure: AtlasStructure): string | null {
  return (
    ATLAS_MUSCULAR_NAMES_VI[structure.english] ??
    (structure.label !== structure.english ? structure.label : null)
  );
}

/** English stays verbatim, including source distinctions between heads and parts. */
export function atlasStructureName(structure: AtlasStructure): string {
  const vietnamese = atlasVietnameseName(structure);
  return vietnamese
    ? `${vietnamese} · ${structure.english}`
    : structure.english;
}
