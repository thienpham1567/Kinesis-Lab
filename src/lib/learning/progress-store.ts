import { NCSF_DOMAINS } from "@/lib/ncsf-quiz";
import type {
  LearningDraft,
  LearningDraftItem,
  LearningItemResult,
  NcsfSource,
  LearningSubmission,
} from "./types";

export const LEARNING_DB_NAME = "kinesis-learning-progress";
export const LEARNING_DB_VERSION = 1;
export const LEARNING_CHANNEL_NAME = "kinesis-learning-progress";

export const LEARNING_LIMITS = {
  maxDraftItems: 300,
  maxSubmissions: 3000,
  maxWriteBytes: 2 * 1024 * 1024,
} as const;

export type LearningStoreErrorCode =
  | "unavailable"
  | "newer-schema"
  | "limit-exceeded"
  | "revision-conflict"
  | "submission-conflict"
  | "invalid-payload"
  | "write-failed";

export class LearningStoreError extends Error {
  readonly code: LearningStoreErrorCode;
  readonly currentDraft?: LearningDraft | null;

  constructor(
    code: LearningStoreErrorCode,
    message: string,
    options?: { currentDraft?: LearningDraft | null },
  ) {
    super(message);
    this.name = "LearningStoreError";
    this.code = code;
    this.currentDraft = options?.currentDraft;
  }
}

const nativeEncoder =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const ID_PATTERN = /^[A-Za-z0-9:_-]{1,128}$/;
const ALLOWED_SOURCES: readonly NcsfSource[] = ["ncsf-quiz", "ncsf-mock"];

function utf8ByteLength(str: string): number {
  if (nativeEncoder) return nativeEncoder.encode(str).byteLength;
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i += 1;
    } else bytes += 3;
  }
  return bytes;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === expected.length &&
    keys.every((key) => expected.includes(key))
  );
}

function isValidIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 64) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

function isValidId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function isValidDomain(value: unknown): value is string | null {
  if (value === null) return true;
  return typeof value === "string" && Object.hasOwn(NCSF_DOMAINS, value);
}

export function validateLearningDraftItem(
  value: unknown,
): value is LearningDraftItem {
  if (!isPlainRecord(value)) return false;
  if (!hasExactKeys(value, ["itemId", "optionOrder", "selectedOptionId"])) {
    return false;
  }
  if (!isValidId(value.itemId)) return false;
  if (
    !Array.isArray(value.optionOrder) ||
    value.optionOrder.length < 2 ||
    value.optionOrder.length > 8 ||
    !value.optionOrder.every(isValidId)
  ) {
    return false;
  }
  if (value.selectedOptionId !== null && !isValidId(value.selectedOptionId)) {
    return false;
  }
  return true;
}

export function validateLearningDraft(value: unknown): value is LearningDraft {
  if (!isPlainRecord(value)) return false;
  if (
    !hasExactKeys(value, [
      "id",
      "source",
      "revision",
      "updatedAt",
      "items",
      "currentItemId",
    ])
  ) {
    return false;
  }
  if (!isValidId(value.id)) return false;
  if (!ALLOWED_SOURCES.includes(value.source as NcsfSource)) return false;
  if (
    typeof value.revision !== "number" ||
    !Number.isInteger(value.revision) ||
    value.revision < 0
  ) {
    return false;
  }
  if (!isValidIsoTimestamp(value.updatedAt)) return false;
  if (
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > LEARNING_LIMITS.maxDraftItems ||
    !value.items.every(validateLearningDraftItem)
  ) {
    return false;
  }
  if (value.currentItemId !== null && !isValidId(value.currentItemId)) {
    return false;
  }
  return true;
}

export function validateLearningItemResult(
  value: unknown,
): value is LearningItemResult {
  if (!isPlainRecord(value)) return false;
  if (
    !hasExactKeys(value, ["itemId", "selectedOptionId", "correct", "domain"])
  ) {
    return false;
  }
  if (!isValidId(value.itemId)) return false;
  if (value.selectedOptionId !== null && !isValidId(value.selectedOptionId)) {
    return false;
  }
  if (typeof value.correct !== "boolean") return false;
  if (!isValidDomain(value.domain)) return false;
  return true;
}

function isUniqueIdList(value: unknown, limit: number): value is string[] {
  return Array.isArray(value) && value.length <= limit &&
    value.every(isValidId) && new Set(value).size === value.length;
}

function validateCaseSubmission(value: Record<string, unknown>): boolean {
  const outcome = value.evaluation;
  if (!hasExactKeys(value, ["id", "source", "submittedAt", "caseId", "caseVersion", "choiceIds", "evaluation"]) ||
      !isValidId(value.caseId) ||
      typeof value.caseVersion !== "number" ||
      !Number.isSafeInteger(value.caseVersion) || value.caseVersion < 1 ||
      !isUniqueIdList(value.choiceIds, 5) || value.choiceIds.length === 0 ||
      !isPlainRecord(outcome) ||
      !hasExactKeys(outcome, ["addressedCriterionIds", "revisitCriterionIds", "unpracticedCriterionIds", "nextCheckpointId"]) ||
      outcome.nextCheckpointId !== null ||
      !isUniqueIdList(outcome.addressedCriterionIds, 25) ||
      !isUniqueIdList(outcome.revisitCriterionIds, 25) ||
      !isUniqueIdList(outcome.unpracticedCriterionIds, 25)) return false;
  const criteria = [...outcome.addressedCriterionIds, ...outcome.revisitCriterionIds, ...outcome.unpracticedCriterionIds];
  return criteria.length > 0 && new Set(criteria).size === criteria.length;
}

export function validateLearningSubmission(
  value: unknown,
): value is LearningSubmission {
  if (!isPlainRecord(value)) return false;
  if (!isValidId(value.id) || !isValidIsoTimestamp(value.submittedAt)) return false;
  if (value.source === "pt-case") return validateCaseSubmission(value);
  if (!hasExactKeys(value, ["id", "source", "submittedAt", "items"])) {
    return false;
  }
  if (!ALLOWED_SOURCES.includes(value.source as NcsfSource)) return false;
  if (
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > LEARNING_LIMITS.maxDraftItems ||
    !value.items.every(validateLearningItemResult)
  ) {
    return false;
  }
  return true;
}

function checkByteSizeLimit(payload: unknown): void {
  const bytes = utf8ByteLength(JSON.stringify(payload));
  if (bytes > LEARNING_LIMITS.maxWriteBytes) {
    throw new LearningStoreError(
      "limit-exceeded",
      "Dữ liệu vượt giới hạn 2MB cho một lần ghi. Hãy xóa lịch sử tiến độ trước khi lưu tiếp.",
    );
  }
}

function sameSubmissionPayload(
  a: LearningSubmission,
  b: LearningSubmission,
): boolean {
  if (a.id !== b.id || a.source !== b.source) return false;
  if (a.source === "pt-case" && b.source === "pt-case") {
    const sameIds = (left: string[], right: string[]) =>
      left.length === right.length && left.every((id, index) => id === right[index]);
    return a.caseId === b.caseId &&
      a.caseVersion === b.caseVersion &&
      sameIds(a.choiceIds, b.choiceIds) &&
      sameIds(a.evaluation.addressedCriterionIds, b.evaluation.addressedCriterionIds) &&
      sameIds(a.evaluation.revisitCriterionIds, b.evaluation.revisitCriterionIds) &&
      sameIds(a.evaluation.unpracticedCriterionIds, b.evaluation.unpracticedCriterionIds);
  }
  if (a.source === "pt-case" || b.source === "pt-case" || a.items.length !== b.items.length) return false;
  for (let i = 0; i < a.items.length; i++) {
    const left = a.items[i]!;
    const right = b.items[i]!;
    if (
      left.itemId !== right.itemId ||
      left.selectedOptionId !== right.selectedOptionId ||
      left.correct !== right.correct ||
      left.domain !== right.domain
    ) {
      return false;
    }
  }
  return true;
}

export type LearningProgressSnapshot = {
  drafts: LearningDraft[];
  submissions: LearningSubmission[];
  corruptedCount: number;
  warning: string | null;
};

export type BroadcastChannelLike = {
  postMessage: (message: unknown) => void;
  close: () => void;
  onmessage?: ((event: MessageEvent) => unknown) | null;
};

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () =>
      reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export function createProgressStore(options?: {
  idbFactory?: IDBFactory | null;
  channelFactory?: (name: string) => BroadcastChannelLike | null;
  dbName?: string;
  version?: number;
}) {
  const dbName = options?.dbName ?? LEARNING_DB_NAME;
  const version = options?.version ?? LEARNING_DB_VERSION;
  const getIdb = (): IDBFactory | null => {
    if (options && "idbFactory" in options) {
      return options.idbFactory ?? null;
    }
    return typeof globalThis.indexedDB !== "undefined"
      ? globalThis.indexedDB
      : null;
  };

  const listeners = new Set<() => void>();
  let channel: BroadcastChannelLike | null = null;

  const ensureChannel = (): BroadcastChannelLike | null => {
    if (channel) return channel;
    try {
      if (options?.channelFactory) {
        channel = options.channelFactory(LEARNING_CHANNEL_NAME);
      } else if (typeof globalThis.BroadcastChannel === "function") {
        channel = new globalThis.BroadcastChannel(LEARNING_CHANNEL_NAME);
      }
      if (channel) {
        channel.onmessage = () => {
          listeners.forEach((listener) => listener());
        };
      }
    } catch {
      channel = null;
    }
    return channel;
  };

  const notifyChange = () => {
    listeners.forEach((listener) => listener());
    try {
      ensureChannel()?.postMessage({
        type: "learning-progress-changed",
        at: Date.now(),
      });
    } catch {
      // BroadcastChannel is advisory only; never fail a committed transaction.
    }
  };

  const openDb = (): Promise<IDBDatabase> => {
    const idb = getIdb();
    if (!idb) {
      return Promise.reject(
        new LearningStoreError(
          "unavailable",
          "Trình duyệt hiện không mở được bộ nhớ lưu tiến độ. Bạn vẫn có thể làm bài trong phiên này.",
        ),
      );
    }
    return new Promise<IDBDatabase>((resolve, reject) => {
      let req: IDBOpenDBRequest;
      try {
        req = idb.open(dbName, version);
      } catch {
        reject(
          new LearningStoreError(
            "unavailable",
            "Không thể khởi tạo kho tiến độ trên trình duyệt này.",
          ),
        );
        return;
      }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("submissions")) {
          db.createObjectStore("submissions", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        const err = req.error;
        if (err && err.name === "VersionError") {
          reject(
            new LearningStoreError(
              "newer-schema",
              "Kho tiến độ trên trình duyệt này thuộc phiên bản mới hơn của ứng dụng. Hãy tải lại trang hoặc cập nhật ứng dụng.",
            ),
          );
          return;
        }
        reject(
          new LearningStoreError(
            "unavailable",
            "Không mở được kho lưu tiến độ trên trình duyệt này.",
          ),
        );
      };
    });
  };

  return {
    subscribe(listener: () => void): () => void {
      ensureChannel();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    async readSnapshot(): Promise<LearningProgressSnapshot> {
      const db = await openDb();
      try {
        const tx = db.transaction(["drafts", "submissions"], "readonly");
        const txPromise = transactionDone(tx);
        const draftsStore = tx.objectStore("drafts");
        const submissionsStore = tx.objectStore("submissions");
        const [rawDrafts, rawSubmissions] = await Promise.all([
          requestToPromise<unknown[]>(draftsStore.getAll()),
          requestToPromise<unknown[]>(submissionsStore.getAll()),
        ]);
        await txPromise;

        const drafts: LearningDraft[] = [];
        const submissions: LearningSubmission[] = [];
        let corruptedCount = 0;

        for (const item of Array.isArray(rawDrafts) ? rawDrafts : []) {
          if (validateLearningDraft(item)) {
            drafts.push(item);
          } else {
            corruptedCount += 1;
          }
        }
        for (const item of Array.isArray(rawSubmissions)
          ? rawSubmissions
          : []) {
          if (validateLearningSubmission(item)) {
            submissions.push(item);
          } else {
            corruptedCount += 1;
          }
        }

        drafts.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
        submissions.sort(
          (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
        );

        return {
          drafts,
          submissions,
          corruptedCount,
          warning:
            corruptedCount > 0
              ? `Đã bỏ qua ${corruptedCount} bản ghi tiến độ không hợp lệ để giữ nguyên lịch sử còn lại.`
              : null,
        };
      } finally {
        db.close();
      }
    },

    async saveDraft(
      draft: LearningDraft,
      expectedRevision?: number,
    ): Promise<LearningDraft> {
      checkByteSizeLimit(draft);
      if (
        Array.isArray(draft?.items) &&
        draft.items.length > LEARNING_LIMITS.maxDraftItems
      ) {
        throw new LearningStoreError(
          "limit-exceeded",
          `Phiên học vượt giới hạn ${LEARNING_LIMITS.maxDraftItems} câu cho một bản nháp. Hãy xóa bớt lịch sử tiến độ.`,
        );
      }
      if (!validateLearningDraft(draft)) {
        throw new LearningStoreError(
          "invalid-payload",
          "Bản nháp không hợp lệ: chỉ được phép lưu metadata định danh.",
        );
      }

      const db = await openDb();
      try {
        const tx = db.transaction(["drafts"], "readwrite");
        const txPromise = transactionDone(tx);
        txPromise.catch(() => {});
        const store = tx.objectStore("drafts");
        const existingRaw = await requestToPromise<unknown>(store.get(draft.id));
        const existing = validateLearningDraft(existingRaw)
          ? existingRaw
          : null;
        const currentRevision = existing ? existing.revision : 0;

        if (
          expectedRevision !== undefined &&
          currentRevision !== expectedRevision
        ) {
          tx.abort();
          throw new LearningStoreError(
            "revision-conflict",
            "Phiên đang học đã thay đổi ở một tab khác. Bài đang làm vẫn giữ trên màn hình; bạn có thể tải lại phiên mới hoặc bắt đầu phiên mới.",
            { currentDraft: existing },
          );
        }

        const nextDraft: LearningDraft = {
          id: draft.id,
          source: draft.source,
          revision: currentRevision + 1,
          updatedAt: draft.updatedAt,
          items: draft.items.map((item) => ({
            itemId: item.itemId,
            optionOrder: [...item.optionOrder],
            selectedOptionId: item.selectedOptionId,
          })),
          currentItemId: draft.currentItemId,
        };

        try {
          await requestToPromise(store.put(nextDraft));
          await txPromise;
        } catch (err) {
          if (err instanceof LearningStoreError) throw err;
          throw new LearningStoreError(
            "write-failed",
            "Chưa lưu được tiến độ vào trình duyệt. Bài đang làm vẫn giữ trong bộ nhớ.",
          );
        }

        notifyChange();
        return nextDraft;
      } finally {
        db.close();
      }
    },

    async submitAttempt(
      submission: LearningSubmission,
      draftId?: string,
    ): Promise<{
      status: "saved" | "idempotent";
      submission: LearningSubmission;
    }> {
      checkByteSizeLimit(submission);
      if (
        submission?.source !== "pt-case" &&
        Array.isArray(submission?.items) &&
        submission.items.length > LEARNING_LIMITS.maxDraftItems
      ) {
        throw new LearningStoreError(
          "limit-exceeded",
          `Lần nộp vượt giới hạn ${LEARNING_LIMITS.maxDraftItems} câu. Hãy xóa bớt lịch sử tiến độ.`,
        );
      }
      if (!validateLearningSubmission(submission)) {
        throw new LearningStoreError(
          "invalid-payload",
          "Kết quả nộp không hợp lệ: chỉ được phép lưu metadata định danh.",
        );
      }

      const db = await openDb();
      try {
        const tx = db.transaction(["drafts", "submissions"], "readwrite");
        const txPromise = transactionDone(tx);
        txPromise.catch(() => {});
        const draftsStore = tx.objectStore("drafts");
        const submissionsStore = tx.objectStore("submissions");

        const existingRaw = await requestToPromise<unknown>(
          submissionsStore.get(submission.id),
        );
        const existing = validateLearningSubmission(existingRaw)
          ? existingRaw
          : null;

        if (existing) {
          if (!sameSubmissionPayload(existing, submission)) {
            tx.abort();
            throw new LearningStoreError(
              "submission-conflict",
              "Mã lần nộp này đã tồn tại với nội dung khác. Không ghi đè lịch sử cũ.",
            );
          }
          const targetDraftId = draftId ?? submission.id;
          if (submission.source !== "pt-case") await requestToPromise(draftsStore.delete(targetDraftId));
          await txPromise;
          notifyChange();
          return { status: "idempotent", submission: existing };
        }

        const count = await requestToPromise<number>(submissionsStore.count());
        if (count >= LEARNING_LIMITS.maxSubmissions) {
          tx.abort();
          throw new LearningStoreError(
            "limit-exceeded",
            `Lịch sử đã chạm giới hạn ${LEARNING_LIMITS.maxSubmissions} lần nộp. Hãy xóa lịch sử tiến độ để lưu thêm.`,
          );
        }

        const cleanSubmission: LearningSubmission = submission.source === "pt-case" ? submission : {
          id: submission.id,
          source: submission.source,
          submittedAt: submission.submittedAt,
          items: submission.items.map((item) => ({
            itemId: item.itemId,
            selectedOptionId: item.selectedOptionId,
            correct: item.correct,
            domain: item.domain,
          })),
        };

        try {
          await requestToPromise(submissionsStore.put(cleanSubmission));
          if (cleanSubmission.source !== "pt-case") {
            await requestToPromise(draftsStore.delete(draftId ?? cleanSubmission.id));
          }
          await txPromise;
        } catch (err) {
          if (err instanceof LearningStoreError) throw err;
          throw new LearningStoreError(
            "write-failed",
            "Chưa lưu được kết quả nộp vào trình duyệt. Hãy thử lưu lại.",
          );
        }

        notifyChange();
        return { status: "saved", submission: cleanSubmission };
      } finally {
        db.close();
      }
    },

    async deleteDraft(draftId: string): Promise<void> {
      if (!isValidId(draftId)) return;
      const db = await openDb();
      try {
        const tx = db.transaction(["drafts"], "readwrite");
        const txPromise = transactionDone(tx);
        await requestToPromise(tx.objectStore("drafts").delete(draftId));
        await txPromise;
        notifyChange();
      } finally {
        db.close();
      }
    },

    async clearAllProgress(): Promise<void> {
      const db = await openDb();
      try {
        const tx = db.transaction(["drafts", "submissions"], "readwrite");
        const txPromise = transactionDone(tx);
        await Promise.all([
          requestToPromise(tx.objectStore("drafts").clear()),
          requestToPromise(tx.objectStore("submissions").clear()),
        ]);
        await txPromise;
        notifyChange();
      } finally {
        db.close();
      }
    },
  };
}

export type LearningProgressStore = ReturnType<typeof createProgressStore>;

let defaultStore: LearningProgressStore | null = null;

export function getDefaultProgressStore(): LearningProgressStore {
  if (!defaultStore) {
    defaultStore = createProgressStore();
  }
  return defaultStore;
}
