export type ChatImageState =
  | "preparing"
  | "generating"
  | "succeeded"
  | "failed"
  | "unknown";

export type ChatImageSource = {
  id: string;
  title: string;
  url: string;
  checkedAt: string;
  access: string;
};

export type ChatIllustrationBrief = {
  title: string;
  subjectKind: "anatomy" | "movement" | "comparison";
  visualDescription: string;
  imageText: string[];
  explanation: string;
  sources: ChatImageSource[];
  limitations: string[];
};

export type ChatImageReceipt = {
  id: string;
  createdAt: string;
  model: string;
  provider: string;
  purpose: "chat-study";
  brief: ChatIllustrationBrief;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  byteLength: number;
  sha256: string;
  elapsedMs: number;
  costUsd: number | null;
  estimateUsd: number | null;
  priceCheckedAt: string;
  resolution: "1K" | "2K" | "auto";
  aspectRatio: "4:3" | "auto";
  parentId: string | null;
  label: "Hình minh họa AI";
  reviewedBy: null;
};

export type ChatImageAttachment = {
  imageId: string;
  sourceMessageId: string;
  state: ChatImageState;
};

export type StudyChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments: ChatImageAttachment[];
  sources: ChatImageSource[];
};

export type ChatImageErrorCode =
  | "invalid-brief"
  | "credit"
  | "rate-limited"
  | "provider-rejected"
  | "invalid-image"
  | "timeout"
  | "unknown"
  | "expired"
  | "storage-full"
  | "unauthorized"
  | "conflict"
  | "unavailable";
