import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID, createHash } from "node:crypto";
import { createAppLoader } from "./lib/load-app-module.mjs";
import { PROTOCOL } from "./eval-study-chat-images.mjs";

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lHkAAAAASUVORK5CYII=";
const brief = {
  title: PROTOCOL.briefs[0].title,
  subjectKind: "anatomy",
  visualDescription: PROTOCOL.briefs[0].visualDescription,
  imageText: PROTOCOL.briefs[0].imageText,
  explanation: PROTOCOL.briefs[0].explanation,
  sources: PROTOCOL.briefs[0].sources,
  limitations: PROTOCOL.briefs[0].limitations,
};

function cookieJar(initial) {
  const bag = new Map(initial ? [[initial.name, initial.value]] : []);
  return {
    get: (name) => (bag.has(name) ? { name, value: bag.get(name) } : undefined),
    set: (name, value) => bag.set(name, value),
    bag,
  };
}

function harness({ slowUpload = false, uploadError = false } = {}) {
  const jar = cookieJar();
  const calls = { brief: 0, image: 0, uploads: 0 };
  const load = createAppLoader({
    globals: {
      Buffer,
      crypto,
      ...(slowUpload ? { setTimeout: (fn, ms) => setTimeout(fn, ms / 1000) } : {}),
      process: {
        env: {
          OPENROUTER_API_KEY: "synthetic-only",
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "service",
          NODE_ENV: "test",
        },
      },
    },
    mocks: {
      "next/headers": { cookies: async () => jar },
      "@/lib/chat/illustration-brief": {
        buildChatIllustrationBrief: async () => {
          calls.brief++;
          return brief;
        },
        parseChatIllustrationBrief: (raw) => raw,
        BriefError: class BriefError extends Error {},
      },
      "@/lib/illustrations/provider": {
        hashBytes: (bytes) => createHash("sha256").update(bytes).digest("hex"),
        requestRasterImage: async (input, target) => {
          calls.image++;
          calls.imageInput = input;
          calls.imageTarget = target;
          return {
            rawBase64: png,
            bytes: Buffer.from(png, "base64"),
            mediaType: "image/png",
            sha256: "abc",
            costUsd: 0.018,
          };
        },
        ImageInputError: class ImageInputError extends Error {
          constructor(message, status = 400) {
            super(message);
            this.status = status;
          }
        },
      },
      "@/lib/chat/image-config": {
        CHAT_IMAGE_MODEL: "bytedance-seed/seedream-5-0-flash",
        CHAT_IMAGE_PROVIDER: "seed",
        CHAT_IMAGE_RESOLUTION: "2K",
        CHAT_IMAGE_ASPECT_RATIO: "auto",
        CHAT_IMAGE_TARGET: { model: "bytedance-seed/seedream-5-0-flash", provider: "seed" },
        chatImageStatus: async () => ({
          enabled: true,
          model: "bytedance-seed/seedream-5-0-flash",
          estimateUsd: 0.018,
          priceCheckedAt: "2026-10-26",
          livePrice: true,
        }),
      },
      "@/lib/chat/image-storage-server": {
        uploadChatIllustration: async () => {
          calls.uploads++;
          if (uploadError) throw new Error("Storage connection failed");
          // Scale a 20s upload to 20ms; the former 10s deadline becomes 10ms.
          if (slowUpload) await new Promise(resolve => setTimeout(resolve, 20));
          return { storagePath: "owner/id.png", assetUrl: "https://signed.example/img" };
        },
        signedChatIllustrationUrl: async () => "https://signed.example/img",
        deleteChatIllustration: async () => {},
      },
    },
  });
  const jobs = load("src/lib/chat/image-jobs.ts");
  const ledger = jobs.createMemoryJobLedger();
  const store = jobs.memoryJobStore(ledger);
  jobs.useJobStoreForTests(store);
  const route = load("src/app/api/chat/illustrations/route.ts");
  const item = load("src/app/api/chat/illustrations/[id]/route.ts");
  const origin = "http://localhost:3000";
  const req = (path, { method = "GET", body, headers = {} } = {}) =>
    new Request(`http://localhost:3000${path}`, {
      method,
      headers: { origin, "content-type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  return { jar, calls, route, item, req, origin, jobs };
}

const postBody = () => ({
  requestId: randomUUID(),
  conversationId: randomUUID(),
  sourceMessageId: randomUUID(),
  instruction: "Vẽ cánh tay trước có 3 nhãn",
  selectedContext: "Bài cơ nhị đầu.",
  sourceIds: ["upper"],
});

test("GET issues a session cookie before generation; POST without it is unauthorized", async () => {
  const f = harness();
  const denied = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body: postBody() }));
  assert.equal(denied.status, 401);
  assert.equal(f.calls.image, 0);
  const ready = await f.route.GET(f.req("/api/chat/illustrations"));
  assert.equal(ready.status, 200);
  const status = await ready.json();
  assert.equal(status.model, "bytedance-seed/seedream-5-0-flash");
  assert.equal(status.resolution, "2K");
  assert.equal(status.estimateUsd, 0.018);
  assert.equal(status.priceCheckedAt, "2026-10-26");
  assert.ok(f.jar.bag.get("chat_image_session"));
});

test("POST generates once, poll does not bill again, foreign owner cannot read", async () => {
  const f = harness();
  await f.route.GET(f.req("/api/chat/illustrations"));
  const body = postBody();
  const created = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body }));
  assert.equal(created.status, 200);
  const payload = await created.json();
  assert.equal(payload.state, "succeeded");
  assert.equal(payload.receipt.model, "bytedance-seed/seedream-5-0-flash");
  assert.equal(payload.receipt.provider, "seed");
  assert.equal(payload.receipt.promptVersion, "medical-image-v2-2026-10-26");
  assert.match(payload.receipt.promptSha256, /^[0-9a-f]{64}$/);
  assert.ok(f.calls.imageInput.prompt.includes(body.instruction));
  assert.ok(f.calls.imageInput.prompt.startsWith("MEDICAL EDUCATIONAL ILLUSTRATION"));
  assert.equal(payload.receipt.resolution, "2K");
  assert.equal(payload.receipt.estimateUsd, 0.018);
  assert.equal(f.calls.imageInput.resolution, "2K");
  assert.equal(f.calls.imageInput.aspectRatio, "auto");
  assert.equal(f.calls.imageInput.quality, undefined);
  assert.ok(f.calls.imageInput.timeoutMs >= 120_000);
  assert.ok(f.route.maxDuration >= 180);
  assert.deepEqual(f.calls.imageTarget, { model: "bytedance-seed/seedream-5-0-flash", provider: "seed" });
  assert.equal(f.calls.image, 1);
  assert.equal(f.calls.brief, 1);
  const replay = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body }));
  assert.equal(replay.status, 200);
  assert.equal(f.calls.image, 1);
  const polled = await f.item.GET(f.req(`/api/chat/illustrations/${body.requestId}`), { params: Promise.resolve({ id: body.requestId }) });
  assert.equal(polled.status, 200);
  assert.equal(f.calls.image, 1);
  f.jar.bag.set("chat_image_session", "0".repeat(64));
  const foreign = await f.item.GET(f.req(`/api/chat/illustrations/${body.requestId}`), { params: Promise.resolve({ id: body.requestId }) });
  assert.ok(foreign.status === 403 || foreign.status === 404);
  const text = await foreign.text();
  assert.equal(text.includes("abc"), false);
  assert.equal(text.includes(brief.visualDescription.slice(0, 20)), false);
});

test("rejects other origin, extra fields and does not leak upstream errors", async () => {
  const f = harness();
  const blocked = await f.route.GET(new Request("http://localhost:3000/api/chat/illustrations", { headers: { origin: "https://evil.example" } }));
  assert.equal(blocked.status, 403);
  const sameSite = await f.route.GET(new Request("http://localhost:3000/api/chat/illustrations", { headers: { "sec-fetch-site": "same-origin" } }));
  assert.equal(sameSite.status, 200);
  await f.route.GET(f.req("/api/chat/illustrations"));
  const extra = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body: { ...postBody(), clientId: "nope" } }));
  assert.equal(extra.status, 400);
  assert.equal(f.calls.image, 0);
});

test("same-origin checks use the browser-facing Host when Next reconstructs an internal localhost URL", async () => {
  const f = harness();
  const local = await f.route.GET(new Request("http://localhost:3000/api/chat/illustrations", {
    headers: { host: "127.0.0.1:3000", referer: "http://127.0.0.1:3000/knowledge" },
  }));
  assert.equal(local.status, 200);
  const foreign = await f.route.GET(new Request("http://localhost:3000/api/chat/illustrations", {
    headers: { host: "127.0.0.1:3000", origin: "https://evil.example" },
  }));
  assert.equal(foreign.status, 403);
});

test("POST returns 503 when job ledger is unavailable, without calling the image provider", async () => {
  const f = harness();
  f.jobs.useJobStoreForTests({
    claim: async () => {
      throw new Error("relation chat_image_jobs does not exist");
    },
    get: async () => null,
    update: async () => null,
    expiredWithAssets: async () => [],
  });
  await f.route.GET(f.req("/api/chat/illustrations"));
  const failed = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body: postBody() }));
  assert.equal(failed.status, 503);
  const payload = await failed.json();
  assert.equal(payload.errorCode, "unavailable");
  assert.equal(payload.error.includes("chat_image_jobs"), false);
  assert.equal(f.calls.image, 0);
  assert.equal(f.calls.brief, 0);
});

test("POST accepts full chat prompts up to 20000 characters and rejects longer input before billing", async () => {
  const f = harness();
  await f.route.GET(f.req("/api/chat/illustrations"));
  const body = { ...postBody(), instruction: "x".repeat(20_000) };
  const accepted = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body }));
  assert.equal(accepted.status, 200);
  assert.ok(f.calls.imageInput.prompt.includes(body.instruction));
  const rejected = await f.route.POST(f.req("/api/chat/illustrations", {
    method: "POST", body: { ...postBody(), instruction: "x".repeat(20_001) },
  }));
  assert.equal(rejected.status, 400);
  assert.equal(f.calls.image, 1);
});

test("a slow upload can use remaining request time without discarding the generated image", async () => {
  const f = harness({ slowUpload: true });
  await f.route.GET(f.req("/api/chat/illustrations"));
  const response = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body: postBody() }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).state, "succeeded");
  assert.equal(f.calls.image, 1);
  assert.equal(f.calls.uploads, 1);
});

test("a storage outage still delivers the generated raster for viewing and browser storage", async () => {
  const f = harness({ uploadError: true });
  await f.route.GET(f.req("/api/chat/illustrations"));
  const response = await f.route.POST(f.req("/api/chat/illustrations", { method: "POST", body: postBody() }));
  assert.equal(response.status, 200);
  const job = await response.json();
  assert.equal(job.state, "succeeded");
  assert.equal(job.receipt.storage, "browser-only");
  assert.equal(job.assetUrl, `data:image/png;base64,${png}`);
  assert.match(job.notice, /máy chủ|trình duyệt/);
  assert.equal(f.calls.image, 1);
});
