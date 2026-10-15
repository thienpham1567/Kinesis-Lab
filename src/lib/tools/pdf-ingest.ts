import { extractText, getDocumentProxy } from "unpdf";
import { embedTexts } from "@/lib/ai/openrouter";
import { supabase } from "@/lib/supabase/server";

const CHUNK = 1400;
const OVERLAP = 180;

export async function ingestPdf(opts: {
  title: string;
  filename: string;
  bytes: Uint8Array;
}) {
  const pdf = await getDocumentProxy(opts.bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [text];
  const chunks = chunkPages(pages);
  if (chunks.length === 0) {
    throw new Error("PDF không có văn bản đọc được (có thể là bản scan ảnh).");
  }

  const { data: doc, error: docErr } = await supabase()
    .from("knowledge_documents")
    .insert({
      title: opts.title,
      filename: opts.filename,
      source_type: "pdf",
      page_count: totalPages,
    })
    .select("id")
    .single();
  if (docErr || !doc) throw new Error(docErr?.message ?? "Không tạo được tài liệu");

  const embeddings = await embedTexts(chunks.map((c) => c.content));
  const rows = chunks.map((c, i) => ({
    document_id: doc.id as string,
    chapter: c.chapter,
    page: c.page,
    content: c.content,
    embedding: embeddings[i],
  }));

  for (let i = 0; i < rows.length; i += 40) {
    const { error } = await supabase().from("knowledge_chunks").insert(rows.slice(i, i + 40));
    if (error) throw new Error(error.message);
  }

  return { documentId: doc.id as string, pages: totalPages, chunks: rows.length };
}

function chunkPages(pages: string[]) {
  const out: { page: number; chapter: string | null; content: string }[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = i + 1;
    const cleaned = pages[i].replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").trim();
    if (cleaned.length < 40) continue;
    const chapter = heading(cleaned);
    if (cleaned.length <= CHUNK) {
      out.push({ page, chapter, content: cleaned });
      continue;
    }
    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(cleaned.length, start + CHUNK);
      out.push({ page, chapter, content: cleaned.slice(start, end).trim() });
      if (end >= cleaned.length) break;
      start = end - OVERLAP;
    }
  }
  return out;
}

function heading(page: string) {
  const first = page.split("\n").map((l) => l.trim()).find((l) => l.length > 3 && l.length < 80);
  return first ?? null;
}
