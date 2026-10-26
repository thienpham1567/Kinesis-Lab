import { createHash } from "node:crypto";
import { hasSupabase, supabase } from "@/lib/supabase/server";
import type {
  ChatIllustrationBrief,
  ChatImageReceipt,
  ChatImageState,
} from "./illustration-types";

const HOUR = 3_600_000;
const ARTIFACT_MS = 24 * HOUR;
export const GLOBAL_CONCURRENCY = 2;
export const GLOBAL_HOUR_LIMIT = 30;
export const SESSION_HOUR_LIMIT = 5;

export type ChatImageJob = {
  id: string;
  ownerHash: string;
  fingerprint: string;
  conversationId: string;
  sourceMessageId: string;
  state: ChatImageState;
  brief: ChatIllustrationBrief | null;
  receipt: ChatImageReceipt | null;
  storagePath: string | null;
  errorCode: string | null;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

export type ClaimInput = {
  requestId: string;
  ownerHash: string;
  fingerprint: string;
  conversationId: string;
  sourceMessageId: string;
};

export type ClaimResult =
  | { kind: "claimed"; job: ChatImageJob }
  | { kind: "existing"; job: ChatImageJob }
  | { kind: "conflict" }
  | { kind: "busy" }
  | { kind: "rate-limited"; scope: "global" | "session" }
  | { kind: "forbidden" };

export type JobStore = {
  claim(input: ClaimInput): Promise<ClaimResult>;
  get(id: string, ownerHash: string): Promise<ChatImageJob | null>;
  update(
    id: string,
    ownerHash: string,
    patch: Partial<
      Pick<ChatImageJob, "state" | "brief" | "receipt" | "storagePath" | "errorCode" | "expiresAt">
    >,
  ): Promise<ChatImageJob | null>;
  expiredWithAssets(now: number): Promise<ChatImageJob[]>;
};

type Ledger = {
  jobs: Map<string, ChatImageJob>;
  withLock<T>(fn: () => T | Promise<T>): Promise<T>;
};

export function createMemoryJobLedger(): Ledger {
  const jobs = new Map<string, ChatImageJob>();
  let lock = Promise.resolve();
  return {
    jobs,
    withLock(fn) {
      const run = lock.then(fn, fn);
      lock = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };
}

function cloneJob(job: ChatImageJob): ChatImageJob {
  return { ...job };
}

export function memoryJobStore(ledger: Ledger): JobStore {
  return {
    claim(input) {
      return ledger.withLock(() => {
        const now = Date.now();
        const existing = ledger.jobs.get(input.requestId);
        if (existing) {
          if (existing.fingerprint !== input.fingerprint) return { kind: "conflict" };
          if (existing.ownerHash !== input.ownerHash) return { kind: "forbidden" };
          return { kind: "existing", job: cloneJob(existing) };
        }
        const rows = [...ledger.jobs.values()];
        const concurrent = rows.filter(
          (job) => job.state === "preparing" || job.state === "generating",
        ).length;
        if (concurrent >= GLOBAL_CONCURRENCY) return { kind: "busy" };
        const hour = rows.filter((job) => now - job.createdAt < HOUR);
        if (hour.length >= GLOBAL_HOUR_LIMIT)
          return { kind: "rate-limited", scope: "global" };
        if (hour.filter((job) => job.ownerHash === input.ownerHash).length >= SESSION_HOUR_LIMIT)
          return { kind: "rate-limited", scope: "session" };
        const job: ChatImageJob = {
          id: input.requestId,
          ownerHash: input.ownerHash,
          fingerprint: input.fingerprint,
          conversationId: input.conversationId,
          sourceMessageId: input.sourceMessageId,
          state: "preparing",
          brief: null,
          receipt: null,
          storagePath: null,
          errorCode: null,
          createdAt: now,
          updatedAt: now,
          expiresAt: now + ARTIFACT_MS,
        };
        ledger.jobs.set(job.id, job);
        return { kind: "claimed", job: cloneJob(job) };
      });
    },
    async get(id, ownerHash) {
      const job = ledger.jobs.get(id);
      if (!job || job.ownerHash !== ownerHash) return null;
      return cloneJob(job);
    },
    async update(id, ownerHash, patch) {
      const job = ledger.jobs.get(id);
      if (!job || job.ownerHash !== ownerHash) return null;
      Object.assign(job, patch, { updatedAt: Date.now() });
      return cloneJob(job);
    },
    async expiredWithAssets(now) {
      return [...ledger.jobs.values()].filter(
        (job) => job.expiresAt <= now && job.storagePath,
      );
    },
  };
}

function fromRow(row: Record<string, unknown>): ChatImageJob {
  return {
    id: String(row.id),
    ownerHash: String(row.owner_hash),
    fingerprint: String(row.fingerprint),
    conversationId: String(row.conversation_id),
    sourceMessageId: String(row.source_message_id),
    state: row.state as ChatImageState,
    brief: (row.brief as ChatIllustrationBrief | null) ?? null,
    receipt: (row.receipt as ChatImageReceipt | null) ?? null,
    storagePath: (row.storage_path as string | null) ?? null,
    errorCode: (row.error_code as string | null) ?? null,
    createdAt: Date.parse(String(row.created_at)),
    updatedAt: Date.parse(String(row.updated_at)),
    expiresAt: Date.parse(String(row.expires_at)),
  };
}

function supabaseJobStore(): JobStore {
  const db = () => supabase();
  return {
    async claim(input) {
      const { data, error } = await db().rpc("claim_chat_image_job", {
        p_id: input.requestId,
        p_owner_hash: input.ownerHash,
        p_fingerprint: input.fingerprint,
        p_conversation_id: input.conversationId,
        p_source_message_id: input.sourceMessageId,
        p_expires_at: new Date(Date.now() + ARTIFACT_MS).toISOString(),
      });
      if (error) throw error;
      const result = data as { kind: string; scope?: string; job?: Record<string, unknown> };
      if (result.kind === "claimed" || result.kind === "existing")
        return { kind: result.kind, job: fromRow(result.job!) } as ClaimResult;
      if (result.kind === "rate-limited")
        return { kind: "rate-limited", scope: result.scope === "session" ? "session" : "global" };
      if (result.kind === "busy" || result.kind === "conflict" || result.kind === "forbidden")
        return { kind: result.kind };
      return { kind: "conflict" };
    },
    async get(id, ownerHash) {
      const { data } = await db()
        .from("chat_image_jobs")
        .select("*")
        .eq("id", id)
        .eq("owner_hash", ownerHash)
        .maybeSingle();
      return data ? fromRow(data as Record<string, unknown>) : null;
    },
    async update(id, ownerHash, patch) {
      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.state !== undefined) row.state = patch.state;
      if (patch.brief !== undefined) row.brief = patch.brief;
      if (patch.receipt !== undefined) row.receipt = patch.receipt;
      if (patch.storagePath !== undefined) row.storage_path = patch.storagePath;
      if (patch.errorCode !== undefined) row.error_code = patch.errorCode;
      if (patch.expiresAt !== undefined) row.expires_at = new Date(patch.expiresAt).toISOString();
      const { data } = await db()
        .from("chat_image_jobs")
        .update(row)
        .eq("id", id)
        .eq("owner_hash", ownerHash)
        .select("*")
        .maybeSingle();
      return data ? fromRow(data as Record<string, unknown>) : null;
    },
    async expiredWithAssets(now) {
      const { data } = await db()
        .from("chat_image_jobs")
        .select("*")
        .lte("expires_at", new Date(now).toISOString())
        .not("storage_path", "is", null);
      return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
    },
  };
}

let testStore: JobStore | null = null;
const localStore = memoryJobStore(createMemoryJobLedger());

export function useJobStoreForTests(store: JobStore) {
  testStore = store;
}
export function jobStore(): JobStore {
  if (testStore) return testStore;
  if (hasSupabase() && process.env.NODE_ENV === "production") return supabaseJobStore();
  return localStore;
}

export function requestFingerprint(body: {
  conversationId: string;
  sourceMessageId: string;
  instruction: string;
  selectedContext: string;
  sourceIds: string[];
  parentId?: string | null;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        conversationId: body.conversationId,
        sourceMessageId: body.sourceMessageId,
        instruction: body.instruction,
        selectedContext: body.selectedContext,
        sourceIds: body.sourceIds,
        parentId: body.parentId ?? null,
      }),
    )
    .digest("hex");
}
