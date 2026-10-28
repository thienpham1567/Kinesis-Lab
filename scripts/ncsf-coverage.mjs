// Regenerates a reference inventory with explicit semantic notes; not a mastery score.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildNcsfCoverage } from './lib/ncsf-coverage.mjs';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.data/ncsf');
const read = f => JSON.parse(readFileSync(path.join(dir, f), 'utf8'));
const objectives = read('objectives.json');
const chapters = Array.from({length:8}, (_, i) => ({ch:i+1,questions:read(`quiz/ch${i+1}.json`)}));
const exams = [1,2].map(i => new Set(read(`exams/exam${i}.json`).map(q => q.title.match(/Câu (\d+)/)?.[1])));
const files = readdirSync(dir).filter(f => /^coverage-status-ch[1-8]\.json$/.test(f));
if (files.length && files.length !== 8) throw new Error('Semantic status inventory incomplete: need all eight chapters');
const notes = files.flatMap(read);
if (notes.length && notes.length !== objectives.length) throw new Error('Need exactly one semantic note for every objective');
const result = buildNcsfCoverage(objectives, read('coverage-map.json'), chapters, exams, notes);
const cell = s => String(s ?? '').replaceAll('|','/').replace(/\s+/g,' ').trim();
const labels = {'sampled':'Đã lấy mẫu','partial':'Còn một phần','source-gap':'Thiếu nguồn/kiến thức hỗ trợ'};
let md = '# Đối chiếu mục tiêu học tập NCSF CPT\n\n';
md += 'Đây là số mục tiêu có câu liên quan, **không phải tỷ lệ phủ hết kiến thức hoặc xác nhận y khoa**. Chỉ câu trong chính chương được tính ở cột riêng; dẫn chiếu chương khác và đề thử được tách biệt. Một câu nhận biết không tự hoàn tất mục tiêu đa kỹ năng.\n\n';
md += `**${result.totals.objectives} mục tiêu:** ${result.totals.own} có câu trong chính chương; ${result.totals.crossOnly} chỉ dựa vào chương khác; ${result.totals.examOnly} chỉ có đề thử; ${result.totals.noApp} chưa có câu app. ${result.totals.sourceGaps} mục có giới hạn nguồn được ghi rõ.\n\n`;
md += '| Chương | Câu | Nhận biết | Cơ chế | Thông số | Tính | Tình huống | Hình/bảng thực sự |\n|---|---:|---:|---:|---:|---:|---:|---:|\n';
const patternSummary = chapters.map(c => ({ch:c.ch,questions:c.questions.length,kinds:Object.fromEntries(['recall','mechanism','numeric','calculation','scenario','figure'].map(k=>[k,c.questions.filter(q=>q.kind===k).length])),figures:c.questions.filter(q=>q.figure).length}));
for (const c of patternSummary) md += `| ${c.ch} | ${c.questions} | ${c.kinds.recall} | ${c.kinds.mechanism} | ${c.kinds.numeric} | ${c.kinds.calculation} | ${c.kinds.scenario} | ${c.figures} |\n`;
let current = '';
for (const row of result.rows) {
  const heading = `Chương ${row.ch} — ${row.src}`;
  if (heading !== current) {
    md += `\n## ${heading}\n\n| Mã | Mục tiêu | Chính chương | Chương khác | Đề thử | Trạng thái / phần còn thiếu |\n|---|---|---|---|---|---|\n`;
    current=heading;
  }
  md += `| ${row.id} | ${cell(row.text)} | ${row.own.join(', ') || '—'} | ${row.other.join(', ') || '—'} | ${row.exam.join(', ') || '—'} | ${labels[row.status]}: ${cell(row.note)} |\n`;
}
writeFileSync(path.join(dir,'coverage.md'),md);
writeFileSync(path.join(dir,'coverage-summary.json'),JSON.stringify({...result,patterns:patternSummary,domains:Object.fromEntries([...new Set(chapters.flatMap(c=>c.questions.map(q=>q.domain)))].filter(Boolean).map(d=>[d,chapters.flatMap(c=>c.questions).filter(q=>q.domain===d).length])),clinicalValidation:false},null,2));
console.log(`${result.totals.objectives} objectives: ${result.totals.own} own-chapter, ${result.totals.crossOnly} cross-only, ${result.totals.examOnly} exam-only; ${result.totals.sourceGaps} source gaps. Reference counts are not complete coverage.`);
