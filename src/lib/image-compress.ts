// Vercel Functions reject request bodies over 4.5 MB, so images are shrunk in the
// browser before upload. Files already under the limit are sent untouched so lab
// text keeps its original sharpness.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const START_EDGE = 3000;
const MIN_EDGE = 1200;
const QUALITIES = [0.9, 0.8, 0.7];

export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
}

export async function compressImageForUpload(
  file: File,
  maxBytes = MAX_UPLOAD_BYTES,
): Promise<File> {
  if (file.size <= maxBytes || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Trình duyệt không đọc được định dạng ảnh này; hãy xuất JPG/PNG rồi tải lại.",
    );
  }

  try {
    let edge = START_EDGE;
    for (;;) {
      const { width, height } = fitWithin(bitmap.width, bitmap.height, edge);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      // JPEG has no alpha; without this, transparent PNG screenshots turn black.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITIES) {
        const blob = await toJpegBlob(canvas, quality);
        if (blob && blob.size <= maxBytes) {
          const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          return new File([blob], name, { type: "image/jpeg" });
        }
      }
      if (edge <= MIN_EDGE) break;
      edge = Math.max(MIN_EDGE, Math.round(edge * 0.8));
    }
  } finally {
    bitmap.close();
  }
  throw new Error(
    "Ảnh quá lớn, không nén xuống dưới 4 MB được; hãy chụp lại gần hơn hoặc cắt bớt viền.",
  );
}
