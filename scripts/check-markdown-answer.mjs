import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { appModuleUrl } from './lib/load-app-esm.mjs';
const { MarkdownAnswer } = await import(appModuleUrl('src/components/MarkdownAnswer.tsx'));
const visible = html => html.replace(/<[^>]+>/g, '');
const render = (text, citations = [], options = {}) =>
  renderToStaticMarkup(createElement(MarkdownAnswer, { text, citations, ...options }));

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
assert.match(visible(cited), /Nội dung học\[1\]\./);
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
  assert.match(visible(html), /rectus femoris\[1,2\]\./, answer);
  assert.match(visible(html), /duỗi gối\[2\]/, answer);
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
assert.match(visible(mixed), /\[1\] \[APP:unknown:x\]/);
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

// Prose is the only eligible citation context, across every Markdown delimiter.
for (const text of [
  '~~~text\n[APP:handbook:patterns]\n~~~',
  '``[APP:handbook:patterns]``',
  '[Lien ket [APP:handbook:patterns]](https://example.org)',
  '$[APP:handbook:patterns]$',
  '![Alt [APP:handbook:patterns]](https://example.org/image)',
]) assert.doesNotMatch(render(text, citations), /Nguồn đối chiếu trong câu trả lời/, text);

assert.match(cited, /<button[^>]*aria-label="Xem nguồn 1"/);
assert.match(cited, /id="[^"]+-source-1"/);
assert.match(formatted, /aria-label="Bảng trong câu trả lời"/);
assert.match(formatted, /tabindex="0"/);
assert.match(formatted, /Sao chép bảng/);
assert.match(render('$\\frac{1}{2}$'), /class="katex"/);
assert.match(render('$\\frac{1}{2}$'), /<math[^>]*xmlns=/);
assert.doesNotThrow(() => render('$\\notARealCommand{x}$'));
assert.doesNotMatch(render('$\\href{javascript:alert(1)}{x}$'), /href="javascript:/);
assert.match(render('**Đang giải thích', [], { streaming: true }), /<strong>Đang giải thích<\/strong>/);
assert.doesNotMatch(render('[Tài liệu](https://example.or', [], { streaming: true }), /<a\b/);
assert.doesNotMatch(render('[Tài liệu](https://example.org)', [], { streaming: true }), /<a\b/);
assert.match(render('**Đang giải thích'), /\*\*Đang giải thích/);

const { studyAnswerClipboard } = await import(appModuleUrl('src/lib/chat/study-copy.ts'));
const copy = studyAnswerClipboard({ content: '`[PMID:35006527]`\n\nÝ chính [RAG:who-chunk].', citations: researchCitations });
assert.match(copy, /`\[PMID:35006527\]`/);
assert.match(copy, /Ý chính\s+\[1\]/);
assert.doesNotMatch(copy, /\[2\]|Giới hạn của EMG/);
console.log('Citation context/copy parity, source controls, tables, math and streaming checks passed.');
const unresolvedGroup = render('[RAG:who-chunk, PMID:999999]', researchCitations);
assert.doesNotMatch(unresolvedGroup, /Nguồn đối chiếu trong câu trả lời/);
const linkCopy = studyAnswerClipboard({ content: '[Ví dụ [PMID:35006527]](https://example.org)\n\nÝ chính [RAG:who-chunk].', citations: researchCitations });
assert.doesNotMatch(linkCopy, /Giới hạn của EMG|\[2\]/);
assert.match(linkCopy, /Ý chính\s+\[1\]/);
for (const prefix of ['**Giải thích', '[Nguồn](https://example.or', '$$\\frac{1}{', '[RAG:who-', '~~~text\n[RAG:who-chunk]']) {
  assert.doesNotThrow(() => render(prefix, researchCitations, { streaming: true }));
}
assert.doesNotMatch(render('$\\includegraphics{https://example.org/pixel}$'), /<img\b|src="https:/);
const { prepareAnswerMarkdown } = await import(appModuleUrl('src/lib/chat/answer-markdown.ts'));
const repeated = prepareAnswerMarkdown('A [RAG:who-chunk]. B [RAG:who-chunk].', researchCitations);
assert.equal(repeated.cited.length, 1);
assert.equal(repeated.cited[0].n, 1);
console.log('Mixed unresolved references are atomic; copy exclusions and streamed prefixes passed.');

// Streamdown must process individual blocks without duplicating the full answer.
const blocks = render('Đoạn một [RAG:who-chunk].\n\nĐoạn hai [PMID:35006527].\n\nĐoạn ba [RAG:who-chunk].', researchCitations, { streaming: true });
assert.match(blocks, /data-answer-renderer="streamdown"/);
assert.equal((visible(blocks).match(/Đoạn một/g) ?? []).length, 1);
assert.match(visible(blocks), /Đoạn một\[1\]/);
assert.match(visible(blocks), /Đoạn hai\[2\]/);
assert.match(visible(blocks), /Đoạn ba\[1\]/);
const referenced = render('[Nhãn [RAG:who-chunk]][ref]\n\nĐoạn khác [PMID:35006527].\n\n[ref]: https://example.org', researchCitations, { streaming: true });
assert.match(visible(referenced), /Đoạn khác\[1\]/);
assert.doesNotMatch(referenced, /\[2\] WHO/);
assert.match(render('Chú thích[^a].\n\n[^a]: Ghi chú đơn giản.'), /Ghi chú đơn giản/);
assert.match(render('```text\n**code literal**\n```'), /<pre><code[^>]*>\*\*code literal\*\*/);
console.log('Streamdown block/reference/code fixtures passed.');
