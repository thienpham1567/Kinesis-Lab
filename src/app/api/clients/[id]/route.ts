import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!hasSupabase()) {
    const store = readLocalStore();
    const client = store.clients.find((c) => c.id === id);
    if (!client) return Response.json({ error: "Không tìm thấy học viên" }, { status: 404 });
    const biomarkers = store.biomarkers
      .filter((b) => b.client_id === id)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
    return Response.json({ client, biomarkers });
  }
  const db = supabase();
  const [{ data: client, error }, { data: biomarkers }] = await Promise.all([
    db.from("clients").select("*").eq("id", id).single(),
    db
      .from("biomarker_records")
      .select("*")
      .eq("client_id", id)
      .order("recorded_at", { ascending: false }),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ client, biomarkers: biomarkers ?? [] });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const patch = {
    name: body.name,
    age: body.age,
    sex: body.sex,
    goals: body.goals,
    training_level: body.training_level,
    medical_conditions: body.medical_conditions,
    medications: body.medications,
    orthopedic_issues: body.orthopedic_issues,
    red_flags: body.red_flags,
    notes: body.notes,
    updated_at: new Date().toISOString(),
  };
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));

  if (!hasSupabase()) {
    const store = readLocalStore();
    const idx = store.clients.findIndex((c) => c.id === id);
    if (idx === -1) return Response.json({ error: "Không tìm thấy học viên" }, { status: 404 });
    store.clients[idx] = { ...store.clients[idx], ...clean };
    writeLocalStore(store);
    return Response.json({ client: store.clients[idx] });
  }

  const { data, error } = await supabase()
    .from("clients")
    .update(clean)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ client: data });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!hasSupabase()) {
    const store = readLocalStore();
    store.clients = store.clients.filter((c) => c.id !== id);
    store.biomarkers = store.biomarkers.filter((b) => b.client_id !== id);
    store.training_records = (store.training_records ?? []).filter((record) => record.client_id !== id);
    writeLocalStore(store);
    return Response.json({ ok: true });
  }
  const { error } = await supabase().from("clients").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
