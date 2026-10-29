"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { readNdjson } from "@/lib/ai/stream-events";
import {
  parseStudyChatStore,
  serializeStudyChatStore,
  toChatMessages,
} from "@/lib/chat/study-messages";
import { answerCitationsFromEvidence } from "@/lib/chat/answer-citations";
import {
  getStudyContext,
  getServerStudyContext,
  studyContextLabel,
  studyQuestions,
  subscribeStudyContext,
} from "@/lib/chat/study-context";
import {
  rememberStudyConversation,
  toggleStudyBookmark,
  type StudyBookmark,
  type StudyConversation,
} from "@/lib/chat/study-library";
import {
  getStudyLibrary,
  getServerStudyLibrary,
  subscribeStudyLibrary,
  writeStudyLibrary,
  studyLibraryUnavailable,
} from "@/lib/chat/study-library-store";
import { isNearStudyBottom } from "@/lib/chat/study-scroll";
import { parseStudyMeta } from "@/lib/chat/study-meta";
import type { StudyChatMessage } from "@/lib/chat/illustration-types";
import type { EvidenceIndexEntry } from "@/lib/clinical/evidence-registry";
import { StudyAnswer } from "./study-chat/StudyAnswer";
import { StudyLibrary } from "./study-chat/StudyLibrary";
import { Icon } from "./WorkspaceUI";

const STORAGE_KEY = "kinesis-study-chat";
const MODEL_KEY = "kinesis-study-chat-model";
const CHAT_MODELS = [
  {
    id: "google/gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    short: "Gemini 3.8",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    short: "Gemini 2.5",
  },
] as const;
const noopSubscribe = () => () => {};
function loadChatModel(): (typeof CHAT_MODELS)[number]["id"] {
  try {
    const saved = sessionStorage.getItem(MODEL_KEY);
    return (
      CHAT_MODELS.find((item) => item.id === saved)?.id ?? CHAT_MODELS[0].id
    );
  } catch {
    return CHAT_MODELS[0].id;
  }
}
function loadStore() {
  if (typeof window === "undefined")
    return {
      conversationId: "00000000-0000-4000-8000-000000000000",
      messages: [] as StudyChatMessage[],
    };
  try {
    return parseStudyChatStore(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return {
      conversationId: crypto.randomUUID(),
      messages: [] as StudyChatMessage[],
    };
  }
}

export function StudyChatWidget({
  pathname,
  pageLabel,
}: {
  pathname: string;
  pageLabel: string;
}) {
  const [initial] = useState(loadStore);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "library">("chat");
  const [conversationId, setConversationId] = useState(initial.conversationId);
  const [messages, setMessages] = useState(initial.messages);
  const [input, setInput] = useState("");
  const [chatModel, setChatModel] = useState(loadChatModel);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selection, setSelection] = useState("");
  const [newContent, setNewContent] = useState(false);
  const contextSnapshot = useSyncExternalStore(
    subscribeStudyContext,
    getStudyContext,
    getServerStudyContext,
  );
  const context = pathname === "/atlas" ? contextSnapshot : null;
  const library = useSyncExternalStore(
    subscribeStudyLibrary,
    getStudyLibrary,
    getServerStudyLibrary,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const panel = useRef<HTMLDivElement>(null);
  const modelMenu = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const readerPosition = useRef(0);
  const inFlight = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const modelMenuOpenRef = useRef(false);
  const composerId = useId();
  const titleId = useId();
  const currentModel =
    (hydrated
      ? CHAT_MODELS.find((item) => item.id === chatModel)
      : CHAT_MODELS[0]) ?? CHAT_MODELS[0];

  useEffect(() => {
    const onSelection = () => {
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim();
      if (text && !panel.current?.contains(sel?.anchorNode ?? null))
        setSelection(text.slice(0, 1500));
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);
  useEffect(() => {
    if (!open) return;
    composer.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modelMenuOpenRef.current) {
        setModelMenuOpen(false);
        return;
      }
      setOpen(false);
      launcher.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    modelMenuOpenRef.current = modelMenuOpen;
  }, [modelMenuOpen]);
  useEffect(() => {
    if (!modelMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!modelMenu.current?.contains(event.target as Node))
        setModelMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [modelMenuOpen]);
  useEffect(() => {
    if (!busy) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          serializeStudyChatStore({ conversationId, messages }),
        );
      } catch {
        /* Browser library remains the persistent fallback. */
      }
    }
    if (open && view === "chat" && scroller.current) {
      scroller.current.scrollTop = follow.current
        ? scroller.current.scrollHeight
        : readerPosition.current;
    }
  }, [messages, busy, open, view, conversationId]);
  useEffect(() => () => abort.current?.abort(), []);

  function persist(next: StudyChatMessage[], id = conversationId) {
    try {
      writeStudyLibrary(
        rememberStudyConversation(
          getStudyLibrary(),
          { id, messages: next },
          new Date().toISOString(),
        ),
      );
    } catch {
      setNotice(
        "Chưa lưu được hội thoại trên trình duyệt này. Nội dung vẫn còn trong phiên đang mở.",
      );
    }
  }
  function bookmark(entry: StudyBookmark) {
    try {
      writeStudyLibrary(toggleStudyBookmark(getStudyLibrary(), entry));
      setNotice("");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Chưa lưu được câu trả lời.",
      );
    }
  }
  function reset() {
    if (inFlight.current) return;
    persist(messages);
    setConversationId(crypto.randomUUID());
    setMessages([]);
    setInput("");
    setError("");
    setView("chat");
    follow.current = true;
    readerPosition.current = 0;
    setNewContent(false);
    composer.current?.focus();
  }
  function restore(conversation: StudyConversation) {
    if (inFlight.current) return;
    persist(messages);
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    setInput("");
    setError("");
    setView("chat");
    follow.current = true;
    setNewContent(false);
  }
  function chooseChatModel(id: (typeof CHAT_MODELS)[number]["id"]) {
    setChatModel(id);
    setModelMenuOpen(false);
    try {
      sessionStorage.setItem(MODEL_KEY, id);
    } catch {
      /* selection still works */
    }
  }
  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || inFlight.current) return;
    inFlight.current = true;
    follow.current = true;
    setNewContent(false);
    setView("chat");
    const next = [
      ...messages.filter((message) => message.content.trim()),
      {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: text,
        attachments: [],
        sources: [],
      },
    ];
    let answer: StudyChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      attachments: [],
      sources: [],
    };
    setMessages([...next, answer]);
    setInput("");
    setBusy(true);
    setError("");
    setNotice("");
    persist(next);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toChatMessages(next),
          studyPage: pathname,
          studyStructureId: context?.structureId,
          model: chatModel,
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.error ?? "Lỗi kết nối");
      }
      let complete = false;
      for await (const event of readNdjson<{
        type: string;
        text?: string;
        error?: string;
        curated?: EvidenceIndexEntry[];
      }>(response.body)) {
        if (controller.signal.aborted) return;
        if (event.type === "meta")
          answer = {
            ...answer,
            citations: answerCitationsFromEvidence(event.curated ?? []),
          };
        if (event.type === "study-meta")
          answer = { ...answer, study: parseStudyMeta(event) };
        if (event.type === "token")
          answer = { ...answer, content: answer.content + (event.text ?? "") };
        if (event.type === "warning") setNotice(event.text ?? "");
        if (event.type === "error") throw new Error(event.error ?? "Lỗi xử lý");
        if (event.type === "done") complete = true;
        setMessages([...next, answer]);
        if (!follow.current) setNewContent(true);
      }
      if (!complete)
        throw new Error(
          "Kết nối bị gián đoạn; câu trả lời có thể chưa đầy đủ. Vui lòng thử lại.",
        );
      persist([...next, answer]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Không gửi được câu hỏi");
      if (answer.content) {
        answer = {
          ...answer,
          content:
            answer.content + "\n\n*Câu trả lời bị gián đoạn, chưa hoàn tất.*",
        };
        setMessages([...next, answer]);
        persist([...next, answer]);
      } else {
        setMessages(next);
        persist(next);
      }
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
          <div className="flex items-start justify-between gap-2 border-b border-rule px-3 py-3">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="flex items-center gap-2 text-sm font-semibold text-ink"
              >
                <Icon name="message" className="size-4 text-cobalt" />
                Hỏi nhanh
              </h2>
              <p className="mt-1 truncate text-[11px] text-slate">
                {pageLabel} · Đối chiếu nguồn
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <div className="relative" ref={modelMenu}>
                <button
                  type="button"
                  aria-label={`Chọn model, đang dùng ${currentModel.label}`}
                  aria-haspopup="menu"
                  aria-expanded={modelMenuOpen}
                  disabled={busy}
                  onClick={() => setModelMenuOpen((value) => !value)}
                  className="inline-flex min-h-9 max-w-28 items-center gap-1 rounded-lg px-1 text-[11px] text-slate hover:bg-canvas"
                >
                  <span className="truncate">{currentModel.short}</span>
                  <Icon name="chevron-down" className="size-3" />
                </button>
                {modelMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Chọn model"
                    className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-rule bg-sheet p-1 shadow-lg"
                  >
                    {CHAT_MODELS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={chatModel === item.id}
                        onClick={() => chooseChatModel(item.id)}
                        className={`flex min-h-10 w-full items-center justify-between rounded-lg px-2.5 text-xs ${chatModel === item.id ? "bg-cobalt-soft text-cobalt" : "text-ink"}`}
                      >
                        {item.label}
                        {chatModel === item.id && (
                          <Icon name="check" className="size-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                aria-label="Bắt đầu hội thoại mới"
                title="Phiên mới"
                className="flex size-9 items-center justify-center rounded-lg text-slate hover:bg-canvas disabled:opacity-40"
              >
                <Icon name="plus" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setModelMenuOpen(false);
                  setOpen(false);
                  launcher.current?.focus();
                }}
                aria-label="Đóng khung chat"
                className="flex size-9 items-center justify-center rounded-lg text-slate hover:bg-canvas"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>
          </div>
          <div
            className="flex gap-1 border-b border-rule px-3 py-1"
            role="group"
            aria-label="Chế độ chat"
          >
            <button
              type="button"
              aria-pressed={view === "chat"}
              onClick={() => setView("chat")}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${view === "chat" ? "text-cobalt" : "text-slate"}`}
            >
              Hỏi đáp
            </button>
            <button
              type="button"
              disabled={busy}
              aria-pressed={view === "library"}
              onClick={() => setView("library")}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold disabled:opacity-40 ${view === "library" ? "text-cobalt" : "text-slate"}`}
            >
              <Icon name="bookmark" className="size-3.5" />
              Thư viện
              {hydrated && library.saved.length > 0
                ? ` · ${library.saved.length}`
                : ""}
            </button>
          </div>
          {view === "library" ? (
            <StudyLibrary
              library={library}
              onRestore={restore}
              onUnsave={bookmark}
              onNavigate={() => setOpen(false)}
            />
          ) : (
            <>
              {context && (
                <div className="border-b border-cobalt/15 bg-cobalt-soft px-3 py-2">
                  <p className="text-[11px] text-cobalt">Đang hỏi về</p>
                  <p className="mt-0.5 text-xs font-semibold leading-5 text-ink">
                    {studyContextLabel(context)}
                  </p>
                </div>
              )}
              <div
                ref={scroller}
                role="log"
                aria-label="Nội dung hỏi đáp"
                aria-busy={busy}
                onScroll={() => {
                  if (!scroller.current) return;
                  follow.current = isNearStudyBottom(scroller.current);
                  readerPosition.current = scroller.current.scrollTop;
                  if (follow.current) setNewContent(false);
                }}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {(!hydrated || messages.length === 0) && (
                  <div className="space-y-3">
                    <p className="text-[13px] leading-6 text-slate">
                      {context
                        ? "Khám phá cấu trúc đang chọn qua các nguồn tham khảo và nghiên cứu liên quan."
                        : "Chọn một cơ trong Atlas hoặc nhập chủ đề để đối chiếu các nguồn tham khảo uy tín."}
                    </p>
                    <p className="text-[11px] leading-5 text-slate">
                      Gợi ý khám phá từ nguồn tham khảo
                    </p>
                  </div>
                )}
                {hydrated &&
                  messages.map((message, index) =>
                    message.role === "assistant" &&
                    !message.content &&
                    !busy ? null : (
                      <article
                        key={message.id}
                        className={`[overflow-wrap:anywhere] ${message.role === "user" ? "ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-cobalt-soft px-3.5 py-2.5 text-[13px] leading-6 text-ink" : ""}`}
                      >
                        {message.role === "user" ? (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        ) : message.content ? (
                          <StudyAnswer
                            onNavigate={() => setOpen(false)}
                            message={message}
                            busy={busy && index === messages.length - 1}
                            saved={library.saved.some(
                              (row) =>
                                row.id === `${conversationId}:${message.id}`,
                            )}
                            onSave={() =>
                              bookmark({
                                id: `${conversationId}:${message.id}`,
                                question:
                                  messages
                                    .slice(0, index)
                                    .reverse()
                                    .find((row) => row.role === "user")
                                    ?.content ?? "",
                                answer: message,
                                savedAt: new Date().toISOString(),
                              })
                            }
                          />
                        ) : (
                          <p className="inline-flex items-center gap-2 text-xs text-slate">
                            <Icon
                              name="spinner"
                              className="size-4 animate-spin"
                            />
                            Đang đối chiếu nguồn và soạn trả lời…
                          </p>
                        )}
                      </article>
                    ),
                  )}
              </div>
              {newContent && (
                <button
                  type="button"
                  onClick={() => {
                    follow.current = true;
                    setNewContent(false);
                    if (scroller.current)
                      scroller.current.scrollTop =
                        scroller.current.scrollHeight;
                  }}
                  className="mx-auto mb-2 inline-flex min-h-9 items-center gap-1 rounded-full border border-cobalt/20 bg-cobalt-soft px-3 text-xs font-semibold text-cobalt"
                >
                  <Icon name="chevron-down" className="size-3.5" />
                  Có nội dung mới
                </button>
              )}
              {error && (
                <p role="alert" className="alert-error mx-3 mb-2 text-xs">
                  {error}
                </p>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
                className="border-t border-rule bg-canvas/50 px-3 pb-3 pt-2"
              >
                <div
                  className="mb-2 flex gap-1.5 overflow-x-auto pb-1"
                  aria-label="Câu hỏi gợi ý theo ngữ cảnh"
                >
                  {studyQuestions(context).map((question) => (
                    <button
                      type="button"
                      key={question.label}
                      disabled={busy}
                      onClick={() => void send(question.prompt)}
                      className="min-h-9 shrink-0 rounded-lg border border-rule bg-sheet px-2 text-[11px] font-medium text-slate hover:border-cobalt/40 hover:text-cobalt disabled:opacity-40"
                    >
                      {question.label}
                    </button>
                  ))}
                </div>
                {selection && (
                  <button
                    type="button"
                    onClick={() => {
                      setInput(
                        (current) =>
                          `Đoạn tôi đang đọc:\n"${selection}"\n\n${current}`,
                      );
                      setSelection("");
                      composer.current?.focus();
                    }}
                    className="mb-2 flex max-w-full items-center gap-1.5 rounded-lg bg-cobalt-soft px-2 py-1.5 text-left text-xs text-cobalt"
                  >
                    <Icon name="plus" className="size-3.5 shrink-0" />
                    <span className="truncate">
                      Hỏi về đoạn đã chọn: “{selection}”
                    </span>
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
                    maxLength={20000}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        void send(input);
                      }
                    }}
                    rows={2}
                    placeholder={
                      context
                        ? "Hỏi về cấu trúc đang chọn…"
                        : "Nhập chủ đề muốn tìm hiểu…"
                    }
                    className="block max-h-40 min-h-11 w-full resize-none px-1 py-1 text-[13px] leading-6"
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
              </form>
            </>
          )}
          {(notice || (hydrated && studyLibraryUnavailable())) && (
            <p
              role="status"
              className="border-t border-rule px-3 py-2 text-xs leading-5 text-caution"
            >
              {notice ||
                "Trình duyệt chưa cho phép lưu thư viện. Nội dung hiện chỉ có trong phiên đang mở."}
            </p>
          )}
        </div>
      )}
      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((value) => !value)}
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
