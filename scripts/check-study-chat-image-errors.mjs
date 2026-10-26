import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

function harness(fetch) {
  const state = [];
  let messages = [];
  const load = createAppLoader({
    globals: { crypto, fetch, AbortController },
    mocks: {
      react: {
        useState(initial) {
          const index = state.length;
          state.push(initial);
          return [initial, (update) => { state[index] = typeof update === "function" ? update(state[index]) : update; }];
        },
        useRef: (value) => ({ current: value }),
        useCallback: (fn) => fn,
        useEffect: () => {},
      },
    },
  });
  const { useStudyChatImages: runHook } = load("src/components/chat/useStudyChatImages.ts");
  const hook = runHook({
    conversationId: crypto.randomUUID(), messages,
    setMessages: (update) => { messages = typeof update === "function" ? update(messages) : update; },
  });
  return { hook, state, messages: () => messages };
}

const options = () => ({ reason: "create", sourceMessageId: crypto.randomUUID(), instruction: "Vẽ sơ đồ bài đang đọc.", selectedContext: "", sourceIds: [], sources: [] });

test("failed session preflight stops the pending card without posting an image request", async () => {
  const calls = [];
  const f = harness(async (url) => { calls.push(url); return Response.json({ error: "unavailable" }, { status: 503 }); });
  await f.hook.createImage(options());
  assert.equal(calls.length, 1);
  assert.equal(f.messages()[1].attachments[0].state, "failed");
  assert.equal(f.state[0], false);
  assert.match(f.state[2], /thông tin tạo hình/);
});

test("a lost POST response becomes unknown and never automatically bills again", async () => {
  let posts = 0;
  const f = harness(async (_url, opts) => {
    if (!opts?.method) return Response.json({ enabled: true });
    posts++;
    throw new TypeError("Failed to fetch");
  });
  await f.hook.createImage(options());
  assert.equal(posts, 1);
  assert.equal(f.messages()[1].attachments[0].state, "unknown");
  assert.equal(f.state[0], false);
});

test("an HTTP failure while polling stops the wait and preserves the job for recovery", async () => {
  const calls = [];
  const f = harness(async (url, opts) => {
    calls.push(url);
    if (calls.length > 3) throw new Error("Polling continued after HTTP 401");
    if (opts?.method === "POST") return Response.json({ state: "generating" });
    if (url === "/api/chat/illustrations") return Response.json({ enabled: true });
    return Response.json({ error: "Thiếu phiên tạo hình." }, { status: 401 });
  });
  await f.hook.createImage(options());
  assert.equal(calls.length, 3);
  assert.equal(f.messages()[1].attachments[0].state, "unknown");
  assert.equal(f.state[0], false);
  assert.match(f.state[2], /Thiếu phiên/);
});

test("brief errors give the learner a next step without exposing schema terminology", async () => {
  const f = harness(async (_url, opts) => opts?.method === "POST"
    ? Response.json({ state: "failed", errorCode: "invalid-brief", error: "Brief y khoa cần claimIds và imageExplanation." }, { status: 400 })
    : Response.json({ enabled: true }));
  await f.hook.createImage(options());
  assert.equal(f.messages()[1].attachments[0].state, "failed");
  assert.doesNotMatch(f.state[2], /claimIds|imageExplanation|Brief/);
  assert.match(f.state[2], /nội dung|nguồn/);
});
