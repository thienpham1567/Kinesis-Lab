import { hasSupabase } from "@/lib/supabase/server";
import { ingestPdf } from "@/lib/tools/pdf-ingest";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return Response.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: "Chưa cấu hình OPENROUTER_API_KEY" }, { status: 503 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  if (!(file instanceof File)) {
    return Response.json({ error: "Thiếu file PDF" }, { status: 400 });
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await ingestPdf({
      title: title || file.name.replace(/\.pdf$/i, ""),
      filename: file.name,
      bytes,
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Nạp PDF thất bại" },
      { status: 422 },
    );
  }
}
