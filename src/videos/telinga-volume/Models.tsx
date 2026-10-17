import React,{useLayoutEffect,useMemo} from 'react';
import {DoubleSide} from 'three';
import type {GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {anatomyMatrices,cochleaCut,headphonePose,prepareParts} from './assets';
import {C,ramp} from './timeline';

function useParts(gltf:GLTF,shot?:keyof typeof anatomyMatrices){
 const parts=useMemo(()=>prepareParts(gltf,shot?anatomyMatrices[shot]:undefined),[gltf,shot]);
 useLayoutEffect(()=>()=>parts.forEach(part=>part.geometry.dispose()),[parts]);
 return parts;
}

/** Authored CC0 asset by nisu. Keep the authored PBR normal/ORM maps and all mesh details. */
export const Headphones:React.FC<{asset:GLTF;time:number;quiet?:boolean}>=({asset,time,quiet=false})=>{
 const parts=useParts(asset),pose=headphonePose(time),cup=parts.find(part=>part.name==='Right_Earcup')!;
 return <group scale={pose.scale} rotation={pose.rotation}>
  {parts.map(part=><mesh key={part.name} name={part.name} position={part.center} geometry={part.geometry} material={part.material} dispose={null}/>)}
  {/* Editorial acoustic halo around the actual earcup; not a product feature claim. */}
  <mesh position={[.145,cup.center[1],cup.center[2]]} rotation={[0,Math.PI/2,0]} scale={1+Math.sin(time*4)*.025}>
   <ringGeometry args={[.048,.0495,64]}/><meshBasicMaterial color={C.mint} side={DoubleSide} transparent opacity={quiet?.22:.58} depthWrite={false}/>
  </mesh>
 </group>;
};

/** Authored CC0 auricle/canal. The camera approaches the real canal opening. */
export const OuterEar:React.FC<{asset:GLTF;time:number}>=({asset,time})=>{
 const parts=useParts(asset,'outer'),reveal=ramp(time,1.65,3.15);
 return <group>
  {parts.filter(p=>/auricle|external_auditory_canal|^tympanic_membrane$/.test(p.id)).map(part=>{
   const pinna=part.id.includes('auricle'),drum=part.id==='tympanic_membrane';
   return <mesh key={part.id} geometry={part.geometry} position={part.center} renderOrder={pinna?2:0}>
    <meshPhysicalMaterial color={pinna?'#C8A78C':drum?C.pearl:'#6C998A'} roughness={pinna?.46:.32} metalness={.035} clearcoat={.2} side={DoubleSide}
     transparent={pinna} opacity={pinna?1-reveal*.94:1} depthWrite={!pinna} />
   </mesh>;
  })}
  {Array.from({length:5},(_,i)=>{
   const p=(time*.48+i/5)%1;
   return <mesh key={i} position={[0,.025,.7-p*1.8]}>
    <ringGeometry args={[.16,.166,48]}/><meshBasicMaterial color={C.mint} side={DoubleSide} transparent opacity={Math.sin(p*Math.PI)*.48} depthWrite={false}/>
   </mesh>;
  })}
  <pointLight position={[0,.04,-.85]} color={C.pearl} intensity={1.4} distance={3}/>
 </group>;
};

const ossicles=new Set(['Malleus','Incus','Stapes']);
/** Measured specimen shapes; oscillation amplitude/time are enlarged for teaching. */
export const MiddleEar:React.FC<{asset:GLTF;time:number}>=({asset,time})=>{
 const parts=useParts(asset,'middle');
 return <group>
  {parts.filter(p=>ossicles.has(p.name)||p.name==='TympanicMembrane').map(part=>{
   const drum=part.name==='TympanicMembrane',vibration=Math.sin(time*16)*.006;
   return <mesh key={part.name} geometry={part.geometry} position={[part.center[0],part.center[1],part.center[2]+vibration]}>
    <meshPhysicalMaterial color={drum?'#D1B89F':part.name==='Stapes'?C.mint:C.pearl} side={DoubleSide} roughness={drum?.4:.34} metalness={.025} clearcoat={.22}
     transparent={drum} opacity={drum?.48:1} depthWrite={!drum}/>
   </mesh>;
  })}
 </group>;
};

export const Cochlea:React.FC<{asset:GLTF;time:number}>=({asset,time})=>{
 const parts=useParts(asset,'cochlea'),open=ramp(time,.8,2.5);
 return <group>
  {parts.filter(p=>p.name==='Labyrinth'||p.name==='OsseousSpiralLamina'||p.name==='CochlearNerve').map(part=>{
   const shell=part.name==='Labyrinth',nerve=part.name==='CochlearNerve';
   return <mesh key={part.name} geometry={part.geometry} position={part.center} renderOrder={shell?2:0}>
    <meshPhysicalMaterial color={shell?C.mint:nerve?C.acid:C.pearl} side={DoubleSide} roughness={shell?.28:.4} metalness={.03} clearcoat={.3}
     clippingPlanes={cochleaCut} transparent={shell} opacity={shell?.66-open*.42:1} depthWrite={!shell}/>
   </mesh>;
  })}
  {/* Light is an editorial pressure cue. The cream spiral is bone, not fluid. */}
  <pointLight position={[0,0,.6]} color={C.mint} intensity={1.2+Math.sin(time*7)*.35} distance={4}/>
 </group>;
};
