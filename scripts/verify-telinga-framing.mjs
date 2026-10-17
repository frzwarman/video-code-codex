import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {Euler,Matrix4,PerspectiveCamera,Quaternion,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {root} from './lib.mjs';

// CPU projection only: no browser, WebGL, images, videos, or network.
const folder=path.join(root,'src/videos/telinga-volume');
const sources=new Map();
function source(file){const text=fs.readFileSync(file,'utf8');sources.set(path.relative(root,file),text);return text;}
const modules=new Map();
function moduleUrl(file){
 if(modules.has(file))return modules.get(file);
 let code=file.endsWith('.json')?`export default ${source(file)};`:ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 code=code.replace(/(from\s+|import\s*)(['"])([^'"]+)\2/g,(match,prefix,quote,specifier)=>{
  let url;
  if(specifier.startsWith('.')){
   const target=path.resolve(path.dirname(file),specifier);
   const resolved=[target,`${target}.ts`].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
   assert(resolved,`Cannot resolve ${specifier} from ${file}`);url=moduleUrl(resolved);
  }else url=import.meta.resolve(specifier);
  return `${prefix}${JSON.stringify(url)}`;
 });
 const url=`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;modules.set(file,url);return url;
}
const assets=await import(moduleUrl(path.join(folder,'assets.ts')));
const {cameraAt}=await import(moduleUrl(path.join(folder,'camera.ts')));
const {timing}=await import(moduleUrl(path.join(folder,'timeline.ts')));
const world=source(path.join(folder,'World.tsx')),models=source(path.join(folder,'Models.tsx'));
const video=source(path.join(folder,'Video.tsx'));source(path.join(folder,'Graphics.tsx'));
const cameraSettings=world.match(/camera=\{\{fov:([.\d]+),near:([.\d]+),far:([.\d]+)/);
assert(cameraSettings,'Update projection check when production camera settings change');
const camera=new PerspectiveCamera(Number(cameraSettings[1]),1080/1920,Number(cameraSettings[2]),Number(cameraSettings[3]));

// Minimal copy of verify-telinga-volume's in-memory GLB texture omission.
// Original geometry, node transforms, and production prepareParts remain intact.
const assetHashes={};
async function loadGlb(name){
 const file=`public/telinga-volume/models/${name}.glb`,bytes=fs.readFileSync(path.join(root,file));
 assetHashes[file]=createHash('sha256').update(bytes).digest('hex');
 let json,bin,offset=12;
 while(offset<bytes.length){const length=bytes.readUInt32LE(offset),kind=bytes.readUInt32LE(offset+4);offset+=8;if(kind===0x4e4f534a)json=JSON.parse(bytes.toString('utf8',offset,offset+length));if(kind===0x004e4942)bin=bytes.subarray(offset,offset+length);offset+=length;}
 assert(json&&bin);
 const remove=value=>{if(!value||typeof value!=='object')return;for(const key of Object.keys(value)){if(key.endsWith('Texture'))delete value[key];else remove(value[key]);}};
 remove(json.materials);delete json.images;delete json.textures;delete json.samplers;
 const text=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(padded);
 const copy=Buffer.alloc(28+padded.length+bin.length);
 copy.writeUInt32LE(0x46546c67,0);copy.writeUInt32LE(2,4);copy.writeUInt32LE(copy.length,8);copy.writeUInt32LE(padded.length,12);copy.writeUInt32LE(0x4e4f534a,16);padded.copy(copy,20);copy.writeUInt32LE(bin.length,20+padded.length);copy.writeUInt32LE(0x004e4942,24+padded.length);bin.copy(copy,28+padded.length);
 return new GLTFLoader().parseAsync(copy.buffer.slice(copy.byteOffset,copy.byteOffset+copy.byteLength),'');
}
const headphones=await loadGlb('headphones'),inner=await loadGlb('inner-ear');
const product=assets.prepareParts(headphones);
const middle=assets.prepareParts(inner,assets.anatomyMatrices.middle).filter(p=>['Malleus','Incus','Stapes','TympanicMembrane'].includes(p.name));
const cochlea=assets.prepareParts(inner,assets.anatomyMatrices.cochlea).filter(p=>['Labyrinth','OsseousSpiralLamina','CochlearNerve'].includes(p.name));
const {headphonePosition,cochleaCut:clipping}=assets;
assert(world.includes('<group position={headphonePosition(s)}><Headphones'),'Update check when production headphone placement changes');
assert(models.includes('<group scale={pose.scale} rotation={pose.rotation}>'),'Update check when production headphone transform changes');
assert(models.includes('clippingPlanes={cochleaCut}'),'Production cochlea must use the shared clipping planes');
assert(models.includes('Math.sin(time*16)*.006'),'Update middle-ear vibration projection after motion changes');
assert(world.includes('productTime=s===10?0:s===0?t:t-49'),'Update product time mapping after changes');
assert(video.includes('visualTime=t>=timing.loopStart?0:t,visualScene=t>=timing.loopStart?0:s'),'Update visual loop time mapping after changes');
const visualAt=(t,scene)=>t>=timing.loopStart?{time:0,scene:0}:{time:t,scene};
function productState(t,scene){
 const visual=visualAt(t,scene),time=visual.scene===10?0:visual.scene===0?visual.time:visual.time-49;
 return {camera:cameraAt(visual.time,visual.scene),position:headphonePosition(visual.scene),pose:assets.headphonePose(time)};
}
const firstState=productState(0,0),lastState=productState(timing.duration-1/timing.fps,10);
assert.deepEqual(firstState,lastState,'First and final frame product/camera transforms differ');

function vertices(parts){
 const points=[];
 for(const part of parts){const p=part.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new Vector3().fromBufferAttribute(p,i).add(new Vector3(...part.center));assert(v.toArray().every(Number.isFinite));points.push(v);}}
 return points;
}
// Sutherland-Hodgman triangle clipping retains edge/plane intersections, which
// a vertices-only filter would miss. Three's default clips negative half-spaces.
function clippedVertices(parts,planes){
 const result=[];
 for(const part of parts){
  const p=part.geometry.attributes.position,index=part.geometry.index,center=new Vector3(...part.center);
  for(let i=0;i<(index?.count??p.count);i+=3){
   let polygon=[0,1,2].map(k=>new Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).add(center));
   for(const plane of planes){
    const next=[];
    for(let j=0;j<polygon.length;j++){
     const a=polygon[j],b=polygon[(j+1)%polygon.length],da=plane.distanceToPoint(a),db=plane.distanceToPoint(b);
     if(da>=0)next.push(a);
     if((da>=0)!==(db>=0))next.push(a.clone().lerp(b,da/(da-db)));
    }
    polygon=next;if(!polygon.length)break;
   }
   for(const v of polygon){assert(v.toArray().every(Number.isFinite));result.push(v);}
  }
 }
 assert(result.length>0);return result;
}
const points={product:vertices(product),middle:vertices(middle),cochlea:clippedVertices(cochlea,clipping)};
const shots=[
 {scene:0,name:'opening-headphones',start:0,end:2.7,kind:'product',safe:[84,650,950,1300]},
 {scene:2,name:'middle-ear',start:9,end:14,kind:'middle',safe:[84,650,950,1210]},
 {scene:3,name:'cochlea-cutaway',start:14,end:19,kind:'cochlea',safe:[84,650,950,1310]},
 {scene:8,name:'lower-volume',start:49,end:57,kind:'product',safe:[84,650,950,1300]},
 {scene:9,name:'comment-prompt',start:57,end:62,kind:'product',safe:[84,650,950,1300]},
 {scene:10,name:'closing-and-loop',start:62,end:65,kind:'product',safe:[84,650,950,1300]},
];
const matrix=new Matrix4(),viewProjection=new Matrix4(),point=new Vector3();
const round=value=>Math.round(value*10)/10;
const checks=[];
for(const shot of shots){
 const bounds=[Infinity,Infinity,-Infinity,-Infinity],worstTimes=Array(4).fill(0);
 let frameCount=0;
 for(let frame=Math.round(shot.start*timing.fps);frame<Math.round(shot.end*timing.fps);frame++){
  const t=frame/timing.fps,{time:visualTime,scene}=visualAt(t,shot.scene);
  const pose=cameraAt(visualTime,scene);assert([...pose.position,...pose.target].every(Number.isFinite));
  camera.position.set(...pose.position);camera.lookAt(...pose.target);camera.updateMatrixWorld();
  viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  matrix.identity();
  if(shot.kind==='product'){
   const time=scene===10?0:scene===0?visualTime:visualTime-49,pose=assets.headphonePose(time);
   matrix.compose(new Vector3(...headphonePosition(scene)),new Quaternion().setFromEuler(new Euler(...pose.rotation)),new Vector3(pose.scale,pose.scale,pose.scale));
  }else if(shot.kind==='middle')matrix.makeTranslation(0,0,Math.sin((visualTime-9)*16)*.006);
  assert(matrix.elements.every(Number.isFinite));
  viewProjection.multiply(matrix);
  for(const v of points[shot.kind]){
   point.copy(v).applyMatrix4(viewProjection);assert([point.x,point.y,point.z].every(Number.isFinite));assert(point.z>=-1&&point.z<=1,`${shot.name}: vertex outside near/far planes at ${t}`);
   const x=(point.x+1)*540,y=(1-point.y)*960;
   for(const [i,value] of [[0,x],[1,y],[2,x],[3,y]])if(i<2?value<bounds[i]:value>bounds[i]){bounds[i]=value;worstTimes[i]=t;}
  }
  frameCount++;
 }
 const [left,top,right,bottom]=bounds,[safeLeft,safeTop,safeRight,safeBottom]=shot.safe;
 const passed=left>=safeLeft&&top>=safeTop&&right<=safeRight&&bottom<=safeBottom;
 checks.push({scene:shot.scene,name:shot.name,interval:[shot.start,shot.end],frames:frameCount,bounds:{left:round(left),top:round(top),right:round(right),bottom:round(bottom)},safeRegion:{left:safeLeft,top:safeTop,right:safeRight,bottom:safeBottom},extremeTimes:worstTimes.map(round),passed});
}
const report={scope:'Source-only CPU mesh projection; no rendered or encoded frames, browser, WebGL, or visual QA',resolution:[1080,1920],fps:timing.fps,method:`Every ${timing.fps} fps frame in the listed intervals; actual production camera, pose, normalization and motion modules; real GLB vertices; cochlea triangles clipped including edge intersections.`,safeRegionBasis:'Top 650 clears the largest settled title (cover ends at ~617); hero bottom 1300 clears the 1320–1350 chips/dials; middle bottom 1210 leaves room for labels at 1250; cochlea bottom 1310 clears its chip at 1350. Horizontal bounds follow copy margins.',checks,loop:{firstFrame:0,lastFrame:timing.duration*timing.fps-1,productPoseAndCameraEqual:true,visualEqualityUnverified:true},passed:checks.every(c=>c.passed),excluded:['Scene 0 at 2.7–4s: intentional macro approach into the earcup','Scene 1: intentional canal approach','Scenes 4–7: microscopic hair-cell sequence, outside this focused mesh-framing regression','Decorative acoustic halo, wave rings, callout leader lines, text motion/blur and shake; not included in mesh bounds'],limitations:['Geometry bounds do not prove visibility, lighting, material appearance, readability or overall visual quality.','The source-only check does not decode textures or inspect browser, rendered, or encoded output.'],sources:Object.fromEntries([...sources].map(([name,text])=>[name,createHash('sha256').update(text).digest('hex')])),assets:assetHashes};
fs.writeFileSync(path.join(root,'docs/telinga-volume/framing-validation.json'),JSON.stringify(report,null,2)+'\n');
for(const c of checks)console.log(`${c.passed?'PASS':'FAIL'} scene ${c.scene} ${c.name}: x ${c.bounds.left}–${c.bounds.right}, y ${c.bounds.top}–${c.bounds.bottom} (${c.frames} frames)`);
for(const parts of [product,middle,cochlea])for(const part of parts)part.geometry.dispose();
if(!report.passed)process.exitCode=1;
