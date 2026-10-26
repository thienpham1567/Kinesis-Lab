import manifest from "../../public/anatomy/3d/manifest.json";
import {
  REGION_FOUNDATIONS,
  type AnatomyRegionId,
} from "./clinical/anatomy-atlas";
import { ANATOMY_REGION_EVIDENCE } from "./clinical/evidence-anatomy";
import { HYPERTROPHY_EXERCISES } from "./clinical/muscle-hypertrophy-atlas";
import type { AtlasArea } from "./clinical/atlas-3d";

export type LandingPreview = {
  id: AnatomyRegionId;
  label: string;
  title: string;
  fact: string;
  sources: { title: string; url: string; checkedAt: string; access: string }[];
  atlasHref: string;
  exerciseHref: string;
  exerciseName: string;
};

const regions: {
  id: AnatomyRegionId;
  label: string;
  title: string;
  area: AtlasArea;
  structure: string;
  exercise: string;
}[] = [
  {
    id: "shoulder",
    label: "Vai",
    title: "Khớp vai & xương bả vai",
    area: "upper",
    structure: "za-392caa1c00b1",
    exercise: "cable-lateral-raise",
  },
  {
    id: "hip_pelvis",
    label: "Hông",
    title: "Khớp háng & khung chậu",
    area: "hip",
    structure: "za-5904807f8c7d",
    exercise: "barbell-hip-thrust",
  },
  {
    id: "knee",
    label: "Gối",
    title: "Khớp gối & xương bánh chè",
    area: "lower",
    structure: "za-574a0a243828",
    exercise: "heel-elevated-hack-squat",
  },
  {
    id: "lumbar",
    label: "Thắt lưng",
    title: "Cột sống thắt lưng",
    area: "trunk",
    structure: "za-a268f2cafbd4",
    exercise: "cable-rope-crunch",
  },
  {
    id: "ankle_foot",
    label: "Cổ chân",
    title: "Cổ chân & bàn chân",
    area: "lower",
    structure: "za-80a3138971d3",
    exercise: "standing-seated-calf-raise",
  },
];

// Navigation follows the source catalog's classifications; it does not validate mesh anatomy.
export const LANDING_PREVIEWS: LandingPreview[] = regions.map((region) => {
  const structure = manifest.structures.find((s) => s.id === region.structure);
  const exercise = HYPERTROPHY_EXERCISES.find((e) => e.id === region.exercise);
  if (!structure || !exercise)
    throw new Error(`Landing destination unavailable: ${region.id}`);
  const foundation = REGION_FOUNDATIONS[region.id][0];
  const sources = foundation.sourceRefs.map((ref) => {
    const source = ANATOMY_REGION_EVIDENCE[region.id].sources[ref - 1];
    if (!source)
      throw new Error(`Landing source unavailable: ${region.id}/${ref}`);
    return source;
  });
  return {
    id: region.id,
    label: region.label,
    title: region.title,
    fact: foundation.text,
    sources,
    atlasHref: `/atlas?${new URLSearchParams({ area: region.area, structure: structure.id })}`,
    exerciseHref: `/atlas?${new URLSearchParams({ tab: "hypertrophy", exercise: exercise.id })}`,
    exerciseName: exercise.vietnameseName,
  };
});

export const LANDING_STRUCTURE_COUNT = manifest.structures.length;
