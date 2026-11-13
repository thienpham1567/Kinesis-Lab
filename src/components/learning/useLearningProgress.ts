"use client";

import { useEffect, useRef, useState } from "react";
import {
  getDefaultProgressStore,
  LearningStoreError,
  type LearningProgressStore,
} from "@/lib/learning/progress-store";
import { summarizeLearningProgress } from "@/lib/learning/schedule";
import type {
  LearningDraft,
  LearningScheduleSummary,
  LearningSubmission,
} from "@/lib/learning/types";

export type RevisionConflictState = {
  draftId: string;
  localDraft: LearningDraft;
  remoteDraft: LearningDraft | null;
};

export type UseLearningProgressResult = {
  hydrated: boolean;
  drafts: LearningDraft[];
  submissions: LearningSubmission[];
  summary: LearningScheduleSummary;
  storeWarning: string | null;
  saveError: string | null;
  revisionConflict: RevisionConflictState | null;
  queueSaveDraft: (draft: LearningDraft) => void;
  saveDraftNow: (draft: LearningDraft) => Promise<LearningDraft | null>;
  submitAttempt: (
    submission: LearningSubmission,
    draftId?: string,
  ) => Promise<boolean>;
  deleteDraft: (draftId: string) => Promise<void>;
  retryLastSave: () => Promise<void>;
  resolveRevisionConflict: (mode: "load-remote" | "start-fresh") => Promise<void>;
  clearAllProgress: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useLearningProgress(options?: {
  store?: LearningProgressStore;
  debounceMs?: number;
}): UseLearningProgressResult {
  const providedStore = options?.store;
  const storeRef = useRef<LearningProgressStore>(
    providedStore ?? getDefaultProgressStore(),
  );
  const debounceMs = options?.debounceMs ?? 200;

  const [hydrated, setHydrated] = useState(false);
  const [drafts, setDrafts] = useState<LearningDraft[]>([]);
  const [submissions, setSubmissions] = useState<LearningSubmission[]>([]);
  const [storeWarning, setStoreWarning] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [revisionConflict, setRevisionConflict] =
    useState<RevisionConflictState | null>(null);

  const revisionsRef = useRef<Record<string, number>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const inFlightSubmissionsRef = useRef<Set<string>>(new Set());
  const retryCallbackRef = useRef<(() => Promise<void>) | null>(null);
  const mountedRef = useRef(true);

  const applySnapshot = (
    nextDrafts: LearningDraft[],
    nextSubmissions: LearningSubmission[],
    warning: string | null,
  ) => {
    const revMap: Record<string, number> = {};
    for (const d of nextDrafts) {
      revMap[d.id] = d.revision;
    }
    revisionsRef.current = revMap;
    setDrafts(nextDrafts);
    setSubmissions(nextSubmissions);
    setStoreWarning(warning);
  };

  const refresh = async () => {
    try {
      const snap = await storeRef.current.readSnapshot();
      if (!mountedRef.current) return;
      applySnapshot(snap.drafts, snap.submissions, snap.warning);
      setHydrated(true);
    } catch (err) {
      if (!mountedRef.current) return;
      const detail =
        err instanceof LearningStoreError
          ? err.message
          : "Không mở được kho lưu tiến độ trên trình duyệt này.";
      setSaveError(`Chưa lưu được tiến độ. ${detail}`);
      setHydrated(true);
    }
  };

  useEffect(() => {
    if (providedStore) {
      storeRef.current = providedStore;
    }
    mountedRef.current = true;
    const currentTimers = timersRef.current;
    const loadInitial = async () => {
      try {
        const snap = await storeRef.current.readSnapshot();
        if (!mountedRef.current) return;
        applySnapshot(snap.drafts, snap.submissions, snap.warning);
        setHydrated(true);
      } catch (err) {
        if (!mountedRef.current) return;
        const detail =
          err instanceof LearningStoreError
            ? err.message
            : "Không mở được kho lưu tiến độ trên trình duyệt này.";
        setSaveError(`Chưa lưu được tiến độ. ${detail}`);
        setHydrated(true);
      }
    };
    void loadInitial();
    const unsubscribe = storeRef.current.subscribe(() => {
      void loadInitial();
    });
    const onFocus = () => {
      void loadInitial();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
    }
    return () => {
      mountedRef.current = false;
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onFocus);
      }
      if (typeof clearTimeout === "function") {
        for (const timer of Object.values(currentTimers)) {
          clearTimeout(timer);
        }
      }
    };
  }, [providedStore]);

  const saveDraftNow = async (
    draft: LearningDraft,
  ): Promise<LearningDraft | null> => {
    if (timersRef.current[draft.id]) {
      if (typeof clearTimeout === "function") {
        clearTimeout(timersRef.current[draft.id]);
      }
      delete timersRef.current[draft.id];
    }
    const expectedRevision = revisionsRef.current[draft.id] ?? 0;
    try {
      const saved = await storeRef.current.saveDraft(draft, expectedRevision);
      revisionsRef.current[draft.id] = saved.revision;
      if (mountedRef.current) {
        setDrafts((prev) => {
          const rest = prev.filter((d) => d.id !== saved.id);
          return [saved, ...rest];
        });
        setSaveError(null);
        setRevisionConflict((curr) =>
          curr?.draftId === draft.id ? null : curr,
        );
      }
      retryCallbackRef.current = null;
      return saved;
    } catch (err) {
      if (!mountedRef.current) return null;
      if (err instanceof LearningStoreError && err.code === "revision-conflict") {
        setRevisionConflict({
          draftId: draft.id,
          localDraft: draft,
          remoteDraft: err.currentDraft ?? null,
        });
        setSaveError(`Chưa lưu được tiến độ. ${err.message}`);
        return null;
      }
      const detail =
        err instanceof Error
          ? err.message
          : "Bộ nhớ trình duyệt hiện không phản hồi.";
      setSaveError(`Chưa lưu được tiến độ. ${detail}`);
      retryCallbackRef.current = async () => {
        await saveDraftNow(draft);
      };
      return null;
    }
  };

  const queueSaveDraft = (draft: LearningDraft) => {
    const knownRev = revisionsRef.current[draft.id] ?? 0;
    const optimistic: LearningDraft = {
      ...draft,
      revision: knownRev,
    };
    setDrafts((prev) => {
      const rest = prev.filter((d) => d.id !== draft.id);
      return [optimistic, ...rest];
    });

    if (timersRef.current[draft.id]) {
      if (typeof clearTimeout === "function") {
        clearTimeout(timersRef.current[draft.id]);
      }
    }
    if (debounceMs <= 0 || typeof setTimeout !== "function") {
      void saveDraftNow(optimistic);
      return;
    }
    timersRef.current[draft.id] = setTimeout(() => {
      delete timersRef.current[draft.id];
      void saveDraftNow(optimistic);
    }, debounceMs);
  };

  const submitAttempt = async (
    submission: LearningSubmission,
    draftId?: string,
  ): Promise<boolean> => {
    const targetDraftId = draftId ?? submission.id;
    if (timersRef.current[targetDraftId]) {
      if (typeof clearTimeout === "function") {
        clearTimeout(timersRef.current[targetDraftId]);
      }
      delete timersRef.current[targetDraftId];
    }

    if (inFlightSubmissionsRef.current.has(submission.id)) {
      return true;
    }
    inFlightSubmissionsRef.current.add(submission.id);

    const addToHistory = (attempt: LearningSubmission) =>
      setSubmissions((prev) => {
        if (prev.some((s) => s.id === attempt.id)) return prev;
        return [attempt, ...prev];
      });
    if (submission.source !== "pt-case") {
      addToHistory(submission);
      setDrafts((prev) => prev.filter((d) => d.id !== targetDraftId));
      delete revisionsRef.current[targetDraftId];
    }

    try {
      const stored = await storeRef.current.submitAttempt(submission, targetDraftId);
      if (submission.source === "pt-case") {
        if (mountedRef.current) addToHistory(stored.submission);
        return true;
      }
      if (mountedRef.current) {
        setSaveError(null);
      }
      retryCallbackRef.current = null;
      return true;
    } catch (err) {
      // The case panel displays its own feedback and can retry this same attempt.
      if (submission.source === "pt-case") return false;
      if (mountedRef.current) {
        const detail =
          err instanceof Error
            ? err.message
            : "Không ghi được kết quả vào trình duyệt.";
        setSaveError(`Chưa lưu được tiến độ. ${detail}`);
      }
      retryCallbackRef.current = async () => {
        inFlightSubmissionsRef.current.delete(submission.id);
        await submitAttempt(submission, targetDraftId);
      };
      return false;
    } finally {
      inFlightSubmissionsRef.current.delete(submission.id);
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (timersRef.current[draftId]) {
      if (typeof clearTimeout === "function") {
        clearTimeout(timersRef.current[draftId]);
      }
      delete timersRef.current[draftId];
    }
    delete revisionsRef.current[draftId];
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    try {
      await storeRef.current.deleteDraft(draftId);
    } catch {
      // Keep UI responsive even if draft delete fails.
    }
  };

  const retryLastSave = async () => {
    const fn = retryCallbackRef.current;
    if (fn) {
      await fn();
    } else {
      await refresh();
    }
  };

  const resolveRevisionConflict = async (
    mode: "load-remote" | "start-fresh",
  ) => {
    if (!revisionConflict) return;
    const { draftId, remoteDraft } = revisionConflict;
    if (mode === "load-remote" && remoteDraft) {
      revisionsRef.current[draftId] = remoteDraft.revision;
      setDrafts((prev) => [
        remoteDraft,
        ...prev.filter((d) => d.id !== draftId),
      ]);
      setRevisionConflict(null);
      setSaveError(null);
      return;
    }
    await deleteDraft(draftId);
    setRevisionConflict(null);
    setSaveError(null);
  };

  const clearAllProgress = async () => {
    if (typeof clearTimeout === "function") {
      for (const timer of Object.values(timersRef.current)) {
        clearTimeout(timer);
      }
    }
    timersRef.current = {};
    revisionsRef.current = {};
    retryCallbackRef.current = null;
    try {
      await storeRef.current.clearAllProgress();
      if (mountedRef.current) {
        setDrafts([]);
        setSubmissions([]);
        setStoreWarning(null);
        setSaveError(null);
        setRevisionConflict(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const detail =
          err instanceof Error ? err.message : "Không thể xóa kho tiến độ.";
        setSaveError(`Chưa xóa được tiến độ. ${detail}`);
      }
    }
  };

  const summary = summarizeLearningProgress(submissions);

  return {
    hydrated,
    drafts,
    submissions,
    summary,
    storeWarning,
    saveError,
    revisionConflict,
    queueSaveDraft,
    saveDraftNow,
    submitAttempt,
    deleteDraft,
    retryLastSave,
    resolveRevisionConflict,
    clearAllProgress,
    refresh,
  };
}
