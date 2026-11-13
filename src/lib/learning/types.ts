import type { CaseSubmission } from "./case-types";

export type NcsfSource = "ncsf-quiz" | "ncsf-mock";

export type LearningItemResult = {
  itemId: string;
  selectedOptionId: string | null;
  correct: boolean;
  domain: string | null;
};

export type NcsfSubmission = {
  id: string;
  source: NcsfSource;
  submittedAt: string;
  items: LearningItemResult[];
};

export type LearningSubmission = NcsfSubmission | CaseSubmission;

export type LearningDraftItem = {
  itemId: string;
  optionOrder: string[];
  selectedOptionId: string | null;
};

export type LearningDraft = {
  id: string;
  source: NcsfSource;
  revision: number;
  updatedAt: string;
  items: LearningDraftItem[];
  currentItemId: string | null;
};

export type QuizQuestionLocation = {
  source: "ncsf-quiz";
  ch: number;
  questionIndex: number;
  page: number;
  lesson: number;
  domain: string | null;
};

export type MockQuestionLocation = {
  source: "ncsf-mock";
  examId: number;
  questionIndex: number;
  position: number;
  domain: string | null;
};

export type IdentifiedItemLocation = QuizQuestionLocation | MockQuestionLocation;

export type IdentifiedQuizQuestion = {
  itemId: string;
  source: "ncsf-quiz";
  ch: number;
  questionIndex: number;
  page: number;
  lesson: number;
  domain: string | null;
  optionIds: string[];
  correctOptionId: string;
};

export type IdentifiedMockQuestion = {
  itemId: string;
  source: "ncsf-mock";
  examId: number;
  questionIndex: number;
  position: number;
  domain: string | null;
  optionIds: string[];
  correctOptionId: string;
};

export type IdentifiedItemRecord = {
  itemId: string;
  source: NcsfSource;
  domain: string | null;
  optionIds: string[];
  correctOptionId: string;
  locations: IdentifiedItemLocation[];
};

export type ItemReviewSchedule = {
  itemId: string;
  source: NcsfSource;
  domain: string | null;
  attempts: number;
  firstCorrect: boolean;
  lastCorrect: boolean;
  streak: number;
  lastSubmittedAt: string;
  lastSubmissionId: string;
  nextReviewAt: string;
  due: boolean;
};

export type DomainLearningSummary = {
  domain: string;
  label: string;
  attempts: number;
  seenCount: number;
  firstTryCorrectCount: number;
  firstTryRate: number;
  latestCorrectCount: number;
  latestRate: number;
  dueCount: number;
};

export type LearningScheduleSummary = {
  nowIso: string;
  totalSubmissions: number;
  totalSeenItems: number;
  dueItems: ItemReviewSchedule[];
  itemsById: Record<string, ItemReviewSchedule>;
  domains: DomainLearningSummary[];
};
