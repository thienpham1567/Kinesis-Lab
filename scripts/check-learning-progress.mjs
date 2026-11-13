import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader({
  globals: {
    crypto: webcrypto,
    BroadcastChannel: class FakeBroadcastChannel {
      constructor(name) {
        this.name = name;
      }
      postMessage() {}
      close() {}
    },
  },
});

const { nextReviewAt, summarizeLearningProgress, buildStudySessionItems } = load(
  "src/lib/learning/schedule.ts",
);
const {
  normalizeLearningText,
  hashOptionText,
  identifyQuizQuestion,
  identifyQuizBank,
  identifyMockBank,
  sha256Hex,
  sha256HexAsync,
} = load("src/lib/learning/ncsf-identity.ts");
const { createProgressStore, LEARNING_LIMITS } = load(
  "src/lib/learning/progress-store.ts",
);

test("review scheduling uses a fixed instant and resets after an error", () => {
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 0, true),
    "2026-11-12T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 3, false),
    "2026-11-12T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 1, true),
    "2026-11-14T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 2, true),
    "2026-11-18T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 3, true),
    "2026-11-25T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 4, true),
    "2026-12-11T08:00:00.000Z",
  );
  assert.equal(
    nextReviewAt("2026-11-11T08:00:00.000Z", 99, true),
    "2026-12-11T08:00:00.000Z",
  );
});

test("synchronous SHA-256 matches Web Crypto SHA-256 on Vietnamese NFC text", async () => {
  const sample = normalizeLearningText(
    "  Đánh   giá   biên độ vận động khớp vai (ROM) ở học viên  ",
  );
  assert.equal(
    sample,
    "Đánh giá biên độ vận động khớp vai (ROM) ở học viên",
  );
  const syncDigest = sha256Hex(sample);
  const asyncDigest = await sha256HexAsync(sample);
  assert.equal(syncDigest, asyncDigest);
});

test("question identity is invariant to option order and changes when answer, text, explanation or figure changes", () => {
  const baseQuestion = {
    q: "Cơ nào giữ vai trò chủ vận khi gập khuỷu tay?",
    options: ["Cơ nhị đầu cánh tay", "Cơ tam đầu cánh tay", "Cơ delta", "Cơ ngực lớn"],
    answer: 0,
    explain: "Cơ nhị đầu cánh tay là cơ gập khuỷu chính.",
    page: 14,
    evidence: "Nguồn tổng hợp minh họa",
    domain: "functional-anatomy",
  };
  const reorderedQuestion = {
    ...baseQuestion,
    options: ["Cơ tam đầu cánh tay", "Cơ nhị đầu cánh tay", "Cơ ngực lớn", "Cơ delta"],
    answer: 1,
  };
  const first = identifyQuizQuestion(1, 0, baseQuestion);
  const second = identifyQuizQuestion(1, 5, reorderedQuestion);
  assert.equal(first.itemId, second.itemId, "swapping options must keep itemId");
  assert.equal(
    first.correctOptionId,
    second.correctOptionId,
    "correct option hash follows the option content",
  );
  assert.equal(first.optionIds[0], second.optionIds[1]);

  const wrongKeyChanged = identifyQuizQuestion(1, 0, {
    ...baseQuestion,
    answer: 2,
  });
  assert.notEqual(
    first.itemId,
    wrongKeyChanged.itemId,
    "changing the answer key must create a new identity",
  );

  const explainChanged = identifyQuizQuestion(1, 0, {
    ...baseQuestion,
    explain: "Giải thích đã được biên tập lại.",
  });
  assert.notEqual(first.itemId, explainChanged.itemId);

  const figureChanged = identifyQuizQuestion(1, 0, {
    ...baseQuestion,
    figure: { page: 14, alt: "Hình khớp khuỷu" },
  });
  assert.notEqual(first.itemId, figureChanged.itemId);

  // NFC vs NFD normalization preserves identity while diacritics and case stay distinct.
  const nfdQuestion = {
    ...baseQuestion,
    q: baseQuestion.q.normalize("NFD"),
  };
  assert.equal(identifyQuizQuestion(1, 0, nfdQuestion).itemId, first.itemId);

  const lowerQuestion = {
    ...baseQuestion,
    q: baseQuestion.q.toLowerCase(),
  };
  assert.notEqual(
    identifyQuizQuestion(1, 0, lowerQuestion).itemId,
    first.itemId,
    "must not lowercase text during canonicalization",
  );
});

test("duplicate canonical questions merge review schedule while preserving both display positions", () => {
  const q1 = {
    q: "Tần suất tập kháng lực tối thiểu theo khuyến nghị cơ bản là:",
    options: ["1 ngày/tuần", "2 ngày/tuần", "5 ngày/tuần", "7 ngày/tuần"],
    answer: 1,
    explain: "Tối thiểu 2 ngày/tuần cho các nhóm cơ chính.",
    page: 9,
    evidence: "Synthetic quote",
    domain: "exercise-programming",
  };
  const bank = {
    chapters: [
      {
        ch: 1,
        questions: [q1, { ...q1 }],
      },
    ],
  };
  const index = identifyQuizBank(bank);
  const locations = index.byChapter.get(1);
  assert.equal(locations.length, 2);
  assert.equal(locations[0].itemId, locations[1].itemId);
  const record = index.byItemId.get(locations[0].itemId);
  assert.equal(record.locations.length, 2);
  assert.deepEqual(
    Array.from(record.locations, (l) => l.questionIndex),
    [0, 1],
  );
});

test("mock bank identity strips option letter prefixes so shuffled mock choices retain option IDs", () => {
  const mockBank = {
    checkedAt: "2026-11-11",
    exams: [
      {
        id: 1,
        questions: [
          {
            position: 1,
            title: "Câu 1: Đơn vị tính VO2max tương đối là gì?",
            options: [
              "A. ml/kg/phút",
              "B. L/phút",
              "C. nhịp/phút",
              "D. kcal/ngày",
            ],
            images: [],
            answer: 0,
            explanation: "VO2max tương đối tính theo ml/kg/phút.",
            notes: "",
            qualified: false,
            sources: [],
          },
        ],
      },
    ],
  };
  const identified = identifyMockBank(mockBank);
  const item = identified.byExam.get(1)[0];
  assert.equal(item.optionIds[0], hashOptionText("ml/kg/phút"));
  assert.equal(item.correctOptionId, item.optionIds[0]);
});

test("schedule summary tracks attempts, first-try vs latest accuracy, unclassified domain and short 10-item queue", () => {
  const submissions = [
    {
      id: "sub-1",
      source: "ncsf-quiz",
      submittedAt: "2026-11-01T08:00:00.000Z",
      items: [
        {
          itemId: "item-a",
          selectedOptionId: "opt-wrong",
          correct: false,
          domain: "functional-anatomy",
        },
        {
          itemId: "item-b",
          selectedOptionId: "opt-right",
          correct: true,
          domain: "functional-anatomy",
        },
        {
          itemId: "item-c",
          selectedOptionId: "opt-right",
          correct: true,
          domain: null,
        },
      ],
    },
    {
      id: "sub-2",
      source: "ncsf-quiz",
      submittedAt: "2026-11-03T08:00:00.000Z",
      items: [
        {
          itemId: "item-a",
          selectedOptionId: "opt-right",
          correct: true,
          domain: "functional-anatomy",
        },
      ],
    },
  ];
  const summary = summarizeLearningProgress(
    submissions,
    "2026-11-01T12:00:00.000Z",
  );
  assert.equal(summary.itemsById["item-b"].due, false);

  const summaryLater = summarizeLearningProgress(
    submissions,
    "2026-11-04T09:00:00.000Z",
  );
  assert.equal(summaryLater.totalSubmissions, 2);
  assert.equal(summaryLater.totalSeenItems, 3);
  assert.equal(summaryLater.itemsById["item-a"].attempts, 2);
  assert.equal(summaryLater.itemsById["item-a"].firstCorrect, false);
  assert.equal(summaryLater.itemsById["item-a"].lastCorrect, true);
  assert.equal(summaryLater.itemsById["item-a"].streak, 1);
  assert.equal(summaryLater.itemsById["item-a"].lastSubmissionId, "sub-2");
  assert.equal(summaryLater.itemsById["item-a"].due, true);

  const anatomy = summaryLater.domains.find(
    (d) => d.domain === "functional-anatomy",
  );
  assert.ok(anatomy);
  assert.equal(anatomy.seenCount, 2);
  assert.equal(anatomy.attempts, 3);
  assert.equal(anatomy.firstTryCorrectCount, 1);
  assert.equal(anatomy.latestCorrectCount, 2);

  const unclassified = summaryLater.domains.find(
    (d) => d.domain === "unclassified",
  );
  assert.ok(unclassified);
  assert.equal(unclassified.label, "Chưa phân loại");
  assert.equal(unclassified.seenCount, 1);

  // Short study session caps at 10 items, prioritizing due items then unseen items.
  const catalogItems = Array.from({ length: 15 }, (_, i) => ({
    itemId: i === 0 ? "item-a" : i === 1 ? "item-b" : `unseen-${i}`,
    domain: "functional-anatomy",
  }));
  const queue = buildStudySessionItems({
    catalogItems,
    summary: summaryLater,
    mode: "due-first",
    maxItems: 10,
  });
  assert.equal(queue.length, 10);
  assert.deepEqual(Array.from(queue.slice(0, 2)), ["item-b", "item-a"]);
  assert.ok(queue.slice(2).every((id) => id.startsWith("unseen-")));
});

function createFakeIdbFactory({
  schemaVersion = 1,
  failOnPutStore = null,
  initialDrafts = [],
  initialSubmissions = [],
  overrideSubmissionCount = null,
} = {}) {
  const databases = new Map();

  function ensureDb(name) {
    if (!databases.has(name)) {
      const drafts = new Map(initialDrafts.map((d) => [d.id, structuredClone(d)]));
      const submissions = new Map(
        initialSubmissions.map((s) => [s.id, structuredClone(s)]),
      );
      databases.set(name, {
        version: schemaVersion,
        storeNames: new Set(["drafts", "submissions"]),
        stores: { drafts, submissions },
      });
    }
    return databases.get(name);
  }

  return {
    databases,
    open(name, requestedVersion = 1) {
      const req = {
        result: null,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      };
      queueMicrotask(() => {
        const dbRecord = ensureDb(name);
        if (requestedVersion < dbRecord.version) {
          const err = new Error("VersionError");
          err.name = "VersionError";
          req.error = err;
          req.onerror?.();
          return;
        }
        const db = {
          objectStoreNames: {
            contains: (storeName) => dbRecord.storeNames.has(storeName),
          },
          createObjectStore(storeName) {
            dbRecord.storeNames.add(storeName);
            if (!dbRecord.stores[storeName]) {
              dbRecord.stores[storeName] = new Map();
            }
            return {};
          },
          transaction(storeNames) {
            const names = Array.isArray(storeNames) ? storeNames : [storeNames];
            const working = {};
            for (const sName of names) {
              working[sName] = new Map(dbRecord.stores[sName]);
            }
            let aborted = false;
            let pending = 0;
            let settled = false;

            const tx = {
              error: null,
              oncomplete: null,
              onerror: null,
              onabort: null,
              abort() {
                if (settled) return;
                aborted = true;
                settled = true;
                queueMicrotask(() => tx.onabort?.());
              },
              objectStore(sName) {
                const map = working[sName];
                const runReq = (fn) => {
                  pending += 1;
                  const r = {
                    result: undefined,
                    error: null,
                    onsuccess: null,
                    onerror: null,
                  };
                  queueMicrotask(() => {
                    pending -= 1;
                    if (aborted) return;
                    try {
                      r.result = fn();
                      r.onsuccess?.();
                      setTimeout(() => {
                        if (pending === 0 && !aborted && !settled) {
                          settled = true;
                          for (const n of names) {
                            dbRecord.stores[n] = working[n];
                          }
                          tx.oncomplete?.();
                        }
                      }, 0);
                    } catch (err) {
                      aborted = true;
                      settled = true;
                      r.error = err;
                      tx.error = err;
                      r.onerror?.();
                      queueMicrotask(() => tx.onerror?.());
                    }
                  });
                  return r;
                };
                return {
                  get: (key) => runReq(() => structuredClone(map.get(key))),
                  getAll: () =>
                    runReq(() => [...map.values()].map((v) => structuredClone(v))),
                  count: () =>
                    runReq(() =>
                      sName === "submissions" && overrideSubmissionCount !== null
                        ? overrideSubmissionCount
                        : map.size,
                    ),
                  put: (val) =>
                    runReq(() => {
                      if (failOnPutStore === sName) {
                        throw new Error(`Simulated write failure on ${sName}`);
                      }
                      map.set(val.id, structuredClone(val));
                      return val.id;
                    }),
                  delete: (key) =>
                    runReq(() => {
                      map.delete(key);
                    }),
                  clear: () =>
                    runReq(() => {
                      map.clear();
                    }),
                };
              },
            };
            return tx;
          },
          close() {},
        };
        req.result = db;
        req.onupgradeneeded?.();
        req.onsuccess?.();
      });
      return req;
    },
  };
}

test("progress store enforces revision concurrency, atomic submit+delete, idempotence, and conflict rejection", async () => {
  const idbFactory = createFakeIdbFactory();
  const store = createProgressStore({ idbFactory });

  const draft = {
    id: "quiz-ch1",
    source: "ncsf-quiz",
    revision: 0,
    updatedAt: "2026-11-11T08:00:00.000Z",
    items: [
      {
        itemId: "item-1",
        optionOrder: ["opt-b", "opt-a", "opt-c", "opt-d"],
        selectedOptionId: "opt-a",
      },
    ],
    currentItemId: "item-1",
  };

  const saved1 = await store.saveDraft(draft, 0);
  assert.equal(saved1.revision, 1);

  // Stale expectedRevision from another tab must reject without overwriting.
  await assert.rejects(
    () =>
      store.saveDraft(
        {
          ...draft,
          updatedAt: "2026-11-11T08:01:00.000Z",
        },
        0,
      ),
    (err) => err.code === "revision-conflict" && err.currentDraft?.revision === 1,
  );

  // Submit deletes the draft in the same transaction and records the submission.
  const submission = {
    id: "attempt-1",
    source: "ncsf-quiz",
    submittedAt: "2026-11-11T08:05:00.000Z",
    items: [
      {
        itemId: "item-1",
        selectedOptionId: "opt-a",
        correct: true,
        domain: "functional-anatomy",
      },
    ],
  };

  const firstSubmit = await store.submitAttempt(submission, "quiz-ch1");
  assert.equal(firstSubmit.status, "saved");

  let snap = await store.readSnapshot();
  assert.equal(snap.drafts.length, 0, "draft deleted on submit");
  assert.equal(snap.submissions.length, 1);

  // Submitting identical attempt ID and payload is idempotent.
  const secondSubmit = await store.submitAttempt(submission, "quiz-ch1");
  assert.equal(secondSubmit.status, "idempotent");
  snap = await store.readSnapshot();
  assert.equal(snap.submissions.length, 1, "idempotent retry must not duplicate");

  // Submitting same ID with different payload must report conflict.
  await assert.rejects(
    () =>
      store.submitAttempt({
        ...submission,
        items: [
          {
            itemId: "item-1",
            selectedOptionId: "opt-b",
            correct: false,
            domain: "functional-anatomy",
          },
        ],
      }),
    (err) => err.code === "submission-conflict",
  );
});

test("progress store rolls back draft deletion if submission write fails, filters corrupt records without wiping DB, and enforces limits", async () => {
  const validDraft = {
    id: "draft-keep",
    source: "ncsf-quiz",
    revision: 1,
    updatedAt: "2026-11-11T08:00:00.000Z",
    items: [
      {
        itemId: "item-1",
        optionOrder: ["opt-a", "opt-b"],
        selectedOptionId: "opt-a",
      },
    ],
    currentItemId: "item-1",
  };
  const corruptDraft = {
    id: "draft-corrupt",
    source: "ncsf-quiz",
    revision: 1,
    updatedAt: "2026-11-11T08:00:00.000Z",
    q: "Forbidden question stem inside IndexedDB",
    items: [],
    currentItemId: null,
  };

  // 1. Corrupt record filtering at read point preserves valid data and surfaces warning.
  const idbWithCorrupt = createFakeIdbFactory({
    initialDrafts: [validDraft, corruptDraft],
  });
  const storeWithCorrupt = createProgressStore({ idbFactory: idbWithCorrupt });
  const snap = await storeWithCorrupt.readSnapshot();
  assert.equal(snap.drafts.length, 1);
  assert.equal(snap.drafts[0].id, "draft-keep");
  assert.equal(snap.corruptedCount, 1);
  assert.ok(snap.warning);

  // 2. Write failure during submit keeps existing draft intact.
  const idbFailWrite = createFakeIdbFactory({
    initialDrafts: [validDraft],
    failOnPutStore: "submissions",
  });
  const failingStore = createProgressStore({ idbFactory: idbFailWrite });
  await assert.rejects(
    () =>
      failingStore.submitAttempt(
        {
          id: "sub-fail",
          source: "ncsf-quiz",
          submittedAt: "2026-11-11T08:10:00.000Z",
          items: [
            {
              itemId: "item-1",
              selectedOptionId: "opt-a",
              correct: true,
              domain: null,
            },
          ],
        },
        "draft-keep",
      ),
    (err) => err.code === "write-failed",
  );
  const afterFailure = await failingStore.readSnapshot();
  assert.equal(
    afterFailure.drafts.length,
    1,
    "transaction failure must not delete the draft",
  );

  // 3. Limits: >300 draft items and >=3000 submissions rejected without deleting history.
  const tooManyItemsDraft = {
    ...validDraft,
    items: Array.from({ length: LEARNING_LIMITS.maxDraftItems + 1 }, (_, i) => ({
      itemId: `item-${i}`,
      optionOrder: ["opt-a", "opt-b"],
      selectedOptionId: null,
    })),
  };
  await assert.rejects(
    () => storeWithCorrupt.saveDraft(tooManyItemsDraft, 0),
    (err) => err.code === "limit-exceeded",
  );

  const idbMaxSubmissions = createFakeIdbFactory({
    overrideSubmissionCount: LEARNING_LIMITS.maxSubmissions,
  });
  const fullStore = createProgressStore({ idbFactory: idbMaxSubmissions });
  await assert.rejects(
    () =>
      fullStore.submitAttempt({
        id: "sub-over-limit",
        source: "ncsf-quiz",
        submittedAt: "2026-11-11T08:10:00.000Z",
        items: [
          {
            itemId: "item-1",
            selectedOptionId: "opt-a",
            correct: true,
            domain: null,
          },
        ],
      }),
    (err) => err.code === "limit-exceeded",
  );

  // 4. Newer schema version surfaces newer-schema error.
  const newerIdb = createFakeIdbFactory({ schemaVersion: 99 });
  const olderAppStore = createProgressStore({ idbFactory: newerIdb, version: 1 });
  await assert.rejects(
    () => olderAppStore.readSnapshot(),
    (err) => err.code === "newer-schema",
  );
});


test("case history preserves versions, rejects free text, and leaves NCSF progress intact", async () => {
  const submittedAt = "2026-11-13T08:00:00.000Z";
  const draft = {
    id: "draft-keep", source: "ncsf-quiz", revision: 1,
    updatedAt: submittedAt,
    items: [{ itemId: "question", optionOrder: ["option", "other"], selectedOptionId: null }],
    currentItemId: "question",
  };
  const quizAttempt = {
    id: "quiz-result", source: "ncsf-quiz", submittedAt,
    items: [{ itemId: "question", selectedOptionId: "option", correct: true, domain: "functional-anatomy" }],
  };
  const idbFactory = createFakeIdbFactory({ initialDrafts: [draft], initialSubmissions: [quizAttempt] });
  const store = createProgressStore({ idbFactory });
  const attempt = {
    id: "pt-case:attempt", source: "pt-case", submittedAt,
    caseId: "equipment-change", caseVersion: 1, choiceIds: ["copy-load"],
    evaluation: {
      addressedCriterionIds: [], revisitCriterionIds: ["compare"],
      unpracticedCriterionIds: ["agree", "document"], nextCheckpointId: null,
    },
  };
  const summaryBefore = summarizeLearningProgress((await store.readSnapshot()).submissions, submittedAt);
  assert.equal((await store.submitAttempt(attempt, draft.id)).status, "saved");
  assert.equal((await store.submitAttempt(attempt, draft.id)).status, "idempotent");
  await assert.rejects(() => store.submitAttempt({ ...attempt, caseVersion: 2 }),
    (err) => err.code === "submission-conflict");
  await assert.rejects(() => store.submitAttempt({ ...attempt, id: "pt-case:extra", reason: "session only" }),
    (err) => err.code === "invalid-payload");
  await store.submitAttempt({ ...attempt, id: "pt-case:later", caseVersion: 2 });
  const snapshot = await store.readSnapshot();
  assert.equal(snapshot.drafts.length, 1);
  assert.equal(snapshot.submissions.length, 3);
  assert.equal(snapshot.submissions.find(({ id }) => id === attempt.id).caseVersion, 1);
  assert.deepEqual(summarizeLearningProgress(snapshot.submissions, submittedAt), summaryBefore);
});
