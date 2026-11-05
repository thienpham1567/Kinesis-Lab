// Add source head GLB nodes without re-encoding or moving any legacy mesh.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const jsonHash = value => hash(Buffer.from(JSON.stringify(value)));
const decode = bytes => {
  if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2)throw Error("Expected GLB 2");
  const n=bytes.readUInt32LE(12);
  return {json:JSON.parse(bytes.subarray(20,20+n)),bin:bytes.subarray(28+n)};
};
const encode = (json,bin) => {
  const raw=Buffer.from(JSON.stringify(json));
  const doc=Buffer.alloc(Math.ceil(raw.length/4)*4,0x20);raw.copy(doc);
  const data=Buffer.alloc(Math.ceil(bin.length/4)*4);bin.copy(data);
  const out=Buffer.alloc(28+doc.length+data.length);
  out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
  out.writeUInt32LE(doc.length,12);out.writeUInt32LE(0x4e4f534a,16);doc.copy(out,20);
  out.writeUInt32LE(data.length,20+doc.length);out.writeUInt32LE(0x004e4942,24+doc.length);data.copy(out,28+doc.length);
  return out;
};

export function mergeHeadGlb(baseBytes,headBytes) {
  const base=decode(baseBytes),head=decode(headBytes);
  for(const value of [base.json,head.json]) {
    if(value.buffers?.length!==1||value.buffers[0].uri||value.animations?.length||value.skins?.length||value.textures?.length)throw Error("Expected static single-buffer untextured source assets");
  }
  const merged=structuredClone(base.json);
  const offset=Object.fromEntries(['accessors','bufferViews','materials','meshes','nodes'].map(k=>[k,base.json[k]?.length??0]));
  for(const key of Object.keys(offset))merged[key]??=[];
  merged.bufferViews.push(...head.json.bufferViews.map(v=>({...v,buffer:0,byteOffset:(v.byteOffset??0)+base.bin.length})));
  merged.accessors.push(...head.json.accessors.map(a=>{
    if(a.sparse)throw Error('Sparse accessors require explicit rebase support');
    return {...a,...(a.bufferView!==undefined?{bufferView:a.bufferView+offset.bufferViews}:{})};
  }));
  merged.materials.push(...head.json.materials);
  merged.meshes.push(...head.json.meshes.map(m=>({...m,primitives:m.primitives.map(p=>({
    ...p,attributes:Object.fromEntries(Object.entries(p.attributes).map(([k,v])=>[k,v+offset.accessors])),
    ...(p.indices!==undefined?{indices:p.indices+offset.accessors}:{}),
    ...(p.material!==undefined?{material:p.material+offset.materials}:{}),
    extensions:{...p.extensions,KHR_draco_mesh_compression:{...p.extensions.KHR_draco_mesh_compression,bufferView:p.extensions.KHR_draco_mesh_compression.bufferView+offset.bufferViews}},
  }))})));
  merged.nodes.push(...head.json.nodes.map(n=>({...n,...(n.mesh!==undefined?{mesh:n.mesh+offset.meshes}:{}),...(n.children?{children:n.children.map(v=>v+offset.nodes)}:{})})));
  merged.scenes[merged.scene??0].nodes.push(...head.json.scenes[head.json.scene??0].nodes.map(v=>v+offset.nodes));
  for(const key of ['extensionsUsed','extensionsRequired'])merged[key]=[...new Set([...(base.json[key]??[]),...(head.json[key]??[])])];
  const bin=Buffer.concat([base.bin,head.bin]);merged.buffers=[{byteLength:bin.length}];
  return encode(merged,bin);
}

export function publishHeadAddition(root=new URL('../',import.meta.url)) {
  const baseline=new URL('.data/z-anatomy/head-2026-11-05/',root);
  const baseManifestBytes=readFileSync(new URL('manifest.json',baseline));
  const before=JSON.parse(baseManifestBytes);
  const extra=JSON.parse(readFileSync(new URL('head-manifest.json',baseline)));
  const baseBytes=readFileSync(new URL('full.glb',baseline));
  const headBytes=readFileSync(new URL('public/anatomy/3d/head.glb',root));
  const existing=new Set(before.structures.map(s=>s.id));
  if(extra.structures.some(s=>existing.has(s.id)))throw Error('Head addition overlaps legacy identities');
  const full=mergeHeadGlb(baseBytes,headBytes);
  const manifest={...before,source:extra.source,bundles:{...before.bundles,...extra.bundles,full:{url:`/anatomy/3d/full.glb?v=${hash(full).slice(0,12)}`,bytes:full.length,structures:before.structures.length+extra.structures.length}},structures:[...before.structures,...extra.structures]};
  writeFileSync(new URL('public/anatomy/3d/full.glb',root),full);
  writeFileSync(new URL('public/anatomy/3d/manifest.json',root),JSON.stringify(manifest));
  const decoded=decode(baseBytes);
  const headDoc=decode(headBytes).json;
  const triangles=new Map();let primitiveCount=0;
  function measureNode(index,owner) {
    const node=headDoc.nodes[index];if(node.name?.startsWith('za-'))owner=node.name;
    if(node.mesh!==undefined&&owner)for(const p of headDoc.meshes[node.mesh].primitives){
      primitiveCount++;triangles.set(owner,(triangles.get(owner)??0)+headDoc.accessors[p.indices??p.attributes.POSITION].count/3);
    }
    for(const child of node.children??[])measureNode(child,owner);
  }
  for(const index of headDoc.scenes[headDoc.scene??0].nodes)measureNode(index,null);
  const geometry={structures:triangles.size,primitives:primitiveCount,triangles:[...triangles.values()].reduce((a,b)=>a+b,0),structuresAtMost10Triangles:[...triangles.values()].filter(n=>n<=10).length,structuresExactly2Triangles:[...triangles.values()].filter(n=>n===2).length};
  const release={generatedAt:new Date().toISOString(),source:extra.source,scope:'Additive source musculoskeletal head export; unchanged legacy mesh binary/metadata. Engineering provenance, not anatomical validation.',
    previous:{structures:before.structures.length,structureIds:before.structures.map(s=>s.id),manifestSha256:hash(baseManifestBytes),fullGlbSha256:hash(baseBytes),binaryBytes:decoded.bin.length,binarySha256:hash(decoded.bin),structuresSha256:jsonHash(before.structures),
      arrays:Object.fromEntries(['nodes','meshes','accessors','bufferViews','materials'].map(k=>[k,{length:decoded.json[k].length,sha256:jsonHash(decoded.json[k])}]))},
    addition:{structures:extra.structures.length,headGlbSha256:hash(headBytes),fullGlbSha256:hash(full),totalStructures:manifest.structures.length,geometry},
    excludedObjects:['Malleus.l','Malleus.r','Incus.l','Incus.r','Stapes.l','Stapes.r'],exclusionReason:'Auditory ossicles belong to the source Bonus collection; upstream separately credits an NC-SA inner-ear model. Per-object origin not established; excluded pending provenance clarification.',reviewedBy:null};
  writeFileSync(new URL('public/anatomy/3d/head-addition.json',root),JSON.stringify(release,null,2)+'\n');
  console.log(`Added ${extra.structures.length} source head objects; ${manifest.structures.length} total. Legacy binary preserved.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)publishHeadAddition();
