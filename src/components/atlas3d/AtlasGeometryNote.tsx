import {
  isSchematicGeometryPilot,
  SCHEMATIC_GEOMETRY_NOTE,
} from "@/lib/clinical/atlas-geometry-pilots.mjs";

export function AtlasGeometryNote({ structureId }: { structureId: string }) {
  if (!isSchematicGeometryPilot(structureId)) return null;
  return (
    <p className="border-l-2 border-rule pl-3 text-xs leading-5 text-slate">
      {SCHEMATIC_GEOMETRY_NOTE}
    </p>
  );
}
