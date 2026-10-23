// Software/provenance checks with a mock upstream; never sends paid requests.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import vm from "node:vm";
const require = createRequire(import.meta.url), ts = require("typescript"), root = path.resolve(import.meta.dirname, "..");
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lHkAAAAASUVORK5CYII=";
let posts = 0, upstreamBody, upstreamStatus = 200, pauseGeneration = null, includeCost = true;
const fakeProcess = { env: { OPENROUTER_API_KEY: "test-key-not-real" } };
async function mockFetch(url, options) {
  if (url.endsWith("/endpoints")) return Response.json({ endpoints: [{ provider_tag: "seed", pricing: [ { billable: "output_image", unit: "image", cost_usd: 0.018 } ] }] });
  assert.equal(url, "https://openrouter.ai/api/v1/images");
  posts++; upstreamBody = JSON.parse(options.body);
  if (pauseGeneration) await pauseGeneration;
  if (upstreamStatus !== 200) return Response.json({ error: { message: "upstream-private-detail" } }, { status: upstreamStatus });
  return Response.json({ data: [{ b64_json: png, media_type: "image/png" }], ...(includeCost ? { usage: { cost: 0.018 } } : {}) });
}
const modules = new Map();
function load(relative) {
  let file = path.resolve(root, relative); if (!path.extname(file)) file += ".ts";
  if (modules.has(file)) return modules.get(file);
  const exports = {}; modules.set(file, exports);
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, {
    exports, Buffer, Request, Response, AbortSignal, URL, process: fakeProcess, fetch: mockFetch,
    require: id => id.startsWith(".") ? load(path.relative(root, path.resolve(path.dirname(file), id))) : id.startsWith("@/") ? load(`src/${id.slice(2)}`) : require(id),
  }, { filename: file }); return exports;
}
const server = load("src/lib/illustrations/server.ts"), catalog = load("src/lib/illustrations/catalog.ts"), route = load("src/app/api/illustrations/route.ts");
const valid = { requestId: randomUUID(), topicId: "patterns", presetId: "upper-arm", prompt: "Anterior anatomy, plain light background", resolution: "1K", aspectRatio: "4:3" };
const req = (body, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/illustrations", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
assert.equal((await route.POST(req(valid, "https://unrelated.invalid"))).status, 403);
assert.equal(posts, 0);
for (const bad of [ { ...valid, clientId: "private-client" }, { ...valid, messages: ["private-lab"] }, { ...valid, model: "other-model" }, { ...valid, topicId: "unknown" }, { ...valid, resolution: "4K" }, { ...valid, prompt: "x".repeat(1601) }, { ...valid, requestId: "bad" }, { ...valid, reference: { name: "ssrf", dataUrl: "http://127.0.0.1/private" } }, { ...valid, reference: { name: "fake.png", dataUrl: "data:image/png;base64,PHN2Zz48L3N2Zz4=" } }, { ...valid, reference: { name: "fake.jpg", dataUrl: `data:image/jpeg;base64,${png}` } } ]) {
  await assert.rejects(() => server.readImageRequest(req(bad)), err => err.status === 400);
}
assert.equal(posts, 0, "invalid requests must not call the billed upstream");
const oversized = new Request("http://localhost:3000/api/illustrations", { method: "POST", headers: { "content-length": "4000000" }, body: "{}" });
await assert.rejects(() => server.readImageRequest(oversized), err => err.status === 413);
for (const topic of catalog.IMAGE_TOPICS) for (const preset of catalog.IMAGE_PRESETS) {
  const prompt = catalog.compileImagePrompt({ ...valid, topicId: topic.id, presetId: preset.id });
  assert.match(prompt, /simulated anatomical teaching model/); assert.match(prompt, /Do not add lettering/);
  assert.ok(catalog.anatomySources(preset.id).length > 0);
}
const response = await route.POST(req(valid)); assert.equal(response.status, 200);
const result = await response.json(); assert.equal(posts, 1);
assert.equal(upstreamBody.model, "bytedance-seed/seedream-5-0-flash"); assert.equal(upstreamBody.n, 1);
assert.deepEqual(upstreamBody.provider, { only: ["seed"], allow_fallbacks: false });
assert.equal(upstreamBody.input_references, undefined); assert.equal(result.receipt.reviewedBy, null);
assert.equal(result.receipt.costUsd, 0.018); assert.equal(result.receipt.sources.length, 1);
assert.equal(result.receipt.sha256, createHash("sha256").update(Buffer.from(png, "base64")).digest("hex"));
assert.match(result.dataUrl, /^data:image\/png;base64,/);
assert.equal((await route.POST(req(valid))).status, 200); assert.equal(posts, 1, "receipt replay must use cached result");
assert.equal((await route.POST(req({ ...valid, prompt: "Changed request with same ID" }))).status, 409); assert.equal(posts, 1);
const edited = { ...valid, requestId: randomUUID(), parentId: valid.requestId, reference: { name: "previous image", dataUrl: result.dataUrl } };
const editedResponse = await route.POST(req(edited)); assert.equal(editedResponse.status, 200);
const editedResult = await editedResponse.json(); assert.equal(posts, 2);
assert.equal(upstreamBody.input_references[0].image_url.url, result.dataUrl);
assert.equal(editedResult.receipt.parentId, valid.requestId); assert.equal(editedResult.receipt.reference.sha256, result.receipt.sha256);
for (let i = 0; i < 5; i++) assert.equal((await route.POST(req({ ...valid, requestId: randomUUID() }))).status, 200);
const beforeReplay = posts;
assert.equal((await route.POST(req(valid))).status, 409, "evicted paid results must not cause another billed request");
assert.equal(posts, beforeReplay);
let release;
pauseGeneration = new Promise(resolve => { release = resolve; });
const pending = { ...valid, requestId: randomUUID() };
const firstPending = route.POST(req(pending));
await new Promise(resolve => setImmediate(resolve));
const afterFirstPending = posts;
assert.equal((await route.POST(req(pending))).status, 409);
assert.equal(posts, afterFirstPending, "concurrent duplicate cannot call upstream twice");
const secondPending = route.POST(req({ ...valid, requestId: randomUUID() }));
await new Promise(resolve => setImmediate(resolve));
const afterSecondPending = posts;
assert.equal((await route.POST(req({ ...valid, requestId: randomUUID() }))).status, 429);
assert.equal(posts, afterSecondPending, "third concurrent request rejected before upstream");
release(); await Promise.all([firstPending, secondPending]); pauseGeneration = null;
includeCost = false;
const unknownCost = await (await route.POST(req({ ...valid, requestId: randomUUID() }))).json();
assert.equal(unknownCost.receipt.costUsd, null, "missing actual cost must not be replaced with estimate");
includeCost = true;
const beforeFailure = posts;
upstreamStatus = 402; const failed = await route.POST(req({ ...valid, requestId: randomUUID() }));
assert.equal(failed.status, 402); assert.match((await failed.json()).error, /credits/);
assert.equal(posts, beforeFailure + 1, "no automatic retry");
fakeProcess.env.OPENROUTER_API_KEY = "";
assert.equal((await route.POST(req({ ...valid, requestId: randomUUID() }))).status, 503); assert.equal(posts, beforeFailure + 1);
assert.equal((await (await route.GET()).json()).enabled, false);
console.log("Illustration workflow passed: fixed model/provider, bounded raster-only inputs, no client payload, provenance/hash/edit ancestry, actual cost, idempotency and error handling. Upstream was mocked; no paid calls.");
