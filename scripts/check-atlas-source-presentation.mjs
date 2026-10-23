import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const require=createRequire(import.meta.url), ts=require('typescript');
const panelFile=new URL('../src/components/ClinicalEvidencePanel.tsx',import.meta.url);
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync(panelFile,'utf8'),{
  fileName:panelFile.pathname,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022},
}).outputText,{exports,require});
const {ClinicalEvidencePanel}=exports;
const labels={'literature-reviewed':'Đã đối chiếu tài liệu',limited:'Đối chiếu có giới hạn','source-only':'Dữ liệu nguồn'};
for(const [status,label] of Object.entries(labels)) {
  const evidence={status,reviewedBy:null,sources:[{title:'Source fixture',url:'https://example.org/source',checkedAt:'2026-10-22',access:'Abstract only'}],supportedClaims:['Claim with bounded scope'],limitations:['Specific measurement is not supported.']};
  const html=renderToStaticMarkup(createElement(ClinicalEvidencePanel,{evidence}));
  assert.ok(html.includes(label),`${status}: source comparison state remains visible`);
  assert.ok(!/Chờ chuyên gia|chờ chuyên gia|độc lập duyệt/.test(html),'null reviewer must not impose an expert approval gate');
  for(const text of ['Claim with bounded scope','Specific measurement is not supported.','https://example.org/source','2026-10-22','Abstract only'])assert.ok(html.includes(text),`Preserve source/claim scope: ${text}`);
}
const statusIntro={'literature-reviewed':'Phát biểu được đối chiếu với các nguồn bên dưới; xem phạm vi đọc và giới hạn áp dụng của từng mục.',limited:'Phạm vi đối chiếu bị giới hạn (quyền truy cập hạn chế, quy ước minh họa hoặc chính sách quy trình); đọc giới hạn trước khi áp dụng.','source-only':'Chỉ là dữ liệu tên gọi và nguồn mesh, chưa có kiến thức theo từng cấu trúc; không phải phát biểu y khoa.'};
const introHtml={};
for(const status of Object.keys(statusIntro)) {
  const html=renderToStaticMarkup(createElement(ClinicalEvidencePanel,{evidence:{status,reviewedBy:null,sources:[{title:'Source fixture',url:'https://example.org/source',checkedAt:'2026-10-22',access:'Abstract only'}],supportedClaims:['Claim with bounded scope'],limitations:['Specific measurement is not supported.']}}));
  introHtml[status]=html;
  assert.ok(html.includes(statusIntro[status]),`${status}: status-specific intro sentence`);
  for(const other of Object.keys(statusIntro))if(other!==status)assert.ok(!html.includes(statusIntro[other]),`${status}: must not show the ${other} intro`);
}
assert.ok(!introHtml['source-only'].includes('Phát biểu được đối chiếu'),'source-only: no comparison claim in the intro');
assert.ok(introHtml['source-only'].includes('dữ liệu tên gọi và nguồn mesh'),'source-only: provenance wording');
assert.equal(renderToStaticMarkup(createElement(ClinicalEvidencePanel,{evidence:undefined})), '');
for (const file of ['BodyMapExplorer.tsx','JointDiagramSvg.tsx','TriggerPointExplorer.tsx','atlas3d/AnatomyEvidenceCard.tsx','atlas3d/HipMaterialStudyControls.tsx','training/TrainingAtlasExplorer.tsx','training/MuscleStudyCard.tsx','training/TrainingAnatomyViewer.tsx','training/curl/CableCurlStudy.tsx']) {
  const content=readFileSync(new URL(`../src/components/${file}`,import.meta.url),'utf8');
  assert.ok(!/Chờ chuyên gia duyệt|chờ chuyên gia|cần chuyên gia.*duyệt|Chưa có đánh giá chuyên gia/.test(content),`${file}: do not use absence of an expert as a gate`);
}
// 3D tab region knowledge: render the real component with the same data the joint-recovery tab uses.
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),loaded=new Map();
function load(file) {
  file=path.resolve(file);
  if(loaded.has(file))return loaded.get(file);
  const mod={};loaded.set(file,mod);
  const out=ts.transpileModule(readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(out,{exports:mod,require:(target)=>{
    if(!target.startsWith('.')&&!target.startsWith('@/'))return require(target);
    const base=target.startsWith('@/')?path.resolve(root,'src',target.slice(2)):path.resolve(path.dirname(file),target);
    const resolved=[base,`${base}.ts`,`${base}.tsx`].find(p=>existsSync(p));
    assert(resolved,`Resolve ${target}`);return load(resolved);
  }},{filename:file});return mod;
}
const {RegionKnowledgePanel}=load(path.join(root,'src/components/atlas3d/RegionKnowledgePanel.tsx'));
const {ANATOMY_REGIONS,REGION_FOUNDATIONS}=load(path.join(root,'src/lib/clinical/anatomy-atlas.ts'));
const {ANATOMY_REGION_EVIDENCE}=load(path.join(root,'src/lib/clinical/evidence-anatomy.ts'));
const panel=props=>renderToStaticMarkup(createElement(RegionKnowledgePanel,props));
const knee=ANATOMY_REGIONS.find(r=>r.id==='knee'),kneeEvidence=ANATOMY_REGION_EVIDENCE.knee;
const kneeHtml=panel({regionId:'knee'});
assert.ok(kneeHtml.includes('Kiến thức nền'),'knee: foundations heading');
assert.equal(REGION_FOUNDATIONS.knee.length,3,'knee: three foundations');
for(const item of REGION_FOUNDATIONS.knee) {
  assert.ok(kneeHtml.includes(item.text),'knee: foundation text rendered');
  for(const n of item.sourceRefs)assert.ok(kneeHtml.includes(`href="${kneeEvidence.sources[n-1].url}"`)&&kneeHtml.includes(`[${n}]`),`knee: foundation source link [${n}]`);
}
assert.equal((kneeHtml.match(/>\[6\]<\/a>/g)??[]).length,3,'knee: one [n] link per foundation');
for(const st of knee.structures)for(const text of [st.name,st.latin,st.originInsertion,st.action])assert.ok(kneeHtml.includes(text.replaceAll('&','&amp;')),`knee: structure card ${st.name}`);
assert.ok(kneeHtml.includes('data-evidence-status="literature-reviewed"')&&kneeHtml.includes('Nguồn và giới hạn áp dụng'),'knee: region ClinicalEvidencePanel');
assert.ok(!/Chờ chuyên gia|chờ chuyên gia/.test(kneeHtml)&&!kneeHtml.includes('text-[11px]'),'knee: no expert gate, text floor 12px');
const order=html=>knee.structures.map(st=>[html.indexOf(st.name.replaceAll('&','&amp;')),st.name]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const defaultOrder=order(kneeHtml);
assert.deepEqual(defaultOrder,knee.structures.map(st=>st.name),'knee: authored order without selection');
const acl=knee.structures.find(st=>st.latin.startsWith('Ligamentum cruciatum')).name;
// Real manifest names: matching uses the Latin term of the structure card; no reliable match leaves the order alone.
assert.equal(order(panel({regionId:'knee',meshEnglish:'Anterior cruciate ligament',meshLatin:'Ligamentum cruciatum anterius'}))[0],acl,'knee: ACL mesh promotes its structure card');
assert.equal(order(panel({regionId:'knee',meshEnglish:'Medial meniscus',meshLatin:'Meniscus medialis'}))[0],knee.structures.find(st=>st.latin.startsWith('Meniscus')).name,'knee: meniscus mesh promotes its structure card');
for(const mesh of [{meshEnglish:'Patella',meshLatin:'Patella'},{meshEnglish:'Gluteus maximus muscle',meshLatin:'Musculus gluteus maximus'},{meshEnglish:'Medial patellar retinaculum',meshLatin:'Retinaculum mediale patellae'},{meshEnglish:'Adductor longus muscle',meshLatin:'Musculus adductor longus'}])assert.deepEqual(order(panel({regionId:'knee',...mesh})),defaultOrder,`knee: no promotion for ${mesh.meshEnglish}`);
assert.ok(panel({regionId:'knee',meshEnglish:'Anterior cruciate ligament',meshLatin:'Ligamentum cruciatum anterius'}).includes('Cấu trúc đang chọn'),'knee: promoted card is labelled');
assert.ok(!kneeHtml.includes('Cấu trúc đang chọn'),'knee: no label without a match');
const hip=ANATOMY_REGIONS.find(r=>r.id==='hip_pelvis'),hipFirst=html=>hip.structures.map(st=>[html.indexOf(st.name.replaceAll('&','&amp;')),st.name]).sort((x,y)=>x[0]-y[0])[0][1];
assert.equal(hipFirst(panel({regionId:'hip_pelvis',meshEnglish:'Gluteus minimus muscle',meshLatin:'Musculus gluteus minimus'})),hip.structures.find(st=>st.latin.startsWith('Gluteus medius')).name,'hip: gluteus minimus mesh promotes the gluteus medius & minimus card');
for(const region of ANATOMY_REGIONS) {
  const html=panel({regionId:region.id});
  assert.ok(html.includes('Kiến thức nền')&&html.includes('data-evidence-status'),`${region.id}: knowledge + evidence render`);
  for(const item of REGION_FOUNDATIONS[region.id])assert.ok(html.includes(item.text),`${region.id}: foundation rendered`);
}
const explorer=readFileSync(path.join(root,'src/components/atlas3d/Atlas3DExplorer.tsx'),'utf8');
assert.ok(/<RegionKnowledgePanel[^>]*regionId=\{region\.id\}/.test(explorer)&&explorer.indexOf('<RegionKnowledgePanel')>explorer.indexOf('Ghi chú PT'),'3D explorer renders the panel below Ghi chú PT');
console.log('Atlas source presentation: comparison states, readable claims/scope/date/links, no fabricated reviewer or mandatory expert gate passed.');
