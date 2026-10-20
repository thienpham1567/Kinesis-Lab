export type EvidenceSource = { title: string; url: string; checkedAt: string; access: string };
export type EvidenceRecord = {
  sources: EvidenceSource[];
  supportedClaims: string[];
  limitations: string[];
  reviewedBy: null;
  status: "literature-reviewed" | "limited" | "source-only";
};
