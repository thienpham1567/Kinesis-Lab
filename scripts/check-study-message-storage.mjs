import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader({ globals: { crypto } });
const {
  upgradeStudyMessages,
  toChatMessages,
  parseStudyChatStore,
  serializeStudyChatStore,
  illustrationContextFromChat,
} = load("src/lib/chat/study-messages.ts");

const v1 = [
  { role: "user", content: "Cơ nhị đầu ở đâu?" },
  { role: "assistant", content: "Nhị đầu nằm nông ở cánh tay trước." },
];

test("upgrades v1 role/content history to stable ids and empty attachments", () => {
  const first = upgradeStudyMessages(v1);
  assert.equal(first.length, 2);
  assert.equal(first[0].role, "user");
  assert.equal(first[0].content, v1[0].content);
  assert.equal(first[0].attachments.length, 0);
  assert.equal(first[0].sources.length, 0);
  assert.match(first[0].id, /^[0-9a-f-]{36}$/i);
  const stored = JSON.parse(serializeStudyChatStore({ conversationId: "conv-1", messages: first }));
  const again = parseStudyChatStore(JSON.stringify(stored)).messages;
  assert.equal(again[0].id, first[0].id);
  assert.equal(again[1].id, first[1].id);
});

test("broken history falls back without throwing", () => {
  assert.equal(upgradeStudyMessages(null).length, 0);
  assert.equal(upgradeStudyMessages("nope").length, 0);
  assert.equal(parseStudyChatStore("not-json").messages.length, 0);
});

test("toChatMessages sends only role/content and drops empty image-only rows", () => {
  const messages = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      role: "user",
      content: "Tạo hình",
      attachments: [],
      sources: [],
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      role: "assistant",
      content: "",
      attachments: [{ imageId: "img-1", sourceMessageId: "11111111-1111-4111-8111-111111111111", state: "generating" }],
      sources: [{ id: "upper", title: "OpenStax", url: "https://openstax.org", checkedAt: "2026-10-23", access: "§11.5" }],
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      role: "assistant",
      content: "Giải thích chi tiết",
      attachments: [],
      sources: [],
    },
  ];
  const wire = toChatMessages(messages);
  assert.equal(wire.length, 2);
  assert.equal(wire[0].role, "user");
  assert.equal(wire[0].content, "Tạo hình");
  assert.equal(wire[1].role, "assistant");
  assert.equal(wire[1].content, "Giải thích chi tiết");
  assert.equal(JSON.stringify(wire).includes("attachments"), false);
  assert.equal(JSON.stringify(wire).includes("img-1"), false);
  assert.equal(JSON.stringify(wire).includes("upper"), false);
});

test("illustration context uses the latest Q&A pair unless a specific answer is chosen", () => {
  const messages = [
    { id: "11111111-1111-4111-8111-111111111111", role: "user", content: "Cơ nhị đầu ở đâu?", attachments: [], sources: [] },
    { id: "22222222-2222-4222-8222-222222222222", role: "assistant", content: "Nhị đầu nằm nông ở cánh tay trước.", attachments: [], sources: [] },
    { id: "33333333-3333-4333-8333-333333333333", role: "user", content: "Squat rộng chân thì sao?", attachments: [], sources: [] },
    { id: "44444444-4444-4444-8444-444444444444", role: "assistant", content: "Độ rộng chân làm thay đổi cơ học, không phải tư thế chuẩn.", attachments: [], sources: [] },
  ];
  const latest = illustrationContextFromChat(messages);
  assert.equal(latest.sourceMessageId, messages[3].id);
  assert.equal(latest.instruction, "Squat rộng chân thì sao?");
  assert.match(latest.selectedContext, /Câu hỏi:\nSquat rộng chân thì sao\?/);
  assert.match(latest.selectedContext, /Câu trả lời:\nĐộ rộng chân làm thay đổi cơ học/);
  assert.equal(latest.contextTitle, "Squat rộng chân thì sao?");
  const pinned = illustrationContextFromChat(messages, messages[1].id);
  assert.equal(pinned.sourceMessageId, messages[1].id);
  assert.equal(pinned.instruction, "Cơ nhị đầu ở đâu?");
  const empty = illustrationContextFromChat([]);
  assert.equal(empty.sourceMessageId, null);
  assert.equal(empty.instruction, "");
});

test("sources stay on the originating message", () => {
  const upgraded = upgradeStudyMessages([
    { role: "user", content: "câu 1", sources: [{ id: "upper", title: "A", url: "https://a.example", checkedAt: "2026-10-23", access: "a" }] },
    { role: "assistant", content: "trả lời 1" },
    { role: "user", content: "câu 2", sources: [{ id: "squat", title: "B", url: "https://b.example", checkedAt: "2026-10-22", access: "b" }] },
  ]);
  assert.equal(upgraded[0].sources[0].id, "upper");
  assert.equal(upgraded[2].sources[0].id, "squat");
  assert.equal(upgraded[1].sources.length, 0);
});
