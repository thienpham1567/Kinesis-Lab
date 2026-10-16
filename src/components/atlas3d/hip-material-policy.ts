export type HipStudySample = "muscle" | "joint";
export const HIP_STUDY_SAMPLES = {
  muscle: {
    selectedId: "za-98cfd2e47395",
    ids: ["za-98cfd2e47395"],
  },
  joint: {
    selectedId: "za-84f58f8d4cfa",
    ids: ["za-5904807f8c7d", "za-b9d73c3c84a7", "za-84f58f8d4cfa"],
  },
} as const;
const ELIGIBLE = new Set([
  "za-98cfd2e47395",
  "za-cc11824f98a0", // Gluteus medius
  "za-5904807f8c7d",
  "za-43545666d494", // Hip bone
  "za-b9d73c3c84a7",
  "za-ebb15e1f4911", // Femur
  "za-84f58f8d4cfa",
  "za-7d133108dfa4", // Acetabular labrum
]);
export function isHipStudyStructure(id: string) {
  return ELIGIBLE.has(id);
}
