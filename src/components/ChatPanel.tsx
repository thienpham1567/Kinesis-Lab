"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ANATOMY_REGIONS,
  detectRegionsInText,
  matchClientIssuesToRegions,
  type AnatomyRegionId,
} from "@/lib/clinical/anatomy-atlas";
import { safetyNotes } from "@/lib/clinical/safety";
import type { ChatMessage, Client, PubMedPaper, RagHit } from "@/lib/types";
import { JointDiagramSvg } from "./JointDiagramSvg";

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

const QUICK_CASES = [
  {
    tag: "Cột sống & Thuốc",
    title: "Thoát vị L4-L5 kèm dùng Bisoprolol",
    regionId: "lumbar" as AnatomyRegionId,
    prompt:
      "Học viên nam 42 tuổi bị thoát vị đĩa đệm L4-L5 (đã qua giai đoạn cấp) và tăng huyết áp đang dùng Bisoprolol 5mg. Tôi muốn lên bài tập thân dưới thay thế Barbell Back Squat và chọn ngưỡng cường độ tim mạch an toàn.",
  },
  {
    tag: "Khớp vai",
    title: "Đau mỏm cùng vai khi đẩy qua đầu",
    regionId: "shoulder" as AnatomyRegionId,
    prompt:
      "Học viên đau mặt trước ngoài khớp vai phải ở cung 70–110 độ khi tập Overhead Press, không đau ban đêm. Cần sàng lọc những gì và chọn chuỗi bài tập regression / phục hồi cơ răng trước (serratus anterior) như thế nào?",
  },
  {
    tag: "Khớp gối",
    title: "Đau khớp chè – đùi khi xuống cầu thang",
    regionId: "knee" as AnatomyRegionId,
    prompt:
      "Học viên đau mặt trước khớp gối trái khi đi xuống cầu thang và khi Squat sâu (hội chứng chè – đùi PFPS). Giải thích cơ chế lực nén PFJ và cách điều chỉnh tỷ lệ mô-men Khớp Gối vs Khớp Háng.",
  },
];

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
  const [visualRegionId, setVisualRegionId] = useState<AnatomyRegionId | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/clients")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ignore && ok) setClients(data.clients ?? []);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const activeClient =
    clients.find((c) => c.id === (lockedClientId ?? selectedId)) ?? null;
  const activeSafety = activeClient ? safetyNotes(activeClient).split("\n") : [];

  // Determine the most relevant visual diagram for the current consultation context
  const conversationText = [
    input,
    ...messages.map((m) => m.content),
  ].join(" ");
  const detectedFromText = detectRegionsInText(conversationText);
  const clientAlerts = matchClientIssuesToRegions(activeClient);
  const firstClientRegionId = Object.keys(clientAlerts)[0] as
    | AnatomyRegionId
    | undefined;

  const effectiveRegionId: AnatomyRegionId | null =
    visualRegionId ??
    detectedFromText[0]?.id ??
    firstClientRegionId ??
    null;

  const activeVisualRegion = effectiveRegionId
    ? ANATOMY_REGIONS.find((r) => r.id === effectiveRegionId) ?? null
    : null;

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError("");

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
    <div className="flex min-h-[72dvh] flex-col overflow-hidden rounded-lg border border-rule bg-sheet shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-surface/50 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-sm font-semibold text-ink">
            {lockedClientId
              ? "Hội chẩn theo hồ sơ học viên"
              : "Bàn Tư vấn Lâm sàng & Cơ sinh học"}
          </span>
          {!lockedClientId && (
            <label className="flex items-center gap-2 text-xs text-slate">
              <span>Ngữ cảnh học viên:</span>
              <select
                aria-label="Chọn hồ sơ học viên"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setVisualRegionId(null);
                }}
                className="px-2.5 py-1 text-xs font-medium text-ink"
              >
                <option value="">Tra cứu chuyên môn chung (không gắn hồ sơ)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age ?? "?"}t)
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          {model ? (
            <span className="rounded bg-cobalt-soft px-2 py-0.5 font-mono text-[11px] text-cobalt">
              {model}
            </span>
          ) : (
            <span className="text-xs text-slate">
              Tự động định tuyến Claude / Gemini + PubMed
            </span>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setRag([]);
                setPubmed([]);
                setError("");
              }}
              className="rounded border border-rule-strong bg-sheet px-2.5 py-1 text-xs text-slate hover:text-ink"
            >
              Phiên mới
            </button>
          )}
        </div>
      </div>

      {activeClient && (
        <div className="border-b border-caution/25 bg-caution-soft/70 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-caution">
              Chống chỉ định & Lưu ý tự động cho {activeClient.name}:
            </span>
            <Link
              href={`/clients/${activeClient.id}`}
              className="font-semibold text-cobalt hover:underline"
            >
              Xem Bản đồ Điểm đau & Bệnh án đầy đủ
            </Link>
          </div>
          <ul className="mt-1 space-y-0.5 text-ink">
            {activeSafety.map((line) => (
              <li key={line} className="leading-5">
                • {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Anatomy Strip inside Consultation */}
      <div className="border-b border-rule bg-canvas/70 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display font-semibold text-ink">
              Sơ đồ Giải phẫu trực quan:
            </span>
            {ANATOMY_REGIONS.map((r) => {
              const isSelected = activeVisualRegion?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    setVisualRegionId(
                      visualRegionId === r.id ? null : r.id,
                    )
                  }
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    isSelected
                      ? "bg-cobalt text-white"
                      : "border border-rule bg-sheet text-slate hover:text-ink"
                  }`}
                >
                  {REGION_CHIP[r.id]}
                </button>
              );
            })}
          </div>
          <Link
            href="/atlas"
            className="text-[11px] font-semibold text-cobalt hover:underline"
          >
            Mở toàn bộ Atlas
          </Link>
        </div>

        {activeVisualRegion && (
          <div className="mt-2.5 space-y-2">
            <JointDiagramSvg regionId={activeVisualRegion.id} />
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-rule bg-sheet px-3 py-2 text-xs">
              <p className="text-ink">
                <strong className="text-cobalt">{activeVisualRegion.name}:</strong>{" "}
                {activeVisualRegion.biomechanicsKey}
              </p>
              <button
                type="button"
                onClick={() => setInput(activeVisualRegion.sampleAiPrompt)}
                className="shrink-0 rounded bg-cobalt-soft px-2.5 py-1 font-semibold text-cobalt hover:bg-cobalt hover:text-white"
              >
                Điền câu hỏi mẫu vùng này
              </button>
            </div>
          </div>
        )}
      </div>

      <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="space-y-6 py-2">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                Kiểm tra chống chỉ định trước khi giao bài tập.
              </h2>
              <p className="text-sm leading-relaxed text-slate">
                Mỗi câu trả lời được tách thành 3 tầng: (1) Sàng lọc Cờ Đỏ & Chống chỉ định,
                (2) Cơ chế Giải phẫu – Sinh lý – Cơ sinh học, (3) Giao thức Tập luyện
                (Regression / Progression, Tempo, RPE) kèm sơ đồ cấu trúc khớp trực quan.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate">
                Tình huống mẫu thường gặp tại phòng tập (nhấn để nạp câu hỏi & mở sơ đồ khớp):
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {QUICK_CASES.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setInput(item.prompt);
                      setVisualRegionId(item.regionId);
                    }}
                    className="flex flex-col justify-between rounded-md border border-rule bg-canvas/70 p-3.5 text-left transition-colors hover:border-cobalt hover:bg-cobalt-soft/30"
                  >
                    <div>
                      <span className="inline-block rounded bg-cobalt-soft px-2 py-0.5 text-[11px] font-semibold text-cobalt">
                        {item.tag}
                      </span>
                      <p className="mt-2 font-display text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate">
                        {item.prompt}
                      </p>
                    </div>
                    <span className="mt-3 text-xs font-medium text-cobalt">
                      Xem sơ đồ khớp & Nạp câu hỏi
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <article
              key={`${m.role}-${idx}`}
              className={
                m.role === "user"
                  ? "ml-auto max-w-2xl rounded-lg border border-cobalt/20 bg-cobalt-soft/60 px-4 py-3"
                  : "rounded-lg border border-rule bg-canvas/50 px-4 py-4 sm:px-5"
              }
            >
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span
                  className={
                    m.role === "user"
                      ? "font-semibold text-cobalt"
                      : "font-display font-semibold text-cleared"
                  }
                >
                  {m.role === "user" ? "Câu hỏi của PT" : "Phân tích Lâm sàng & Vận động"}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-[15px] leading-7 text-ink">
                {m.content || (busy ? "Đang đối chiếu y văn PubMed và hồ sơ bệnh lý..." : "")}
              </div>
            </article>
          ))
        )}

        {error && (
          <div className="rounded-md border border-crimson/30 bg-crimson-soft px-4 py-3 text-sm text-crimson">
            <p className="font-semibold">Không thể hoàn tất truy vấn</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        )}
      </div>

      {(rag.length > 0 || pubmed.length > 0) && (
        <aside className="max-h-44 overflow-y-auto border-t border-rule bg-surface/70 px-4 py-3 text-xs">
          <p className="mb-2 font-display font-semibold text-ink">
            Nguồn y văn & giáo trình đã đối chiếu ({rag.length + pubmed.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {rag.map((h) => (
              <div key={h.id} className="rounded border border-rule bg-sheet p-2">
                <p className="font-medium text-ink">
                  {h.title} {h.page != null ? `(Trang ${h.page})` : ""}
                </p>
                <p className="mt-0.5 line-clamp-2 text-slate">{h.content}</p>
              </div>
            ))}
            {pubmed.map((p) => (
              <a
                key={p.pmid}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded border border-rule bg-sheet p-2 transition-colors hover:border-cobalt"
              >
                <span className="font-mono text-[11px] font-semibold text-cobalt">
                  PMID {p.pmid} ({p.year})
                </span>
                <p className="mt-0.5 line-clamp-2 font-medium text-ink">{p.title}</p>
              </a>
            ))}
          </div>
        </aside>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendText(input);
        }}
        className="border-t border-rule bg-sheet p-3 sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            aria-label="Nội dung câu hỏi chuyên môn"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendText(input);
              }
            }}
            rows={2}
            placeholder={placeholder}
            className="flex-1 resize-none px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-md bg-cobalt px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-95 disabled:bg-surface disabled:text-slate disabled:opacity-100"
          >
            {busy ? "Đang phân tích..." : "Phân tích"}
          </button>
        </div>
      </form>
    </div>
  );
}
