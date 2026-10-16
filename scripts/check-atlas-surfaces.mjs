import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../public/anatomy/3d/manifest.json',import.meta.url)));
const expectedKinds={Femur:['bone','cartilage'],'Gluteus medius muscle':['muscle','tendon'],'Hip bone':['bone','cartilage']};
for (const [name,kinds] of Object.entries(expectedKinds)) {
  for (const structure of manifest.structures.filter(s=>s.english===name)) {
    assert.ok(structure.surfaces,`${name}: source surface metadata must survive export`);
    for (const kind of kinds) assert.ok(structure.surfaces.some(s=>s.kind===kind&&s.faces>0),`${name}: missing ${kind}`);
  }
}
for(const [area,bundle] of Object.entries(manifest.bundles)) {
 const bytes=readFileSync(new URL(`../public${new URL(bundle.url,'http://local').pathname}`,import.meta.url));
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 const expected=manifest.structures.filter(s=>area==='full'||s.areas.includes(area));
 for(const s of expected) {
  const root=gltf.nodes.findIndex(n=>n.name===s.id);
  assert.ok(root>=0,`${area}: missing stable root ${s.id}`);
  const primitives=[];
  function visit(index){const n=gltf.nodes[index];if(n.mesh!==undefined)primitives.push(...gltf.meshes[n.mesh].primitives);for(const child of n.children??[])visit(child);}
  visit(root);
  assert.ok(primitives.length>0,`${s.english}: no actual geometry`);
  for(const surface of s.surfaces)assert.ok(primitives.some(p=>gltf.materials[p.material].name===`Kinesis_${surface.kind}`),`${s.english}: material boundary ${surface.kind} lost`);
  if(s.thickness) {
   assert.equal(s.thickness.units,'m');
   assert.equal(s.thickness.method,'inward-normal-cone-median-v1');
   assert.ok(s.thickness.validVertices/s.thickness.vertices>=.95);
   assert.ok(s.thickness.min>0&&s.thickness.max>=s.thickness.p50);
   for(const p of primitives) {
    assert.ok('_THICKNESS' in p.attributes,`${s.english}: missing thickness field`);
    assert.ok('_THICKNESS_VALID' in p.attributes,`${s.english}: missing validity field`);
    const attr=gltf.accessors[p.attributes._THICKNESS];
    assert.equal(attr.type,'SCALAR');
    assert.equal(attr.componentType,5126);
    assert.equal(attr.count,gltf.accessors[p.attributes.POSITION].count);
   }
  }
 }
 console.log(`${area}: ${expected.length} stable structures; material boundaries and fields present`);
}
assert.equal(manifest.structures.filter(s=>s.thickness).length,10,'only the ten audited hip samples get thickness fields');
console.log('Source surfaces and estimated thickness asset checks passed.');
