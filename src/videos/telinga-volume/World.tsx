import React,{useLayoutEffect,useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {DataTexture,EquirectangularReflectionMapping,FloatType,LinearFilter,RGBAFormat} from 'three';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {C,damageAt} from './timeline';
import {HairField} from './HairField';
import {headphonePosition,type Assets} from './assets';
import {Cochlea,Headphones,MiddleEar,OuterEar} from './Models';
import {cameraAt} from './camera';

// A small original floating-point studio environment. Reflection panels are fixed;
// the frame-driven camera and objects move through their highlights.
const StudioEnvironment:React.FC=()=>{
 const {scene}=useThree();
 const map=useMemo(()=>{
  const w=128,h=64,data=new Float32Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const u=x/w,v=y/h;
   const panel=(cx:number,cy:number,sx:number,sy:number)=>Math.exp(-Math.pow((u-cx)/sx,8)-Math.pow((v-cy)/sy,8));
   const key=panel(.24,.42,.035,.24)*3.5,rim=panel(.72,.45,.02,.28)*2.8,top=panel(.5,.12,.25,.04)*2;
   const k=(y*w+x)*4;
   data[k]=.08+key+rim*.18+top;data[k+1]=.12+key*.98+rim+top;data[k+2]=.13+key*.92+rim*.8+top;data[k+3]=1;
  }
  const texture=new DataTexture(data,w,h,RGBAFormat,FloatType);texture.mapping=EquirectangularReflectionMapping;
  texture.magFilter=LinearFilter;texture.minFilter=LinearFilter;texture.needsUpdate=true;return texture;
 },[]);
 useLayoutEffect(()=>{const old=scene.environment;scene.environment=map;return()=>{scene.environment=old;};},[map,scene]);
 useLayoutEffect(()=>()=>map.dispose(),[map]);
 return null;
};

const WaveFronts:React.FC<{time:number;tunnel?:boolean}>=({time,tunnel=false})=><group>
 {Array.from({length:9},(_,i)=>{
  const phase=((time*.48+i/9)%1+1)%1;
  return <mesh key={i} position={tunnel?[0,0,5-phase*15]:[-.9-phase*2.5,.25,0]} rotation={tunnel?[0,0,0]:[0,Math.PI/2,0]} scale={tunnel?1.5:1+phase*.7}>
   <torusGeometry args={[tunnel?1.1:.45,.009,5,72]}/><meshBasicMaterial color={C.mint} transparent opacity={Math.sin(phase*Math.PI)*.45} depthWrite={false}/>
  </mesh>;
 })}
 </group>;

export const World:React.FC<{time:number;scene:number;quality:Quality;assets:Assets}>=({time:t,scene:s,quality,assets})=>{
 const {position,target}=cameraAt(t,s),hero=s===0||s>=8,micro=s>=4&&s<=7,damage=damageAt(t);
 const productTime=s===10?0:s===0?t:t-49;
 return <ThreeCanvas width={1080} height={1920} dpr={1} camera={{fov:38,near:.05,far:70,position:[3.7,1.9,11]}} gl={{antialias:quality==='final',alpha:true,localClippingEnabled:true,powerPreference:'high-performance'}} style={{position:'absolute',inset:0,maskImage:micro?'linear-gradient(to bottom, transparent 28%, black 36%, black 65%, transparent 78%)':undefined}}>
  <CameraRig position={position} target={target}/><StudioEnvironment/>
  <ambientLight intensity={micro?.6:.35}/>
  <directionalLight position={[-5,7,6]} intensity={micro?1.7:3} color={C.pearl}/>
  <directionalLight position={[5,1,-3]} intensity={micro?1.15:3.4} color={s===6||s===7?C.coral:C.mint}/>
  <pointLight position={[-3,-1,4]} intensity={micro?4:20} color={s===6?C.coral:C.mint}/>
  <fog attach="fog" args={[s===8?C.pearl:C.ink,14,30]}/>
  {hero&&<group position={headphonePosition(s)}><Headphones asset={assets.headphones} time={productTime} quiet={s===8}/>{s!==9&&<WaveFronts time={s===10?0:t}/>}</group>}
  {s===1&&<OuterEar asset={assets.outer} time={t-4}/>}
  {s===2&&<MiddleEar asset={assets.inner} time={t-9}/>}
  {s===3&&<Cochlea asset={assets.inner} time={t-14}/>}
  {s>=4&&s<=7&&<HairField time={t-19} damage={s>=6?damage:0}/>}
 </ThreeCanvas>;
};
