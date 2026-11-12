"use client";

import {
  useCallback,
  useEffect,
  type RefObject,
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
import {
  answerCitationsFromEvidence,
  answerCitationsFromStudySources,
} from "@/lib/chat/answer-citations";
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
import { StudyChatDrawer } from "./study-chat/StudyChatDrawer";
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
  open,
  onOpenChange,
  launcherRef,
}: {
  pathname: string;
  pageLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  launcherRef: RefObject<HTMLButtonElement | null>;
}) {
  const [initial] = useState(loadStore);
  const [view, setView] = useState<"chat" | "library">("chat");
  const [conversationId, setConversationId] = useState(initial.conversationId);
  const [messages, setMessages] = useState(initial.messages);
  const [input, setInput] = useState("");
  const [chatModel, setChatModel] = useState(loadChatModel);
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
  const panel = useRef<HTMLDialogElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const readerPosition = useRef(0);
  const inFlight = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const composerId = useId();
  const titleId = useId();
  const currentModel =
    (hydrated
      ? CHAT_MODELS.find((item) => item.id === chatModel)
      : CHAT_MODELS[0]) ?? CHAT_MODELS[0];

  useEffect(() => {
    const onSelection = () => {
      if (document.activeElement?.matches("input, textarea, select")) return;
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim();
      if (text && !panel.current?.contains(sel?.anchorNode ?? null))
        setSelection(text.slice(0, 1500));
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);
  const closeDrawer = useCallback(() => onOpenChange(false), [onOpenChange]);
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
        if (event.type === "study-meta") {
          const study = parseStudyMeta(event);
          answer = {
            ...answer,
            study,
            citations: [
              ...(answer.citations ?? []),
              ...answerCitationsFromStudySources(study?.sources ?? []),
            ],
          };
        }
        if (event.type === "token")
          answer = { ...answer, content: answer.content + (event.text ?? "") };
        if (event.type === "warning") {
          setNotice(event.text ?? "");
          if (answer.study)
            answer = {
              ...answer,
              study: {
                ...answer.study,
                warning: [answer.study.warning, event.text]
                  .filter(Boolean)
                  .join(" "),
              },
            };
        }
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
    <StudyChatDrawer
      open={open}
      onOpenChange={onOpenChange}
      onEscape={closeDrawer}
      panelRef={panel}
      launcherRef={launcherRef}
      composerRef={composer}
      titleId={titleId}
    >
      <header className="study-drawer-header shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              tabIndex={-1}
              data-drawer-heading
              className="flex items-center gap-2.5 text-lg font-semibold leading-7 tracking-tight text-ink outline-none"
            >
              <Icon name="book" className="size-5 text-cobalt" />
              Trợ lý học tập
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate">
              {pageLabel} · Đối chiếu nguồn
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Đóng trợ lý học tập"
            title="Đóng trợ lý"
            className="study-drawer-close"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <div className="study-drawer-model-row mt-4 flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Model trả lời</span>
            <select
              value={currentModel.id}
              disabled={busy}
              onChange={(event) =>
                chooseChatModel(
                  event.target.value as (typeof CHAT_MODELS)[number]["id"],
                )
              }
              className="study-model-select"
            >
              {CHAT_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            aria-label="Bắt đầu hội thoại mới"
            className="study-drawer-new"
          >
            <Icon name="plus" className="size-4" /> Hỏi mới
          </button>
        </div>
      </header>
      <div
        className="study-drawer-tabs shrink-0"
        role="group"
        aria-label="Chế độ chat"
      >
        <button
          type="button"
          aria-pressed={view === "chat"}
          onClick={() => setView("chat")}
          className="study-drawer-tab"
        >
          <Icon name="message" className="size-4" /> Hỏi đáp
        </button>
        <button
          type="button"
          disabled={busy}
          aria-pressed={view === "library"}
          onClick={() => setView("library")}
          className="study-drawer-tab"
        >
          <Icon name="bookmark" className="size-4" /> Thư viện
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
          onNavigate={closeDrawer}
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
            className="min-h-0 flex-1 study-drawer-messages space-y-6 overflow-y-auto overscroll-contain"
          >
            {(!hydrated || messages.length === 0) && (
              <div className="study-drawer-empty">
                <h3 className="text-lg font-semibold leading-7 tracking-tight text-ink">
                  Cùng làm rõ điều bạn đang học.
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate">
                  {context
                    ? "Khám phá cấu trúc đang chọn qua các nguồn tham khảo và nghiên cứu liên quan."
                    : "Hỏi về một khái niệm, so sánh hai ý hoặc thêm đoạn tài liệu bạn đang đọc."}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate">
                  Nguồn và phạm vi đọc đi kèm từng câu trả lời.
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
                    className={`[overflow-wrap:anywhere] ${message.role === "user" ? "ml-auto max-w-[92%] rounded-xl rounded-tr-sm bg-cobalt-soft px-4 py-3 text-sm leading-6 text-ink" : ""}`}
                  >
                    {message.role === "user" ? (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : message.content ? (
                      <StudyAnswer
                        onNavigate={closeDrawer}
                        message={message}
                        busy={busy && index === messages.length - 1}
                        saved={library.saved.some(
                          (row) => row.id === `${conversationId}:${message.id}`,
                        )}
                        onSave={() =>
                          bookmark({
                            id: `${conversationId}:${message.id}`,
                            question:
                              messages
                                .slice(0, index)
                                .reverse()
                                .find((row) => row.role === "user")?.content ??
                              "",
                            answer: message,
                            savedAt: new Date().toISOString(),
                          })
                        }
                      />
                    ) : (
                      <p className="inline-flex items-center gap-2 text-xs text-slate">
                        <Icon name="spinner" className="size-4 animate-spin" />
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
                  scroller.current.scrollTop = scroller.current.scrollHeight;
              }}
              className="mx-auto mb-2 inline-flex min-h-11 items-center gap-1 rounded-full border border-cobalt/20 bg-cobalt-soft px-3 text-xs font-semibold text-cobalt"
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
            className="study-drawer-composer shrink-0"
          >
            <div
              className="study-drawer-suggestions mb-3 gap-2"
              aria-label="Câu hỏi gợi ý theo ngữ cảnh"
            >
              {studyQuestions(context).map((question) => (
                <button
                  type="button"
                  key={question.label}
                  disabled={busy}
                  onClick={() => void send(question.prompt)}
                  className="min-h-10 shrink-0 rounded-lg border border-rule bg-sheet px-3 text-xs font-medium text-slate hover:border-cobalt/40 hover:text-cobalt disabled:opacity-40"
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
                className="block max-h-40 min-h-11 w-full resize-none px-1 py-1 text-sm leading-6"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Gửi câu hỏi"
                className="button-primary size-11 shrink-0 !p-0"
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
    </StudyChatDrawer>
  );
}
