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
import {
  ImageInputError,
  decodeImageBase64,
  hashBytes,
  imageMime,
  requestRasterImage,
} from "./provider";

export { ImageInputError, imageMime };

const MAX_BODY = 3_900_000;
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
    const bytes = decodeImageBase64(match[2], 2_700_000);
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
  const fingerprint = hashBytes(JSON.stringify(input));
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
    const raster = await requestRasterImage({
      prompt: compiledPrompt,
      resolution: input.resolution,
      aspectRatio: input.aspectRatio,
      timeoutMs: 120_000,
      referenceDataUrl: input.reference?.dataUrl,
      onAccepted: () => completed.set(input.requestId, fingerprint),
    });
    const ref = input.reference?.dataUrl.split(",")[1];
    const result: GeneratedImage = {
      dataUrl: `data:${raster.mediaType};base64,${raster.rawBase64}`,
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
        costUsd: raster.costUsd,
        estimateUsd: status.prices[input.resolution],
        priceCheckedAt: status.priceCheckedAt,
        elapsedMs: Date.now() - started,
        sha256: raster.sha256,
        mediaType: raster.mediaType,
        byteLength: raster.bytes.length,
        sources: anatomySources(input.presetId),
        reference:
          input.reference && ref
            ? {
                name: input.reference.name,
                sha256: hashBytes(Buffer.from(ref, "base64")),
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
