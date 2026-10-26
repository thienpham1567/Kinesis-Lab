import { openIllustrationDatabase } from "@/lib/illustrations/library";
import type { ChatIllustrationBrief, ChatImageReceipt } from "./illustration-types";

export const CHAT_IMAGE_LIMIT = 50;
const STORE = "chat-images";

export type ChatImageRecord = {
  id: string;
  blob: Blob;
  brief: ChatIllustrationBrief;
  receipt: ChatImageReceipt;
  savedAt: string;
};

export type ChatImageDb = {
  list(): Promise<ChatImageRecord[]>;
  get(id: string): Promise<ChatImageRecord | null>;
  put(record: ChatImageRecord): Promise<void>;
  disabled?: boolean;
};

export function memoryChatImageDb(limit = CHAT_IMAGE_LIMIT): ChatImageDb {
  const rows = new Map<string, ChatImageRecord>();
  return {
    async list() {
      return [...rows.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async put(record) {
      const existing = rows.get(record.id);
      if (!existing && rows.size >= limit)
        throw new Error("Thư viện ảnh chat đã đầy.");
      rows.set(record.id, record);
    },
  };
}

export function disabledChatImageDb(): ChatImageDb {
  return {
    disabled: true,
    async list() {
      throw new Error("Trình duyệt không hỗ trợ lưu ảnh chat.");
    },
    async get() {
      throw new Error("Trình duyệt không hỗ trợ lưu ảnh chat.");
    },
    async put() {
      throw new Error("Trình duyệt không hỗ trợ lưu ảnh chat.");
    },
  };
}

function idb(): ChatImageDb {
  return {
    async list() {
      const db = await openIllustrationDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const request = tx.objectStore(STORE).getAll();
        tx.oncomplete = () =>
          resolve(
            (request.result as ChatImageRecord[]).sort((a, b) =>
              b.savedAt.localeCompare(a.savedAt),
            ),
          );
        tx.onerror = () => reject(new Error("Chưa đọc được ảnh chat đã lưu."));
      });
    },
    async get(id) {
      const db = await openIllustrationDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const request = tx.objectStore(STORE).get(id);
        tx.oncomplete = () => resolve((request.result as ChatImageRecord | undefined) ?? null);
        tx.onerror = () => reject(new Error("Chưa đọc được ảnh chat đã lưu."));
      });
    },
    async put(record) {
      const db = await openIllustrationDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () =>
          reject(new Error("Không lưu được ảnh; có thể bộ nhớ trình duyệt đã đầy. Hãy tải ảnh xuống."));
        tx.onabort = () =>
          reject(new Error("Lưu ảnh bị gián đoạn; hãy thử lại hoặc tải xuống."));
      });
    },
  };
}

let active: ChatImageDb | null = null;
export function useChatImageDbForTests(db: ChatImageDb | null) {
  active = db;
}
export function chatImageDb(): ChatImageDb {
  if (active) return active;
  if (typeof indexedDB === "undefined") return disabledChatImageDb();
  return idb();
}

export async function saveChatImage(
  record: ChatImageRecord,
  db = chatImageDb(),
): Promise<{ saved: boolean; notice?: string }> {
  if (db.disabled)
    return {
      saved: false,
      notice: "Ảnh vẫn xem và tải được. Trình duyệt chưa lưu được vào thư viện.",
    };
  try {
    const listed = await db.list();
    if (!listed.some((item) => item.id === record.id) && listed.length >= CHAT_IMAGE_LIMIT)
      return {
        saved: false,
        notice: "Đã có 50 ảnh chat trên máy. Ảnh hiện tại vẫn xem và tải được, chưa lưu thêm.",
      };
    await db.put(record);
    return { saved: true };
  } catch {
    return {
      saved: false,
      notice: "Không lưu được ảnh trên máy. Ảnh hiện tại vẫn xem và tải được.",
    };
  }
}

export async function loadChatImage(id: string, db = chatImageDb()) {
  try {
    return await db.get(id);
  } catch {
    return null;
  }
}

const urls = new Map<string, string>();
export function chatImageObjectUrl(id: string, blob: Blob) {
  const previous = urls.get(id);
  if (previous) URL.revokeObjectURL(previous);
  const url = URL.createObjectURL(blob);
  urls.set(id, url);
  return url;
}

export function revokeChatImageUrl(id: string) {
  const url = urls.get(id);
  if (url) URL.revokeObjectURL(url);
  urls.delete(id);
}

export function revokeAllChatImageUrls() {
  for (const id of [...urls.keys()]) revokeChatImageUrl(id);
}
