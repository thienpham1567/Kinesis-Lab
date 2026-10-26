import { hasSupabase, supabase } from "@/lib/supabase/server";

export const CHAT_IMAGE_BUCKET = "chat-illustrations";

const localBlobs = new Map<string, { bytes: Buffer; mediaType: string }>();

function remoteStorage() {
  return hasSupabase() && process.env.NODE_ENV === "production";
}

function dataUrl(item: { bytes: Buffer; mediaType: string }) {
  return `data:${item.mediaType};base64,${item.bytes.toString("base64")}`;
}

export async function uploadChatIllustration(input: {
  ownerHash: string;
  id: string;
  bytes: Buffer;
  mediaType: string;
}) {
  const ext = input.mediaType === "image/jpeg" ? "jpg" : input.mediaType === "image/webp" ? "webp" : "png";
  if (!remoteStorage()) {
    const storagePath = `local/${input.ownerHash.slice(0, 16)}/${input.id}.${ext}`;
    const item = { bytes: input.bytes, mediaType: input.mediaType };
    localBlobs.set(storagePath, item);
    return { storagePath, assetUrl: dataUrl(item) };
  }
  const storagePath = `${input.ownerHash.slice(0, 16)}/${input.id}.${ext}`;
  const { error } = await supabase()
    .storage.from(CHAT_IMAGE_BUCKET)
    .upload(storagePath, input.bytes, { contentType: input.mediaType, upsert: false });
  if (error) throw error;
  const assetUrl = await signedChatIllustrationUrl(storagePath);
  return { storagePath, assetUrl };
}

export async function signedChatIllustrationUrl(storagePath: string) {
  if (storagePath.startsWith("local/")) {
    const item = localBlobs.get(storagePath);
    if (!item) throw new Error("Chưa cấp được đường dẫn ảnh.");
    return dataUrl(item);
  }
  const { data, error } = await supabase()
    .storage.from(CHAT_IMAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) throw error ?? new Error("Chưa cấp được đường dẫn ảnh.");
  return data.signedUrl;
}

export async function deleteChatIllustration(storagePath: string) {
  if (storagePath.startsWith("local/")) {
    localBlobs.delete(storagePath);
    return;
  }
  const { error } = await supabase().storage.from(CHAT_IMAGE_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function downloadChatIllustration(storagePath: string) {
  if (storagePath.startsWith("local/")) {
    const item = localBlobs.get(storagePath);
    if (!item) throw new Error("Không đọc được ảnh gốc.");
    return item.bytes;
  }
  const { data, error } = await supabase().storage.from(CHAT_IMAGE_BUCKET).download(storagePath);
  if (error || !data) throw error ?? new Error("Không đọc được ảnh gốc.");
  return Buffer.from(await data.arrayBuffer());
}
