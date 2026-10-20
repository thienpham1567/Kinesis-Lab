import type { AtlasArea, AtlasStructure } from "./atlas-3d";
import type { MuscleGroupId } from "./muscle-hypertrophy-atlas";

// Display preferences only; these do not encode motion or anatomical measurements.
export function preferredTrainingView(group: MuscleGroupId) {
  return [
    "glutes",
    "hamstrings",
    "calves",
    "lats_teres",
    "upper_back_traps",
  ].includes(group)
    ? ("back-oblique" as const)
    : ("front-oblique" as const);
}

export function sourceStructureLabel(structure: AtlasStructure) {
  const side =
    structure.side === "left"
      ? "trái"
      : structure.side === "right"
        ? "phải"
        : "không phân bên";
  return `${structure.label} · ${side} — ${structure.english}`;
}

export function visibleObservationSelection(
  structures: AtlasStructure[],
  state: {
    area: AtlasArea;
    selectedId: string | null;
    isolatedId: string | null;
    hiddenIds: ReadonlySet<string>;
    bones: boolean;
  },
) {
  return structures.find(
    (s) =>
      s.id === state.selectedId &&
      (state.area === "full" || s.areas.includes(state.area)) &&
      !state.hiddenIds.has(s.id) &&
      (s.layer !== "bone" || state.bones) &&
      s.layer !== "joint" &&
      (!state.isolatedId || s.id === state.isolatedId),
  );
}
