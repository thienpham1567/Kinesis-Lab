import { NCSF_DOMAINS, type NcsfDomain } from "@/lib/ncsf-quiz";
import type {
  DomainLearningSummary,
  ItemReviewSchedule,
  LearningScheduleSummary,
  LearningSubmission,
} from "./types";

// Product-chosen intervals in days for consecutive correct answers; wrong resets to 1 day.
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
export const SHORT_SESSION_MAX_ITEMS = 10;
export const UNCLASSIFIED_DOMAIN = "unclassified";

const DAY_MS = 24 * 60 * 60 * 1000;

export function domainLabel(domain: string | null | undefined): string {
  if (!domain || domain === UNCLASSIFIED_DOMAIN) return "Chưa phân loại";
  if (Object.hasOwn(NCSF_DOMAINS, domain)) {
    return NCSF_DOMAINS[domain as NcsfDomain];
  }
  return "Chưa phân loại";
}

export function normalizeDomainKey(domain: string | null | undefined): string {
  if (!domain || !Object.hasOwn(NCSF_DOMAINS, domain)) {
    return UNCLASSIFIED_DOMAIN;
  }
  return domain;
}

export function nextReviewAt(
  nowIso: string,
  streak: number,
  correct: boolean,
): string {
  const baseMs = Date.parse(nowIso);
  if (!Number.isFinite(baseMs)) {
    throw new Error(`Invalid ISO timestamp: ${nowIso}`);
  }
  const safeStreak = Number.isFinite(streak)
    ? Math.max(0, Math.min(REVIEW_INTERVAL_DAYS.length - 1, Math.floor(streak)))
    : 0;
  const days = correct ? REVIEW_INTERVAL_DAYS[safeStreak] : 1;
  return new Date(baseMs + days * DAY_MS).toISOString();
}

export function summarizeLearningProgress(
  submissions: readonly LearningSubmission[],
  nowIso: string = new Date().toISOString(),
): LearningScheduleSummary {
  const nowMs = Date.parse(nowIso);
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const safeNowIso = new Date(safeNowMs).toISOString();

  const ordered = [...submissions]
    .map((submission, index) => ({
      submission,
      index,
      ms: Date.parse(submission.submittedAt),
    }))
    .sort((a, b) => {
      if (Number.isFinite(a.ms) && Number.isFinite(b.ms) && a.ms !== b.ms) {
        return a.ms - b.ms;
      }
      return a.index - b.index;
    });

  const itemsById: Record<string, ItemReviewSchedule> = {};
  const domainAttempts = new Map<string, number>();

  for (const { submission } of ordered) {
    for (const item of submission.items) {
      const normalizedDomain = normalizeDomainKey(item.domain);
      domainAttempts.set(
        normalizedDomain,
        (domainAttempts.get(normalizedDomain) ?? 0) + 1,
      );

      const previous = itemsById[item.itemId];
      const priorStreak = previous ? previous.streak : 0;
      const reviewIso = nextReviewAt(
        submission.submittedAt,
        priorStreak,
        item.correct,
      );
      const reviewMs = Date.parse(reviewIso);
      const nextStreak = item.correct ? priorStreak + 1 : 0;

      if (!previous) {
        itemsById[item.itemId] = {
          itemId: item.itemId,
          source: submission.source,
          domain: item.domain,
          attempts: 1,
          firstCorrect: item.correct,
          lastCorrect: item.correct,
          streak: nextStreak,
          lastSubmittedAt: submission.submittedAt,
          lastSubmissionId: submission.id,
          nextReviewAt: reviewIso,
          due: Number.isFinite(reviewMs) && reviewMs <= safeNowMs,
        };
      } else {
        itemsById[item.itemId] = {
          ...previous,
          source: submission.source,
          domain: item.domain ?? previous.domain,
          attempts: previous.attempts + 1,
          lastCorrect: item.correct,
          streak: nextStreak,
          lastSubmittedAt: submission.submittedAt,
          lastSubmissionId: submission.id,
          nextReviewAt: reviewIso,
          due: Number.isFinite(reviewMs) && reviewMs <= safeNowMs,
        };
      }
    }
  }

  const allSchedules = Object.values(itemsById);
  const dueItems = allSchedules
    .filter((item) => item.due)
    .sort((a, b) => {
      const diff = Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt);
      if (diff !== 0) return diff;
      return a.itemId.localeCompare(b.itemId);
    });

  const domainMap = new Map<
    string,
    {
      seenCount: number;
      firstTryCorrectCount: number;
      latestCorrectCount: number;
      dueCount: number;
    }
  >();

  for (const item of allSchedules) {
    const key = normalizeDomainKey(item.domain);
    const current = domainMap.get(key) ?? {
      seenCount: 0,
      firstTryCorrectCount: 0,
      latestCorrectCount: 0,
      dueCount: 0,
    };
    current.seenCount += 1;
    if (item.firstCorrect) current.firstTryCorrectCount += 1;
    if (item.lastCorrect) current.latestCorrectCount += 1;
    if (item.due) current.dueCount += 1;
    domainMap.set(key, current);
  }

  const domains: DomainLearningSummary[] = [...domainMap.entries()]
    .map(([domain, stats]) => {
      const attempts = domainAttempts.get(domain) ?? stats.seenCount;
      const firstTryRate =
        stats.seenCount > 0
          ? Math.round((stats.firstTryCorrectCount / stats.seenCount) * 100)
          : 0;
      const latestRate =
        stats.seenCount > 0
          ? Math.round((stats.latestCorrectCount / stats.seenCount) * 100)
          : 0;
      return {
        domain,
        label: domainLabel(domain),
        attempts,
        seenCount: stats.seenCount,
        firstTryCorrectCount: stats.firstTryCorrectCount,
        firstTryRate,
        latestCorrectCount: stats.latestCorrectCount,
        latestRate,
        dueCount: stats.dueCount,
      };
    })
    .sort((a, b) => {
      if (b.dueCount !== a.dueCount) return b.dueCount - a.dueCount;
      if (a.latestRate !== b.latestRate) return a.latestRate - b.latestRate;
      return a.label.localeCompare(b.label, "vi");
    });

  return {
    nowIso: safeNowIso,
    totalSubmissions: submissions.length,
    totalSeenItems: allSchedules.length,
    dueItems,
    itemsById,
    domains,
  };
}

export function buildStudySessionItems({
  catalogItems,
  summary,
  domainFilter,
  mode = "due-first",
  maxItems = SHORT_SESSION_MAX_ITEMS,
}: {
  catalogItems: readonly { itemId: string; domain: string | null }[];
  summary: LearningScheduleSummary;
  domainFilter?: string | null;
  mode?: "due-first" | "due-only" | "domain";
  maxItems?: number;
}): string[] {
  const limit = Math.max(1, Math.min(SHORT_SESSION_MAX_ITEMS, Math.floor(maxItems)));
  const seenInCatalog = new Set<string>();
  const uniqueCatalog: { itemId: string; domain: string | null }[] = [];
  for (const item of catalogItems) {
    if (seenInCatalog.has(item.itemId)) continue;
    if (
      domainFilter &&
      normalizeDomainKey(item.domain) !== normalizeDomainKey(domainFilter)
    ) {
      continue;
    }
    seenInCatalog.add(item.itemId);
    uniqueCatalog.push(item);
  }

  const dueCandidates = uniqueCatalog
    .filter((item) => summary.itemsById[item.itemId]?.due)
    .sort((a, b) => {
      const sa = summary.itemsById[a.itemId]!;
      const sb = summary.itemsById[b.itemId]!;
      return Date.parse(sa.nextReviewAt) - Date.parse(sb.nextReviewAt);
    })
    .map((item) => item.itemId);

  if (mode === "due-only") {
    return dueCandidates.slice(0, limit);
  }

  const unseenCandidates = uniqueCatalog
    .filter((item) => !summary.itemsById[item.itemId])
    .map((item) => item.itemId);

  const reviewAgainCandidates = uniqueCatalog
    .filter((item) => {
      const sched = summary.itemsById[item.itemId];
      return sched && !sched.due;
    })
    .sort((a, b) => {
      const sa = summary.itemsById[a.itemId]!;
      const sb = summary.itemsById[b.itemId]!;
      if (sa.lastCorrect !== sb.lastCorrect) return sa.lastCorrect ? 1 : -1;
      if (sa.streak !== sb.streak) return sa.streak - sb.streak;
      return Date.parse(sa.nextReviewAt) - Date.parse(sb.nextReviewAt);
    })
    .map((item) => item.itemId);

  return [
    ...dueCandidates,
    ...unseenCandidates,
    ...(mode === "domain" ? reviewAgainCandidates : []),
  ].slice(0, limit);
}
