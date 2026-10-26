import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { BriefError, buildChatIllustrationBrief } from "@/lib/chat/illustration-brief";
import { compileChatIllustrationPrompt } from "@/lib/chat/illustration-prompt";
import { resolveChatImageSources } from "@/lib/chat/illustration-sources";
import { jobStore, requestFingerprint, type ChatImageJob } from "@/lib/chat/image-jobs";
import {
  CHAT_IMAGE_COOKIE,
  getOrCreateImageSession,
  sessionCookieOptions,
} from "@/lib/chat/image-session";
import {
  deleteChatIllustration,
  downloadChatIllustration,
  signedChatIllustrationUrl,
  uploadChatIllustration,
} from "@/lib/chat/image-storage-server";
import { ImageInputError, requestRasterImage } from "@/lib/illustrations/provider";
import { ILLUSTRATION_LABEL } from "@/lib/illustrations/catalog";
import {
  CHAT_IMAGE_MODEL,
  CHAT_IMAGE_PROVIDER,
  CHAT_IMAGE_RESOLUTION,
  CHAT_IMAGE_TARGET,
  chatImageStatus,
} from "@/lib/chat/image-config";
import type { ChatImageErrorCode, ChatImageReceipt } from "@/lib/chat/illustration-types";

const POST_KEYS = [
  "requestId",
  "conversationId",
  "sourceMessageId",
  "instruction",
  "selectedContext",
  "sourceIds",
  "parentId",
];
const UUID = /^[0-9a-f-]{36}$/i;
const DEADLINE_MS = 140_000;
const BRIEF_MS = 15_000;
const IMAGE_MS = 110_000;
const UPLOAD_MS = 10_000;

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = new URL(req.url).origin;
  if (origin) return origin === host;
  if (req.headers.get("sec-fetch-site") === "same-origin") return true;
  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === host;
  } catch {
    return false;
  }
}

function json(
  body: unknown,
  status = 200,
) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readSession(create: boolean) {
  const jar = await cookies();
  const session = getOrCreateImageSession(jar.get(CHAT_IMAGE_COOKIE)?.value, create);
  if (session?.created)
    jar.set(CHAT_IMAGE_COOKIE, session.token, sessionCookieOptions());
  return session;
}

function publicJob(job: ChatImageJob, assetUrl?: string | null) {
  return {
    id: job.id,
    state: job.state,
    brief: job.brief,
    receipt: job.receipt,
    assetUrl: assetUrl ?? null,
    errorCode: job.errorCode,
  };
}

export async function chatIllustrationGET(req: Request) {
  if (!sameOrigin(req))
    return json({ error: "Chỉ nhận yêu cầu từ giao diện Kinesis Lab cùng địa chỉ." }, 403);
  await readSession(true);
  const status = await chatImageStatus();
  return json({
    enabled: status.enabled,
    model: status.model,
    estimateUsd: status.prices[CHAT_IMAGE_RESOLUTION],
    priceCheckedAt: status.priceCheckedAt,
    livePrice: status.livePrice,
    resolution: CHAT_IMAGE_RESOLUTION,
    aspectRatio: "4:3",
  });
}

function parsePost(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new ImageInputError("Yêu cầu không hợp lệ.");
  const body = raw as Record<string, unknown>;
  if (Object.keys(body).some((key) => !POST_KEYS.includes(key)))
    throw new ImageInputError("Yêu cầu chứa trường không được phép.");
  if (typeof body.requestId !== "string" || !UUID.test(body.requestId))
    throw new ImageInputError("Mã yêu cầu không hợp lệ.");
  if (typeof body.conversationId !== "string" || !UUID.test(body.conversationId))
    throw new ImageInputError("Mã cuộc chat không hợp lệ.");
  if (typeof body.sourceMessageId !== "string" || !UUID.test(body.sourceMessageId))
    throw new ImageInputError("Mã câu trả lời không hợp lệ.");
  if (typeof body.instruction !== "string" || !body.instruction.trim() || body.instruction.length > 1600)
    throw new ImageInputError("Mô tả tối đa 1.600 ký tự.");
  if (body.selectedContext !== undefined && (typeof body.selectedContext !== "string" || body.selectedContext.length > 4000))
    throw new ImageInputError("Ngữ cảnh chọn không hợp lệ.");
  if (!Array.isArray(body.sourceIds) || body.sourceIds.length > 8 || body.sourceIds.some((id) => typeof id !== "string" || id.length > 120))
    throw new ImageInputError("Danh sách nguồn không hợp lệ.");
  if (body.parentId !== undefined && (typeof body.parentId !== "string" || !UUID.test(body.parentId)))
    throw new ImageInputError("Mã ảnh trước không hợp lệ.");
  return {
    requestId: body.requestId,
    conversationId: body.conversationId,
    sourceMessageId: body.sourceMessageId,
    instruction: body.instruction.trim(),
    selectedContext: typeof body.selectedContext === "string" ? body.selectedContext : "",
    sourceIds: body.sourceIds as string[],
    parentId: typeof body.parentId === "string" ? body.parentId : null,
  };
}

async function assetFor(job: ChatImageJob) {
  if (job.state !== "succeeded" || !job.storagePath) return null;
  try {
    return await signedChatIllustrationUrl(job.storagePath);
  } catch {
    return null;
  }
}

export async function chatIllustrationPOST(req: Request) {
  if (!sameOrigin(req))
    return json({ error: "Chỉ nhận yêu cầu từ giao diện Kinesis Lab cùng địa chỉ." }, 403);
  const session = await readSession(false);
  if (!session) return json({ error: "Thiếu phiên tạo hình.", errorCode: "unauthorized" }, 401);
  let input: ReturnType<typeof parsePost>;
  try {
    input = parsePost(await req.json());
  } catch (err) {
    return json(
      { error: err instanceof ImageInputError ? err.message : "Yêu cầu không hợp lệ." },
      err instanceof ImageInputError ? err.status : 400,
    );
  }
  let sources;
  try {
    sources = resolveChatImageSources(input.sourceIds);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Nguồn không hợp lệ.", errorCode: "invalid-brief" }, 400);
  }
  let store;
  try {
    store = jobStore();
  } catch {
    return json({ error: "Hàng đợi ảnh chưa sẵn sàng.", errorCode: "unavailable" }, 503);
  }
  const fingerprint = requestFingerprint(input);
  let claimed;
  try {
    claimed = await store.claim({
      requestId: input.requestId,
      ownerHash: session.ownerHash,
      fingerprint,
      conversationId: input.conversationId,
      sourceMessageId: input.sourceMessageId,
    });
  } catch {
    return json({ error: "Hàng đợi ảnh chưa sẵn sàng.", errorCode: "unavailable" }, 503);
  }
  if (claimed.kind === "conflict")
    return json({ id: input.requestId, state: "failed", errorCode: "conflict", error: "Mã yêu cầu đã dùng cho nội dung khác." }, 409);
  if (claimed.kind === "forbidden")
    return json({ error: "Không có quyền truy cập yêu cầu này.", errorCode: "unauthorized" }, 403);
  if (claimed.kind === "busy")
    return json({ error: "Đang có hai ảnh được tạo. Hãy chờ ảnh hiện tại hoàn tất.", errorCode: "rate-limited" }, 429);
  if (claimed.kind === "rate-limited")
    return json({
      error:
        claimed.scope === "session"
          ? "Phiên này đã đạt 5 lượt tạo hình trong giờ."
          : "Đã đạt 30 yêu cầu trong giờ này trên máy chủ.",
      errorCode: "rate-limited",
    }, 429);
  const job = claimed.job;
  if (claimed.kind === "existing") {
    if (job.state === "succeeded")
      return json(publicJob(job, await assetFor(job)));
    return json(publicJob(job));
  }
  const started = Date.now();
  const deadline = started + DEADLINE_MS;
  const remain = () => deadline - Date.now();
  try {
    const briefMs = Math.min(BRIEF_MS, remain());
    if (briefMs <= 0) throw new ImageInputError("Hết thời gian chuẩn bị nội dung.", 502);
    const brief = await buildChatIllustrationBrief({
      instruction: input.instruction,
      selectedContext: input.selectedContext,
      sources,
      deadlineMs: briefMs,
    });
    await store.update(job.id, session.ownerHash, { brief, state: "generating" });
    const imageBudget = Math.min(IMAGE_MS, remain() - UPLOAD_MS);
    if (imageBudget <= 0)
      throw new ImageInputError("Không còn thời gian để gọi tạo ảnh.", 502);
    let referenceDataUrl: string | undefined;
    if (input.parentId) {
      const parent = await store.get(input.parentId, session.ownerHash);
      if (!parent?.storagePath || parent.state !== "succeeded")
        throw new ImageInputError("Ảnh gốc không còn để chỉnh sửa.");
      const bytes = await downloadChatIllustration(parent.storagePath);
      referenceDataUrl = `data:${parent.receipt?.mediaType ?? "image/png"};base64,${bytes.toString("base64")}`;
    }
    const raster = await requestRasterImage({
      prompt: compileChatIllustrationPrompt(brief),
      resolution: CHAT_IMAGE_RESOLUTION,
      aspectRatio: "4:3",
      timeoutMs: imageBudget,
      referenceDataUrl,
    }, CHAT_IMAGE_TARGET);
    const upload = await Promise.race([
      uploadChatIllustration({
        ownerHash: session.ownerHash,
        id: job.id,
        bytes: raster.bytes,
        mediaType: raster.mediaType,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new ImageInputError("Lưu ảnh vượt 10 giây.", 502)), UPLOAD_MS),
      ),
    ]);
    const status = await chatImageStatus();
    const receipt: ChatImageReceipt = {
      id: job.id,
      createdAt: new Date().toISOString(),
      model: CHAT_IMAGE_MODEL,
      provider: CHAT_IMAGE_PROVIDER,
      purpose: "chat-study",
      brief,
      mediaType: raster.mediaType,
      byteLength: raster.bytes.length,
      sha256: raster.sha256,
      elapsedMs: Date.now() - started,
      costUsd: raster.costUsd,
      estimateUsd: status.prices[CHAT_IMAGE_RESOLUTION],
      priceCheckedAt: status.priceCheckedAt,
      resolution: CHAT_IMAGE_RESOLUTION,
      aspectRatio: "4:3",
      parentId: input.parentId,
      label: ILLUSTRATION_LABEL,
      reviewedBy: null,
    };
    const saved = await store.update(job.id, session.ownerHash, {
      state: "succeeded",
      brief,
      receipt,
      storagePath: upload.storagePath,
      errorCode: null,
    });
    return json(publicJob(saved ?? job, upload.assetUrl));
  } catch (err) {
    const timedOut =
      (err instanceof Error && err.name === "TimeoutError") ||
      (err instanceof ImageInputError && /thời gian|gián đoạn/.test(err.message));
    const errorCode: ChatImageErrorCode = timedOut
      ? "unknown"
      : err instanceof BriefError
        ? "invalid-brief"
        : err instanceof ImageInputError && err.status === 402
          ? "credit"
          : err instanceof ImageInputError && err.status === 429
            ? "rate-limited"
            : "provider-rejected";
    const state = timedOut ? "unknown" : "failed";
    const saved = await store.update(job.id, session.ownerHash, { state, errorCode });
    const message =
      err instanceof ImageInputError || err instanceof BriefError
        ? err.message
        : "Chưa tạo được hình minh họa.";
    return json(
      { ...publicJob(saved ?? { ...job, state, errorCode }), error: message },
      timedOut ? 504 : err instanceof BriefError ? 400 : err instanceof ImageInputError ? err.status : 502,
    );
  }
}

export async function chatIllustrationItemGET(req: Request, id: string) {
  if (!sameOrigin(req))
    return json({ error: "Chỉ nhận yêu cầu từ giao diện Kinesis Lab cùng địa chỉ." }, 403);
  const session = await readSession(false);
  if (!session) return json({ error: "Thiếu phiên tạo hình.", errorCode: "unauthorized" }, 401);
  if (!UUID.test(id)) return json({ error: "Mã ảnh không hợp lệ." }, 400);
  let job;
  try {
    job = await jobStore().get(id, session.ownerHash);
  } catch {
    return json({ error: "Hàng đợi ảnh chưa sẵn sàng.", errorCode: "unavailable" }, 503);
  }
  if (!job) return json({ error: "Không tìm thấy ảnh.", errorCode: "unauthorized" }, 404);
  if (job.state === "succeeded" && job.expiresAt <= Date.now() && !job.storagePath)
    return json({ id: job.id, state: job.state, errorCode: "expired", error: "Ảnh đã hết thời gian lưu trên máy chủ." }, 410);
  return json(publicJob(job, await assetFor(job)));
}

export async function chatIllustrationCleanup(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b))
    return json({ error: "Unauthorized" }, 401);
  const store = jobStore();
  const expired = await store.expiredWithAssets(Date.now());
  let removed = 0;
  for (const job of expired) {
    if (job.storagePath) await deleteChatIllustration(job.storagePath);
    await store.update(job.id, job.ownerHash, {
      brief: null,
      receipt: null,
      storagePath: null,
      errorCode: job.errorCode ?? "expired",
    });
    removed += 1;
  }
  return json({ removed });
}
