import { createHash } from "node:crypto";
import {
  ILLUSTRATION_MODEL,
  ILLUSTRATION_PROVIDER,
  type AspectRatio,
  type Resolution,
} from "./catalog";

const MAX_IMAGE = 12 * 1024 * 1024;

export class ImageInputError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function imageMime(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    Buffer.from(bytes.subarray(0, 8)).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return "image/webp";
  throw new ImageInputError("Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP hợp lệ.");
}

export function decodeImageBase64(value: string, max: number) {
  if (
    !value ||
    value.length > Math.ceil(max / 3) * 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(value) ||
    value.length % 4 === 1
  )
    throw new ImageInputError("Dữ liệu ảnh không hợp lệ hoặc quá lớn.");
  const bytes = Buffer.from(value, "base64");
  if (!bytes.length || bytes.length > max)
    throw new ImageInputError("Ảnh vượt giới hạn dung lượng.", 413);
  return bytes;
}

export function hashBytes(bytes: string | Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

export type RasterImageRequest = {
  prompt: string;
  resolution: Resolution | "auto";
  aspectRatio: AspectRatio | "auto";
  quality?: "auto";
  timeoutMs: number;
  referenceDataUrl?: string;
  onAccepted?: () => void;
};

export type RasterImageResult = {
  rawBase64: string;
  bytes: Buffer;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  sha256: string;
  costUsd: number | null;
};

export async function requestRasterImage(
  input: RasterImageRequest,
  target = { model: ILLUSTRATION_MODEL, provider: ILLUSTRATION_PROVIDER },
): Promise<RasterImageResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key)
    throw new ImageInputError(
      "Chưa cấu hình OPENROUTER_API_KEY trên máy chủ.",
      503,
    );
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Kinesis Lab Illustrations",
      },
      signal: AbortSignal.timeout(input.timeoutMs),
      body: JSON.stringify({
        model: target.model,
        prompt: input.prompt,
        n: 1,
        ...(input.resolution !== "auto" ? { resolution: input.resolution } : {}),
        aspect_ratio: input.aspectRatio,
        ...(input.quality ? { quality: input.quality } : {}),
        provider: { only: [target.provider], allow_fallbacks: false },
        ...(input.referenceDataUrl
          ? {
              input_references: [
                {
                  type: "image_url",
                  image_url: { url: input.referenceDataUrl },
                },
              ],
            }
          : {}),
      }),
    });
  } catch {
    throw new ImageInputError(
      "Kết nối tạo ảnh bị gián đoạn hoặc quá thời gian. Kiểm tra lịch sử OpenRouter trước khi tạo lại.",
      502,
    );
  }
  if (!res.ok) {
    if (res.status === 402)
      throw new ImageInputError(
        "OpenRouter chưa đủ credits để tạo ảnh. Nạp credits rồi thử lại.",
        402,
      );
    if (res.status === 401 || res.status === 403)
      throw new ImageInputError(
        "OpenRouter từ chối quyền tạo ảnh. Kiểm tra khóa và quyền truy cập model.",
        503,
      );
    if (res.status === 429)
      throw new ImageInputError(
        "Nhà cung cấp đang giới hạn lượt tạo. Hãy thử lại sau.",
        429,
      );
    throw new ImageInputError(
      `Chưa tạo được ảnh (OpenRouter ${res.status}). Không tự động gửi lại yêu cầu.`,
      502,
    );
  }
  input.onAccepted?.();
  if (Number(res.headers.get("content-length")) > MAX_IMAGE * 1.5)
    throw new ImageInputError(
      "Ảnh trả về vượt giới hạn xử lý; kiểm tra lịch sử OpenRouter trước khi tạo lại.",
      502,
    );
  const responseReader = res.body?.getReader();
  if (!responseReader) throw new ImageInputError("API trả nội dung rỗng.", 502);
  const responseChunks: Uint8Array[] = [];
  let responseLength = 0;
  try {
    for (;;) {
      const { done, value } = await responseReader.read();
      if (done) break;
      responseLength += value.length;
      if (responseLength > MAX_IMAGE * 1.5) {
        await responseReader.cancel();
        throw new ImageInputError(
          "Ảnh trả về vượt giới hạn xử lý; kiểm tra lịch sử OpenRouter trước khi tạo lại.",
          502,
        );
      }
      responseChunks.push(value);
    }
  } finally {
    responseReader.releaseLock();
  }
  let data: { data?: { b64_json?: string }[]; usage?: { cost?: number } };
  try {
    data = JSON.parse(Buffer.concat(responseChunks).toString("utf8"));
  } catch {
    throw new ImageInputError(
      "API không trả ảnh hoàn chỉnh. Kiểm tra lịch sử OpenRouter trước khi thử lại.",
      502,
    );
  }
  const raw = data.data?.[0]?.b64_json;
  if (typeof raw !== "string")
    throw new ImageInputError(
      "API không trả ảnh hoàn chỉnh. Kiểm tra lịch sử OpenRouter trước khi thử lại.",
      502,
    );
  const bytes = decodeImageBase64(raw, MAX_IMAGE);
  const mediaType = imageMime(bytes);
  return {
    rawBase64: raw,
    bytes,
    mediaType,
    sha256: hashBytes(bytes),
    costUsd:
      typeof data.usage?.cost === "number" &&
      Number.isFinite(data.usage.cost) &&
      data.usage.cost >= 0
        ? data.usage.cost
        : null,
  };
}
