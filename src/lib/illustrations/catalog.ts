import { HANDBOOK, type HandbookTopic } from "@/lib/clinical/movement-handbook";
import { ANATOMY_CONTEXT_SOURCES, ANATOMY_IMAGE_PRESETS } from "./anatomy-presets";

export const ILLUSTRATION_MODEL = "bytedance-seed/seedream-5-0-flash";
export const ILLUSTRATION_PROVIDER = "seed";
export const ILLUSTRATION_MODEL_LABEL = "Seedream 5.0 Flash";
export function illustrationModelLabel(model: string) {
  if (model === ILLUSTRATION_MODEL) return ILLUSTRATION_MODEL_LABEL;
  if (model === "google/gemini-nano-banana-2.1") return "Nano Banana 2.1";
  if (model === "black-forest-labs/flux-3-image-klein") return "FLUX 3 Image Klein";
  return model;
}
export const ILLUSTRATION_LABEL = "Hình minh họa AI";
export const IMAGE_LIMIT =
  "Giải phẫu do AI mô phỏng; cần đối chiếu cấu trúc với nguồn. Không phải ảnh mô thật, dữ liệu đo hoặc hình đã được xác nhận chính xác từng chi tiết.";
export type MovementTopicId = HandbookTopic["id"];
export type Resolution = "1K" | "2K";
export type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9";
export const IMAGE_PRESETS = ANATOMY_IMAGE_PRESETS;
export type PresetId = (typeof IMAGE_PRESETS)[number]["id"];
export const IMAGE_TOPICS = HANDBOOK.map(({ id, tab }) => ({ id, label: tab }));
export function imageTopic(id: string) {
  return HANDBOOK.find((t) => t.id === id);
}
export function imagePreset(id: string) {
  return IMAGE_PRESETS.find((p) => p.id === id);
}

export type ImageSource = {
  title: string;
  url: string;
  checkedAt: string;
  access: string;
};
export function topicSources(id: string): ImageSource[] {
  return (imageTopic(id)?.sources ?? []).map(
    ({ title, url, checkedAt, access }) => ({ title, url, checkedAt, access }),
  );
}
export function anatomySources(presetId: string): ImageSource[] {
  return (imagePreset(presetId)?.sourceIds ?? []).map(
    (id) => ANATOMY_CONTEXT_SOURCES[id],
  );
}
export type ImageRequest = {
  requestId: string;
  topicId: MovementTopicId;
  presetId: PresetId;
  prompt: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  reference?: { dataUrl: string; name: string };
  parentId?: string;
};
export type ImageReceipt = {
  id: string;
  createdAt: string;
  model: string;
  provider: string;
  topicId: MovementTopicId;
  // Legacy saved FLUX receipts retain their original exercise preset IDs.
  presetId: string;
  purpose?: "anatomy";
  prompt: string;
  compiledPrompt: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  costUsd: number | null;
  estimateUsd: number;
  priceCheckedAt: string;
  elapsedMs: number;
  sha256: string;
  mediaType: string;
  byteLength: number;
  sources: ImageSource[];
  reference: { name: string; sha256: string } | null;
  parentId: string | null;
  label: typeof ILLUSTRATION_LABEL;
  limitation: string;
  reviewedBy: null;
};
export type GeneratedImage = { receipt: ImageReceipt; dataUrl: string };
export type LibraryImage = {
  receipt: ImageReceipt;
  blob: Blob;
  title: string;
  caption: string;
  attachedTopicId: MovementTopicId | null;
  savedAt: string;
  deletedAt: string | null;
};
export type ImageStatus = {
  enabled: boolean;
  model: string;
  prices: Record<Resolution, number>;
  priceCheckedAt: string;
  livePrice: boolean;
};

export function compileImagePrompt(input: ImageRequest) {
  const preset = imagePreset(input.presetId)!;
  return [
    "Create one original educational human anatomy illustration for Kinesis Lab. This is a simulated anatomical teaching model, not a cadaver photograph, patient scan or clinical measurement.",
    preset.brief,
    "Visual style: polished three-dimensional anatomical teaching illustration, clean non-bloody model with skin omitted in the requested region, muted red muscles, ivory tendons and warm off-white bones. Soft studio lighting and a plain light neutral background. Keep all requested structures inside frame with breathing room. Clarity of muscle-bone-tendon relationships matters more than dramatic texture. No exercise, sports equipment or fitness photography.",
    "Do not add lettering, labels, numbers, angle arcs, arrows, injury maps, activation heatmaps or diagnostic claims. The app adds captions outside the image. Do not claim verified fiber directions, measured tissue thickness or clinical validation. Do not copy a specific published atlas image.",
    input.reference
      ? "Use the supplied image as the structural reference. Preserve its viewing direction, bone geometry, muscle boundaries, visible attachments and anatomical relationships unless the requested edit specifies otherwise. Do not invent additional structures."
      : "Use an adult anatomical model. Preserve a coherent viewing direction, laterality and superficial/deep relationships; do not invent extra structures or present a deep layer as superficial.",
    `User visual instructions (not verified medical facts): ${input.prompt.trim() || "Follow the task description above."}`,
    "Textbook context is linked separately for source comparison. Those sources do not clinically validate the generated image. Do not add exercise instructions.",
  ].join("\n\n");
}
