export type StudyContext = {
  structureId: string;
  name: string;
  english: string;
  side: "left" | "right" | null;
  area: string;
  groupId: string | null;
};

export type StudyAction = { label: string; href: string };
export type StudySource = {
  id: string;
  title: string;
  url: string;
  checkedAt: string;
  access: string;
};
export type StudyAnswerMeta = {
  sources: StudySource[];
  actions: StudyAction[];
  context: StudyContext | null;
  /** Retrieval problems for the reader; shown only when the answer cites nothing. */
  sourceNotice?: string;
  /** Citation-audit warning; always shown. */
  warning?: string;
};
