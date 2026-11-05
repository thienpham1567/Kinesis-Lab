import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL("../src/components/MarkdownAnswer.tsx", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
// "@/..." project modules are transpiled the same way (they have only type imports).
const local = (specifier) => {
  const file = readFileSync(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url), "utf8");
  const js = ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
};
const executable = outputText.replace(
  /from (["'])([^"']+)\1/g,
  (_, quote, specifier) =>
    `from ${quote}${specifier.startsWith("@/") ? local(specifier) : pathToFileURL(require.resolve(specifier)).href}${quote}`,
);
const { MarkdownAnswer } = await import(
  `data:text/javascript;base64,${Buffer.from(executable).toString("base64")}`
);
const render = (text, citations = []) =>
  renderToStaticMarkup(createElement(MarkdownAnswer, { text, citations }));

for (const image of [
  "![Diagram](https://example.invalid/pixel?client=private)",
  "![Diagram](/api/illustrations?client=private)",
  "![Diagram][ref]\n\n[ref]: https://example.invalid/pixel?client=private",
]) {
  const html = render(image);
  assert.doesNotMatch(html, /<(?:img|link)\b|(?:src|href)=/i);
  assert.match(html, /Diagram/);
}
const formatted = render(
  "**Summary**\n\n[Source](https://pubmed.ncbi.nlm.nih.gov/1/)\n\n| A | B |\n| - | - |\n| 1 | 2 |",
);
assert.match(formatted, /<strong>Summary<\/strong>/);
assert.match(formatted, /<table>/);
assert.match(formatted, /href="https:\/\/pubmed.ncbi.nlm.nih.gov\/1\/"/);
assert.match(formatted, /rel="noreferrer noopener"/);
assert.doesNotMatch(render("<img src=x onerror=alert(1)>"), /<img\b/i);
assert.doesNotMatch(render("[unsafe](javascript:alert%281%29)"), /href="javascript:/i);
const citations = [{
  id: "APP:handbook:patterns", label: "Các mẫu vận động cơ bản",
  sources: [{ title: "Tài liệu đối chiếu", url: "https://example.org/source", checkedAt: "2026-10-26", access: "Phần giới thiệu" }],
}];
const cited = render("Nội dung học [APP:handbook:patterns].", citations);
assert.match(cited, /Các mẫu vận động cơ bản/);
assert.doesNotMatch(cited, /\[APP:handbook:patterns\]/);
// Inline marker is a small numbered ref; the label appears only in the source list.
assert.match(cited, /Nội dung học<sup[^>]*>\[1\]<\/sup>\./);
assert.doesNotMatch(cited, /【/);
assert.equal(cited.match(/Các mẫu vận động cơ bản<\/p>/g)?.length, 1);
// Real model output (local run 2026-11-05): per-source markers, adjacent and merged.
const knee = [{
  id: "APP:anatomy:knee", label: "Khớp Gối, Khớp Chè–Đùi & Dây chằng",
  sources: Array.from({ length: 7 }, (_, i) => ({ title: `Nguồn gối ${i + 1}`, url: `https://example.org/knee/${i + 1}`, checkedAt: "2026-11-05", access: "Phạm vi" })),
}];
for (const answer of [
  "Đáp án là **rectus femoris** [APP:anatomy:knee:2] [APP:anatomy:knee:7].\n\n* Ba cơ rộng chỉ duỗi gối [APP:anatomy:knee:7].",
  "Đáp án là **rectus femoris** [APP:anatomy:knee:2, APP:anatomy:knee:7].\n\n* Ba cơ rộng chỉ duỗi gối [APP:anatomy:knee:7].",
  "Đáp án là **rectus femoris** [APP:anatomy:knee:2,7].\n\n* Ba cơ rộng chỉ duỗi gối [APP:anatomy:knee:7].",
]) {
  const html = render(answer, knee);
  assert.doesNotMatch(html, /APP:|【|Khớp Gối[^<]*· 2/, answer);
  assert.match(html, /rectus femoris<\/strong><sup[^>]*>\[1,2\]<\/sup>\./, answer);
  assert.match(html, /duỗi gối<sup[^>]*>\[2\]<\/sup>/, answer);
  // Each number lists only the specific source it points to.
  assert.match(html, /\[1\] Khớp Gối[^<]*<\/p><p>[^<]*<a href="https:\/\/example.org\/knee\/2"/, answer);
  assert.match(html, /\[2\] Khớp Gối[^<]*<\/p><p>[^<]*<a href="https:\/\/example.org\/knee\/7"/, answer);
  assert.doesNotMatch(html, /knee\/1"/, answer);
}
// Retrieval notice explains a source-less answer only.
const renderNotice = (text, list) => renderToStaticMarkup(createElement(MarkdownAnswer, { text, citations: list, uncitedNotice: "Chưa tra cứu được PubMed." }));
assert.match(renderNotice("Không có nguồn.", knee), /Chưa tra cứu được PubMed/);
assert.doesNotMatch(renderNotice("Có nguồn [APP:anatomy:knee:2].", knee), /Chưa tra cứu được PubMed/);
const mixed = render("Ý A [APP:anatomy:knee:2] [APP:unknown:x].", knee);
assert.match(mixed, /<sup[^>]*>\[1\]<\/sup> \[APP:unknown:x\]/);
const qualified = render("Theo quy ước [APP:handbook:patterns:Quy ước của app].", citations);
assert.match(qualified, /Các mẫu vận động cơ bản · Quy ước của app/);
assert.doesNotMatch(qualified, /\[APP:/);
assert.match(qualified, /Tài liệu đối chiếu/);
assert.match(cited, /href="https:\/\/example.org\/source"/);
assert.match(cited, /2026-10-26/);
assert.match(render("`[APP:handbook:patterns]`", citations), /<code>\[APP:handbook:patterns\]<\/code>/);
assert.match(render("[APP:unknown:missing]", citations), /\[APP:unknown:missing\]/);
assert.doesNotMatch(render("Không trích dẫn nguồn này.", citations), /Tài liệu đối chiếu/);
const malicious = render("[APP:handbook:patterns]", [{ ...citations[0], sources: [{ ...citations[0].sources[0], url: "javascript:alert(1)" }] }]);
assert.doesNotMatch(malicious, /href="javascript:/);
console.log("Assistant Markdown: inert images, source links, formatting and unsafe HTML/URL checks passed.");
const researchCitations = [
  { id: 'RAG:who-chunk', label: 'WHO 2020 · Khuyến nghị', sources: citations[0].sources },
  { id: 'PMID:35006527', label: 'Giới hạn của EMG', sources: citations[0].sources },
];
const research = render('Đối chiếu [RAG:who-chunk] và [PMID:35006527].', researchCitations);
assert.match(research, /WHO 2020 · Khuyến nghị/);
assert.match(research, /Giới hạn của EMG/);
assert.doesNotMatch(research, /\[(RAG|PMID):/);
