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
const executable = outputText.replace(
  /from (["'])([^"']+)\1/g,
  (_, quote, specifier) =>
    `from ${quote}${pathToFileURL(require.resolve(specifier)).href}${quote}`,
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
