import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root} from './lib.mjs';

// Preserve downloaded mesh topology; compact away unused photographic/teaching textures
// because the film applies its own restrained PBR art direction.
const dir=path.join(root,'public/telinga-volume/models');
const input=path.join(dir,'ear-anatomy-source.glb'),bytes=fs.readFileSync(input);
if(bytes.toString('ascii',0,4)!=='glTF')throw Error('Expected downloaded GLB');
const length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length));
const binary=bytes.subarray(28+length);
const sourceHash=crypto.createHash('sha256').update(bytes).digest('hex');
const used=[...new Set(json.accessors.map(a=>a.bufferView).filter(v=>v!==undefined))];
const chunks=[],views=[],mapping=new Map();let offset=0;
for(const old of used){
 const view=json.bufferViews[old],data=binary.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
 mapping.set(old,views.length);views.push({...view,buffer:0,byteOffset:offset});chunks.push(data);offset+=data.length;
 const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}
}
json.accessors.forEach(a=>{if(a.bufferView!==undefined)a.bufferView=mapping.get(a.bufferView);});
json.bufferViews=views;json.buffers=[{byteLength:offset}];
const colors=[[.25,.76,.66,1],[.72,.88,.35,1],[.35,.58,.51,1],[.23,.85,.74,1],[.91,.87,.79,1],[.74,.59,.48,1],[.88,.83,.70,1]];
json.materials=json.materials.map((m,i)=>({name:m.name+' / film restyle',pbrMetallicRoughness:{baseColorFactor:colors[i],metallicFactor:.06,roughnessFactor:.43},doubleSided:true}));
delete json.images;delete json.textures;delete json.samplers;delete json.extensionsRequired;delete json.extensionsUsed;
json.asset.extras={...json.asset.extras,license:'CC0-1.0',source:'https://www.innerscene.com/tools/library/3d-parts/ear-anatomy-model-6b89b9e8',modified:true,modifications:'Original mesh vertices/topology preserved. Texture payloads removed, materials restyled for film.'};
const jb=Buffer.from(JSON.stringify(json)),jp=Buffer.concat([jb,Buffer.alloc((4-jb.length%4)%4,32)]),bin=Buffer.concat(chunks);
const out=Buffer.alloc(28+jp.length+bin.length);out.write('glTF');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jp.length,12);out.writeUInt32LE(0x4e4f534a,16);jp.copy(out,20);out.writeUInt32LE(bin.length,20+jp.length);out.writeUInt32LE(0x004e4942,24+jp.length);bin.copy(out,28+jp.length);
fs.writeFileSync(path.join(dir,'outer-ear.glb'),out);
const stats=json.nodes.filter(n=>n.mesh!==undefined).map(n=>({name:n.name,anatomicalId:n.extras?.anatomical_id,primitives:json.meshes[n.mesh].primitives.map(p=>({boundsMin:json.accessors[p.attributes.POSITION].min,boundsMax:json.accessors[p.attributes.POSITION].max,vertices:json.accessors[p.attributes.POSITION].count,triangles:json.accessors[p.indices].count/3}))}));
const provenance={title:'Ear anatomy model',author:'Innerscene; source page credits adaptation from MakeHuman/MPFB CC0 assets',source:json.asset.extras.source,download:'https://www.innerscene.com/api/library/ear-anatomy-model-6b89b9e8/download',license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',licenseEvidence:'Source page states public domain (CC0), commercial use permitted. Original GLB root extras also specify license CC0-1.0 and original_design true.',sourceSha256:sourceHash,sourceBytes:bytes.length,derivedFile:'outer-ear.glb',derivedSha256:crypto.createHash('sha256').update(out).digest('hex'),derivedBytes:out.length,modifications:json.asset.extras.modifications,scope:'Authored anatomical teaching mesh, not a clinical scan. Inner-ear close-ups use a separate CT-derived SPL atlas.',parts:stats};
fs.writeFileSync(path.join(dir,'outer-ear-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({file:'outer-ear.glb',bytes:out.length,meshes:stats.length,triangles:stats.reduce((n,m)=>n+m.primitives.reduce((s,p)=>s+p.triangles,0),0),sourceSha256:sourceHash},null,2));
