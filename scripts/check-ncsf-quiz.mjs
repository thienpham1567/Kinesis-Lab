// Integrity/source-location checks only. Medical truth and distractor exclusivity require source comparison.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionErrors, figureObjectKey } from '../src/lib/ncsf-quiz.ts';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.data/ncsf');
const read = f => JSON.parse(readFileSync(path.join(dir,f),'utf8'));
const norm = s => s.normalize('NFC').replace(/[​️]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const stem = s => norm(s).replace(/^câu \d+:\s*/, '');
const words = s => new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1));
const jaccard = (a,b) => {let n=0;for(const w of a)if(b.has(w))n++;return n/(a.size+b.size-n);};
const objectives = new Set(read('objectives.json').map(o=>o.id));
const imageNotes = read('image-notes.json');
const pageFiles = readdirSync(path.join(dir,'pages'));
function pages(ch) {
  const file=pageFiles.find(f=>f.startsWith(`0${ch}-`));
  const parts=readFileSync(path.join(dir,'pages',file),'utf8').split(/^=== p\.(\d+) ===$/m);
  const result=new Map();for(let i=1;i<parts.length;i+=2)result.set(Number(parts[i]),norm(parts[i+1]));return result;
}
const exams=[1,2].flatMap(n=>read(`exams/exam${n}.json`).map(q=>({ref:`E${n}-${q.title.match(/Câu (\d+)/)?.[1]}`,text:stem(q.title),set:words(q.title+' '+q.options.join(' '))})));
const errors=[],all=[],similar=[];
let supplemental=0,figures=0;
for(let ch=1;ch<=8;ch++){
  const pg=pages(ch);const questions=read(`quiz/ch${ch}.json`);
  questions.forEach((q,i)=>{
    const id=`ch${ch}#${i+1}`;
    questionErrors(q,ch).forEach(e=>errors.push(`${id}: ${e}`));
    if(!q.kind||!q.domain)errors.push(`${id}: missing pattern/domain metadata`);
    if(q.kind==='figure'&&!q.figure)errors.push(`${id}: figure kind has no actual stimulus`);
    for(const obj of q.obj??[])if(!objectives.has(obj))errors.push(`${id}: unknown objective ${obj}`);
    if(q.basis==='supplement')supplemental++;
    else {
      const text=q.source==='image' ? imageNotes[`${ch}-${q.page}`] && norm(imageNotes[`${ch}-${q.page}`]) : pg.get(q.page);
      if(!text)errors.push(`${id}: missing ${q.source==='image'?'image transcript':'page'} ${q.page}`);
      else if(!text.includes(norm(q.evidence)))errors.push(`${id}: evidence not present on cited page ${q.page}: ${q.evidence}`);
    }
    if(q.figure){
      figures++;
      const key=figureObjectKey(ch,q.figure.page);
      const asset=key&&path.join(dir,key);
      if(!asset||!existsSync(asset))errors.push(`${id}: missing rendered figure ${key}`);
      else if(readFileSync(asset).subarray(0,8).toString('hex')!=='89504e470d0a1a0a')errors.push(`${id}: invalid PNG`);
    }
    if(typeof q.q==='string'&&Array.isArray(q.options))all.push({id,q,set:words(q.q+' '+q.options.join(' '))});
  });
}
for(let i=0;i<all.length;i++){
  for(let j=i+1;j<all.length;j++){
    if(stem(all[i].q.q)===stem(all[j].q.q))errors.push(`Duplicate stem: ${all[i].id} / ${all[j].id}`);
    else if(jaccard(all[i].set,all[j].set)>=0.67)similar.push({left:all[i].id,right:all[j].id,score:jaccard(all[i].set,all[j].set)});
  }
  for(const e of exams){
    if(stem(all[i].q.q)===e.text)errors.push(`Copied mock stem: ${all[i].id} / ${e.ref}`);
    else if(jaccard(all[i].set,e.set)>=0.72)similar.push({left:all[i].id,right:e.ref,score:jaccard(all[i].set,e.set)});
  }
}
writeFileSync(path.join(dir,'similarity-review.json'),JSON.stringify(similar,null,2));
console.log(`${all.length} questions; ${figures} actual figures; ${supplemental} supplementary evidence records. ${similar.length} similarity candidates for semantic review (shared topic is allowed).`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Integrity/page quote/source metadata checks passed. This is not medical or complete-coverage validation.');
