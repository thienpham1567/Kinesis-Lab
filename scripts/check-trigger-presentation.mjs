// Render the actual React components. These assertions check presentation, not medical truth.
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';

const require=createRequire(import.meta.url), ts=require('typescript');
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const loaded=new Map();
function load(file) {
  file=path.resolve(file);
  if(loaded.has(file)) return loaded.get(file);
  const exports={};loaded.set(file,exports);
  const result=ts.transpileModule(readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
  assert.equal(result.diagnostics?.length??0,0,`Syntax: ${file}`);
  vm.runInNewContext(result.outputText,{exports,require:(target)=>{
    if(!target.startsWith('.')&&!target.startsWith('@/')) return require(target);
    const base=target.startsWith('@/')?path.resolve(root,'src',target.slice(2)):path.resolve(path.dirname(file),target);
    const resolved=[base,`${base}.ts`,`${base}.tsx`,`${base}.mjs`].find(p=>existsSync(p));
    assert(resolved,`Resolve ${target}`);return load(resolved);
  }},{filename:file});return exports;
}
const {TriggerPointExplorer}=load(path.join(root,'src/components/TriggerPointExplorer.tsx'));
const {TriggerSourceAnatomy}=load(path.join(root,'src/components/TriggerSourceAnatomy.tsx'));
const atlas=load(path.join(root,'src/lib/clinical/trigger-point-atlas.ts'));
for(const muscle of atlas.TRIGGER_POINT_MUSCLES) {
  const html=renderToStaticMarkup(createElement(TriggerSourceAnatomy,{muscle}));
  assert.ok(!/<path|<circle|muscles-anterior|muscles-posterior/.test(html),`${muscle.id}: original anatomy without authored overlays`);
  for(const view of muscle.plateViews)assert.ok(html.includes(atlas.SOURCE_PLATES[view.plate].src),`${muscle.id}: source plate`);
}
// API metadata checked 2026-10-22; exact source bytes, not an independent anatomy approval.
for(const [name,sha] of [['full-body-muscles-openstax.jpg','8a3b1231f319214a74cffda6b70ff2c166e55a81'],['glute-deep-openstax.jpg','48a26b0c6351a2052a16c4fcd338bc092505e492']]) {
  assert.equal(createHash('sha1').update(readFileSync(path.join(root,'public/anatomy',name))).digest('hex'),sha,`Exact source asset ${name}`);
}
const render=mode=>renderToStaticMarkup(createElement(TriggerPointExplorer,{initialMode:mode}));
const muscle=render('muscle_to_pain');
assert.match(muscle,/full-body-muscles-openstax\.jpg/,'primary muscle study uses the attributed labeled plate');
assert.ok(!/muscles-anterior\.png|muscles-posterior\.png/.test(muscle),'muscle study must not paint a superficial regional silhouette as selected anatomy');
assert.doesNotMatch(muscle,/Lan đau\?|Vòng đánh dấu|Nút Trigger Point|CƠ BỊ ỨC CHẾ|Thủ phạm:/,'unverified point/referral and causal labels must not reach muscle UI');
assert.match(muscle,/Xem ảnh gốc/,'small crop labels have a full resolution alternative');
const symptom=render('pain_to_muscle');
assert.match(symptom,/muscles-anterior\.png/,'symptom locator remains available');
assert.match(symptom,/Gáy &amp; thái dương/);
assert.match(symptom,/Mặt ngoài gối/);
assert.match(symptom,/Gót chân/);
assert.doesNotMatch(symptom,/Lan đau\?|Vòng đánh dấu|Nút Trigger Point|Thủ phạm:/,'region navigation must not display diagnostic trigger locations');
const handbook=render('handbook');
assert.match(handbook,/Tiêu chí đồng thuận và độ tin cậy sờ nắn/);
assert.match(handbook,/Đối chiếu có giới hạn/);
assert.ok(!/Chờ chuyên gia duyệt/.test(handbook),'source comparison does not require an expert approval gate');
assert.ok(!/Thang lực ấn an toàn|Foam roll không nghiền mô sẹo/.test(handbook),'handbook headings must not imply a validated safe dose or a proven mechanism');
console.log('Trigger presentation: attributed primary anatomy, withheld unverified point/referral overlays, neutral symptom navigation and handbook passed.');
