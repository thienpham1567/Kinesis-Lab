import { normalizeLabExtraction } from "@/lib/clinical/lab-extraction";
import { extractText, getDocumentProxy } from "unpdf";
import { chatComplete, MODELS } from "@/lib/ai/openrouter";
import { LAB_EXTRACT_PROMPT } from "@/lib/ai/prompts/clinical-pt-system";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: "Chưa cấu hình OPENROUTER_API_KEY" }, { status: 503 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Thiếu ảnh/PDF phiếu xét nghiệm hoặc InBody" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  let userContent:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;

  if (isPdf) {
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    if (String(text).trim().length < 20) {
      return Response.json(
        { error: "PDF là bản scan ảnh — chụp màn hình hoặc xuất JPG/PNG rồi tải lại." },
        { status: 422 },
      );
    }
    userContent = `Đọc phiếu (${file.name}):\n\n${String(text).slice(0, 24000)}`;
  } else {
    const mime = file.type || "image/jpeg";
    userContent = [
      { type: "text", text: `Đọc phiếu: ${file.name}` },
      { type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}` } },
    ];
  }

  let raw: string;
  try {
    raw = await chatComplete({
      model: MODELS.vision,
      json: true,
      messages: [
        { role: "system", content: LAB_EXTRACT_PROMPT },
        { role: "user", content: userContent } as never,
      ],
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "OpenRouter lỗi" },
      { status: 502 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "").trim());
  } catch {
    return Response.json({ error: "Không parse được kết quả Vision", raw }, { status: 502 });
  }
  try {
    return Response.json(normalizeLabExtraction(parsed));
  } catch (err) {
    return Response.json({error: err instanceof Error ? err.message : "Cần kiểm tra phiếu gốc"}, {status:422});
  }
}
