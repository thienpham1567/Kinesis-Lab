import crypto from "node:crypto";
import {
  readLocalStore,
  writeLocalStore,
  type StoreShape,
} from "@/lib/local-store";
import { supabase } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import type { TrainingRecord } from "@/lib/training-log";
import {
  identifier,
  object,
  ProgramError,
  validateProgramDraft,
  validateWorkoutInput,
  type PlanStatus,
  type TrainingPlan,
  type TrainingWorkout,
} from "@/lib/training/program";
import { validateSourceContext } from "@/lib/training/sources";
export type TrainingStoreAdapter = {
  read(): StoreShape;
  write(store: StoreShape): void;
};
export type TrainingHistory = {
  legacy: TrainingRecord[];
  workouts: TrainingWorkout[];
};
export function trainingUsesSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!!url !== !!key)
    throw new ProgramError(
      "Cấu hình Supabase chưa đầy đủ; không chuyển sang dữ liệu cục bộ.",
      503,
    );
  return Boolean(url && key);
}
function databaseError(error: unknown): never {
  const code = (error as { code?: string })?.code;
  if (code === "22P02")
    throw new ProgramError("Mã bản ghi Supabase phải là UUID hợp lệ.");
  if (code === "P0002")
    throw new ProgramError("Không tìm thấy bản ghi thuộc học viên này.", 404);
  if (code === "23505" || code === "23514" || code === "P0001")
    throw new ProgramError(
      "Bản ghi đã thay đổi hoặc tham chiếu không khớp. Hãy tải lại.",
      409,
    );
  throw new ProgramError(
    "Chưa truy cập được kho chương trình. Kiểm tra cấu hình và migration 004; dữ liệu chưa được chuyển sang kho khác.",
    503,
  );
}
function localClient(store: StoreShape, id: string) {
  const client = store.clients.find((c) => c.id === id);
  if (!client) throw new ProgramError("Không tìm thấy học viên.", 404);
  return client;
}
export function createTrainingRepository(
  adapter: TrainingStoreAdapter = {
    read: readLocalStore,
    write: writeLocalStore,
  },
) {
  async function getClient(clientId: string): Promise<Client> {
    const id = identifier(clientId);
    if (!trainingUsesSupabase()) return localClient(adapter.read(), id);
    const { data, error } = await supabase()
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new ProgramError("Không tìm thấy học viên.", 404);
    return data as Client;
  }
  async function listPlans(clientId: string): Promise<TrainingPlan[]> {
    const id = identifier(clientId);
    if (!trainingUsesSupabase()) {
      const store = adapter.read();
      localClient(store, id);
      return (store.training_plans ?? [])
        .filter((p) => p.client_id === id)
        .sort((a, b) => b.revision - a.revision);
    }
    await getClient(id);
    const { data, error } = await supabase()
      .from("training_plans")
      .select("*")
      .eq("client_id", id)
      .order("revision", { ascending: false });
    if (error) databaseError(error);
    return data as TrainingPlan[];
  }
  async function savePlan(value: unknown): Promise<TrainingPlan> {
    const body = object(value);
    const client_id = identifier(body.client_id);
    const program = validateProgramDraft(body.program);
    const source_context = validateSourceContext(body.source_context);
    const baseId =
      body.base_plan_id == null ? null : identifier(body.base_plan_id);
    if (trainingUsesSupabase()) {
      const { data, error } = await supabase().rpc("save_training_plan", {
        p_client_id: client_id,
        p_program: program,
        p_source_context: source_context,
        p_base_plan_id: baseId,
      });
      if (error) databaseError(error);
      if (!data) databaseError(null);
      return data as TrainingPlan;
    }
    // No await inside local read/validate/write: an activation or revision is one synchronous transaction.
    const store = adapter.read();
    localClient(store, client_id);
    const plans = store.training_plans ?? [];
    if (
      baseId &&
      !plans.some((p) => p.id === baseId && p.client_id === client_id)
    )
      throw new ProgramError("Không tìm thấy bản gốc thuộc học viên này.", 404);
    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      client_id,
      revision:
        Math.max(
          0,
          ...plans
            .filter((p) => p.client_id === client_id)
            .map((p) => p.revision),
        ) + 1,
      status: "draft",
      program,
      source_context,
      created_at: new Date().toISOString(),
    };
    store.training_plans = [...plans, plan];
    adapter.write(store);
    return plan;
  }
  async function setPlanStatus(
    clientId: string,
    planId: string,
    status: unknown,
  ): Promise<TrainingPlan> {
    const client_id = identifier(clientId);
    const id = identifier(planId);
    if (status !== "active" && status !== "archived")
      throw new ProgramError(
        "Chỉ có thể áp dụng hoặc lưu trữ phiên bản đã lưu.",
      );
    if (trainingUsesSupabase()) {
      const { data, error } = await supabase().rpc("set_training_plan_status", {
        p_client_id: client_id,
        p_plan_id: id,
        p_status: status,
      });
      if (error) databaseError(error);
      if (!data) databaseError(null);
      return data as TrainingPlan;
    }
    const store = adapter.read();
    localClient(store, client_id);
    const plans = store.training_plans ?? [];
    const found = plans.find((p) => p.id === id && p.client_id === client_id);
    if (!found)
      throw new ProgramError(
        "Không tìm thấy phiên bản thuộc học viên này.",
        404,
      );
    store.training_plans = plans.map((p) =>
      p.id === id
        ? { ...p, status: status as PlanStatus }
        : status === "active" &&
            p.client_id === client_id &&
            p.status === "active"
          ? { ...p, status: "archived" }
          : p,
    );
    adapter.write(store);
    return store.training_plans.find((p) => p.id === id)!;
  }
  async function listWorkouts(clientId: string): Promise<TrainingWorkout[]> {
    const id = identifier(clientId);
    if (!trainingUsesSupabase()) {
      const store = adapter.read();
      localClient(store, id);
      return (store.training_workouts ?? [])
        .filter((w) => w.client_id === id)
        .sort(
          (a, b) =>
            b.performedAt.localeCompare(a.performedAt) ||
            b.updated_at.localeCompare(a.updated_at),
        );
    }
    await getClient(id);
    const { data, error } = await supabase()
      .from("training_workouts")
      .select("*")
      .eq("client_id", id)
      .order("performedAt", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) databaseError(error);
    return data as TrainingWorkout[];
  }
  async function saveWorkout(value: unknown): Promise<TrainingWorkout> {
    const body = object(value);
    const client_id = identifier(body.client_id);
    const plan_id = identifier(body.plan_id);
    const id = identifier(body.id);
    const session_id = identifier(body.session_id);
    if (trainingUsesSupabase()) {
      const plans = await listPlans(client_id);
      const plan = plans.find((p) => p.id === plan_id);
      const session = plan?.program.sessions.find((s) => s.id === session_id);
      if (!session)
        throw new ProgramError(
          "Giáo án hoặc buổi tập không thuộc học viên này.",
          404,
        );
      const input = validateWorkoutInput(body, session);
      const { data, error } = await supabase().rpc("save_training_workout", {
        p_workout: input,
      });
      if (error) databaseError(error);
      if (!data) databaseError(null);
      return data as TrainingWorkout;
    }
    const store = adapter.read();
    localClient(store, client_id);
    const plan = (store.training_plans ?? []).find(
      (p) => p.id === plan_id && p.client_id === client_id,
    );
    const session = plan?.program.sessions.find((s) => s.id === session_id);
    if (!session)
      throw new ProgramError(
        "Giáo án hoặc buổi tập không thuộc học viên này.",
        404,
      );
    const workouts = store.training_workouts ?? [];
    const existing = workouts.find((w) => w.id === id);
    if (
      existing &&
      (existing.client_id !== client_id ||
        existing.plan_id !== plan_id ||
        existing.session_id !== session_id)
    )
      throw new ProgramError(
        "Không thể đổi chủ sở hữu hoặc giáo án của buổi tập đã ghi.",
        409,
      );
    if (
      existing &&
      JSON.stringify(existing.prescription) !== JSON.stringify(session)
    )
      throw new ProgramError(
        "Chỉ định gốc đã thay đổi; không ghi đè buổi tập.",
        409,
      );
    const input = validateWorkoutInput(body, session);
    const now = new Date().toISOString();
    const workout: TrainingWorkout = {
      ...input,
      prescription: structuredClone(existing?.prescription ?? session),
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    store.training_workouts = [...workouts.filter((w) => w.id !== id), workout];
    adapter.write(store);
    return workout;
  }
  async function recentHistory(clientId: string): Promise<TrainingHistory> {
    const id = identifier(clientId);
    if (!trainingUsesSupabase()) {
      const store = adapter.read();
      localClient(store, id);
      return {
        legacy: (store.training_records ?? [])
          .filter((r) => r.client_id === id)
          .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
          .slice(0, 8),
        workouts: (store.training_workouts ?? [])
          .filter((w) => w.client_id === id)
          .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
          .slice(0, 6),
      };
    }
    await getClient(id);
    const [legacy, workouts] = await Promise.all([
      supabase()
        .from("training_records")
        .select("*")
        .eq("client_id", id)
        .order("recorded_at", { ascending: false })
        .limit(8),
      supabase()
        .from("training_workouts")
        .select("*")
        .eq("client_id", id)
        .order("performedAt", { ascending: false })
        .limit(6),
    ]);
    if (legacy.error) databaseError(legacy.error);
    if (workouts.error) databaseError(workouts.error);
    return {
      legacy: legacy.data as TrainingRecord[],
      workouts: workouts.data as TrainingWorkout[],
    };
  }
  return {
    getClient,
    listPlans,
    savePlan,
    setPlanStatus,
    listWorkouts,
    saveWorkout,
    recentHistory,
  };
}
export const trainingRepository = createTrainingRepository();
