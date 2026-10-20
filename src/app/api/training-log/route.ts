import crypto from "node:crypto";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { hasSupabase, supabase } from "@/lib/supabase/server";
import { TrainingLogError, validateTrainingClientId, validateTrainingInput, type TrainingRecord } from "@/lib/training-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Không thể truy cập nhật ký tập.";
  return Response.json({ error: message }, { status: error instanceof TrainingLogError ? error.status : 500 });
}

function databaseFailure(error: { code?: string; message: string }): never {
  if (error.code === "42P01" || error.code === "PGRST205" || /training_records.*(schema cache|does not exist)/i.test(error.message)) {
    throw new TrainingLogError("Supabase chưa có bảng training_records. Áp dụng supabase/migrations/003_training_records.sql rồi tải lại nhật ký.", 503);
  }
  throw new TrainingLogError(`Không thể truy cập nhật ký Supabase: ${error.message}`, 500);
}

function shouldUseSupabase(): boolean {
  if ((process.env.SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY) && !hasSupabase()) {
    throw new TrainingLogError("Cấu hình Supabase chưa đủ: cần SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY để lưu nhật ký. Không chuyển sang kho cục bộ.", 503);
  }
  return hasSupabase();
}

async function requireSupabaseClient(clientId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)) {
    throw new TrainingLogError("Mã học viên Supabase phải là UUID hợp lệ.");
  }
  const db = supabase();
  const { data, error } = await db.from("clients").select("id").eq("id", clientId).maybeSingle();
  if (error) databaseFailure(error);
  if (!data) throw new TrainingLogError("Không tìm thấy học viên.", 404);
  return db;
}

export async function GET(req: Request) {
  try {
    const clientId = validateTrainingClientId(new URL(req.url).searchParams.get("client_id"));
    if (!shouldUseSupabase()) {
      const store = readLocalStore();
      if (!store.clients.some((client) => client.id === clientId)) throw new TrainingLogError("Không tìm thấy học viên.", 404);
      const records = (store.training_records ?? []).filter((record) => record.client_id === clientId)
        .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at) || b.created_at.localeCompare(a.created_at));
      return Response.json({ records, mode: "local" }, { headers: { "Cache-Control": "no-store" } });
    }
    const db = await requireSupabaseClient(clientId);
    const { data, error } = await db.from("training_records").select("*").eq("client_id", clientId)
      .order("recorded_at", { ascending: false }).order("created_at", { ascending: false });
    if (error) databaseFailure(error);
    return Response.json({ records: data, mode: "supabase" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { throw new TrainingLogError("Nội dung JSON không hợp lệ."); }
    const input = validateTrainingInput(body);
    if (!shouldUseSupabase()) {
      const store = readLocalStore();
      if (!store.clients.some((client) => client.id === input.client_id)) throw new TrainingLogError("Không tìm thấy học viên.", 404);
      const record: TrainingRecord = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      store.training_records = [record, ...(store.training_records ?? [])];
      writeLocalStore(store);
      return Response.json({ record }, { status: 201 });
    }
    const db = await requireSupabaseClient(input.client_id);
    const { data, error } = await db.from("training_records").insert(input).select("*").single();
    if (error) databaseFailure(error);
    return Response.json({ record: data }, { status: 201 });
  } catch (error) { return failure(error); }
}

export async function DELETE(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const clientId = validateTrainingClientId(params.get("client_id"));
    const id = params.get("id");
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new TrainingLogError("Thiếu hoặc sai mã nhật ký (id).");
    }
    if (!shouldUseSupabase()) {
      const store = readLocalStore();
      if (!store.clients.some((client) => client.id === clientId)) throw new TrainingLogError("Không tìm thấy học viên.", 404);
      const records = store.training_records ?? [];
      if (!records.some((record) => record.id === id && record.client_id === clientId)) throw new TrainingLogError("Không tìm thấy nhật ký của học viên này.", 404);
      store.training_records = records.filter((record) => !(record.id === id && record.client_id === clientId));
      writeLocalStore(store);
      return Response.json({ ok: true });
    }
    const db = await requireSupabaseClient(clientId);
    const { data, error } = await db.from("training_records").delete().eq("client_id", clientId).eq("id", id).select("id");
    if (error) databaseFailure(error);
    if (!data?.length) throw new TrainingLogError("Không tìm thấy nhật ký của học viên này.", 404);
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
