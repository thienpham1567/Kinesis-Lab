import crypto from "node:crypto";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabase()) {
    const store = readLocalStore();
    return Response.json({ clients: store.clients, mode: "local" });
  }
  const { data, error } = await supabase()
    .from("clients")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ clients: data, mode: "supabase" });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name?.trim()) {
    return Response.json({ error: "Thiếu tên học viên" }, { status: 400 });
  }
  if (!hasSupabase()) {
    const store = readLocalStore();
    const now = new Date().toISOString();
    const client = {
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim(),
      age: body.age ?? null,
      sex: body.sex ?? null,
      goals: body.goals ?? null,
      training_level: body.training_level ?? null,
      medical_conditions: body.medical_conditions ?? [],
      medications: body.medications ?? [],
      orthopedic_issues: body.orthopedic_issues ?? [],
      red_flags: body.red_flags ?? {},
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    };
    store.clients.unshift(client);
    writeLocalStore(store);
    return Response.json({ client });
  }
  const { data, error } = await supabase()
    .from("clients")
    .insert({
      name: body.name.trim(),
      age: body.age ?? null,
      sex: body.sex ?? null,
      goals: body.goals ?? null,
      training_level: body.training_level ?? null,
      medical_conditions: body.medical_conditions ?? [],
      medications: body.medications ?? [],
      orthopedic_issues: body.orthopedic_issues ?? [],
      red_flags: body.red_flags ?? {},
      notes: body.notes ?? null,
    })
    .select("*")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ client: data });
}
