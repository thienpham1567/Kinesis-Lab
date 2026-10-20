import type { EvidenceSource } from "@/lib/clinical/evidence-types";

export type CurlStructure = {
  id: string;
  label: string;
  english: string;
  side: "left";
  layer: "muscle" | "bone";
  role: "elbow-flexor" | "context";
  sourceName: string;
  vertices: number;
};
export type CurlInfo = {
  id: string;
  status: "experimental-simulation";
  reviewedBy: null;
  sourceRepository: string;
  sourceCommit: string;
  license: string;
  assetSha256: string;
  motion: {
    variant: string;
    durationSeconds: number;
    authoredAngleRangeDegrees: number[];
    meaning: string;
  };
  rig: {
    landmarkProvenance: string;
    weighting: string;
    sourceRefs: Record<string, unknown>;
  };
  structures: CurlStructure[];
  sources: EvidenceSource[];
  supportedClaims: string[];
  limitations: string[];
};
export type CurlPlayback = { phase: number; playing: boolean };
export type CurlView = "oblique" | "front" | "side";
