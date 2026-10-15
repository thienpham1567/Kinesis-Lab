import { embedTexts } from "@/lib/ai/openrouter";
import { supabase } from "@/lib/supabase/server";
import type { RagHit } from "@/lib/types";

export async function searchRag(query: string, matchCount = 8): Promise<RagHit[]> {
  const [embedding] = await embedTexts([query]);
  const { data, error } = await supabase().rpc("match_knowledge", {
    query_embedding: embedding,
    query_text: query,
    match_count: matchCount,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as RagHit[];
}

export function formatRag(hits: RagHit[]) {
  if (!hits.length) return "";
  return hits
    .map((h, i) => {
      const loc = [h.title, h.chapter, h.page != null ? `p.${h.page}` : null]
        .filter(Boolean)
        .join(" — ");
      return `${i + 1}. ${loc}\n${h.content.slice(0, 900)}`;
    })
    .join("\n\n");
}
