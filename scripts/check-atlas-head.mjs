import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(readFileSync(new URL("../public/anatomy/3d/manifest.json", import.meta.url)));
const id = name => `za-${createHash("sha256").update(name).digest("hex").slice(0,12)}`;
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

test("public source notes link to the shipped head terminology report", () => {
  const report=readFileSync(new URL('../public/anatomy/3d/HEAD-TERMINOLOGY.md',import.meta.url),'utf8');
  assert.equal(report,readFileSync(new URL('../docs/research/2026-11-05-atlas-head-terminology.md',import.meta.url),'utf8'));
  for(const file of ['ATTRIBUTION.md','TERMINOLOGY.md']){
    const doc=readFileSync(new URL(`../public/anatomy/3d/${file}`,import.meta.url),'utf8');
    const links=[...doc.matchAll(/\]\(([^)]*HEAD-TERMINOLOGY\.md)\)/g)].map(m=>m[1]);
    assert.ok(links.length,`${file} must link the public head report`);
    for(const link of links)assert.equal(new URL(link,`https://local/anatomy/3d/${file}`).pathname,'/anatomy/3d/HEAD-TERMINOLOGY.md');
  }
});

test("additive full bundle preserves all legacy metadata, binary bytes and mesh references", () => {
  const release=JSON.parse(readFileSync(new URL('../public/anatomy/3d/head-addition.json',import.meta.url)));
  const bytes=readFileSync(new URL(`../public${manifest.bundles.full.url}`,import.meta.url));
  const n=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+n)),bin=bytes.subarray(28+n);
  assert.equal(hash(bytes),release.addition.fullGlbSha256);
  assert.equal(hash(bin.subarray(0,release.previous.binaryBytes)),release.previous.binarySha256);
  assert.equal(hash(Buffer.from(JSON.stringify(manifest.structures.slice(0,release.previous.structures)))),release.previous.structuresSha256);
  for(const [key,record] of Object.entries(release.previous.arrays))
    assert.equal(hash(Buffer.from(JSON.stringify(gltf[key].slice(0,record.length)))),record.sha256,`Legacy ${key} changed`);
  assert.equal(manifest.structures.length,release.previous.structures+release.addition.structures);
});

test("whole body and a dedicated head bundle retain real source skull, chewing muscle and TMJ identities", () => {
  assert.ok(manifest.bundles.head, "Missing head bundle");
  for (const name of ["Frontal bone", "Occipital bone", "Mandible", "Maxilla.l", "Ethmoid bone", "Superficial part of masseter.l", "Temporalis muscle.r", "Articular disc of temporomandibular joint.l"]) {
    const row=manifest.structures.find(s=>s.id===id(name));
    assert.ok(row,`Missing source head object ${name}`);
    assert.ok(row.areas.includes("head"));
    assert.equal(row.clinicalRegion,null,"Head must not inherit unrelated cervical clinical knowledge");
  }
  const rows=manifest.structures.filter(s=>s.areas.includes("head"));
  assert.equal(rows.length,manifest.bundles.head.structures);
  const bytes=readFileSync(new URL(`../public${manifest.bundles.head.url}`,import.meta.url));
  assert.equal(bytes.length,manifest.bundles.head.bytes);
  const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  const present=new Set(gltf.nodes.map(n=>n.name).filter(Boolean));
  assert.deepEqual(new Set(rows.map(s=>s.id)),new Set([...present].filter(n=>n.startsWith('za-'))));
});

test("source selection restores musculoskeletal head while excluding nonmusculoskeletal and separately credited auditory content", () => {
  const result=execFileSync("python3",["-c",`import sys;sys.path.insert(0,'scripts')
from z_anatomy_selection import source_layer
assert source_layer('Mandible',{'Head','1: Skeletal system'}) == 'bone'
assert source_layer('Ethmoid bone',{'1: Skeletal system'}) == 'bone'
assert source_layer('Temporalis muscle.l',{'Head','Muscles','4: Muscular system'}) == 'muscle'
assert source_layer('Articular disc of temporomandibular joint.l',{'Head','3: Joints'}) == 'joint'
assert source_layer('Cerebrum',{'Head','7: Nervous system & Sense organs'}) is None
assert source_layer('Malleus.l',{'Head','1: Skeletal system','Auditory ossicles'}) is None
assert source_layer('Temporalis muscle.l.i',{'Head','Muscles','4: Muscular system'}) is None
print('head selection passed')`],{encoding:"utf8"});
  assert.match(result,/head selection passed/);
});
