export type MedicalCondition = {
  name: string;
  notes?: string;
  since?: string;
};

export type Medication = {
  name: string;
  dose?: string;
  notes?: string;
};

export type OrthopedicIssue = {
  region: string;
  painTriggers?: string;
  safeRom?: string;
  notes?: string;
};

export type RedFlags = {
  parq?: Record<string, boolean | null>;
  notes?: string;
};

export type Client = {
  id: string;
  name: string;
  age: number | null;
  sex: string | null;
  goals: string | null;
  training_level: string | null;
  medical_conditions: MedicalCondition[];
  medications: Medication[];
  orthopedic_issues: OrthopedicIssue[];
  red_flags: RedFlags;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BiomarkerRecord = {
  id: string;
  client_id: string;
  recorded_at: string;
  kind: "blood_lab" | "inbody" | "rom";
  metrics: Record<string, unknown>;
  ai_summary: string | null;
  created_at: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  source_type: string;
  filename: string | null;
  page_count: number | null;
  created_at: string;
};

export type RagHit = {
  id: string;
  document_id: string;
  title: string;
  chapter: string | null;
  page: number | null;
  content: string;
  score: number;
  url?: string;
  doi?: string;
  year?: string;
  license?: string;
  licenseUrl?: string;
  authors?: string[];
  checkedAt?: string;
  access?: string;
  sourceKind?: string;
};

export type RetrievalState = {
  status: "ready" | "empty" | "no_matches" | "indexing" | "unavailable" | "incompatible" | "error" | "skipped";
  message: string;
  model?: string;
  dimensions?: number;
  documents?: number;
};

export type ChatSourceStatus = {
  rag: RetrievalState;
  pubmed: { status: string; message: string };
};

export type PubMedPaper = {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  url: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LabMetric = {
  name: string;
  value: number | string;
  unit?: string;
  flag?: "low" | "high" | "normal" | "unknown";
};
