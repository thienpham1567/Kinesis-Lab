import { searchPubMed } from "@/lib/tools/pubmed";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return Response.json({ papers: [] });
  const papers = await searchPubMed(q, 8);
  return Response.json({ papers, query: q });
}
