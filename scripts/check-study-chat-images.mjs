import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const widget = readFileSync(new URL("../src/components/StudyChatWidget.tsx", import.meta.url), "utf8");
const composer = readFileSync(new URL("../src/components/chat/StudyChatImageComposer.tsx", import.meta.url), "utf8");
const card = readFileSync(new URL("../src/components/chat/StudyChatImageCard.tsx", import.meta.url), "utf8");
const markdown = readFileSync(new URL("../src/components/MarkdownAnswer.tsx", import.meta.url), "utf8");

test("text chat still posts to /api/chat; image generation is a separate control", () => {
  assert.match(widget, /fetch\("\/api\/chat"/);
  assert.match(widget, /toChatMessages/);
  assert.match(widget, /Minh họa nội dung này/);
  assert.match(widget, /illustrationContextFromChat/);
  assert.match(widget, /openIllustrate/);
  assert.match(widget, /mode !== "ask"/);
  assert.match(composer, /Tạo hình/);
  assert.match(composer, /Hỏi đáp/);
  assert.equal(composer.includes("Ước tính"), false);
  assert.equal(composer.includes("Đang đọc giá tạo hình"), false);
});

test("markdown still strips model-controlled image URLs", () => {
  assert.match(markdown, /img: \(\{ alt \}\) => <span>\{alt\}<\/span>/);
});

test("image card keeps billed retry explicit and unknown does not auto-send", () => {
  assert.match(card, /tính phí mới/);
  assert.match(card, /Không tự gửi lại yêu cầu trả phí/);
  assert.match(card, /Hình minh họa AI/);
  assert.match(card, /Chữ đã yêu cầu model vẽ/);
});

test("image-only rows are not sent to the text chat API", () => {
  const load = createAppLoader({ globals: { crypto } });
  const { toChatMessages } = load("src/lib/chat/study-messages.ts");
  const wire = toChatMessages([
    { id: "1", role: "user", content: "hỏi", attachments: [], sources: [] },
    { id: "2", role: "assistant", content: "", attachments: [{ imageId: "img", sourceMessageId: "1", state: "succeeded" }], sources: [] },
  ]);
  assert.equal(wire.length, 1);
  assert.equal(wire[0].content, "hỏi");
});
