import assert from "node:assert/strict";
import { test } from "node:test";
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

function fixture({ status = 200, body, includeCost = true, hangMs = 0 } = {}) {
  const calls = [];
  const load = createAppLoader({
    globals: {
      Buffer,
      process: { env: { OPENROUTER_API_KEY: "synthetic-only" } },
      fetch: async (url, options) => {
        calls.push({ url, options });
        if (hangMs) await new Promise((_, reject) => {
          // A real pending fetch keeps Node alive; AbortSignal.timeout alone does not.
          const timer = setTimeout(() => reject(new Error("Mock fetch did not abort")), 1000);
          options.signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(options.signal.reason);
          }, { once: true });
        });
        if (status !== 200) return Response.json({ error: { message: "upstream-private-detail" } }, { status });
        return Response.json(body ?? {
          data: [{ b64_json: png, media_type: "image/png" }],
          ...(includeCost ? { usage: { cost: 0.018 } } : {}),
        });
      },
    },
  });
  return { calls, ...load("src/lib/illustrations/provider.ts"), prompt: load("src/lib/chat/illustration-prompt.ts") };
}

test("chat prompt paints exact Vietnamese text and does not reuse anatomy lettering ban", () => {
  const { prompt } = fixture();
  const compiled = prompt.compileChatIllustrationPrompt(brief);
  for (const line of brief.imageText) assert.ok(compiled.includes(line));
  assert.ok(compiled.includes(brief.title));
  assert.match(compiled, /Vietnamese|tiếng Việt/i);
  assert.doesNotMatch(compiled, /Do not add lettering/);
  assert.doesNotMatch(compiled, /The app adds captions outside the image/);
  assert.doesNotMatch(compiled, /No exercise, sports equipment/);
});

test("raster request pins Seedream, 2K/4:3, n=1 and Vietnamese brief text", async () => {
  const f = fixture();
  const compiled = f.prompt.compileChatIllustrationPrompt(brief);
  const result = await f.requestRasterImage({
    prompt: compiled,
    resolution: "2K",
    aspectRatio: "4:3",
    timeoutMs: 110_000,
  });
  assert.equal(f.calls.length, 1);
  const body = JSON.parse(f.calls[0].options.body);
  assert.equal(body.model, "bytedance-seed/seedream-5-0-flash");
  assert.equal(body.n, 1);
  assert.equal(body.resolution, "2K");
  assert.equal(body.aspect_ratio, "4:3");
  assert.deepEqual(body.provider, { only: ["seed"], allow_fallbacks: false });
  assert.ok(body.prompt.includes("Cơ nhị đầu cánh tay (biceps brachii)"));
  assert.equal(body.input_references, undefined);
  assert.equal(result.costUsd, 0.018);
  assert.equal(result.mediaType, "image/png");
});

test("chat raster uses Seedream 2K and automatic aspect ratio, including reference edits", async () => {
  const f = fixture();
  const target = { model: PROTOCOL.model, provider: PROTOCOL.provider };
  await f.requestRasterImage({
    prompt: f.prompt.compileChatIllustrationPrompt(brief),
    resolution: PROTOCOL.resolution,
    aspectRatio: PROTOCOL.aspectRatio,
    timeoutMs: 140_000,
    referenceDataUrl: `data:image/png;base64,${png}`,
  }, target);
  assert.equal(f.calls.length, 1);
  const body = JSON.parse(f.calls[0].options.body);
  assert.equal(body.model, "bytedance-seed/seedream-5-0-flash");
  assert.equal(body.resolution, "2K");
  assert.equal(body.size, undefined);
  assert.equal(body.aspect_ratio, "auto");
  assert.equal(body.quality, undefined);
  assert.equal(body.n, 1);
  assert.deepEqual(body.provider, { only: ["seed"], allow_fallbacks: false });
  assert.equal(body.input_references[0].image_url.url, `data:image/png;base64,${png}`);
});

test("chat reports Seedream's image price, with a dated estimate when the catalog is unavailable", async () => {
  for (const unavailable of [false, true]) {
    const load = createAppLoader({
      globals: {
        process: { env: { OPENROUTER_API_KEY: "synthetic-only" } },
        fetch: async (url) => {
          assert.match(url, /bytedance-seed\/seedream-5-0-flash\/endpoints$/);
          if (unavailable) throw new Error("offline");
          return Response.json({ endpoints: [{
            provider_tag: "seed",
            pricing: [{ billable: "output_image", unit: "image", cost_usd: 0.018 }],
          }] });
        },
      },
    });
    const config = load("src/lib/chat/image-config.ts");
    assert.equal(config.CHAT_IMAGE_MODEL, PROTOCOL.model);
    assert.equal(config.CHAT_IMAGE_RESOLUTION, "2K");
    assert.equal(config.CHAT_IMAGE_ASPECT_RATIO, "auto");
    const status = await config.chatImageStatus();
    assert.equal(status.model, "bytedance-seed/seedream-5-0-flash");
    assert.equal(status.estimateUsd, 0.018);
    assert.equal(status.outputTokenPriceUsd, undefined);
    assert.equal(status.livePrice, !unavailable);
    if (unavailable) assert.equal(status.priceCheckedAt, "2026-10-26");
  }
});

test("reference is only the supplied owner-checked data URL", async () => {
  const f = fixture();
  await f.requestRasterImage({
    prompt: "prompt",
    resolution: "2K",
    aspectRatio: "4:3",
    timeoutMs: 1000,
    referenceDataUrl: `data:image/png;base64,${png}`,
  });
  const body = JSON.parse(f.calls[0].options.body);
  assert.equal(body.input_references[0].image_url.url, `data:image/png;base64,${png}`);
});

test("malformed, oversize, MIME mismatch, 402, 429, deadline and missing cost", async () => {
  const missing = fixture({ body: { data: [{}] } });
  await assert.rejects(() => missing.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 }), /ảnh/i);

  const badMime = fixture({
    body: { data: [{ b64_json: Buffer.from("<svg></svg>").toString("base64") }] },
  });
  await assert.rejects(() => badMime.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 }), /hợp lệ|MIME|định dạng|PNG/i);

  const oversized = createAppLoader({
    globals: {
      Buffer,
      process: { env: { OPENROUTER_API_KEY: "synthetic-only" } },
      fetch: async () =>
        new Response(JSON.stringify({ data: [{ b64_json: png }] }), {
          status: 200,
          headers: { "content-length": String(20 * 1024 * 1024) },
        }),
    },
  })("src/lib/illustrations/provider.ts");
  await assert.rejects(
    () => oversized.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 }),
    /giới hạn|lớn/i,
  );

  const credit = fixture({ status: 402 });
  await assert.rejects(() => credit.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 }), (err) => err.status === 402);

  const limited = fixture({ status: 429 });
  await assert.rejects(() => limited.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 }), (err) => err.status === 429);

  const noCost = fixture({ includeCost: false });
  const raster = await noCost.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1000 });
  assert.equal(raster.costUsd, null);

  const hung = fixture({ hangMs: 1 });
  await assert.rejects(() => hung.requestRasterImage({ prompt: "p", resolution: "2K", aspectRatio: "4:3", timeoutMs: 1 }), /thời gian|gián đoạn/i);
});
