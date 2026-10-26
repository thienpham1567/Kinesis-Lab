import type { GeneratedImage, LibraryImage, MovementTopicId } from "./catalog";

const EVENT = "kinesis-illustrations-changed";
const CHANNEL = "kinesis-illustrations";
let connection: Promise<IDBDatabase> | null = null;
export function openIllustrationDatabase() {
  return database();
}
function database() {
  if (!connection)
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(
          new Error(
            "Trình duyệt không hỗ trợ thư viện ảnh. Bạn vẫn có thể tải ảnh xuống.",
          ),
        );
        return;
      }
      const request = indexedDB.open("kinesis-illustrations", 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("images"))
          db.createObjectStore("images", { keyPath: "receipt.id" });
        if (!db.objectStoreNames.contains("chat-images"))
          db.createObjectStore("chat-images", { keyPath: "id" });
      };
      request.onerror = () => {
        connection = null;
        reject(new Error("Chưa mở được thư viện ảnh trên trình duyệt."));
      };
      request.onblocked = () => {
        connection = null;
        reject(new Error("Đóng tab Kinesis cũ rồi mở lại thư viện."));
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          connection = null;
        };
        resolve(db);
      };
    });
  return connection;
}
function announce() {
  window.dispatchEvent(new Event(EVENT));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage("changed");
    channel.close();
  }
}
export function subscribeLibrary(listener: () => void) {
  window.addEventListener(EVENT, listener);
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(CHANNEL)
      : null;
  if (channel) channel.onmessage = listener;
  return () => {
    window.removeEventListener(EVENT, listener);
    channel?.close();
  };
}
export async function listImages() {
  const db = await database();
  return new Promise<LibraryImage[]>((resolve, reject) => {
    const tx = db.transaction("images", "readonly");
    const request = tx.objectStore("images").getAll();
    tx.oncomplete = () =>
      resolve(
        (request.result as LibraryImage[]).sort((a, b) =>
          b.savedAt.localeCompare(a.savedAt),
        ),
      );
    tx.onerror = () => reject(new Error("Chưa đọc được thư viện ảnh."));
    tx.onabort = () => reject(new Error("Đọc thư viện bị gián đoạn."));
  });
}
async function putImage(image: LibraryImage) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").put(image);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(
        new Error(
          "Không lưu được ảnh; có thể bộ nhớ trình duyệt đã đầy. Hãy tải ảnh xuống.",
        ),
      );
    tx.onabort = () =>
      reject(new Error("Lưu ảnh bị gián đoạn; hãy thử lại hoặc tải xuống."));
  });
  announce();
}
export function dataUrlBlob(dataUrl: string) {
  const match =
    /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Ảnh không có định dạng hợp lệ.");
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}
export async function saveImage(
  result: GeneratedImage,
  title: string,
  caption: string,
) {
  const existing = await listImages();
  const previous = existing.find((a) => a.receipt.id === result.receipt.id);
  if (!previous && existing.filter((i) => !i.deletedAt).length >= 50)
    throw new Error(
      "Thư viện đã có 50 ảnh. Chuyển bớt ảnh vào thùng rác trước khi lưu thêm.",
    );
  const image: LibraryImage = {
    receipt: result.receipt,
    blob: dataUrlBlob(result.dataUrl),
    title: title.trim().slice(0, 120) || "Minh họa giải phẫu",
    caption: caption.trim().slice(0, 600),
    attachedTopicId: previous?.attachedTopicId ?? null,
    savedAt: previous?.savedAt ?? new Date().toISOString(),
    deletedAt: null,
  };
  await putImage(image);
  return image;
}
export async function updateImage(
  id: string,
  change: {
    attachedTopicId?: MovementTopicId | null;
    deletedAt?: string | null;
  },
) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("images", "readwrite"),
      store = tx.objectStore("images"),
      request = store.get(id);
    let missing = false;
    request.onsuccess = () => {
      if (!request.result) {
        missing = true;
        tx.abort();
        return;
      }
      store.put({ ...request.result, ...change });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Không cập nhật được ảnh."));
    tx.onabort = () =>
      reject(
        new Error(
          missing
            ? "Ảnh không còn trong thư viện."
            : "Cập nhật ảnh bị gián đoạn.",
        ),
      );
  });
  announce();
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export function exportImage(image: LibraryImage) {
  const extension =
    image.blob.type === "image/jpeg"
      ? "jpg"
      : image.blob.type === "image/webp"
        ? "webp"
        : "png";
  downloadBlob(
    image.blob,
    `kinesis-${image.receipt.presetId}-${image.receipt.id.slice(0, 8)}.${extension}`,
  );
}
export function exportReceipt(image: LibraryImage) {
  const { blob, ...provenance } = image;
  downloadBlob(
    new Blob(
      [
        JSON.stringify(
          {
            ...provenance,
            storedImageType: blob.type,
            storedImageBytes: blob.size,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
    `kinesis-${image.receipt.id.slice(0, 8)}-nguon.json`,
  );
}
export function fileDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Chưa đọc được ảnh tham chiếu."));
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Ảnh không hợp lệ."));
    reader.readAsDataURL(file);
  });
}
