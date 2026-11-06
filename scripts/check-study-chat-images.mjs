import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const widget = readFileSync(new URL("../src/components/StudyChatWidget.tsx", import.meta.url), "utf8");
const markdown = readFileSync(new URL("../src/components/MarkdownAnswer.tsx", import.meta.url), "utf8");

test("study assistant posts text only and does not offer image generation", () => {
  assert.match(widget, /fetch\("\/api\/chat"/);
  assert.match(widget, /toChatMessages/);
  assert.equal(widget.includes("Minh họa nội dung này"), false);
  assert.equal(widget.includes("StudyChatImageComposer"), false);
  assert.equal(widget.includes("/api/chat/illustrations"), false);
  assert.equal(widget.includes("Đoạn tài liệu tham chiếu"), false);
  assert.equal(widget.includes("RAG:"), false);
  assert.match(widget, /Gemini 3\.8 Flash/);
  assert.match(widget, /Gemini 2\.5 Flash/);
  // Drawer controls and shared answer rendering have their own behavior tests.
  // The retired floating menu/inline citation implementation is not a requirement.
});

test("markdown still strips model-controlled image URLs", () => {
  assert.match(markdown, /img: \(\{ alt \}\) => <span>\{alt\}<\/span>/);
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
