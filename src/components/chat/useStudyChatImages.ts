"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyImageState,
  bindImageMessage,
  shouldBillNewImage,
} from "@/lib/chat/image-client";
import {
  chatImageObjectUrl,
  loadChatImage,
  revokeAllChatImageUrls,
  saveChatImage,
} from "@/lib/chat/image-storage";
import type { ChatImageSource, StudyChatMessage } from "@/lib/chat/illustration-types";

export type ImageEstimate = {
  enabled: boolean;
  model: string;
  estimateUsd: number;
  priceCheckedAt: string;
  livePrice: boolean;
};

type JobPayload = {
  id: string;
  state: "preparing" | "generating" | "succeeded" | "failed" | "unknown";
  brief?: { explanation?: string; title?: string } | null;
  receipt?: {
    mediaType?: string;
    model?: string;
    parentId?: string | null;
  } | null;
  assetUrl?: string | null;
  errorCode?: string | null;
  error?: string;
};

function errorText(payload: JobPayload | null, fallback: string) {
  if (payload?.error) return payload.error;
  if (payload?.errorCode === "credit")
    return "OpenRouter chưa đủ credits để tạo ảnh. Nạp credits rồi thử lại.";
  if (payload?.errorCode === "rate-limited")
    return "Đã đạt giới hạn lượt tạo hình. Hãy thử lại sau.";
  if (payload?.errorCode === "expired")
    return "Ảnh đã hết thời gian lưu trên máy chủ. Không tự tạo lại.";
  if (payload?.errorCode === "unknown")
    return "Chưa rõ ảnh đã tạo xong chưa. Không tự gửi lại yêu cầu trả phí.";
  if (payload?.errorCode === "unavailable")
    return "Hàng đợi ảnh chưa sẵn sàng.";
  return fallback;
}

export function useStudyChatImages(input: {
  conversationId: string;
  messages: StudyChatMessage[];
  setMessages: (
    update: StudyChatMessage[] | ((current: StudyChatMessage[]) => StudyChatMessage[]),
  ) => void;
}) {
  const [imageBusy, setImageBusy] = useState(false);
  const [estimate, setEstimate] = useState<ImageEstimate | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<
    Record<string, { brief?: JobPayload["brief"]; receipt?: JobPayload["receipt"] }>
  >({});
  const abort = useRef<AbortController | null>(null);
  const conversationRef = useRef(input.conversationId);

  useEffect(() => {
    conversationRef.current = input.conversationId;
  }, [input.conversationId]);

  const ensureSession = useCallback(async () => {
    const res = await fetch("/api/chat/illustrations");
    if (!res.ok) throw new Error("Chưa lấy được thông tin tạo hình.");
    const data = (await res.json()) as ImageEstimate;
    setEstimate(data);
    return data;
  }, []);

  useEffect(() => {
    return () => {
      abort.current?.abort();
      revokeAllChatImageUrls();
    };
  }, []);

  const rememberBlob = useCallback(async (imageId: string, blob: Blob) => {
    const url = chatImageObjectUrl(imageId, blob);
    setPreviews((current) => ({ ...current, [imageId]: url }));
    return url;
  }, []);

  const hydrateImage = useCallback(
    async (imageId: string, assetUrl?: string | null) => {
      const local = await loadChatImage(imageId);
      if (local?.blob) {
        await rememberBlob(imageId, local.blob);
        setDetails((current) => ({
          ...current,
          [imageId]: { brief: local.brief, receipt: local.receipt },
        }));
        return;
      }
      if (!assetUrl) return;
      const res = await fetch(assetUrl);
      if (!res.ok) return;
      const blob = await res.blob();
      await rememberBlob(imageId, blob);
    },
    [rememberBlob],
  );

  useEffect(() => {
    const missing = input.messages.flatMap((message) =>
      message.attachments
        .map((item) => item.imageId)
        .filter((id) => !previews[id]),
    );
    if (!missing.length) return;
    const timer = setTimeout(() => {
      for (const id of missing) void hydrateImage(id);
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrateImage, input.messages, previews]);

  const applyJob = useCallback(
    (job: JobPayload, sourceMessageId: string, conversationId: string) => {
      input.setMessages((messages) =>
        applyImageState(messages, {
          conversationId,
          activeConversationId: conversationRef.current,
          imageId: job.id,
          sourceMessageId,
          state: job.state,
          content: job.brief?.explanation,
        }),
      );
    },
    [input],
  );

  const poll = useCallback(
    async (id: string, sourceMessageId: string, conversationId: string, signal: AbortSignal) => {
      while (!signal.aborted) {
        const res = await fetch(`/api/chat/illustrations/${id}`, { signal });
        const job = (await res.json()) as JobPayload;
        if (signal.aborted) return job;
        applyJob({ ...job, id }, sourceMessageId, conversationId);
        if (job.state === "succeeded") {
          await hydrateImage(id, job.assetUrl);
          return job;
        }
        if (job.state === "failed" || job.state === "unknown") return job;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return null;
    },
    [applyJob, hydrateImage],
  );

  const createImage = useCallback(
    async (opts: {
      reason: "create" | "edit";
      sourceMessageId: string;
      instruction: string;
      selectedContext: string;
      sourceIds: string[];
      sources: ChatImageSource[];
      parentId?: string | null;
    }) => {
      if (!shouldBillNewImage(opts.reason) || imageBusy) return;
      setError("");
      setNotice("");
      const requestId = crypto.randomUUID();
      const conversationId = conversationRef.current;
      input.setMessages((messages) =>
        bindImageMessage({
          messages,
          conversationId,
          activeConversationId: conversationId,
          imageId: requestId,
          sourceMessageId: opts.sourceMessageId,
          userContent: opts.instruction,
        }),
      );
      setImageBusy(true);
      const controller = new AbortController();
      abort.current = controller;
      try {
        await ensureSession();
        const res = await fetch("/api/chat/illustrations", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            conversationId,
            sourceMessageId: opts.sourceMessageId,
            instruction: opts.instruction,
            selectedContext: opts.selectedContext,
            sourceIds: opts.sourceIds,
            ...(opts.parentId ? { parentId: opts.parentId } : {}),
          }),
          signal: controller.signal,
        });
        const job = (await res.json()) as JobPayload;
        const state =
          job.state === "preparing" ||
          job.state === "generating" ||
          job.state === "succeeded" ||
          job.state === "failed" ||
          job.state === "unknown"
            ? job.state
            : "failed";
        applyJob({ ...job, id: requestId, state }, opts.sourceMessageId, conversationId);
        if (job.brief || job.receipt)
          setDetails((current) => ({
            ...current,
            [requestId]: { brief: job.brief, receipt: job.receipt },
          }));
        if (job.state === "succeeded") {
          if (job.assetUrl) {
            const img = await fetch(job.assetUrl);
            if (img.ok) {
              const blob = await img.blob();
              await rememberBlob(requestId, blob);
              if (job.brief && job.receipt) {
                const saved = await saveChatImage({
                  id: requestId,
                  blob,
                  brief: job.brief as never,
                  receipt: job.receipt as never,
                  savedAt: new Date().toISOString(),
                });
                if (!saved.saved) setNotice(saved.notice ?? "");
              }
            }
          }
          return;
        }
        if (job.state === "preparing" || job.state === "generating") {
          const polled = await poll(requestId, opts.sourceMessageId, conversationId, controller.signal);
          if (polled?.state === "succeeded" && polled.assetUrl)
            await hydrateImage(requestId, polled.assetUrl);
          if (polled?.state === "failed" || polled?.state === "unknown")
            setError(errorText(polled, "Chưa tạo được hình minh họa."));
          return;
        }
        setError(errorText(job, "Chưa tạo được hình minh họa."));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Không gửi được yêu cầu tạo hình.");
      } finally {
        if (abort.current === controller) {
          abort.current = null;
          setImageBusy(false);
        }
      }
    },
    [applyJob, ensureSession, hydrateImage, imageBusy, input, poll, rememberBlob],
  );

  function cancelWait() {
    abort.current?.abort();
    abort.current = null;
    setImageBusy(false);
  }

  return {
    imageBusy,
    estimate,
    error,
    notice,
    viewerId,
    previews,
    details,
    ensureSession,
    createImage,
    cancelWait,
    openViewer: (id: string) => setViewerId(id),
    closeViewer: () => setViewerId(null),
    recover: (id: string, sourceMessageId: string) => {
      const controller = new AbortController();
      abort.current = controller;
      void poll(id, sourceMessageId, conversationRef.current, controller.signal);
    },
  };
}
