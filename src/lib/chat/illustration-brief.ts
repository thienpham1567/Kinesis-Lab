import type { ChatIllustrationBrief, ChatImageClaim, ChatImageSource } from "./illustration-types";
import { MEDICAL_ILLUSTRATION_PRETEXT } from "./medical-illustration-policy";

const SUBJECTS = new Set(["anatomy", "movement", "comparison"]);
const ALLOWED = [
  "title",
  "subjectKind",
  "visualDescription",
  "imageText",
  "imageExplanation",
  "claimIds",
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
  const result = value.trim();
  if (result.length > max) throw new BriefError(`${label} quá dài; giới hạn ${max} ký tự.`);
  return result;
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
  allowedClaims: ChatImageClaim[] = [],
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
  if (!Array.isArray(imageText) || imageText.length < 2 || imageText.length > 8)
    throw new BriefError("Cần 2–8 chú giải trong ảnh.");
  const captions = [...new Set(imageText.map((item, index) =>
    text(item, `Chú giải ${index + 1}`, 120),
  ).filter(line => line !== title))];
  if (captions.length < 2)
    throw new BriefError("Cần 2–8 chú giải khác nhau trong ảnh.");
  const imageExplanation = body.imageExplanation === undefined ? "" : text(body.imageExplanation, "Giải thích trong ảnh", 320);
  if (title.length + captions.join("").length + imageExplanation.length > 900)
    throw new BriefError("Tổng chữ trong ảnh vượt giới hạn 900 ký tự.");
  const sourcesRaw = body.sources;
  if (!Array.isArray(sourcesRaw) || sourcesRaw.length > 8)
    throw new BriefError("Danh sách nguồn không hợp lệ.");
  const allowed = new Map(allowedSources.map(source => [sourceKey(source), source]));
  const sources: ChatImageSource[] = sourcesRaw
    .map(parseSource)
    .flatMap(source => allowed.has(sourceKey(source)) ? [{ ...allowed.get(sourceKey(source))! }] : []);
  const claimIds = body.claimIds;
  if (allowedClaims.length && (!Array.isArray(claimIds) || !claimIds.length || !imageExplanation))
    throw new BriefError("Brief y khoa cần nhận định có nguồn và giải thích trong ảnh.");
  const claims: ChatImageClaim[] = [];
  if (claimIds !== undefined) {
    if (!Array.isArray(claimIds) || claimIds.length > 12 || claimIds.some(id => typeof id !== "string"))
      throw new BriefError("Danh sách claim không hợp lệ.");
    for (const id of new Set(claimIds)) {
      const claim = allowedClaims.find(item => item.id === id);
      if (!claim || claim.sourceIds.some(sourceId => !allowedSources.some(source => source.id === sourceId)))
        throw new BriefError("Nhận định không nằm trong nguồn máy chủ cung cấp.");
      claims.push({ ...claim, sourceIds: [...claim.sourceIds] });
      for (const sourceId of claim.sourceIds) {
        if (!sources.some(source => source.id === sourceId)) sources.push({ ...allowedSources.find(source => source.id === sourceId)! });
      }
    }
  }
  const limitations = Array.isArray(body.limitations)
    ? body.limitations.map((item, index) => text(String(item), `Giới hạn ${index + 1}`, 400))
    : [];
  return {
    title,
    subjectKind: body.subjectKind as ChatIllustrationBrief["subjectKind"],
    visualDescription: text(body.visualDescription, "Mô tả hình", 1600),
    imageText: captions,
    imageExplanation,
    claims,
    explanation: text(body.explanation, "Giải thích", 1600),
    sources,
    limitations,
  };
}

export async function buildChatIllustrationBrief(input: {
  instruction: string;
  selectedContext: string;
  sources: ChatImageSource[];
  claims?: ChatImageClaim[];
  evidenceLimitations?: string[];
  deadlineMs: number;
}): Promise<ChatIllustrationBrief> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new BriefError("Chưa cấu hình OPENROUTER_API_KEY trên máy chủ.");
  const instruction = text(input.instruction, "Mô tả tạo hình", 1600);
  const selectedContext = input.selectedContext.slice(0, 4000);
  const sourceBlock = JSON.stringify({ sources: input.sources, supportedClaims: input.claims ?? [], limitations: input.evidenceLimitations ?? [] });
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
      max_tokens: 2600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${MEDICAL_ILLUSTRATION_PRETEXT}\n\nBạn lập brief, chưa vẽ ảnh. Trả JSON tiếng Việt gồm title (tối đa 60 ký tự), subjectKind (anatomy|movement|comparison), visualDescription (tối đa 1600 ký tự, mô tả hướng nhìn, bên cơ thể, lớp mô, bố cục và đầu mút đường chỉ dẫn), imageText (2–8 nhãn ngắn, mỗi nhãn tối đa 120 ký tự, không lặp tiêu đề), imageExplanation (1–2 câu giải thích trực tiếp trong ảnh, tối đa 320 ký tự), explanation (giải thích đầy đủ bên ngoài ảnh, tối đa 1600 ký tự), claimIds (chỉ ID nhận định đã cấp thực sự hỗ trợ nhãn/giải thích), sources (id/title/url/checkedAt/access từ danh sách đã cấp), limitations (mảng giới hạn cụ thể). Tổng tiêu đề + nhãn + imageExplanation tối đa 900 ký tự. Ưu tiên 4–6 nhãn, không làm dày chữ chỉ để tăng chi tiết. Bảo toàn ý nghĩa các từ phủ định và hướng trước/sau. Nếu có nhận định được cung cấp, phải chọn claimIds và viết imageExplanation; mỗi nhận định y khoa cần nguồn tương ứng. Nếu nguồn chỉ có metadata hoặc không có nhận định phù hợp, chỉ lập sơ đồ khái niệm có giới hạn rõ, không tự thêm điểm bám hay cơ chế y khoa. Không coi yêu cầu hoặc đoạn chọn là nguồn đã xác minh.`,
        },
        {
          role: "user",
          content: JSON.stringify({ userRequest: instruction, selectedContext, evidence: JSON.parse(sourceBlock) }),
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
  const brief = parseChatIllustrationBrief(parsed, input.sources, input.claims);
  brief.limitations = [...new Set([...(input.evidenceLimitations ?? []), ...brief.limitations])];
  return brief;
}

export { BriefError };
