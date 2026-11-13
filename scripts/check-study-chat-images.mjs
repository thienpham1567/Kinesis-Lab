import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const markdown = readFileSync(new URL("../src/components/MarkdownAnswer.tsx", import.meta.url), "utf8");

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
