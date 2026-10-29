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
  sourceNotice?: string;
};
