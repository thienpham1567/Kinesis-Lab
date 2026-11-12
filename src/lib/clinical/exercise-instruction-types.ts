import type { EvidenceSource } from "@/lib/clinical/evidence-types";

/**
 * `sourced` lines carry a claim about structure, function or training effect and
 * must cite sources at that line. `coaching-example` lines are app-authored
 * teaching wording; they must not carry medical assertions.
 */
export type InstructionText =
  | { kind: "sourced"; text: string; sources: EvidenceSource[] }
  | { kind: "coaching-example"; text: string };

export type ExerciseInstructionMediaAsset = {
  src: string;
  poster: string;
  captions: string;
  credit: string;
  license: string;
  sourceUrl: string;
};

export type ExerciseInstruction = {
  exerciseId: string;
  version: number;
  /** Variant this card describes; not applied to other catalog variants. */
  variantNote: string;
  setup: InstructionText[];
  execution: InstructionText[];
  cues: InstructionText[];
  observations: InstructionText[];
  adjustments: {
    context: string;
    suggestion: InstructionText;
    alternativeExerciseId: string | null;
  }[];
  limitations: string[];
  reviewedBy: null;
  media: ExerciseInstructionMediaAsset | null;
};
