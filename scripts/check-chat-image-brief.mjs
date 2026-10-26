import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader();
const { parseChatIllustrationBrief } = load("src/lib/chat/illustration-brief.ts");

const allowed = [
  {
    id: "upper",
    title: "OpenStax A&P 2e · 11.5 Cơ đai vai và chi trên",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
    checkedAt: "2026-10-23",
    access: "Văn bản §11.5",
  },
];

const valid = {
  title: "Cánh tay trước",
  subjectKind: "anatomy",
  visualDescription: "Nhìn trước cánh tay phải.",
  imageText: ["Cơ nhị đầu cánh tay", "Xương cánh tay"],
  explanation: "Nhãn theo OpenStax §11.5, không phải phép đo.",
  sources: allowed,
  limitations: ["Nguồn không xác nhận pixel."],
};

function reject(raw, pattern) {
  assert.throws(() => parseChatIllustrationBrief(raw, allowed), (err) => {
    assert.match(String(err.message), pattern);
    return true;
  });
}

test("accepts a sourced brief within length caps", () => {
  const brief = parseChatIllustrationBrief(valid, allowed);
  assert.equal(brief.title, "Cánh tay trước");
  assert.equal(brief.subjectKind, "anatomy");
  assert.deepEqual(Array.from(brief.imageText), valid.imageText);
  assert.equal(brief.reviewedBy, undefined);
});

test("rejects invalid JSON shape and enum; strips extra fields", () => {
  reject(null, /JSON|không hợp lệ/i);
  reject("not-json", /JSON|không hợp lệ/i);
  reject({ ...valid, subjectKind: "diagnostic" }, /subjectKind|loại hình/i);
  const stripped = parseChatIllustrationBrief(
    { ...valid, clientId: "private-client", model: "other-model", messages: [{ role: "user", content: "raw history" }] },
    allowed,
  );
  assert.equal(stripped.title, valid.title);
  assert.equal(JSON.stringify(stripped).includes("clientId"), false);
  assert.equal(JSON.stringify(stripped).includes("raw history"), false);
});

test("rejects overlong medical copy instead of truncating meaning", () => {
  reject({ ...valid, title: "T".repeat(61) }, /60|dài/);
  reject({ ...valid, imageText: ["A".repeat(121), "B"] }, /120|dài/);
  reject({ ...valid, imageText: ["chỉ một nhãn"] }, /2–8|2-8/);
  reject({ ...valid, title: "T".repeat(60), imageText: Array.from({ length: 8 }, (_, i) => String(i) + "A".repeat(119)) }, /900|giới hạn/);
  reject({ ...valid, visualDescription: "v".repeat(1601) }, /1600|dài/);
  reject({ ...valid, explanation: "e".repeat(1601) }, /1600|dài/);
});

test("brief builder uses Gemini Flash, deadline and supplied sources only", async () => {
  const calls = [];
  const loadBuild = createAppLoader({
    globals: {
      process: { env: { OPENROUTER_API_KEY: "synthetic-only" } },
      fetch: async (url, options) => {
        calls.push({ url, options });
        return Response.json({
          choices: [{ message: { content: JSON.stringify(valid) } }],
        });
      },
    },
  });
  const { buildChatIllustrationBrief } = loadBuild("src/lib/chat/illustration-brief.ts");
  const brief = await buildChatIllustrationBrief({
    instruction: "Vẽ cánh tay trước có 3 nhãn",
    selectedContext: "Bài đang học cơ nhị đầu.",
    sources: allowed,
    deadlineMs: 15_000,
  });
  assert.equal(brief.title, valid.title);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://openrouter.ai/api/v1/chat/completions");
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, "google/gemini-2.5-flash");
  assert.equal(JSON.stringify(body).includes("clientId"), false);
  assert.ok(body.messages[1].content.includes("Vẽ cánh tay trước có 3 nhãn"));
  assert.ok(body.messages[1].content.includes("upper"));
  assert.ok(calls[0].options.signal);
});

test("drops sources the server did not supply", () => {
  const mixed = parseChatIllustrationBrief(
    {
      ...valid,
      sources: [
        {
          id: "forged",
          title: allowed[0].title,
          url: allowed[0].url,
          checkedAt: allowed[0].checkedAt,
          access: allowed[0].access,
        },
        allowed[0],
      ],
    },
    allowed,
  );
  assert.equal(mixed.sources.length, 1);
  assert.equal(mixed.sources[0].id, "upper");
  const emptyAllowed = parseChatIllustrationBrief(valid, []);
  assert.equal(emptyAllowed.sources.length, 0);
  const evil = parseChatIllustrationBrief(
    { ...valid, sources: [{ ...allowed[0], url: "https://evil.example/steal" }] },
    allowed,
  );
  assert.equal(evil.sources.length, 0);
});
