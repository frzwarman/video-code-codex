import React,{useMemo,useLayoutEffect} from 'react';
import {useLoader} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {staticFile,useVideoConfig} from 'remotion';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Box3,Mesh,MeshPhysicalMaterial,Vector3} from 'three';
import {CameraRig} from '../../three/Scenes';
import {AnimatedMolecule} from '../../compositions/fun-facts/coffee-effects/AnimatedMolecule';
import {seeded} from '../../motion';
import type {Quality} from '../../types';
import {C,ramp,type V3} from './timeline';

const seeds=Array.from({length:60},(_,i)=>[seeded('night-particles',i,'x'),seeded('night-particles',i,'y'),seeded('night-particles',i,'z')]);
const Brain:React.FC<{time:number;opacity:number}>=({time,opacity})=>{
 const gltf=useLoader(GLTFLoader,staticFile('coffee/brain.glb'));
 const brain=useMemo(()=>{const root=gltf.scene.clone(true);root.updateMatrixWorld(true);const box=new Box3().setFromObject(root),center=box.getCenter(new Vector3()),size=box.getSize(new Vector3());root.position.sub(center);root.traverse(o=>{if(o instanceof Mesh){o.material=new MeshPhysicalMaterial({color:C.dawn,roughness:.56,metalness:.08,transparent:true,clearcoat:.12});}});return{root,scale:3.8/Math.max(size.x,size.y,size.z)};},[gltf]);
 useLayoutEffect(()=>{brain.root.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshPhysicalMaterial){o.material.opacity=opacity;o.material.depthWrite=opacity>.8;}});},[brain,opacity]);
 useLayoutEffect(()=>()=>brain.root.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshPhysicalMaterial)o.material.dispose();}),[brain]);
 return <group position={[0,-.7,0]} rotation={[.05,Math.sin(time*.16)*.25-.25,0]} scale={brain.scale}><primitive object={brain.root}/></group>;
};
const Pressure:React.FC<{time:number;amount:number;dim?:boolean;quality:Quality}>=({time,amount,dim=false,quality})=>{
 const n=quality==='final'?60:30;
 return <group position={[0,-.7,.25]}>{seeds.slice(0,n).map(([a,b,c],i)=>{
  const fall=ramp(time,8+i/n*4,10+i/n*4),x=(a-.5)*2.5,z=(c-.5)*1.4;
  const y=(1-fall)*(1.3+b*1.1)+fall*(-1.25+b*amount*1.7);
  return <mesh key={i} position={[x,y,z]} scale={.045+b*.035}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={dim?'#545b68':C.amber} emissive={C.amber} emissiveIntensity={dim?.015:.3} roughness={.65}/></mesh>;
 })}</group>;
};
export const World:React.FC<{time:number;scene:number;quality:Quality}>=({time:t,scene:s,quality})=>{
 const {width,height}=useVideoConfig();const dive=s===6?ramp(t,35,39):0;
 const camera:V3=s===6?[Math.sin(t*.18)*.5,.1,11-dive*2.8]:[Math.sin(t*.13)*.8,.3,11];
 return <ThreeCanvas width={width} height={height} dpr={1} camera={{fov:39,near:.1,far:50,position:[0,.3,11]}} gl={{antialias:quality==='final',alpha:true}} style={{position:'absolute',inset:0}}>
 <CameraRig position={camera} target={[0,0,0]}/><ambientLight intensity={.35}/><directionalLight position={[-4,5,5]} intensity={2.5} color={s===9?C.dawn:C.amber}/><directionalLight position={[4,1,-2]} intensity={3} color={C.dawn}/><pointLight position={[1,-2,4]} intensity={10} color={s===6?C.red:C.amber}/>
 {(s===2||s===6)&&<Brain time={t} opacity={s===6?1-dive*.8:.78}/>}
 {s===2&&<Pressure time={t} amount={ramp(t,8,15)} quality={quality}/>}
 {s===6&&<group position={[0,-1,.8]}>{[-1,1].map(side=><group key={side} position={[side*.64,.07,.12]}><mesh scale={[.25,.16,.2]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={1.4+Math.sin(t*5)*.5}/></mesh><mesh scale={.5+Math.sin(t*5)*.07}><sphereGeometry args={[1,16,10]}/><meshBasicMaterial color={C.red} transparent opacity={.12} depthWrite={false}/></mesh></group>)}</group>}
 {s===8&&<group position={[0,-.55,0]}><Pressure time={20} amount={1} dim={t>50} quality={quality}/><AnimatedMolecule kind="caffeine" time={t-48} scale={.43} position={[2.5*(1-ramp(t,48,50.5)),.5,.8]} rotation={[.1,(t-48)*.35,.1]} hydrogens={quality==='final'}/><mesh position={[0,.5,.4]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.85,.12,12,48]}/><meshStandardMaterial color={C.dawn} roughness={.3} metalness={.4}/></mesh></group>}
 </ThreeCanvas>;
};
