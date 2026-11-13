import type { EvidenceSource } from "@/lib/clinical/evidence-types";
import type { NcsfDomain } from "@/lib/ncsf-quiz";

export type CaseChoice = {
  id: string;
  label: string;
  feedback: string;
  criterionIds: string[];
  nextCheckpointId: string | null;
};

export type PtCase = {
  id: string;
  version: number;
  title: string;
  objective: string;
  domain: NcsfDomain;
  fictionalContext: string;
  entryCheckpointId: string;
  checkpoints: {
    id: string;
    prompt: string;
    criterionIds: string[];
    choices: CaseChoice[];
  }[];
  criteria: {
    id: string;
    description: string;
    sources: EvidenceSource[];
    basis: "sourced" | "authored-workflow";
  }[];
  reading?: { href: string; label: string };
  limitations: string[];
  reviewedBy: null;
};

export type CaseEvaluation = {
  addressedCriterionIds: string[];
  revisitCriterionIds: string[];
  unpracticedCriterionIds: string[];
  nextCheckpointId: string | null;
};

export type CaseSubmission = {
  id: string;
  source: "pt-case";
  submittedAt: string;
  caseId: string;
  caseVersion: number;
  choiceIds: string[];
  evaluation: CaseEvaluation;
};
