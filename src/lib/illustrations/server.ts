import { createHash } from "node:crypto";
import {
  ILLUSTRATION_MODEL,
  ILLUSTRATION_PROVIDER,
  ILLUSTRATION_LABEL,
  IMAGE_LIMIT,
  imagePreset,
  imageTopic,
  compileImagePrompt,
  anatomySources,
  type GeneratedImage,
  type ImageRequest,
  type ImageStatus,
} from "./catalog";

const MAX_BODY = 3_900_000;
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
const hash = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
function decodeBase64(value: string, max: number) {
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
export async function readImageRequest(req: Request): Promise<ImageRequest> {
  if (Number(req.headers.get("content-length")) > MAX_BODY)
    throw new ImageInputError(
      "Yêu cầu quá lớn; chọn ảnh tham chiếu nhỏ hơn.",
      413,
    );
  const reader = req.body?.getReader();
  if (!reader) throw new ImageInputError("Thiếu nội dung yêu cầu.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_BODY) {
        await reader.cancel();
        throw new ImageInputError("Yêu cầu vượt 3.9 MB.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ImageInputError("Yêu cầu JSON không hợp lệ.");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ImageInputError("Yêu cầu không hợp lệ.");
  const body = raw as Record<string, unknown>;
  const keys = [
    "requestId",
    "topicId",
    "presetId",
    "prompt",
    "resolution",
    "aspectRatio",
    "reference",
    "parentId",
  ];
  if (Object.keys(body).some((k) => !keys.includes(k)))
    throw new ImageInputError(
      "Luồng tạo hình chỉ nhận mô tả và ảnh tham chiếu được chọn.",
    );
  if (
    typeof body.requestId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(body.requestId)
  )
    throw new ImageInputError("Mã yêu cầu không hợp lệ.");
  if (
    typeof body.topicId !== "string" ||
    !imageTopic(body.topicId) ||
    typeof body.presetId !== "string" ||
    !imagePreset(body.presetId)
  )
    throw new ImageInputError("Chọn ngữ cảnh và vùng giải phẫu hợp lệ.");
  if (typeof body.prompt !== "string" || body.prompt.length > 1600)
    throw new ImageInputError("Mô tả tối đa 1.600 ký tự.");
  if (
    !["1K", "2K"].includes(String(body.resolution)) ||
    !["1:1", "4:3", "3:4", "16:9"].includes(String(body.aspectRatio))
  )
    throw new ImageInputError("Kích thước ảnh không được hỗ trợ.");
  if (
    body.parentId !== undefined &&
    (typeof body.parentId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.parentId))
  )
    throw new ImageInputError("Mã ảnh trước không hợp lệ.");
  if (body.reference !== undefined) {
    const ref = body.reference as Record<string, unknown> | null;
    if (
      !ref ||
      typeof ref !== "object" ||
      typeof ref.name !== "string" ||
      ref.name.length > 160 ||
      typeof ref.dataUrl !== "string"
    )
      throw new ImageInputError("Ảnh tham chiếu không hợp lệ.");
    const match =
      /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
        ref.dataUrl,
      );
    if (!match)
      throw new ImageInputError(
        "Chọn tệp PNG, JPEG hoặc WebP; không nhận URL ảnh bên ngoài.",
      );
    const bytes = decodeBase64(match[2], 2_700_000);
    if (imageMime(bytes) !== match[1])
      throw new ImageInputError("Định dạng ảnh không khớp nội dung tệp.");
  }
  return body as ImageRequest;
}

let cachedPrice: ImageStatus | null = null;
export async function imageStatus(): Promise<ImageStatus> {
  const enabled = Boolean(process.env.OPENROUTER_API_KEY);
  if (
    cachedPrice &&
    Date.now() - Date.parse(cachedPrice.priceCheckedAt) < 300_000
  )
    return { ...cachedPrice, enabled };
  const status: ImageStatus = {
    enabled,
    model: ILLUSTRATION_MODEL,
    prices: { "1K": 0.018, "2K": 0.018 },
    priceCheckedAt: "2026-10-23",
    livePrice: false,
  };
  try {
    const res = await fetch(
      `https://openrouter.ai/api/v1/images/models/${ILLUSTRATION_MODEL}/endpoints`,
      { signal: AbortSignal.timeout(6000), cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      const endpoint = data.endpoints?.find(
        (e: { provider_tag?: string }) =>
          e.provider_tag === ILLUSTRATION_PROVIDER,
      );
      for (const resolution of ["1K", "2K"] as const) {
        const prices = endpoint?.pricing?.filter(
          (p: { billable: string; unit: string }) =>
            p.billable === "output_image" &&
            p.unit === "image",
        );
        const p = prices?.find(
          (p: { variant?: string }) => p.variant === resolution.toLowerCase(),
        ) ?? prices?.find((p: { variant?: string }) => !p.variant);
        if (typeof p?.cost_usd !== "number" || p.cost_usd < 0)
          throw new Error("Missing price");
        status.prices[resolution] = p.cost_usd;
      }
      status.priceCheckedAt = new Date().toISOString();
      status.livePrice = true;
      cachedPrice = status;
    }
  } catch {
    /* Show a dated estimate if the public price catalog is unavailable. */
  }
  return status;
}

type CachedResult = {
  fingerprint: string;
  result: GeneratedImage;
  expires: number;
};
const results = new Map<string, CachedResult>();
// Keep small receipts after evicting large images; known IDs never bill again.
// Process-local guards need durable shared storage in a multi-server deployment.
const completed = new Map<string, string>();
const running = new Map<string, string>();
const attempts: number[] = [];
export async function generateIllustration(
  input: ImageRequest,
): Promise<GeneratedImage> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key)
    throw new ImageInputError(
      "Chưa cấu hình OPENROUTER_API_KEY trên máy chủ.",
      503,
    );
  const fingerprint = hash(JSON.stringify(input));
  for (const [id, entry] of results)
    if (entry.expires < Date.now()) results.delete(id);
  const previous = results.get(input.requestId);
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      throw new ImageInputError("Mã yêu cầu đã dùng cho nội dung khác.", 409);
    return previous.result;
  }
  if (completed.has(input.requestId))
    throw new ImageInputError(
      "Yêu cầu này đã tạo ảnh, nhưng ảnh đã hết thời gian lưu tạm. Kiểm tra thư viện hoặc lịch sử OpenRouter; không gửi lại cùng mã để tính phí lần nữa.",
      409,
    );
  if (completed.size >= 10_000)
    throw new ImageInputError(
      "Bộ nhớ biên nhận của máy chủ đã đầy; cần khởi động lại dịch vụ trước khi tạo thêm ảnh.",
      503,
    );
  if (running.has(input.requestId))
    throw new ImageInputError(
      "Yêu cầu này đang được tạo; vui lòng giữ tab mở.",
      409,
    );
  if (running.size >= 2)
    throw new ImageInputError(
      "Đang có hai ảnh được tạo. Hãy chờ ảnh hiện tại hoàn tất.",
      429,
    );
  while (attempts.length && attempts[0] < Date.now() - 3_600_000)
    attempts.shift();
  if (attempts.length >= 30)
    throw new ImageInputError(
      "Đã đạt 30 yêu cầu trong giờ này trên máy chủ. Hãy thử lại sau.",
      429,
    );
  running.set(input.requestId, fingerprint);
  attempts.push(Date.now());
  const started = Date.now();
  try {
    const status = await imageStatus();
    const compiledPrompt = compileImagePrompt(input);
    const res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Kinesis Lab Illustrations",
      },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model: ILLUSTRATION_MODEL,
        prompt: compiledPrompt,
        n: 1,
        resolution: input.resolution,
        aspect_ratio: input.aspectRatio,
        provider: { only: [ILLUSTRATION_PROVIDER], allow_fallbacks: false },
        ...(input.reference
          ? {
              input_references: [
                {
                  type: "image_url",
                  image_url: { url: input.reference.dataUrl },
                },
              ],
            }
          : {}),
      }),
    });
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
    // Preserve the completed ID even if output parsing fails afterwards.
    completed.set(input.requestId, fingerprint);
    if (Number(res.headers.get("content-length")) > MAX_IMAGE * 1.5)
      throw new ImageInputError(
        "Ảnh trả về vượt giới hạn xử lý; kiểm tra lịch sử OpenRouter trước khi tạo lại.",
        502,
      );
    const responseReader = res.body?.getReader();
    if (!responseReader)
      throw new ImageInputError("API trả nội dung rỗng.", 502);
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
    const data = JSON.parse(Buffer.concat(responseChunks).toString("utf8"));
    const raw = data.data?.[0]?.b64_json;
    if (typeof raw !== "string")
      throw new ImageInputError(
        "API không trả ảnh hoàn chỉnh. Kiểm tra lịch sử OpenRouter trước khi thử lại.",
        502,
      );
    const bytes = decodeBase64(raw, MAX_IMAGE);
    const mediaType = imageMime(bytes);
    const ref = input.reference?.dataUrl.split(",")[1];
    const result: GeneratedImage = {
      dataUrl: `data:${mediaType};base64,${raw}`,
      receipt: {
        id: input.requestId,
        createdAt: new Date().toISOString(),
        model: ILLUSTRATION_MODEL,
        provider: ILLUSTRATION_PROVIDER,
        topicId: input.topicId,
        presetId: input.presetId,
        purpose: "anatomy",
        prompt: input.prompt.trim(),
        compiledPrompt,
        resolution: input.resolution,
        aspectRatio: input.aspectRatio,
        costUsd:
          typeof data.usage?.cost === "number" &&
          Number.isFinite(data.usage.cost) &&
          data.usage.cost >= 0
            ? data.usage.cost
            : null,
        estimateUsd: status.prices[input.resolution],
        priceCheckedAt: status.priceCheckedAt,
        elapsedMs: Date.now() - started,
        sha256: hash(bytes),
        mediaType,
        byteLength: bytes.length,
        sources: anatomySources(input.presetId),
        reference:
          input.reference && ref
            ? {
                name: input.reference.name,
                sha256: hash(Buffer.from(ref, "base64")),
              }
            : null,
        parentId: input.parentId ?? null,
        label: ILLUSTRATION_LABEL,
        limitation: IMAGE_LIMIT,
        reviewedBy: null,
      },
    };
    const oldestId = results.keys().next().value;
    if (results.size >= 4 && oldestId) results.delete(oldestId);
    results.set(input.requestId, {
      fingerprint,
      result,
      expires: Date.now() + 600_000,
    });
    return result;
  } catch (err) {
    if (err instanceof ImageInputError) throw err;
    throw new ImageInputError(
      "Kết nối tạo ảnh bị gián đoạn hoặc quá thời gian. Kiểm tra lịch sử OpenRouter trước khi tạo lại.",
      502,
    );
  } finally {
    running.delete(input.requestId);
  }
}
