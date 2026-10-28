import { chatStream, pickChatModel } from "@/lib/ai/openrouter";
import {
  CLINICAL_PT_SYSTEM,
  clientContextBlock,
  evidenceBlock,
  studyContextBlock,
} from "@/lib/ai/prompts/clinical-pt-system";
import { formatClient, safetyNotes } from "@/lib/clinical/safety";
import { selectCuratedEvidence, formatCuratedEvidence, normalizeEvidenceQuery } from "@/lib/clinical/evidence-registry";
import { readLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";
import { formatPubMed, searchPubMed } from "@/lib/tools/pubmed";
import { formatRag, retrieveKnowledge } from "@/lib/tools/rag-search";
import { readSseData } from "@/lib/ai/stream-events";
import type {
  BiomarkerRecord,
  ChatMessage,
  Client,
  PubMedPaper,
} from "@/lib/types";

export const maxDuration = 90;

const CHAT_MODEL_CHOICES = ["google/gemini-2.5-flash", "google/gemini-3.8-flash"] as const;

function chosenChatModel(requested: unknown, fallback: string) {
  return typeof requested === "string" &&
    (CHAT_MODEL_CHOICES as readonly string[]).includes(requested)
    ? requested
    : fallback;
}

// Public search receives only fixed topic vocabulary, never the raw question,
// stored client profile, laboratory values, medication list, or document text.
const PUBLIC_LITERATURE_TOPICS: readonly [RegExp, string][] = [
  [/\b(insulin|metformin|sglt2|diabetes)\b/, "exercise diabetes medication"],
  [/\b(thuoc|medication|beta blocker|statin|anticoagulant)\b/, "exercise medication safety"],
  [/\b(xet nghiem|laboratory|biomarker|inbody)\b/, "laboratory reference intervals interpretation"],
  [/\b(trigger point|diem dau|massage|palpation)\b/, "myofascial trigger point systematic review"],
  [/\b(rom|tam van dong|goniometer|range of motion)\b/, "joint range of motion measurement reliability"],
  [/\b(vai|shoulder|rotator cuff|deltoid)\b/, "shoulder exercise rehabilitation"],
  [/\b(goi|knee|quadriceps|hamstring)\b/, "knee exercise rehabilitation"],
  [/\b(hong|hip|gluteus|gluteal)\b/, "hip gluteal muscle exercise"],
  [/\b(dau lung|that lung|lumbar|spine|back pain)\b/, "low back pain exercise guideline"],
  [/\b(cervical|neck|cot song co)\b/, "neck pain exercise guideline"],
  [/\b(co chan|ankle|foot|calf|soleus|gastrocnemius)\b/, "ankle foot exercise"],
  [/\b(phi dai|hypertrophy|resistance training)\b/, "resistance training muscle hypertrophy systematic review"],
  [/\b(sang loc|screening|parq|csep)\b/, "physical activity preparticipation screening"],
];

function publicLiteratureQuery(question: string) {
  const normalized = normalizeEvidenceQuery(question.slice(0, 4000));
  return PUBLIC_LITERATURE_TOPICS.filter(([pattern]) => pattern.test(normalized))
    .slice(0, 2).map(([, topic]) => topic).join(" ");
}

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: "Chưa cấu hình OPENROUTER_API_KEY" }, { status: 503 });
  }
  let body: { messages: ChatMessage[]; clientId?: string; studyPage?: string; model?: string };
  try {
    const input = await req.json();
    if (!input || typeof input !== "object" || !Array.isArray(input.messages) ||
        input.messages.length < 1 || input.messages.length > 48 || JSON.stringify(input).length > 240000 ||
        input.messages.some((m: unknown) => !m || typeof m !== "object" ||
          !["user", "assistant"].includes((m as ChatMessage).role) ||
          typeof (m as ChatMessage).content !== "string" || (m as ChatMessage).content.length > 20000) ||
        (input.studyPage != null && (typeof input.studyPage !== "string" || input.studyPage.length > 500)) ||
        (input.model != null && (typeof input.model !== "string" || input.model.length > 80)) ||
        (input.clientId != null && (typeof input.clientId !== "string" || input.clientId.length > 100)) ||
        input.messages.at(-1)?.role !== "user") {
      return Response.json({ error: "Nội dung hội thoại không hợp lệ hoặc quá dài." }, { status: 400 });
    }
    body = { messages: input.messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      clientId: input.clientId || undefined, studyPage: input.studyPage || undefined,
      model: typeof input.model === "string" ? input.model : undefined };
  } catch {
    return Response.json({ error: "Không đọc được nội dung câu hỏi." }, { status: 400 });
  }
  const messages = body.messages;
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!last.trim()) return Response.json({ error: "Thiếu câu hỏi" }, { status: 400 });

  let client: Client | null = null;
  let labsText = "";
  if (body.clientId) {
    if (hasSupabase()) {
      const db = supabase();
      const [{ data: c }, { data: labs }] = await Promise.all([
        db.from("clients").select("*").eq("id", body.clientId).single(),
        db
          .from("biomarker_records")
          .select("*")
          .eq("client_id", body.clientId)
          .order("recorded_at", { ascending: false })
          .limit(4),
      ]);
      client = (c as Client) ?? null;
      labsText = ((labs ?? []) as BiomarkerRecord[])
        .map((r) => `${r.recorded_at} (${r.kind}): ${JSON.stringify(r.metrics)}`)
        .join("\n");
    } else {
      const store = readLocalStore();
      client = store.clients.find((c) => c.id === body.clientId) ?? null;
      labsText = store.biomarkers
        .filter((b) => b.client_id === body.clientId)
        .slice(0, 4)
        .map((r) => `${r.recorded_at} (${r.kind}): ${JSON.stringify(r.metrics)}`)
        .join("\n");
    }
  }

  // Preserve a short topic history for follow-ups; public search still receives
  // fixed vocabulary derived from the current question only, never that history.
  const prior = messages.filter(m => m.role === "user").slice(-3, -1).map(m => m.content.slice(-800));
  const retrievalQuery = [...prior, last.slice(-4000)].join("\n");
  const curated = selectCuratedEvidence(retrievalQuery);
  const publicQuery = publicLiteratureQuery(last);
  const publicSearch = { query: publicQuery || null, scope: "fixed-topic-vocabulary", skipped: !publicQuery };
  const [knowledge, literature] = await Promise.all([
    retrieveKnowledge(retrievalQuery),
    publicQuery
      ? searchPubMed(publicQuery, 5).then(papers => ({ papers, status: papers.length ? "ready" : "no_matches" }))
        .catch(() => ({ papers: [] as PubMedPaper[], status: "error" }))
      : Promise.resolve({ papers: [] as PubMedPaper[], status: "skipped" }),
  ]);
  const { hits: rag, retrieval } = knowledge;
  const pubmed = literature.papers;
  const sourceStatus = { rag: retrieval, pubmed: { status: literature.status,
    message: literature.status === "error" ? "Chưa tra cứu được PubMed trong lượt này." :
      literature.status === "no_matches" ? "PubMed chưa trả về bài phù hợp với chủ đề tra cứu." :
      literature.status === "skipped" ? "Chủ đề này chưa có truy vấn PubMed cố định; chưa tìm nguồn công khai." :
      "Kết quả PubMed gồm thông tin bài và abstract nếu có, không đồng nghĩa đã đọc toàn văn." } };

  const system = [
    CLINICAL_PT_SYSTEM,
    client
      ? clientContextBlock(
          [formatClient(client), labsText ? `Xét nghiệm/InBody:\n${labsText}` : ""]
            .filter(Boolean)
            .join("\n"),
          safetyNotes(client),
        )
      : "",
    typeof body.studyPage === "string" ? studyContextBlock(body.studyPage) : "",
    formatCuratedEvidence(curated),
    evidenceBlock(formatRag(rag), formatPubMed(pubmed)),
    `TRẠNG THÁI NGUỒN CỦA LƯỢT NÀY\nKho toàn văn: ${retrieval.status}. ${retrieval.message}\nPubMed: ${sourceStatus.pubmed.status}. ${sourceStatus.pubmed.message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const model = chosenChatModel(body.model, pickChatModel({ clientId: body.clientId, text: last }));
  const orMessages = [
    { role: "system" as const, content: system },
    ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
  ];

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await chatStream({ model, messages: orMessages, signal: req.signal });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error && err.name === "TimeoutError" ? "Model chưa phản hồi kịp. Vui lòng thử lại." : "Chưa kết nối được model trả lời. Vui lòng thử lại." },
      { status: 502 },
    );
  }
  const encoder = new TextEncoder();
  let assistant = "";
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "meta", model, rag, pubmed, curated, publicSearch, sourceStatus }) + "\n"),
      );
      try {
        let complete = false;
        for await (const data of readSseData(upstream)) {
          if (cancelled) return;
          if (data === "[DONE]") break;
          let json: {
            error?: unknown;
            choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
          };
          try { json = JSON.parse(data); } catch { throw new Error("Phản hồi model không hợp lệ. Vui lòng thử lại."); }
          if (json.error) throw new Error("Model bị gián đoạn; câu trả lời có thể chưa hoàn tất.");
          for (const choice of json.choices ?? []) {
            if (choice.finish_reason === "length") throw new Error("Câu trả lời chạm giới hạn độ dài. Hãy chia câu hỏi thành phần nhỏ hơn.");
            if (choice.finish_reason && choice.finish_reason !== "stop") throw new Error("Model chưa hoàn tất câu trả lời. Vui lòng thử lại hoặc diễn đạt câu hỏi khác.");
            if (choice.finish_reason === "stop") complete = true;
            const text = choice.delta?.content ?? "";
            if (!text) continue;
            assistant += text;
            controller.enqueue(encoder.encode(JSON.stringify({ type: "token", text }) + "\n"));
          }
        }
        if (!complete || !assistant.trim()) throw new Error("Kết nối kết thúc trước khi nhận đủ câu trả lời. Vui lòng thử lại.");
        const suppliedRagIds = new Set(rag.map(hit => hit.id));
        const citedRag = [...assistant.matchAll(/\bRAG:([^\s,\];)]+)/g)].map(match => match[1].replace(/[.:]+$/, ""));
        const citationAudit = { unsupportedRagReferences: citedRag.filter(id => !suppliedRagIds.has(id)).length };
        if (citationAudit.unsupportedRagReferences > 0) controller.enqueue(encoder.encode(JSON.stringify({
          type: "warning", text: "Có mã trích dẫn RAG không khớp đoạn nguồn đã cung cấp. Hãy đối chiếu danh sách nguồn trước khi sử dụng câu trả lời.",
        }) + "\n"));
        if (body.clientId && hasSupabase() && assistant) {
          const { error: saveError } = await supabase().from("consultations").insert([
            { client_id: body.clientId, role: "user", content: last, citations: [] },
            {
              client_id: body.clientId,
              role: "assistant",
              content: assistant,
              citations: { rag, pubmed, model, curated, publicSearch, sourceStatus, citationAudit },
            },
          ]);
          if (saveError) controller.enqueue(encoder.encode(JSON.stringify({ type: "warning", text: "Câu trả lời đã hiển thị nhưng chưa lưu được vào hồ sơ." }) + "\n"));
        }
        controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
      } catch (err) {
        if (!cancelled) controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: err instanceof Error ? err.message : "Lỗi stream",
            }) + "\n",
          ),
        );
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() { cancelled = true; },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
