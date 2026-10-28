export const MODELS = {
  clinical:
    process.env.OPENROUTER_MODEL_CLINICAL ?? "google/gemini-3.8-flash",
  vision: process.env.OPENROUTER_MODEL_VISION ?? "google/gemini-2.5-pro",
  fast: process.env.OPENROUTER_MODEL_FAST ?? "google/gemini-3.8-flash",
  embedding:
    process.env.OPENROUTER_MODEL_EMBEDDING ?? "google/gemini-embedding-2",
} as const;

// This dimension and formatting version define a vector space. Never compare
// vectors from another model or from the old unprefixed ingestion pipeline.
export const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_NAMESPACE = `evidence-v1:${MODELS.embedding}:${EMBEDDING_DIMENSIONS}:qa-v1`;

export type ChatTask = "clinical_reasoning" | "vision_extraction" | "fast_rag";

export function modelFor(task: ChatTask) {
  if (task === "clinical_reasoning") return MODELS.clinical;
  if (task === "vision_extraction") return MODELS.vision;
  return MODELS.fast;
}

export function pickChatModel(input: { clientId?: string; text: string }) {
  const t = input.text.toLowerCase();
  const clinical =
    Boolean(input.clientId) ||
    /đau|chấn thương|thoát vị|cột sống|khớp|huyết áp|tiểu đường|đái tháo đường|red flag|cờ đỏ|rehab|phục hồi|chống chỉ định|thuốc|inbody|xét nghiệm|tim mạch|ung thư|choáng|tê bì|mất sức/.test(
      t,
    );
  return clinical ? MODELS.clinical : MODELS.fast;
}

function apiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Thiếu OPENROUTER_API_KEY");
  return key;
}

function headers() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://pt-medical-agent.local",
    "X-Title": "PT Medical Agent",
  };
}

export type OrMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

export async function chatComplete(opts: {
  model: string;
  messages: OrMessage[];
  temperature?: number;
  json?: boolean;
}) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      ...samplingOptions(opts.model, opts.temperature),
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function chatStream(opts: {
  model: string;
  messages: OrMessage[];
  temperature?: number;
  signal?: AbortSignal;
}) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: headers(),
    signal: opts.signal ? AbortSignal.any([opts.signal, AbortSignal.timeout(50000)]) : AbortSignal.timeout(50000),
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      ...samplingOptions(opts.model, opts.temperature),
      max_tokens: 4096,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  return res.body;
}

function samplingOptions(model: string, temperature = 0.2) {
  // Claude 5.5 supports adaptive reasoning, but does not advertise temperature.
  return /^anthropic\/claude-(haiku|sonnet|opus)-5/.test(model)
    ? {}
    : { temperature };
}

export async function embedTexts(
  texts: string[],
  options: { task?: "query" | "document"; titles?: string[] } = {},
) {
  if (texts.length === 0) return [] as number[][];
  if (options.titles && options.titles.length !== texts.length) {
    throw new Error("Embedding titles must match input count");
  }
  if (texts.some((text) => typeof text !== "string" || !text.trim())) {
    throw new Error("Embedding input must contain nonempty text");
  }
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 8) {
    const batch = texts.slice(i, i + 8).map((text, j) => {
      if (MODELS.embedding !== "google/gemini-embedding-2") return text;
      return options.task === "query"
        ? `task: question answering | query: ${text}`
        : `title: ${options.titles?.[i + j] ?? "none"} | text: ${text}`;
    });
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: headers(),
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({ model: MODELS.embedding, dimensions: EMBEDDING_DIMENSIONS, input: batch }),
    });
    if (!res.ok) {
      throw new Error(`OpenRouter embed ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      data: { embedding: number[]; index: number }[];
    };
    if (!Array.isArray(data.data) || data.data.length !== batch.length) {
      throw new Error("Embedding response count does not match inputs");
    }
    const ordered = [...data.data].sort((a, b) => a.index - b.index);
    for (const [index, row] of ordered.entries()) {
      if (row.index !== index) throw new Error("Embedding index is missing or duplicated");
      if (!Array.isArray(row.embedding) || row.embedding.length !== EMBEDDING_DIMENSIONS ||
          row.embedding.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
        throw new Error("Embedding vector has invalid dimensions or values");
      }
      const norm = Math.hypot(...row.embedding);
      if (!Number.isFinite(norm) || norm <= 0) throw new Error("Embedding vector has invalid norm");
      out.push(row.embedding.map((value) => value / norm));
    }
  }
  return out;
}

export function parseSseToken(chunk: string) {
  let token = "";
  for (const line of chunk.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload) as {
        choices?: { delta?: { content?: string } }[];
      };
      token += json.choices?.[0]?.delta?.content ?? "";
    } catch {
      // ponytail: skip malformed sse fragments at stream boundaries
    }
  }
  return token;
}
