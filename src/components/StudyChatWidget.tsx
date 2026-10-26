"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { readNdjson } from "@/lib/ai/stream-events";
import type { ChatSourceStatus, RagHit, PubMedPaper } from "@/lib/types";
import {
  illustrationContextFromChat,
  parseStudyChatStore,
  serializeStudyChatStore,
  toChatMessages,
} from "@/lib/chat/study-messages";
import { catalogChatImageSources } from "@/lib/chat/illustration-sources";
import type { ChatImageSource, StudyChatMessage } from "@/lib/chat/illustration-types";
import { MarkdownAnswer } from "./MarkdownAnswer";
import { Icon } from "./WorkspaceUI";
import { StudyChatImageCard } from "./chat/StudyChatImageCard";
import { StudyChatImageComposer } from "./chat/StudyChatImageComposer";
import { StudyChatImageViewer } from "./chat/StudyChatImageViewer";
import { useStudyChatImages } from "./chat/useStudyChatImages";

const STORAGE_KEY = "kinesis-study-chat";
const MAX_QUOTE = 1500;
const catalogIds = new Set(catalogChatImageSources().map((source) => source.id));

function loadStore(): { conversationId: string; messages: StudyChatMessage[] } {
  if (typeof window === "undefined")
    return { conversationId: "00000000-0000-4000-8000-000000000000", messages: [] };
  try {
    return parseStudyChatStore(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return { conversationId: crypto.randomUUID(), messages: [] };
  }
}

const noopSubscribe = () => () => {};

function saveStore(conversationId: string, messages: StudyChatMessage[]) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      serializeStudyChatStore({ conversationId, messages }),
    );
  } catch {
    /* private mode / blocked storage: chat still works in memory */
  }
}

function ragSources(hits: RagHit[]): ChatImageSource[] {
  return hits.slice(0, 8).flatMap((hit) =>
    hit.url
      ? [
          {
            id: hit.id,
            title: hit.title,
            url: hit.url,
            checkedAt: hit.checkedAt ?? "",
            access: hit.access ?? "",
          },
        ]
      : [],
  );
}

export function StudyChatWidget({
  pathname,
  pageLabel,
}: {
  pathname: string;
  pageLabel: string;
}) {
  const initial = loadStore();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(initial.conversationId);
  const [messages, setMessages] = useState<StudyChatMessage[]>(initial.messages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pubmed, setPubmed] = useState<PubMedPaper[]>([]);
  const [rag, setRag] = useState<RagHit[]>([]);
  const [sourceStatus, setSourceStatus] = useState<ChatSourceStatus | null>(null);
  const [mode, setMode] = useState<"ask" | "illustrate">("ask");
  const [imageInstruction, setImageInstruction] = useState("");
  const [sourceMessageId, setSourceMessageId] = useState<string | null>(null);
  const [parentImageId, setParentImageId] = useState<string | null>(null);
  const inFlight = useRef(false);
  const [selection, setSelection] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const composerId = useId();
  const titleId = useId();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const images = useStudyChatImages({ conversationId, messages, setMessages });
  const illustrationCtx = illustrationContextFromChat(messages, sourceMessageId);

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!text) return;
      if (panel.current?.contains(sel?.anchorNode ?? null)) return;
      setSelection(text.slice(0, MAX_QUOTE));
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    composer.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (images.viewerId) return;
      setOpen(false);
      launcher.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.viewerId]);

  useEffect(() => {
    if (!busy && !images.imageBusy)
      saveStore(conversationId, messages);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, busy, images.imageBusy, open, conversationId]);

  useEffect(() => () => abort.current?.abort(), []);

  function quoteSelection() {
    if (!selection) return;
    const quote = `Đoạn tôi đang đọc:\n"${selection}"\n\n`;
    if (mode === "illustrate") setImageInstruction((current) => quote + current);
    else setInput((current) => quote + current);
    setSelection("");
    composer.current?.focus();
  }

  function reset() {
    abort.current?.abort();
    abort.current = null;
    inFlight.current = false;
    images.cancelWait();
    setBusy(false);
    setConversationId(crypto.randomUUID());
    setMessages([]);
    setPubmed([]);
    setRag([]);
    setSourceStatus(null);
    setError("");
    setNotice("");
    setInput("");
    setImageInstruction("");
    setSourceMessageId(null);
    setParentImageId(null);
    setMode("ask");
    composer.current?.focus();
  }

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || inFlight.current || mode !== "ask") return;
    inFlight.current = true;
    const next = [
      ...messages.filter((m) => m.content.trim() || m.attachments.length),
      {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: text,
        attachments: [],
        sources: [],
      },
    ];
    const assistantId = crypto.randomUUID();
    setMessages([
      ...next,
      { id: assistantId, role: "assistant", content: "", attachments: [], sources: [] },
    ]);
    setInput("");
    setBusy(true);
    setError("");
    setNotice("");
    setPubmed([]);
    setRag([]);
    setSourceStatus(null);
    const controller = new AbortController();
    abort.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toChatMessages(next),
          studyPage: pathname,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error ?? "Lỗi kết nối");
      }
      let assistant = "";
      let complete = false;
      let nextRag: RagHit[] = [];
      for await (const evt of readNdjson<{
        type: string; text?: string; pubmed?: PubMedPaper[]; rag?: RagHit[];
        sourceStatus?: ChatSourceStatus; error?: string;
      }>(res.body)) {
        if (controller.signal.aborted) return;
        if (evt.type === "meta") {
          setPubmed(evt.pubmed ?? []);
          nextRag = evt.rag ?? [];
          setRag(nextRag);
          setSourceStatus(evt.sourceStatus ?? null);
        } else if (evt.type === "token") {
          assistant += evt.text ?? "";
          setMessages([
            ...next,
            {
              id: assistantId,
              role: "assistant",
              content: assistant,
              attachments: [],
              sources: ragSources(nextRag),
            },
          ]);
        } else if (evt.type === "error") {
          throw new Error(evt.error ?? "Lỗi xử lý");
        } else if (evt.type === "warning") {
          setNotice((current) => [current, evt.text].filter(Boolean).join(" "));
        } else if (evt.type === "done") {
          complete = true;
        }
      }
      if (!complete) throw new Error("Kết nối bị gián đoạn; câu trả lời có thể chưa đầy đủ. Vui lòng thử lại.");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Không gửi được câu hỏi");
      setMessages(next);
      setInput(text);
    } finally {
      if (abort.current === controller) {
        abort.current = null;
        inFlight.current = false;
        setBusy(false);
      }
    }
  }

  function openIllustrate(preferredAssistantId?: string | null) {
    const ctx = illustrationContextFromChat(messages, preferredAssistantId);
    setSourceMessageId(ctx.sourceMessageId);
    setMode("illustrate");
    setImageInstruction((current) => (current.trim() ? current : ctx.instruction));
    void images.ensureSession();
  }

  function createFromComposer() {
    const selected = messages.find((message) => message.id === illustrationCtx.sourceMessageId);
    void images.createImage({
      reason: parentImageId ? "edit" : "create",
      sourceMessageId: illustrationCtx.sourceMessageId ?? conversationId,
      instruction: imageInstruction.trim() || illustrationCtx.instruction,
      selectedContext: illustrationCtx.selectedContext,
      sourceIds: (selected?.sources ?? [])
        .map((source) => source.id)
        .filter((id) => catalogIds.has(id)),
      sources: selected?.sources ?? [],
      parentId: parentImageId,
    });
    setParentImageId(null);
  }

  return (
    <>
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-labelledby={titleId}
          className="study-chat-panel panel flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 border-b border-rule px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cobalt-soft text-cobalt">
                <Icon name="message" className="size-4" />
              </span>
              <div className="min-w-0">
                <h2 id={titleId} className="text-sm font-semibold text-ink">
                  Hỏi nhanh khi học
                </h2>
                <p className="truncate text-xs text-slate">
                  Đang ở: {pageLabel}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate hover:bg-canvas hover:text-cobalt"
                >
                  <Icon name="refresh" className="size-3.5" />
                  Phiên mới
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  launcher.current?.focus();
                }}
                aria-label="Đóng khung chat"
                className="flex size-9 items-center justify-center rounded-lg text-slate hover:bg-canvas hover:text-ink"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={scroller}
            role="log"
            aria-label="Nội dung hỏi đáp"
            aria-busy={busy || images.imageBusy}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 ? (
              <p className="text-[13px] leading-6 text-slate">
                Hỏi bất cứ điều gì về bài đang học. Mẹo: bôi đen một đoạn
                trong giáo trình rồi bấm{" "}
                <span className="font-medium text-ink">
                  “Hỏi về đoạn đã chọn”
                </span>
                .
              </p>
            ) : (
              messages.map((m) =>
                m.role === "assistant" && !m.content && !m.attachments.length && !busy ? null : (
                  <article
                    key={m.id}
                    className={`[overflow-wrap:anywhere] ${m.role === "user" ? "ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-cobalt-soft px-3.5 py-2.5" : ""}`}
                  >
                    {m.role === "assistant" && m.content ? (
                      <MarkdownAnswer text={m.content} className="text-[13px]" />
                    ) : m.content ? (
                      <div className="whitespace-pre-wrap text-[13px] leading-6 text-ink">
                        {m.content}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-[13px] leading-6 text-ink">
                        <span className="inline-flex items-center gap-2 text-xs text-slate">
                          <Icon
                            name="spinner"
                            className="size-4 animate-spin"
                          />
                          Đang soạn câu trả lời…
                        </span>
                      </div>
                    )}
                    {m.role === "assistant" && m.content && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-cobalt"
                        onClick={() => openIllustrate(m.id)}
                      >
                        Minh họa nội dung này
                      </button>
                    )}
                    {m.attachments.map((attachment) => (
                      <StudyChatImageCard
                        key={attachment.imageId}
                        attachment={attachment}
                        previewUrl={images.previews[attachment.imageId]}
                        brief={images.details[attachment.imageId]?.brief as never}
                        receipt={images.details[attachment.imageId]?.receipt as never}
                        onOpen={() => images.openViewer(attachment.imageId)}
                        onEdit={() => {
                          setParentImageId(attachment.imageId);
                          openIllustrate(attachment.sourceMessageId);
                        }}
                        onRetry={() => openIllustrate(attachment.sourceMessageId)}
                        onRecover={() => images.recover(attachment.imageId, attachment.sourceMessageId)}
                      />
                    ))}
                  </article>
                ),
              )
            )}
            {sourceStatus && !busy && <div className="rounded-lg border border-rule bg-canvas px-3 py-2 text-xs leading-5 text-slate">
              <p>{sourceStatus.rag.message}</p><p>{sourceStatus.pubmed.message}</p>
            </div>}
            {rag.length > 0 && !busy && <details className="rounded-lg border border-rule bg-canvas px-3 text-xs">
              <summary className="py-2 font-medium text-ink">Đoạn tài liệu tham chiếu · {rag.length}</summary>
              <ul className="space-y-2 pb-2.5">{rag.map(hit => <li key={hit.id}>
                <a href={hit.url} target="_blank" rel="noreferrer" className="text-cobalt underline">{hit.title}</a>
                <p className="mt-1 break-all text-[10px] leading-4 text-slate">RAG:{hit.id} · {hit.chapter} · {hit.year} · {hit.license}</p>
              </li>)}</ul>
            </details>}
            {pubmed.length > 0 && !busy && (
              <details className="rounded-lg border border-rule bg-canvas px-3 text-xs">
                <summary className="py-2 font-medium text-ink">
                  Bài báo tham chiếu · {pubmed.length}
                </summary>
                <ul className="space-y-1.5 pb-2.5">
                  {pubmed.map((p) => (
                    <li key={p.pmid}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 leading-5 text-cobalt underline-offset-2 hover:underline"
                      >
                        PMID {p.pmid} · {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {notice && <p role="status" className="mx-4 mb-2 text-xs leading-5 text-caution">{notice}</p>}
          {images.notice && <p role="status" className="mx-4 mb-2 text-xs leading-5 text-caution">{images.notice}</p>}
          {(error || images.error) && (
            <p role="alert" className="alert-error mx-4 mb-2 text-xs">
              {error || images.error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "ask") void send(input);
            }}
            className="border-t border-rule bg-canvas/50 px-3 pb-3 pt-2.5"
          >
            {selection && (
              <button
                type="button"
                onClick={quoteSelection}
                className="mb-2 flex w-full items-center gap-2 rounded-lg border border-cobalt/20 bg-cobalt-soft px-2.5 py-1.5 text-left text-xs text-cobalt"
              >
                <Icon name="plus" className="size-3.5" />
                <span className="shrink-0 font-semibold">
                  Hỏi về đoạn đã chọn:
                </span>
                <span className="truncate opacity-80">“{selection}”</span>
              </button>
            )}
            <StudyChatImageComposer
              mode={mode}
              onMode={(next) => {
                if (next === "illustrate") openIllustrate();
                else setMode("ask");
              }}
              instruction={imageInstruction}
              onInstruction={setImageInstruction}
              contextTitle={illustrationCtx.contextTitle}
              estimate={images.estimate}
              busy={images.imageBusy}
              onCreate={createFromComposer}
            />
            {mode === "ask" && (
              <>
                <label htmlFor={composerId} className="sr-only">
                  Câu hỏi của bạn
                </label>
                <div className="chat-composer mt-2 flex items-end gap-2 rounded-xl border border-rule-strong bg-sheet p-2">
                  <textarea
                    ref={composer}
                    id={composerId}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        void send(input);
                      }
                    }}
                    rows={2}
                    placeholder="Hỏi về bài đang học…"
                    className="block max-h-40 min-h-11 w-full resize-none px-1.5 py-1 text-[13px] leading-6"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    aria-label="Gửi câu hỏi"
                    className="button-primary size-10 shrink-0 !p-0"
                  >
                    <Icon
                      name={busy ? "spinner" : "send"}
                      className={`size-4 ${busy ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      <StudyChatImageViewer
        open={Boolean(images.viewerId)}
        src={images.viewerId ? images.previews[images.viewerId] : undefined}
        title="Hình minh họa AI"
        onClose={() => {
          images.closeViewer();
        }}
      />

      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Đóng khung hỏi nhanh" : "Mở khung hỏi nhanh"}
        className="study-chat-launcher flex items-center justify-center rounded-full bg-cobalt text-sheet shadow-lg transition-transform hover:scale-105"
      >
        <Icon name={open ? "close" : "message"} className="size-6" />
        {hydrated && !open && messages.length > 0 && (
          <span
            className="absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-sheet bg-cleared"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
