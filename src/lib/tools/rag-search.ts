import { embedTexts, MODELS, EMBEDDING_DIMENSIONS, EMBEDDING_NAMESPACE } from "@/lib/ai/openrouter";
import { hasSupabase, supabase } from "@/lib/supabase/server";
import corpus from "@/lib/knowledge/corpus.json";
import type { RagHit, RetrievalState } from "@/lib/types";

export async function retrieveKnowledge(query: string, matchCount = 6): Promise<{ hits: RagHit[]; retrieval: RetrievalState }> {
  const base = { model: MODELS.embedding, dimensions: EMBEDDING_DIMENSIONS };
  const result = (status: RetrievalState["status"], message: string, documents = 0, hits: RagHit[] = []) =>
    ({ hits, retrieval: { ...base, status, message, documents } });
  if (!hasSupabase()) return result("unavailable", "Kho tài liệu chưa được cấu hình; đang dùng nguồn đối chiếu của app.");
  if (corpus.namespace !== EMBEDDING_NAMESPACE) return result("incompatible", "Cấu hình embedding chưa khớp kho nguồn; cần lập chỉ mục lại trước khi truy xuất.");
  try {
    const db = supabase();
    const { data, error } = await db.from("knowledge_documents").select("id,source_type");
    if (error) throw new Error("Corpus metadata query failed");
    const documents = (data ?? []) as { id: string; source_type: string }[];
    if (!documents.length) return result("empty", "Kho toàn văn chưa có tài liệu. Câu trả lời dùng nguồn đối chiếu khác được liệt kê.");
    // The existing RPC searches the whole table. Refuse heterogeneous vectors
    // before calling it, even when their dimensions are identical.
    if (documents.some(doc => doc.source_type !== EMBEDDING_NAMESPACE || !corpus.sources.some(source => source.documentId === doc.id))) {
      return result("incompatible", "Kho chứa tài liệu từ cấu hình embedding khác hoặc phiên bản chưa đăng ký; chưa dùng các vector này.");
    }
    const expected = corpus.sources.reduce((sum, source) => sum + source.chunkCount, 0);
    const { count, error: countError } = await db.from("knowledge_chunks").select("id", { count: "exact", head: true })
      .in("document_id", corpus.sources.map(source => source.documentId)).not("embedding", "is", null);
    if (countError) throw new Error("Corpus completeness query failed");
    if (documents.length !== corpus.sources.length || count !== expected) {
      return result("indexing", "Kho nguồn đang nạp hoặc chưa hoàn tất lập chỉ mục; tạm dùng nguồn đối chiếu khác.", documents.length);
    }
    const [embedding] = await embedTexts([query.slice(0, 6000)], { task: "query" });
    const limit = Number.isFinite(matchCount) ? Math.min(8, Math.max(1, Math.floor(matchCount))) : 6;
    const { data: matched, error: matchError } = await db.rpc("match_knowledge", {
      query_embedding: embedding, query_text: query.slice(0, 4000), match_count: limit,
    });
    if (matchError) throw new Error("Vector retrieval failed");
    const hits = ((matched ?? []) as RagHit[]).filter(hit =>
      Number.isFinite(hit.score) && hit.score >= 0.32 && corpus.sources.some(source => source.documentId === hit.document_id),
    ).map(hit => {
      const source = corpus.sources.find(source => source.documentId === hit.document_id)!;
      return { ...hit, title: source.title, url: source.canonicalUrl, doi: source.doi, year: source.year,
        license: source.license, licenseUrl: source.licenseUrl, authors: source.authors, checkedAt: source.checkedAt, access: source.access, sourceKind: source.kind };
    });
    return hits.length
      ? result("ready", "Đã truy xuất các đoạn toàn văn theo chủ đề; từng nhận định vẫn cần đối chiếu nguồn.", documents.length, hits)
      : result("no_matches", "Chưa tìm thấy đoạn toàn văn đủ liên quan trong kho hiện có.", documents.length);
  } catch {
    return result("error", "Chưa truy xuất được kho toàn văn; câu trả lời chỉ dùng những nguồn khác thực sự có bên dưới.");
  }
}

export async function searchRag(query: string, matchCount = 6): Promise<RagHit[]> {
  return (await retrieveKnowledge(query, matchCount)).hits;
}

export function formatRag(hits: RagHit[]) {
  return hits.map(hit => {
    const location = [hit.title, hit.chapter, hit.page != null ? `Trang ${hit.page}` : null].filter(Boolean).join(" — ");
    return `[RAG:${hit.id}] ${location}\n${hit.url ?? ""}\nTác giả: ${hit.authors?.join(", ") ?? "Xem bài gốc"}; ${hit.license ?? ""} ${hit.licenseUrl ?? ""}\nNăm: ${hit.year ?? "chưa rõ"}; loại: ${hit.sourceKind ?? "đoạn tài liệu"}; kiểm tra: ${hit.checkedAt ?? "chưa ghi"}\nPhạm vi: ${hit.access ?? "Chỉ đoạn văn được cung cấp, không suy đã đọc cả tài liệu."}\n${hit.content}`;
  }).join("\n\n");
}
