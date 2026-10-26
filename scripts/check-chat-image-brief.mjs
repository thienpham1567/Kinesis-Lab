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
  assert.deepEqual(brief.imageText, valid.imageText);
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

test("clips overlong title, captions and total image text", () => {
  assert.equal(parseChatIllustrationBrief({ ...valid, title: "T".repeat(61) }, allowed).title.length, 60);
  assert.equal(parseChatIllustrationBrief({ ...valid, imageText: ["A".repeat(121), "B"] }, allowed).imageText[0].length, 120);
  reject({ ...valid, imageText: ["chỉ một nhãn"] }, /2–4|2-4|hai/i);
  const clipped = parseChatIllustrationBrief(
    {
      ...valid,
      title: "T".repeat(60),
      imageText: ["A".repeat(120), "B".repeat(120), "C".repeat(120), "D".repeat(121)],
    },
    allowed,
  );
  assert.ok(clipped.title.length + clipped.imageText.join("").length <= 550);
  assert.equal(parseChatIllustrationBrief({ ...valid, visualDescription: "v".repeat(1601) }, allowed).visualDescription.length, 1600);
  assert.equal(parseChatIllustrationBrief({ ...valid, explanation: "e".repeat(1601) }, allowed).explanation.length, 1600);
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
