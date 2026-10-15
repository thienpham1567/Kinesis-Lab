import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabase()) {
    const store = readLocalStore();
    return Response.json({ documents: store.documents, mode: "local" });
  }
  const { data, error } = await supabase()
    .from("knowledge_documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ documents: data, mode: "supabase" });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Thiếu id" }, { status: 400 });
  if (!hasSupabase()) {
    const store = readLocalStore();
    store.documents = store.documents.filter((d) => d.id !== id);
    writeLocalStore(store);
    return Response.json({ ok: true });
  }
  const { error } = await supabase().from("knowledge_documents").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
