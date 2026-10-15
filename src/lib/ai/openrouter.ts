export const MODELS = {
  clinical:
    process.env.OPENROUTER_MODEL_CLINICAL ?? "anthropic/claude-sonnet-4",
  vision: process.env.OPENROUTER_MODEL_VISION ?? "google/gemini-2.5-pro",
  fast: process.env.OPENROUTER_MODEL_FAST ?? "google/gemini-2.5-flash",
  embedding:
    process.env.OPENROUTER_MODEL_EMBEDDING ?? "openai/text-embedding-3-small",
} as const;

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
      temperature: opts.temperature ?? 0.2,
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
}) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }
  return res.body;
}

export async function embedTexts(texts: string[]) {
  if (texts.length === 0) return [] as number[][];
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 32) {
    const batch = texts.slice(i, i + 32);
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model: MODELS.embedding, input: batch }),
    });
    if (!res.ok) {
      throw new Error(`OpenRouter embed ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      data: { embedding: number[]; index: number }[];
    };
    const ordered = [...data.data].sort((a, b) => a.index - b.index);
    for (const row of ordered) out.push(row.embedding);
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
