// Local synthetic browser comparison. Open the printed URL with the browser tool.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import path from 'node:path';

const dir = path.resolve('.data/artifacts/streamdown-review');
mkdirSync(dir, { recursive: true });
const baseline = path.join(dir, 'MarkdownAnswer.baseline.tsx');
if (!existsSync(baseline)) throw new Error('Preserve the pre-migration MarkdownAnswer.tsx as .data/artifacts/streamdown-review/MarkdownAnswer.baseline.tsx first.');
writeFileSync(baseline, readFileSync(baseline, 'utf8').replace('"./MarkdownTable"', '"@/components/MarkdownTable"'));
writeFileSync(path.join(dir, 'benchmark.tsx'), `
import { Profiler, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MarkdownAnswer as Baseline } from './MarkdownAnswer.baseline';
import { MarkdownAnswer as Candidate } from '@/components/MarkdownAnswer';
const citations = [{id:'RAG:fixture',label:'Nguồn kiểm tra tổng hợp',sources:[{title:'Synthetic fixture',url:'https://example.org/fixture',checkedAt:'2026-11-06',access:'Dữ liệu kiểm tra giao diện, không phải tài liệu y khoa.'}]}];
const text = Array.from({length:18},(_,i)=>[
  '### Mục kiểm tra '+(i+1),
  'Đây là **nội dung tổng hợp** để đo bộ hiển thị, không phải kiến thức y khoa. Mỗi đoạn có cùng cấu trúc để so sánh công bằng tốc độ xử lý và khả năng giữ ổn định các khối đã hoàn thành [RAG:fixture].',
  '- Một ý để kiểm tra danh sách.\\n- Một ý khác có chữ *nghiêng* và ký hiệu $x_1$.',
  '$$\\n\\\\tau = F \\\\times r + \\\\frac{1}{2}x^2\\n$$',
  ...(i%3===0?['| Cột thứ nhất | Cột thứ hai | Cột thứ ba |\\n|---|---|---|\\n| Dữ liệu A | Dữ liệu B | $x^2$ |']:[]),
].join('\\n\\n')).join('\\n\\n');
const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
function App(){
 const [kind,setKind]=useState('candidate'),[count,setCount]=useState(text.length),[streaming,setStreaming]=useState(false),[running,setRunning]=useState(false),[results,setResults]=useState([]),[checks,setChecks]=useState(null);
 const rendering=useRef([]),active=useRef(false);
 const Component=kind==='baseline'?Baseline:Candidate;
 async function one(which){
  flushSync(()=>{setKind(which);setCount(0);setStreaming(true)}); await tick();
  const updates=[]; rendering.current=[];active.current=true;
  for(let end=96;end<text.length+96;end+=96){
   const start=performance.now();flushSync(()=>setCount(Math.min(end,text.length)));updates.push(performance.now()-start);await tick();
  }
  flushSync(()=>setStreaming(false));active.current=false;
  const sorted=[...updates].sort((a,b)=>a-b);
  return {kind:which,chars:text.length,updates:updates.length,reactMs:Math.round(rendering.current.reduce((a,b)=>a+b,0)*10)/10,flushMs:Math.round(updates.reduce((a,b)=>a+b,0)*10)/10,p95FlushMs:Math.round(sorted[Math.floor(sorted.length*.95)]*10)/10,viewport:innerWidth};
 }
 async function suite(){
  setRunning(true);setResults([]);await one('baseline');await one('candidate');
  const rows=[];
  for(let pair=0;pair<3;pair++)for(const which of pair%2?['candidate','baseline']:['baseline','candidate']){rows.push(await one(which));setResults([...rows]);}
  setRunning(false);
 }
 function lifecycle(){
  const host=document.getElementById('lifecycle');const r=createRoot(host);
  const sourceText='Đoạn có nguồn [RAG:fixture].';
  flushSync(()=>r.render(<Candidate text={sourceText} citations={[]} streaming={true}/>));
  const before=host.querySelectorAll('.md-citation button').length;
  flushSync(()=>r.render(<Candidate text={sourceText} citations={citations} streaming={true}/>));
  const after=host.querySelectorAll('.md-citation button').length;
  const first=host.querySelector('.md-stream p');
  flushSync(()=>r.render(<Candidate text={sourceText+'\\n\\nĐoạn mới đang viết.'} citations={citations} streaming={true}/>));
  const retained=first===host.querySelector('.md-stream p');
  const changed=citations.map(c=>({...c,label:'Tên nguồn đã cập nhật'}));
  flushSync(()=>r.render(<Candidate text={sourceText+'\\n\\nĐoạn mới đang viết.'} citations={changed} streaming={true}/>));
  const metadata=host.textContent.includes('Tên nguồn đã cập nhật');
  r.unmount();setChecks({before,after,completedBlockRetained:retained,metadataUpdated:metadata,pass:before===0&&after===1&&retained&&metadata});
 }
 return <main aria-busy={running}><h1>So sánh bộ hiển thị câu trả lời</h1><p>Dữ liệu tổng hợp; phép đo React trong trình duyệt này, không đại diện điện thoại thật.</p><button disabled={running} onClick={()=>void suite()}>Đo 3 lượt mỗi bộ hiển thị</button><button disabled={running} onClick={lifecycle}>Kiểm tra thay đổi nguồn</button><p role="status">{running?'Đang đo…':'Sẵn sàng'}</p><pre aria-label="Kết quả đo">{JSON.stringify(results,null,2)}</pre><pre aria-label="Kết quả nguồn">{JSON.stringify(checks,null,2)}</pre><div id="lifecycle"/><section className="fixture"><Profiler id="answer" onRender={(_,__,duration)=>{if(active.current)rendering.current.push(duration)}}><Component text={text.slice(0,count)} citations={citations} streaming={streaming}/></Profiler></section></main>;
}
createRoot(document.getElementById('root')).render(<App/>);
`);
execFileSync('npx', ['--yes', 'esbuild', path.join(dir, 'benchmark.tsx'), '--bundle', '--format=esm', '--jsx=automatic', '--alias:@=./src', '--define:process.env.NODE_ENV="development"', `--outfile=${path.join(dir, 'benchmark.js')}`], { stdio: 'inherit' });
const css = readdirSync('.next/static/chunks').filter(f => f.endsWith('.css')).map(f => readFileSync(path.join('.next/static/chunks', f), 'utf8')).join('\n');
writeFileSync(path.join(dir, 'app.css'), css);
const html = '<!doctype html><html lang="vi" data-theme="linen"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{overflow:auto!important;padding:20px;background:var(--sheet)}main{max-width:900px;margin:auto}h1{font-size:24px}button{border:1px solid var(--ink);border-radius:8px;padding:8px;margin:8px 8px 8px 0;min-height:44px}pre{white-space:pre-wrap;font-size:12px}.fixture{max-width:460px;margin-top:24px}.md-stream>*+*{margin-top:.6em}</style><div id="root"></div><script type="module" src="/benchmark.js"></script></html>';
createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/') { res.setHeader('content-type', 'text/html;charset=utf-8'); res.end(html); return; }
  const file = pathname === '/app.css' || pathname === '/benchmark.js' ? path.join(dir, pathname.slice(1))
    : pathname.startsWith('/media/') ? path.resolve('.next/static', '.' + pathname)
    : pathname.startsWith('/fonts/') ? path.resolve('public', '.' + pathname) : null;
  if (!file || !existsSync(file) || ![dir, path.resolve('.next/static/media'), path.resolve('public/fonts')].some(base => file.startsWith(base + path.sep))) { res.writeHead(404);res.end();return; }
  res.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream');res.end(readFileSync(file));
}).listen(3311, '127.0.0.1', () => console.log('Synthetic benchmark: http://127.0.0.1:3311'));
