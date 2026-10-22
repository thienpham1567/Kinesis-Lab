"use client";

import { ClinicalEvidencePanel } from "./ClinicalEvidencePanel";
import { ASSISTANT_EVIDENCE } from "@/lib/clinical/evidence-assessment";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ANATOMY_REGIONS,
  detectRegionsInText,
  matchClientIssuesToRegions,
  type AnatomyRegionId,
} from "@/lib/clinical/anatomy-atlas";
import { safetyNotes } from "@/lib/clinical/safety";
import type { ChatMessage, Client, PubMedPaper, RagHit } from "@/lib/types";
import { JointDiagramSvg } from "./JointDiagramSvg";
import { MarkdownAnswer } from "./MarkdownAnswer";
import { Icon } from "./WorkspaceUI";

const REGION_CHIP: Record<AnatomyRegionId, string> = {
  cervical: "Cổ",
  shoulder: "Vai",
  thoracic_core: "Ngực / Core",
  lumbar: "Thắt lưng",
  hip_pelvis: "Háng",
  thigh_hamstring: "Đùi",
  knee: "Gối",
  ankle_foot: "Cổ chân",
};

export function ChatPanel({
  clientId: lockedClientId,
  initialClientId,
  placeholder = "Nhập tình huống lâm sàng, triệu chứng đau cơ học, chỉ số xét nghiệm hoặc bài tập cần kiểm tra...",
  initialPrompt,
}: {
  clientId?: string;
  initialClientId?: string;
  placeholder?: string;
  initialPrompt?: string;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    lockedClientId ?? initialClientId ?? "",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt ?? "");
  const [busy, setBusy] = useState(false);
  const [rag, setRag] = useState<RagHit[]>([]);
  const [pubmed, setPubmed] = useState<PubMedPaper[]>([]);
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [visualRegionId, setVisualRegionId] = useState<AnatomyRegionId | null>(
    null,
  );
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const composerId = useId();
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ignore) return;
        if (!ok) throw new Error("clients");
        setClients(data.clients ?? []);
      })
      .catch(() => {
        if (!ignore) setClientsError(true);
      })
      .finally(() => {
        if (!ignore) setClientsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const activeClient =
    clients.find((c) => c.id === (lockedClientId ?? selectedId)) ?? null;
  const activeSafety = activeClient
    ? safetyNotes(activeClient).split("\n")
    : [];

  // Determine the most relevant visual diagram for the current consultation context
  const conversationText = [input, ...messages.map((m) => m.content)].join(" ");
  const detectedFromText = detectRegionsInText(conversationText);
  const clientAlerts = matchClientIssuesToRegions(activeClient);
  const firstClientRegionId = Object.keys(clientAlerts)[0] as
    AnatomyRegionId | undefined;

  const effectiveRegionId: AnatomyRegionId | null =
    visualRegionId ?? detectedFromText[0]?.id ?? firstClientRegionId ?? null;

  const activeVisualRegion = effectiveRegionId
    ? (ANATOMY_REGIONS.find((r) => r.id === effectiveRegionId) ?? null)
    : null;

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || busy) return;
    const failedTurn = messages
      .map((message) => message.role)
      .lastIndexOf("user");
    const history =
      error && failedTurn >= 0 ? messages.slice(0, failedTurn) : messages;
    const next = [
      ...history.filter((message) => message.content.trim()),
      { role: "user" as const, content: text },
    ];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError("");
    setRag([]);
    setPubmed([]);
    setModel("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          clientId: (lockedClientId ?? selectedId) || undefined,
        }),
      });
      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error ?? (await res.text()) ?? "Lỗi kết nối");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line) as {
            type: string;
            text?: string;
            model?: string;
            rag?: RagHit[];
            pubmed?: PubMedPaper[];
            error?: string;
          };
          if (evt.type === "meta") {
            setRag(evt.rag ?? []);
            setPubmed(evt.pubmed ?? []);
            setModel(evt.model ?? "");
          } else if (evt.type === "token") {
            assistant += evt.text ?? "";
            setMessages([...next, { role: "assistant", content: assistant }]);
          } else if (evt.type === "error") {
            setError(evt.error ?? "Lỗi xử lý");
          }
        }
        scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được câu hỏi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="panel flex min-h-[660px] flex-col overflow-hidden"
      aria-label="Phiên tư vấn chuyên môn"
    >
      <div className="px-5 pt-4"><ClinicalEvidencePanel evidence={ASSISTANT_EVIDENCE} title="Nguồn, phạm vi và giới hạn trợ lý" /></div>
      <div className="border-b border-rule px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-cobalt-soft text-cobalt">
              <Icon name="message" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {lockedClientId ? "Tư vấn theo hồ sơ" : "Phiên tư vấn"}
              </h2>
              <p className="mt-0.5 text-xs text-slate">
                Nguồn theo chủ đề · Cần kiểm tra từng câu trả lời
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMessages([]);
                setRag([]);
                setPubmed([]);
                setModel("");
                setError("");
                composer.current?.focus();
              }}
              className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-slate hover:text-cobalt disabled:opacity-50"
            >
              <Icon name="refresh" className="size-3.5" />
              Phiên mới
            </button>
          )}
        </div>
        {!lockedClientId && (
          <div className="mt-4 rounded-xl border border-rule bg-canvas px-3.5 py-3">
            <label className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
              <span className="flex shrink-0 items-center gap-2 font-medium text-slate">
                <Icon name="users" className="size-4" />
                Hồ sơ học viên
              </span>
              <select
                aria-label="Chọn hồ sơ học viên"
                value={selectedId}
                disabled={clientsLoading || busy}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setVisualRegionId(null);
                }}
                className="min-h-10 w-full min-w-0 flex-1 px-2.5 py-2 text-xs font-medium text-ink"
              >
                <option value="">
                  {clientsLoading
                    ? "Đang tải hồ sơ…"
                    : "Tra cứu chung · Không gắn hồ sơ"}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age ?? "?"} tuổi)
                  </option>
                ))}
              </select>
            </label>
            {clientsError && (
              <p className="mt-2 text-xs text-crimson" role="status">
                Chưa tải được hồ sơ.{" "}
                <Link href="/clients" className="underline underline-offset-2">
                  Mở trang Học viên để thử lại
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </div>

      {activeClient && (
        <div className="border-b border-caution/20 bg-caution-soft/60 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <h3 className="flex items-center gap-2 font-semibold text-caution">
              <Icon name="shield" className="size-4" />
              Lưu ý trước khi tập · {activeClient.name}
            </h3>
            <Link
              href={`/clients/${activeClient.id}`}
              className="inline-flex min-h-8 items-center gap-1 font-medium text-cobalt"
            >
              Xem hồ sơ
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-ink">
            {activeSafety.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-b border-rule px-5 py-3.5 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate">
            Tham chiếu giải phẫu
          </span>
          <Link
            href="/atlas"
            className="inline-flex min-h-7 items-center gap-1 text-[11px] font-medium text-cobalt"
          >
            Atlas
            <Icon name="external" className="size-3" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ANATOMY_REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={activeVisualRegion?.id === r.id}
              onClick={() =>
                setVisualRegionId(visualRegionId === r.id ? null : r.id)
              }
              className={`min-h-9 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${activeVisualRegion?.id === r.id ? "border-cobalt/20 bg-cobalt-soft text-cobalt" : "border-rule bg-sheet text-slate hover:border-cobalt/40 hover:text-cobalt"}`}
            >
              {REGION_CHIP[r.id]}
            </button>
          ))}
        </div>
        {activeVisualRegion && (
          <details
            key={activeVisualRegion.id}
            className="mt-3 rounded-xl border border-rule bg-canvas px-3.5"
          >
            <summary className="py-3 text-xs font-medium text-cobalt">
              Xem sơ đồ · {activeVisualRegion.name}
            </summary>
            <div className="space-y-3 pb-3">
              <JointDiagramSvg regionId={activeVisualRegion.id} />
              <p className="text-xs leading-6 text-slate">
                {activeVisualRegion.biomechanicsKey}
              </p>
            </div>
          </details>
        )}
      </div>

      <div
        ref={scroller}
        role="log"
        aria-label="Nội dung phiên tư vấn"
        aria-busy={busy}
        className={`flex-1 space-y-5 overflow-y-auto px-5 py-2 sm:px-6 ${messages.length > 0 ? "max-h-[62dvh] min-h-[320px] py-6" : ""}`}
      >
        {messages.map((m, idx) =>
          m.role === "assistant" && !m.content && !busy ? null : (
            <article
              key={`${m.role}-${idx}`}
              className={`[overflow-wrap:anywhere] ${m.role === "user" ? "ml-auto max-w-[92%] rounded-2xl rounded-tr-sm border border-cobalt/10 bg-cobalt-soft px-4 py-3.5" : "rounded-xl py-2"}`}
            >
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span
                  className={`flex size-6 items-center justify-center rounded-md text-[9px] font-semibold ${m.role === "user" ? "bg-cobalt/10 text-cobalt" : "bg-cleared-soft text-cleared"}`}
                >
                  {m.role === "user" ? (
                    "PT"
                  ) : (
                    <Icon name="activity" className="size-3.5" />
                  )}
                </span>
                <span className="font-semibold text-ink">
                  {m.role === "user"
                    ? "Câu hỏi của bạn"
                    : "Phân tích lâm sàng & vận động"}
                </span>
              </div>
              {m.role === "assistant" && m.content ? (
                <MarkdownAnswer text={m.content} className="text-sm" />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-7 text-ink">
                  {m.content ||
                    (busy ? (
                      <span className="inline-flex items-center gap-2 text-xs text-slate">
                        <Icon name="spinner" className="size-4 animate-spin" />
                        Đang đối chiếu y văn và hồ sơ…
                      </span>
                    ) : (
                      ""
                    ))}
                </div>
              )}
            </article>
          ),
        )}
      </div>
      {error && (
        <div role="alert" className="alert-error mx-5 my-3 sm:mx-6">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="alert" className="size-4" />
            Chưa thể hoàn tất phân tích
          </p>
          <p className="mt-1 text-xs">{error}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const lastIndex = messages.map((m) => m.role).lastIndexOf("user");
              const last = messages[lastIndex];
              if (last) {
                setInput(last.content);
                setMessages(messages.slice(0, lastIndex));
                setRag([]);
                setPubmed([]);
                setModel("");
                setError("");
                composer.current?.focus();
              }
            }}
            className="mt-2 min-h-9 text-xs font-semibold underline underline-offset-4"
          >
            Đưa câu hỏi về ô nhập để thử lại
          </button>
        </div>
      )}

      {(rag.length > 0 || pubmed.length > 0) && (
        <details className="mx-5 my-3 rounded-xl border border-rule bg-canvas px-4 text-xs sm:mx-6">
          <summary className="py-3 font-semibold text-ink">
            Nguồn tham chiếu · {rag.length + pubmed.length} tài liệu
          </summary>
          <div className="grid max-h-60 gap-2 overflow-y-auto pb-4 sm:grid-cols-2">
            {rag.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-rule bg-sheet p-3"
              >
                <p className="font-medium text-ink">
                  {h.title}
                  {h.page != null ? ` · Trang ${h.page}` : ""}
                </p>
                <p className="mt-1 line-clamp-2 leading-5 text-slate">
                  {h.content}
                </p>
              </div>
            ))}
            {pubmed.map((p) => (
              <a
                key={p.pmid}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-rule bg-sheet p-3 hover:border-cobalt"
              >
                <span className="flex items-center justify-between gap-2 font-mono text-[10px] text-cobalt">
                  PMID {p.pmid} · {p.year}
                  <Icon name="external" className="size-3" />
                </span>
                <p className="mt-1 line-clamp-2 font-medium leading-5 text-ink">
                  {p.title}
                </p>
              </a>
            ))}
          </div>
        </details>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendText(input);
        }}
        className="mt-auto border-t border-rule bg-canvas/50 px-4 py-4 sm:px-5"
      >
        <label htmlFor={composerId} className="sr-only">
          Nội dung câu hỏi chuyên môn
        </label>
        <div className="chat-composer overflow-hidden rounded-xl border border-rule-strong bg-sheet p-3 transition-shadow">
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
                void sendText(input);
              }
            }}
            rows={3}
            placeholder={placeholder}
            className="block w-full resize-y px-1 py-1 text-[13px] leading-6"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3">
            <span className="text-[10px] leading-5 text-slate">
              Enter để gửi <span className="mx-1">·</span> Shift + Enter xuống
              dòng
            </span>
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="button-primary ml-auto"
            >
              <Icon
                name={busy ? "spinner" : "send"}
                className={`size-4 ${busy ? "animate-spin" : ""}`}
              />
              {busy ? "Đang phân tích…" : "Phân tích"}
            </button>
          </div>
        </div>
        <p className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-xs leading-5 text-slate">
          <span>Luôn đối chiếu kết quả với đánh giá trực tiếp học viên.</span>
          {model && (
            <span className="max-w-full truncate font-mono" title={model}>
              {model}
            </span>
          )}
        </p>
      </form>
    </section>
  );
}
