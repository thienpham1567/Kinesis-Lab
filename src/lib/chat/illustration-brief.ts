import type { ChatIllustrationBrief, ChatImageSource } from "./illustration-types";

const SUBJECTS = new Set(["anatomy", "movement", "comparison"]);
const ALLOWED = [
  "title",
  "subjectKind",
  "visualDescription",
  "imageText",
  "explanation",
  "sources",
  "limitations",
] as const;

class BriefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BriefError";
  }
}

function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim())
    throw new BriefError(`${label} không hợp lệ.`);
  return value.trim().slice(0, max);
}

function sourceKey(source: ChatImageSource) {
  return `${source.id}\0${source.url}`;
}

function parseSource(raw: unknown): ChatImageSource {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new BriefError("Nguồn không hợp lệ.");
  const row = raw as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.url !== "string" ||
    typeof row.checkedAt !== "string" ||
    typeof row.access !== "string"
  )
    throw new BriefError("Nguồn không hợp lệ.");
  return {
    id: text(row.id, "Mã nguồn", 120),
    title: text(row.title, "Tên nguồn", 240),
    url: text(row.url, "URL nguồn", 500),
    checkedAt: text(row.checkedAt, "Ngày kiểm tra nguồn", 40),
    access: text(row.access, "Phạm vi đọc nguồn", 800),
  };
}

export function parseChatIllustrationBrief(
  raw: unknown,
  allowedSources: ChatImageSource[],
): ChatIllustrationBrief {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new BriefError("Brief JSON không hợp lệ.");
  const rawBody = raw as Record<string, unknown>;
  const body = Object.fromEntries(
    ALLOWED.filter((key) => key in rawBody).map((key) => [key, rawBody[key]]),
  ) as Record<string, unknown>;
  if (!SUBJECTS.has(String(body.subjectKind)))
    throw new BriefError("Loại hình subjectKind không hợp lệ.");
  const title = text(body.title, "Tiêu đề", 60);
  const imageText = body.imageText;
  if (!Array.isArray(imageText) || imageText.length < 2 || imageText.length > 4)
    throw new BriefError("Cần 2–4 chú giải trong ảnh.");
  const captions = imageText.map((item, index) =>
    text(item, `Chú giải ${index + 1}`, 120),
  );
  let total = title.length + captions.join("").length;
  while (total > 550 && captions.length) {
    const last = captions.length - 1;
    captions[last] = captions[last].slice(0, Math.max(0, captions[last].length - (total - 550)));
    if (!captions[last]) captions.pop();
    total = title.length + captions.join("").length;
  }
  if (captions.length < 2)
    throw new BriefError("Cần 2–4 chú giải trong ảnh.");
  const sourcesRaw = body.sources;
  if (!Array.isArray(sourcesRaw) || sourcesRaw.length > 8)
    throw new BriefError("Danh sách nguồn không hợp lệ.");
  const allowed = new Set(allowedSources.map(sourceKey));
  const sources = sourcesRaw
    .map(parseSource)
    .filter((source) => allowed.has(sourceKey(source)));
  const limitations = Array.isArray(body.limitations)
    ? body.limitations.map((item, index) => text(String(item), `Giới hạn ${index + 1}`, 400))
    : [];
  return {
    title,
    subjectKind: body.subjectKind as ChatIllustrationBrief["subjectKind"],
    visualDescription: text(body.visualDescription, "Mô tả hình", 1600),
    imageText: captions,
    explanation: text(body.explanation, "Giải thích", 1600),
    sources,
    limitations,
  };
}

export async function buildChatIllustrationBrief(input: {
  instruction: string;
  selectedContext: string;
  sources: ChatImageSource[];
  deadlineMs: number;
}): Promise<ChatIllustrationBrief> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new BriefError("Chưa cấu hình OPENROUTER_API_KEY trên máy chủ.");
  const instruction = text(input.instruction, "Mô tả tạo hình", 1600);
  const selectedContext = input.selectedContext.slice(0, 4000);
  const sourceBlock = input.sources
    .map(
      (source) =>
        `${source.id}\n${source.title}\n${source.url}\ncheckedAt ${source.checkedAt}\n${source.access}`,
    )
    .join("\n\n");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "Kinesis Lab chat illustration brief",
    },
    signal: AbortSignal.timeout(input.deadlineMs),
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Trả JSON brief minh họa học tập tiếng Việt. Chỉ dùng nguồn được cung cấp. Không thêm khẳng định y khoa mới, không đo lường, không chẩn đoán. Các trường: title, subjectKind (anatomy|movement|comparison), visualDescription, imageText (2-4 chuỗi), explanation, sources (id/title/url/checkedAt/access khớp nguồn đã cho), limitations.",
        },
        {
          role: "user",
          content: `Yêu cầu vẽ:\n${instruction}\n\nNội dung đang học:\n${selectedContext || "(không có đoạn chọn)"}\n\nNGUỒN ĐỐI CHIẾU:\n${sourceBlock || "(không có nguồn; ghi giới hạn, không vẽ nhãn đo lường/chẩn đoán)"}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new BriefError("Chưa chuẩn bị được nội dung hình.");
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "");
  } catch {
    throw new BriefError("Brief JSON không hợp lệ.");
  }
  return parseChatIllustrationBrief(parsed, input.sources);
}

export { BriefError };
