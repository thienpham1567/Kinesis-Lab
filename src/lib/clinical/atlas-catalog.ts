import corrections from "./atlas-corrections.json";
import { applyAtlasCorrections, type AtlasCorrection } from "./atlas-catalog-corrections.mjs";
import type { AtlasManifest } from "./atlas-3d";

export type { AtlasCorrection } from "./atlas-catalog-corrections.mjs";
// JSON cannot preserve the literal null/side union in inferred object types.
const records = corrections as AtlasCorrection[];

/** Resolve once, immediately after loading the unmodified source manifest. */
export function resolveAtlasManifest(raw: AtlasManifest): AtlasManifest {
  return applyAtlasCorrections(raw, records);
}

/** Per-claim sources and guards for a structure; unknown IDs inherit nothing. */
export function getAtlasCorrections(structureId: string): readonly AtlasCorrection[] {
  return records.filter((record) => record.structureIds.includes(structureId));
}
