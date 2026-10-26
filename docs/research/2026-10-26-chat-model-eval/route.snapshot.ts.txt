import { chatStream, pickChatModel } from "@/lib/ai/openrouter";
import {
  CLINICAL_PT_SYSTEM,
  clientContextBlock,
  evidenceBlock,
} from "@/lib/ai/prompts/clinical-pt-system";
import { formatClient, safetyNotes } from "@/lib/clinical/safety";
import { selectCuratedEvidence, formatCuratedEvidence, normalizeEvidenceQuery } from "@/lib/clinical/evidence-registry";
import { readLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";
import { formatPubMed, searchPubMed } from "@/lib/tools/pubmed";
import { formatRag, searchRag } from "@/lib/tools/rag-search";
import type {
  BiomarkerRecord,
  ChatMessage,
  Client,
  PubMedPaper,
  RagHit,
} from "@/lib/types";

export const maxDuration = 90;

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
  const body = (await req.json()) as {
    messages: ChatMessage[];
    clientId?: string;
  };
  const messages = body.messages ?? [];
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

  const curated = selectCuratedEvidence(last);
  const publicQuery = publicLiteratureQuery(last);
  const publicSearch = { query: publicQuery || null, scope: "fixed-topic-vocabulary", skipped: !publicQuery };
  const [rag, pubmed] = await Promise.all([
    hasSupabase()
      ? searchRag(last).catch(() => [] as RagHit[])
      : Promise.resolve([] as RagHit[]),
    publicQuery
      ? searchPubMed(publicQuery, 5).catch(() => [] as PubMedPaper[])
      : Promise.resolve([] as PubMedPaper[]),
  ]);

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
    formatCuratedEvidence(curated),
    evidenceBlock(formatRag(rag), formatPubMed(pubmed)),
  ]
    .filter(Boolean)
    .join("\n\n");

  const model = pickChatModel({ clientId: body.clientId, text: last });
  const orMessages = [
    { role: "system" as const, content: system },
    ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
  ];

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await chatStream({ model, messages: orMessages });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "OpenRouter lỗi" },
      { status: 502 },
    );
  }
  const encoder = new TextEncoder();
  let assistant = "";

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "meta", model, rag, pubmed, curated, publicSearch }) + "\n"),
      );
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const payload = line.trim();
            if (!payload.startsWith("data:")) continue;
            const data = payload.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const text = json.choices?.[0]?.delta?.content ?? "";
              if (!text) continue;
              assistant += text;
              controller.enqueue(encoder.encode(JSON.stringify({ type: "token", text }) + "\n"));
            } catch {
              // incomplete json at boundary
            }
          }
        }
        if (body.clientId && hasSupabase() && assistant) {
          await supabase().from("consultations").insert([
            { client_id: body.clientId, role: "user", content: last, citations: [] },
            {
              client_id: body.clientId,
              role: "assistant",
              content: assistant,
              citations: { rag, pubmed, model, curated, publicSearch },
            },
          ]);
        }
        controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: err instanceof Error ? err.message : "Lỗi stream",
            }) + "\n",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
