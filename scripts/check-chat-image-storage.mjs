import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader({ globals: { Buffer, crypto, URL, Blob } });
const storage = load("src/lib/chat/image-storage.ts");
const client = load("src/lib/chat/image-client.ts");
const { upgradeStudyMessages, parseStudyChatStore, serializeStudyChatStore } = load(
  "src/lib/chat/study-messages.ts",
);

const brief = {
  title: "Cánh tay trước",
  subjectKind: "anatomy",
  visualDescription: "Nhìn trước.",
  imageText: ["Cơ nhị đầu cánh tay", "Xương cánh tay"],
  explanation: "Nhãn theo nguồn.",
  sources: [],
  limitations: [],
};
const receipt = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2026-10-26T00:00:00.000Z",
  model: "bytedance-seed/seedream-5-0-flash",
  provider: "seed",
  purpose: "chat-study",
  brief,
  mediaType: "image/png",
  byteLength: 8,
  sha256: "abc",
  elapsedMs: 1,
  costUsd: 0.018,
  estimateUsd: 0.018,
  priceCheckedAt: "2026-10-26",
  resolution: "2K",
  aspectRatio: "4:3",
  parentId: null,
  label: "Hình minh họa AI",
  reviewedBy: null,
};

test("stores 50 chat images then keeps the current blob when quota is full", async () => {
  const db = storage.memoryChatImageDb(50);
  for (let i = 0; i < 50; i++) {
    const saved = await storage.saveChatImage(
      { id: `id-${i}`, blob: new Blob(["x"]), brief, receipt: { ...receipt, id: `id-${i}` }, savedAt: `2026-10-26T00:00:${String(i).padStart(2, "0")}.000Z` },
      db,
    );
    assert.equal(saved.saved, true);
  }
  const extra = await storage.saveChatImage(
    { id: "overflow", blob: new Blob(["live"]), brief, receipt: { ...receipt, id: "overflow" }, savedAt: "2026-10-26T01:00:00.000Z" },
    db,
  );
  assert.equal(extra.saved, false);
  assert.match(extra.notice, /50|chưa lưu/i);
});

test("disabled or failed IDB still reports the image is viewable", async () => {
  const disabled = await storage.saveChatImage(
    { id: "live", blob: new Blob(["live"]), brief, receipt, savedAt: "2026-10-26T00:00:00.000Z" },
    storage.disabledChatImageDb(),
  );
  assert.equal(disabled.saved, false);
  assert.match(disabled.notice, /xem và tải/i);
});

test("session history keeps attachment ids without blobs", () => {
  const messages = upgradeStudyMessages([
    {
      id: "11111111-1111-4111-8111-111111111111",
      role: "assistant",
      content: "Giải thích",
      attachments: [{ imageId: "img-1", sourceMessageId: "src", state: "succeeded" }],
      sources: [],
    },
  ]);
  const raw = serializeStudyChatStore({ conversationId: "22222222-2222-4222-8222-222222222222", messages });
  assert.equal(raw.includes("blob"), false);
  assert.equal(raw.includes("data:image"), false);
  const restored = parseStudyChatStore(raw);
  assert.equal(restored.messages[0].attachments[0].imageId, "img-1");
});

test("does not bill again for refresh, viewer, expired URL or GET errors", () => {
  assert.equal(client.shouldBillNewImage("create"), true);
  assert.equal(client.shouldBillNewImage("edit"), true);
  for (const reason of ["refresh", "viewer", "expired-url", "get-error", "poll"])
    assert.equal(client.shouldBillNewImage(reason), false);
});

test("out-of-order jobs do not attach to another conversation", () => {
  const messages = client.bindImageMessage({
    messages: [],
    conversationId: "aaa",
    activeConversationId: "aaa",
    imageId: "img-1",
    sourceMessageId: "src",
    userContent: "Vẽ hình",
  });
  const other = client.applyImageState(messages, {
    conversationId: "bbb",
    activeConversationId: "aaa",
    imageId: "img-1",
    sourceMessageId: "src",
    state: "succeeded",
    content: "nhầm phiên",
  });
  assert.equal(other[1].attachments[0].state, "preparing");
  assert.equal(other[1].content, "");
  const same = client.applyImageState(messages, {
    conversationId: "aaa",
    activeConversationId: "aaa",
    imageId: "img-1",
    sourceMessageId: "src",
    state: "succeeded",
    content: "Giải thích",
  });
  assert.equal(same[1].attachments[0].state, "succeeded");
  assert.equal(same[1].content, "Giải thích");
});
