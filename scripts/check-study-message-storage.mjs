import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader({ globals: { crypto } });
const { answerCitationsFromEvidence, parseAnswerCitations } = load("src/lib/chat/answer-citations.ts");
const {
  upgradeStudyMessages,
  toChatMessages,
  parseStudyChatStore,
  serializeStudyChatStore,
  illustrationContextFromChat,
  imagePromptMessageId,
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

test("selecting a user prompt keeps its exact text and never borrows a later answer", () => {
  const prompt = `Đoạn tôi đang đọc:\n"${"Thuật ngữ về vị trí. ".repeat(110)}"\n\nVẽ sơ đồ giúp tôi.`;
  const messages = upgradeStudyMessages([
    { role: "user", content: prompt },
    { role: "assistant", content: "Câu trả lời cho đoạn đọc." },
    { role: "user", content: "Một câu hỏi khác." },
    { role: "assistant", content: "Câu trả lời mới nhất không liên quan." },
  ]);
  const chosen = illustrationContextFromChat(messages, messages[0].id);
  assert.equal(chosen.sourceMessageId, messages[0].id);
  assert.equal(chosen.instruction, prompt);
  assert.ok(chosen.selectedContext.includes(prompt));
  assert.equal(chosen.selectedContext.includes("không liên quan"), false);
});

test("a prompt can be illustrated before an assistant has answered", () => {
  const messages = upgradeStudyMessages([{ role: "user", content: "Vẽ sơ đồ các hướng trên cơ thể." }]);
  const chosen = illustrationContextFromChat(messages, messages[0].id);
  assert.equal(chosen.sourceMessageId, messages[0].id);
  assert.equal(chosen.instruction, messages[0].content);
  assert.equal(illustrationContextFromChat(messages).instruction, messages[0].content);
  assert.equal(illustrationContextFromChat(messages, "missing").sourceMessageId, null);
});

test("edit and retry restore the image's submitted prompt after customization", () => {
  const messages = upgradeStudyMessages([
    { role: "user", content: "Câu hỏi ban đầu." },
    { role: "assistant", content: "Câu trả lời." },
    { role: "user", content: "Vẽ hai ô, giữ đúng tiêu đề tôi sửa." },
    { role: "assistant", content: "", attachments: [{ imageId: "image-1", sourceMessageId: "old-question", state: "failed" }] },
    { role: "user", content: "Câu hỏi mới hơn." },
  ]);
  const id = imagePromptMessageId(messages, "image-1");
  assert.equal(id, messages[2].id);
  assert.equal(illustrationContextFromChat(messages, id).instruction, messages[2].content);
  assert.equal(imagePromptMessageId(messages, "missing"), null);
});

test("each answer retains its own readable citations after reload, without sending metadata to chat", () => {
  const citations = answerCitationsFromEvidence([{
    id: "handbook:patterns", label: "Mẫu vận động cơ bản",
    evidence: { sources: [{ title: "Nguồn đối chiếu", url: "https://example.org/source", checkedAt: "2026-10-26", access: "Phần đã đọc" }] },
  }]);
  const messages = upgradeStudyMessages([
    { role: "user", content: "Giải thích bài học." },
    { role: "assistant", content: "Nội dung [APP:handbook:patterns].", citations },
    { role: "user", content: "Câu hỏi khác." },
    { role: "assistant", content: "Không có nguồn APP trong lượt này." },
  ]);
  const restored = parseStudyChatStore(serializeStudyChatStore({ conversationId: crypto.randomUUID(), messages }));
  assert.equal(restored.messages[1].citations[0].label, "Mẫu vận động cơ bản");
  assert.equal(restored.messages[3].citations.length, 0);
  assert.equal(JSON.stringify(toChatMessages(restored.messages)).includes("citations"), false);
  const parsed = parseAnswerCitations([{ ...citations[0], sources: [{ ...citations[0].sources[0], url: "javascript:alert(1)" }] }]);
  assert.equal(parsed[0].sources.length, 0);
});
