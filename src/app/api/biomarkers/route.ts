import crypto from "node:crypto";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.client_id || !body.kind) {
    return Response.json({ error: "Thiếu client_id hoặc kind" }, { status: 400 });
  }
  if (!hasSupabase()) {
    const store = readLocalStore();
    const record = {
      id: `b-${crypto.randomUUID().slice(0, 8)}`,
      client_id: body.client_id,
      kind: body.kind as "blood_lab" | "inbody" | "rom",
      recorded_at: body.recorded_at ?? new Date().toISOString().slice(0, 10),
      metrics: body.metrics ?? {},
      ai_summary: body.ai_summary ?? null,
      created_at: new Date().toISOString(),
    };
    store.biomarkers.unshift(record);
    writeLocalStore(store);
    return Response.json({ record });
  }
  const { data, error } = await supabase()
    .from("biomarker_records")
    .insert({
      client_id: body.client_id,
      kind: body.kind,
      recorded_at: body.recorded_at ?? new Date().toISOString().slice(0, 10),
      metrics: body.metrics ?? {},
      ai_summary: body.ai_summary ?? null,
    })
    .select("*")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ record: data });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Thiếu id" }, { status: 400 });
  if (!hasSupabase()) {
    const store = readLocalStore();
    store.biomarkers = store.biomarkers.filter((b) => b.id !== id);
    writeLocalStore(store);
    return Response.json({ ok: true });
  }
  const { error } = await supabase().from("biomarker_records").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
