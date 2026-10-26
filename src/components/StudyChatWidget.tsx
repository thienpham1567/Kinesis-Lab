"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { readNdjson } from "@/lib/ai/stream-events";
import type { ChatMessage, ChatSourceStatus, RagHit, PubMedPaper } from "@/lib/types";
import { MarkdownAnswer } from "./MarkdownAnswer";
import { Icon } from "./WorkspaceUI";

const STORAGE_KEY = "kinesis-study-chat";
const MAX_QUOTE = 1500;

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const noopSubscribe = () => () => {};

function saveMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // private mode / blocked storage: chat still works in memory
  }
}

export function StudyChatWidget({
  pathname,
  pageLabel,
}: {
  pathname: string;
  pageLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pubmed, setPubmed] = useState<PubMedPaper[]>([]);
  const [rag, setRag] = useState<RagHit[]>([]);
  const [sourceStatus, setSourceStatus] = useState<ChatSourceStatus | null>(null);
  const inFlight = useRef(false);
  const [selection, setSelection] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const composerId = useId();
  const titleId = useId();
  // Stored history only exists in the browser; gate UI derived from it until
  // after hydration so server and client markup match.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // Remember the last text the learner highlighted outside the widget, so it
  // can be quoted after focus moves into the composer.
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
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!busy) saveMessages(messages);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, busy, open]);

  useEffect(() => () => abort.current?.abort(), []);

  function quoteSelection() {
    if (!selection) return;
    const quote = `Đoạn tôi đang đọc:\n"${selection}"\n\n`;
    setInput((current) => quote + current);
    setSelection("");
    composer.current?.focus();
  }

  function reset() {
    abort.current?.abort();
    abort.current = null;
    inFlight.current = false;
    setBusy(false);
    setMessages([]);
    setPubmed([]);
    setRag([]);
    setSourceStatus(null);
    setError("");
    setInput("");
    composer.current?.focus();
  }

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || inFlight.current) return;
    inFlight.current = true;
    const next = [
      ...messages.filter((m) => m.content.trim()),
      { role: "user" as const, content: text },
    ];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError("");
    setPubmed([]);
    setRag([]);
    setSourceStatus(null);
    const controller = new AbortController();
    abort.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-11), studyPage: pathname }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error ?? "Lỗi kết nối");
      }
      let assistant = "";
      let complete = false;
      for await (const evt of readNdjson<{
        type: string; text?: string; pubmed?: PubMedPaper[]; rag?: RagHit[];
        sourceStatus?: ChatSourceStatus; error?: string;
      }>(res.body)) {
        if (controller.signal.aborted) return;
        if (evt.type === "meta") {
          setPubmed(evt.pubmed ?? []);
          setRag(evt.rag ?? []);
          setSourceStatus(evt.sourceStatus ?? null);
        } else if (evt.type === "token") {
          assistant += evt.text ?? "";
          setMessages([...next, { role: "assistant", content: assistant }]);
        } else if (evt.type === "error") {
          throw new Error(evt.error ?? "Lỗi xử lý");
        } else if (evt.type === "done") {
          complete = true;
        }
      }
      if (!complete) throw new Error("Kết nối bị gián đoạn; câu trả lời có thể chưa đầy đủ. Vui lòng thử lại.");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Không gửi được câu hỏi");
      // Put the question back so it can be retried without retyping.
      setMessages(next.slice(0, -1));
      setInput(text);
    } finally {
      if (abort.current === controller) {
        abort.current = null;
        inFlight.current = false;
        setBusy(false);
      }
    }
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
            aria-busy={busy}
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
              messages.map((m, idx) =>
                m.role === "assistant" && !m.content && !busy ? null : (
                  <article
                    key={`${m.role}-${idx}`}
                    className={`[overflow-wrap:anywhere] ${m.role === "user" ? "ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-cobalt-soft px-3.5 py-2.5" : ""}`}
                  >
                    {m.role === "assistant" && m.content ? (
                      <MarkdownAnswer text={m.content} className="text-[13px]" />
                    ) : (
                      <div className="whitespace-pre-wrap text-[13px] leading-6 text-ink">
                        {m.content || (
                          <span className="inline-flex items-center gap-2 text-xs text-slate">
                            <Icon
                              name="spinner"
                              className="size-4 animate-spin"
                            />
                            Đang soạn câu trả lời…
                          </span>
                        )}
                      </div>
                    )}
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

          {error && (
            <p role="alert" className="alert-error mx-4 mb-2 text-xs">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
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
            <label htmlFor={composerId} className="sr-only">
              Câu hỏi của bạn
            </label>
            <div className="chat-composer flex items-end gap-2 rounded-xl border border-rule-strong bg-sheet p-2">
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
            <p className="mt-1.5 text-xs leading-5 text-slate">
              AI có thể sai — đối chiếu lại với giáo trình và nguồn gốc.
            </p>
          </form>
        </div>
      )}

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
