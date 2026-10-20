import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=new URL('../public/anatomy/3d/motion/',import.meta.url);
assert(existsSync(new URL('cable-curl-left.glb',base)),'source-anatomy curl asset must exist');
const info=JSON.parse(readFileSync(new URL('cable-curl-left.json',base)));
assert.equal(info.reviewedBy,null);assert.equal(info.status,'experimental-simulation');assert(info.limitations.length>=4);
assert(info.sources.some(s=>s.url.includes('openstax.org')&&s.checkedAt==='2026-10-20'));
assert.equal(info.motion.durationSeconds,6);assert.equal(info.motion.variant,'single-arm-low-cable-curl-study');
assert(info.rig.weighting.includes('authored'));
assert.deepEqual(info.structures.filter(s=>s.role==='elbow-flexor').map(s=>s.english).sort(), ['Brachialis muscle','Brachioradialis muscle','Long head of biceps brachii','Short head of biceps brachii'].sort());
const bytes=readFileSync(new URL('cable-curl-left.glb',base));assert(bytes.length<8*1024*1024,'pilot asset below 8 MiB');
assert.equal(createHash('sha256').update(bytes).digest('hex'),info.assetSha256,'sidecar must identify exact derived GLB');
const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
assert.equal(gltf.skins.length,1);assert.equal(gltf.animations.length,1);
assert(gltf.meshes.length>=8);assert(gltf.animations[0].channels.some(c=>c.target.path==='rotation'));
for(const mesh of gltf.meshes)for(const p of mesh.primitives){assert(p.attributes.JOINTS_0!==undefined);assert(p.attributes.WEIGHTS_0!==undefined);}
const ids=info.structures.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
const catalog=JSON.parse(readFileSync(new URL('../public/anatomy/3d/manifest.json',import.meta.url)));
for(const id of ids)assert(catalog.structures.some(s=>s.id===id),'derived geometry must retain known source ID');
console.log('Curl asset: source identity, pending review, authored rig limits, skinning, animation and byte budget passed.');
const THREE=await import('three');
const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
const array=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const asset=await new GLTFLoader().parseAsync(array,'');
assert(Math.abs(asset.animations[0].duration-6)<.01);
const mixer=new THREE.AnimationMixer(asset.scene);mixer.clipAction(asset.animations[0]).play();
const meshes=[];asset.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o)});
assert(meshes.length>0);
for(const mesh of meshes){const weights=mesh.geometry.getAttribute('skinWeight');for(let i=0;i<weights.count;i++){let sum=0;for(let j=0;j<4;j++){const w=weights.array[i*4+j];assert(Number.isFinite(w)&&w>=0&&w<=1);sum+=w;}assert(Math.abs(sum-1)<.002);}}
function meshFor(english){const id=info.structures.find(s=>s.english===english)?.id;return meshes.find(m=>{let a=m;while(a){if(a.name===id)return true;a=a.parent;}return false});}
const hand=meshFor('Third metacarpal bone'),upper=meshFor('Humerus');assert(hand);assert(upper);
function point(mesh,time){mixer.setTime(time);asset.scene.updateMatrixWorld(true);mesh.skeleton.update();const p=new THREE.Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'),0);mesh.applyBoneTransform(0,p);return mesh.localToWorld(p);}
const start=point(hand,0),peak=point(hand,3),end=point(hand,6);
assert(start.distanceTo(peak)>.1,'forearm source mesh must actually move');assert(start.distanceTo(end)<.0001,'cycle closes without a position snap');
assert(point(upper,0).distanceTo(point(upper,3))<.0001,'upper arm source bone stays anchored');
for(const time of [0,1.5,3,4.5,6])for(const mesh of meshes){const p=point(mesh,time);assert(p.toArray().every(Number.isFinite));}
console.log('Curl actual GLB CPU checks: normalized weights, source forearm movement, anchored upper arm, finite sampled poses and loop closure passed.');
