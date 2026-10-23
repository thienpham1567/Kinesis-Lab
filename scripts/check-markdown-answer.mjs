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
const render = (text) =>
  renderToStaticMarkup(createElement(MarkdownAnswer, { text }));

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
console.log("Assistant Markdown: inert images, source links, formatting and unsafe HTML/URL checks passed.");
