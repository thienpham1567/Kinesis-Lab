import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
assert.equal(renderToStaticMarkup(createElement(ClinicalEvidencePanel,{evidence:undefined})), '');
for (const file of ['BodyMapExplorer.tsx','JointDiagramSvg.tsx','TriggerPointExplorer.tsx','atlas3d/AnatomyEvidenceCard.tsx','atlas3d/HipMaterialStudyControls.tsx','training/TrainingAtlasExplorer.tsx','training/MuscleStudyCard.tsx','training/TrainingAnatomyViewer.tsx','training/curl/CableCurlStudy.tsx']) {
  const content=readFileSync(new URL(`../src/components/${file}`,import.meta.url),'utf8');
  assert.ok(!/Chờ chuyên gia duyệt|chờ chuyên gia|cần chuyên gia.*duyệt|Chưa có đánh giá chuyên gia/.test(content),`${file}: do not use absence of an expert as a gate`);
}
console.log('Atlas source presentation: comparison states, readable claims/scope/date/links, no fabricated reviewer or mandatory expert gate passed.');
