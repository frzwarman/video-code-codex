import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import ts from 'typescript';
import {Box3,Matrix4,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {root,validateBrief} from './lib.mjs';

// Source-only QA: no browser, renderer, screenshots, video files, or network.
const folder=path.join(root,'src/videos/telinga-volume');
const brief=JSON.parse(fs.readFileSync(path.join(folder,'brief.json'),'utf8'));
const input=JSON.parse(fs.readFileSync(path.join(root,'briefs/telinga-volume.json'),'utf8'));
const timing=JSON.parse(fs.readFileSync(path.join(folder,'timing.json'),'utf8'));
validateBrief(brief);assert.deepEqual(brief,input);assert.equal(brief.audio.narration,null);
assert.equal(brief.duration*brief.fps,3900);
const cues=brief.narration.map((cue,i)=>{
 const scene=brief.scenes[i];
 assert.equal(scene.start,timing.cuts[i]);assert.equal(scene.end,timing.cuts[i+1]);
 assert(cue.start>=scene.start&&cue.end<=scene.end);
 const words=cue.text.split(/\s+/).length;
 return{scene:i+1,words,plannedWpm:Math.round(words*60/(cue.end-cue.start))};
});
for(const name of ['score','effects']){
 const wav=fs.readFileSync(path.join(root,`public/telinga-volume/${name}.wav`));
 assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),48000);
 assert.equal(wav.readUInt16LE(22),2);assert.equal(wav.readUInt16LE(34),16);
 assert.equal(wav.readUInt32LE(40),65*48000*4);
}
const levels=JSON.parse(fs.readFileSync(path.join(folder,'audio-levels.json'),'utf8'));
assert.equal(levels.levels.length,3900);assert(levels.levels.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
// Execute the actual geometry module in Node, resolving its sole dependency.
const source=fs.readFileSync(path.join(folder,'geometry.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from ['"]three['"]/g,`from ${JSON.stringify(import.meta.resolve('three'))}`);
const geometry=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
// Surface winding must face outward so ordinary front-sided nerve/fluid materials render correctly.
const tube=geometry.sweep(geometry.curve([[0,0,0],[0,0,2],[0,0,4]]),12,16,()=>1);
for(let i=0;i<tube.attributes.position.count;i++){
 const p=tube.attributes.position,n=tube.attributes.normal;
 assert(p.getX(i)*n.getX(i)+p.getY(i)*n.getY(i)>.9,'Tube normals point inward');
}
tube.dispose();
const hairSource=fs.readFileSync(path.join(folder,'hair.ts'),'utf8');
const compiledHair=ts.transpileModule(hairSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from ['"]three['"]/g,`from ${JSON.stringify(import.meta.resolve('three'))}`);
const hair=await import(`data:text/javascript;base64,${Buffer.from(compiledHair).toString('base64')}`);
const objects={hairCellApical:hair.hairCellGeometry(),stereocilium:hair.stereociliumGeometry()};
for(const cell of hair.hairCells)for(let j=0;j<hair.HAIRS_PER_CELL;j++){
 const healthy=hair.hairState(cell,j,1.5,0),damaged=hair.hairState(cell,j,24,1);
 assert((healthy.root.x/.44)**2+(healthy.root.z/.352)**2<1,'Hair root outside apical plate');
 assert(healthy.root.y<=.065&&healthy.root.y>=.025,'Hair root outside apical surface height');
 assert(healthy.height>0&&healthy.width>0);
 assert.deepEqual(hair.hairState(cell,j,1.5,0),healthy,'Hair state depends on evaluation order');
 if(j<hair.HAIRS_PER_RANK*2)assert(hair.hairState(cell,j+hair.HAIRS_PER_RANK,1.5,0).height>healthy.height,'Bundle ranks must increase in height');
 if(cell.selected){assert.equal(damaged.height,0);assert.equal(hair.hairState(cell,j,29,1).height,0,'Lost bundle regrows in later scene');}
}
const stats={};
for(const [name,g] of Object.entries(objects)){
 for(const attribute of Object.values(g.attributes))assert(Array.from(attribute.array).every(Number.isFinite),`${name}: invalid geometry`);
 g.computeBoundingBox();assert(g.boundingBox&&!g.boundingBox.isEmpty());
 stats[name]={vertices:g.attributes.position.count,triangles:g.index.count/3};g.dispose();
}
// Inspect the actual local models. No browser, WebGL context, or asset requests.
const modelFolder=path.join(root,'public/telinga-volume/models');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const readJson=name=>JSON.parse(fs.readFileSync(path.join(modelFolder,name),'utf8'));
const provenance={headphones:readJson('headphones-provenance.json'),outer:readJson('outer-ear-provenance.json'),inner:readJson('inner-ear-provenance.json')};
function parseGlb(bytes,label){
 assert.equal(bytes.readUInt32LE(0),0x46546c67,`${label}: GLB signature`);
 assert.equal(bytes.readUInt32LE(4),2,`${label}: GLB version`);
 assert.equal(bytes.readUInt32LE(8),bytes.length,`${label}: GLB length`);
 let json,bin,offset=12;
 while(offset<bytes.length){
  assert(offset+8<=bytes.length,`${label}: truncated chunk`);
  const length=bytes.readUInt32LE(offset),kind=bytes.readUInt32LE(offset+4);offset+=8;
  assert(offset+length<=bytes.length&&length%4===0,`${label}: invalid chunk range`);
  if(kind===0x4e4f534a){assert(!json,`${label}: duplicate JSON chunk`);json=JSON.parse(bytes.toString('utf8',offset,offset+length));}
  if(kind===0x004e4942){assert(!bin,`${label}: duplicate BIN chunk`);bin=bytes.subarray(offset,offset+length);}
  offset+=length;
 }
 assert(json&&bin,`${label}: missing JSON or BIN data`);
 assert.equal(json.buffers.length,1,`${label}: expected embedded buffer`);
 for(const buffer of json.buffers){assert.equal(buffer.uri,undefined,`${label}: external buffer`);assert(buffer.byteLength<=bin.length);}
 for(const view of json.bufferViews??[]){assert.equal(view.buffer,0);const start=view.byteOffset??0;assert(start>=0&&view.byteLength>0&&start+view.byteLength<=json.buffers[0].byteLength,`${label}: invalid bufferView range`);}
 for(const image of json.images??[]){assert.equal(image.uri,undefined,`${label}: external image`);assert(Number.isInteger(image.bufferView)&&json.bufferViews[image.bufferView],`${label}: missing embedded image`);}
 return{json,bin};
}
const crcTable=Array.from({length:256},(_,i)=>{let n=i;for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;};
function checkPng(bytes,label){
 assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]),`${label}: PNG signature`);
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),bitDepth=bytes[24],colorType=bytes[25];
 assert.equal(width,2048);assert.equal(height,2048);assert.equal(bitDepth,8);assert.equal(colorType,2);
 assert.equal(bytes[26],0);assert.equal(bytes[27],0);assert.equal(bytes[28],0,'Only noninterlaced source PNGs expected');
 const compressed=[];let offset=8,ended=false;
 while(offset<bytes.length){
  assert(offset+12<=bytes.length,`${label}: truncated PNG chunk`);
  const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),end=offset+12+length;
  assert(end<=bytes.length,`${label}: PNG chunk exceeds file`);
  assert.equal(crc32(bytes.subarray(offset+4,offset+8+length)),bytes.readUInt32BE(offset+8+length),`${label}: PNG CRC`);
  if(type==='IDAT')compressed.push(bytes.subarray(offset+8,offset+8+length));
  if(type==='IEND'){assert.equal(length,0);ended=true;assert.equal(end,bytes.length);}
  offset=end;
 }
 assert(ended&&compressed.length,`${label}: incomplete PNG`);
 const scanlines=inflateSync(Buffer.concat(compressed),{maxOutputLength:(width*3+1)*height});
 assert.equal(scanlines.length,(width*3+1)*height);
 for(let row=0;row<height;row++)assert(scanlines[row*(width*3+1)]<=4,`${label}: invalid PNG row filter`);
 return{width,height,bitDepth,colorType,bytes:bytes.length,crcAndCompressedScanlinesValid:true};
}
function withoutTextureBindings(doc){
 const copy=structuredClone(doc);
 function remove(value){
  if(!value||typeof value!=='object')return;
  for(const key of Object.keys(value)){
   if(key.endsWith('Texture'))delete value[key];else remove(value[key]);
  }
 }
 remove(copy.materials);delete copy.images;delete copy.textures;delete copy.samplers;return copy;
}
function encodeGlb(json,bin){
 const text=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(padded);
 const bytes=Buffer.alloc(28+padded.length+bin.length);
 bytes.writeUInt32LE(0x46546c67,0);bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8);
 bytes.writeUInt32LE(padded.length,12);bytes.writeUInt32LE(0x4e4f534a,16);padded.copy(bytes,20);
 bytes.writeUInt32LE(bin.length,20+padded.length);bytes.writeUInt32LE(0x004e4942,24+padded.length);bin.copy(bytes,28+padded.length);return bytes;
}
const configs={
 headphones:{file:'headphones.glb',hash:provenance.headphones.outputSha256,bytes:provenance.headphones.outputBytes,names:['Right_Earcup','Left_Earcup','Headband'],vertices:provenance.headphones.vertices,triangles:provenance.headphones.triangles},
 outer:{file:'outer-ear.glb',hash:provenance.outer.derivedSha256,bytes:provenance.outer.derivedBytes,names:provenance.outer.parts.map(p=>p.name),vertices:provenance.outer.parts.flatMap(p=>p.primitives).reduce((s,p)=>s+p.vertices,0),triangles:provenance.outer.parts.flatMap(p=>p.primitives).reduce((s,p)=>s+p.triangles,0)},
 inner:{file:'inner-ear.glb',hash:provenance.inner.output.sha256,bytes:provenance.inner.output.bytes,names:['Labyrinth','Malleus','Incus','Stapes','TympanicMembrane','OsseousSpiralLamina','CochlearNerve'],vertices:provenance.inner.output.vertices,triangles:provenance.inner.output.triangles},
};
const loaded={},assetStats={};
for(const [name,config] of Object.entries(configs)){
 const bytes=fs.readFileSync(path.join(modelFolder,config.file));
 assert.equal(bytes.length,config.bytes,`${name}: byte size differs from provenance`);assert.equal(sha256(bytes),config.hash,`${name}: hash differs from provenance`);
 const {json,bin}=parseGlb(bytes,name);
 const names=json.nodes.filter(n=>Number.isInteger(n.mesh)).map(n=>n.name).sort();assert.deepEqual(names,[...config.names].sort(),`${name}: expected semantic mesh names`);
 const textures=(json.images??[]).map((image,i)=>{
  assert.equal(image.mimeType,'image/png');const view=json.bufferViews[image.bufferView];
  return{name:image.name??`image-${i}`,...checkPng(bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength),`${name}/${i}`)};
 });
 for(const texture of json.textures??[])assert(json.images[texture.source],`${name}: texture points to missing image`);
 const parseBytes=name==='headphones'?encodeGlb(withoutTextureBindings(json),bin):bytes;
 const gltf=await new GLTFLoader().parseAsync(parseBytes.buffer.slice(parseBytes.byteOffset,parseBytes.byteOffset+parseBytes.byteLength),'');
 let vertices=0,triangles=0,meshes=0;
 gltf.scene.traverse(object=>{
  if(!object.isMesh)return;meshes++;
  const g=object.geometry,p=g.attributes.position;assert(p&&p.count>0,`${name}: missing positions`);
  for(const [key,attribute] of Object.entries(g.attributes))assert(Array.from(attribute.array).every(Number.isFinite),`${name}/${object.name}: invalid ${key}`);
  if(g.index){assert(Array.from(g.index.array).every(i=>Number.isInteger(i)&&i>=0&&i<p.count),`${name}: invalid triangle index`);assert.equal(g.index.count%3,0);}
  else assert.equal(p.count%3,0);
  vertices+=p.count;triangles+=(g.index?.count??p.count)/3;
 });
 assert.equal(meshes,config.names.length);assert.equal(vertices,config.vertices);assert.equal(triangles,config.triangles);
 const box=new Box3().setFromObject(gltf.scene);assert(!box.isEmpty());
 assetStats[name]={file:config.file,bytes:bytes.length,sha256:config.hash,meshes,vertices,triangles,semanticNodes:names,bounds:{min:box.min.toArray(),max:box.max.toArray()},embeddedImages:textures,externalDependencies:0,loaderPassed:true,textureBindingsOmittedForNodeValidation:name==='headphones'};
 loaded[name]=gltf;
}
const outerSource=fs.readFileSync(path.join(modelFolder,'ear-anatomy-source.glb'));
assert.equal(outerSource.length,provenance.outer.sourceBytes);assert.equal(sha256(outerSource),provenance.outer.sourceSha256);
const requiredDocs=['headphones-license.txt','headphones-source-evidence.txt','headphones-provenance.json','outer-ear-provenance.json','inner-ear-provenance.json',provenance.inner.license.localHtml,provenance.inner.license.localText];
for(const file of requiredDocs)assert(fs.statSync(path.join(modelFolder,file)).size>100,`Missing local license/provenance document: ${file}`);
assert.equal(sha256(fs.readFileSync(path.join(modelFolder,provenance.inner.license.localHtml))),provenance.inner.license.sourceSha256);
const licenseText=fs.readFileSync(path.join(modelFolder,provenance.inner.license.localText),'utf8');
for(const phrase of ['All or portions of this licensed product','PART B. DOWNLOADING AGREEMENT','PART C. MISCELLANEOUS'])assert(licenseText.includes(phrase),`Incomplete SPL license: ${phrase}`);
assert.equal(provenance.outer.license,'CC0-1.0');assert.equal(provenance.headphones.license,'CC0-1.0');
const references=fs.readFileSync(path.join(root,'docs/references.md'),'utf8');
for(const text of ['Headphones by nisu','Ear anatomy model by Innerscene','SPL Inner Ear Atlas','3D Slicer License Part B'])assert(references.includes(text),`Missing attribution: ${text}`);
// Exercise the production transform helper and ensure cloning preserves loader data.
const assetModule=fs.readFileSync(path.join(folder,'assets.ts'),'utf8');
const compiledAssets=ts.transpileModule(assetModule,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from ['"]three['"]/g,`from ${JSON.stringify(import.meta.resolve('three'))}`);
const {prepareParts,anatomyMatrices,middleAnchors}=await import(`data:text/javascript;base64,${Buffer.from(compiledAssets).toString('base64')}`);
const normalizedStats={};
for(const [shot,matrix] of Object.entries({headphones:new Matrix4(),...anatomyMatrices})){
 const gltf=shot==='headphones'?loaded.headphones:shot==='outer'?loaded.outer:loaded.inner;
 assert(matrix.elements.every(Number.isFinite));assert(matrix.determinant()>0,'Anatomy normalization reflects or collapses geometry');
 const originals=[];gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(o.isMesh)originals.push(o);});
 const before=originals.map(o=>sha256(Buffer.from(o.geometry.attributes.position.array.buffer,o.geometry.attributes.position.array.byteOffset,o.geometry.attributes.position.array.byteLength)));
 const parts=prepareParts(gltf,matrix);assert.equal(parts.length,originals.length);
 const box=new Box3();
 for(let i=0;i<parts.length;i++){
  const part=parts[i],object=originals[i],sourcePosition=object.geometry.attributes.position,p=part.geometry.attributes.position;
  assert.notEqual(part.geometry,object.geometry);assert.equal(part.material,object.material);assert.equal(p.count,sourcePosition.count);
  assert.deepEqual(Array.from(part.geometry.index?.array??[]),Array.from(object.geometry.index?.array??[]),'Topology changed while preparing parts');
  const combined=new Matrix4().multiplyMatrices(matrix,object.matrixWorld),point=new Vector3(),actual=new Vector3(),center=new Vector3(...part.center);
  for(let v=0;v<p.count;v++){
   point.fromBufferAttribute(sourcePosition,v).applyMatrix4(combined);actual.fromBufferAttribute(p,v).add(center);
   assert(actual.distanceTo(point)<1e-5,`${shot}/${part.name}: normalized vertices differ from absolute transform`);
  }
  assert(part.center.every(Number.isFinite));
  const partBox=new Box3().setFromBufferAttribute(p).translate(center);box.union(partBox);
  if(shot==='middle'&&part.name==='TympanicMembrane')assert(partBox.clone().expandByScalar(1e-5).containsPoint(new Vector3(...middleAnchors.eardrum)),'Eardrum anchor outside real CT mesh bounds');
  if(shot==='middle'&&part.name==='Incus')assert(partBox.clone().expandByScalar(1e-5).containsPoint(new Vector3(...middleAnchors.ossicles)),'Ossicle anchor outside real incus bounds');
  part.geometry.dispose();
 }
 assert(!box.isEmpty());
 for(let i=0;i<originals.length;i++){const a=originals[i].geometry.attributes.position.array;assert.equal(sha256(Buffer.from(a.buffer,a.byteOffset,a.byteLength)),before[i],'Loader geometry mutated');}
 normalizedStats[shot]={parts:parts.length,bounds:{min:box.min.toArray(),max:box.max.toArray()},allVerticesMatchAbsoluteTransform:true,sourceGeometryUnmodified:true};
}
const copy=fs.readFileSync(path.join(root,'out/telinga-volume/publish.md'),'utf8');
const caption=copy.split('<!-- caption:start -->')[1].split('<!-- caption:end -->')[0].trim();assert(caption.length<150);
const files=fs.readdirSync(path.join(root,'out/telinga-volume'));assert(!files.some(name=>/\.(mp4|png|jpe?g)$/i.test(name)),'Rendering is deferred; verify any existing exports separately.');
const report={scope:'Source and source audio only; no browser, rendering, visual or encoded-output review',duration:65,fps:60,plannedFrames:3900,sceneCount:brief.scenes.length,narrationWords:cues.reduce((a,c)=>a+c.words,0),cues,geometry:stats,assets:assetStats,normalizedAnatomy:normalizedStats,anchorChecks:{eardrumInsideTympanicMembraneBounds:true,ossiclesInsideIncusBounds:true},licenseDocuments:requiredDocs,assetValidationLimit:'Headphones geometry parsed from an in-memory copy with image/texture bindings removed. Original embedded PNG dimensions, CRCs, zlib scanline data and filters validated. No browser image decoder, GPU texture sampling, material appearance, lighting or camera framing was tested.',captionCharacters:caption.length,narration:null,audioFrames:levels.levels.length,pending:['User decision to render','Visual framing, materials, transitions and motion review','Voice recording and actual alignment','Preview, cover, final MP4, encoded frames and AAC peak checks']};
fs.writeFileSync(path.join(root,'docs/telinga-volume/source-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
