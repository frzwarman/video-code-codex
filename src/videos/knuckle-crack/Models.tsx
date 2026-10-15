import React,{useMemo,useLayoutEffect} from 'react';
import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {Bone,Mesh,MeshPhysicalMaterial,Quaternion,Vector3,DoubleSide} from 'three';
import {staticFile} from 'remotion';
import {P,V3} from './timeline';

export const RiggedHand:React.FC<{curl:number;pull?:number;left?:boolean;position?:V3;rotation?:V3;scale?:number}>=({curl,pull=0,left=false,position=[0,0,0],rotation=[0,0,0],scale=30})=>{
 const gltf=useLoader(GLTFLoader,staticFile('knuckle-crack/right.glb'));
 const rig=useMemo(()=>{const object=clone(gltf.scene);object.updateMatrixWorld(true);const chains=[['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip'],...['index','middle','ring','pinky'].map(f=>[`${f}-finger-metacarpal`,`${f}-finger-phalanx-proximal`,`${f}-finger-phalanx-intermediate`,`${f}-finger-phalanx-distal`,`${f}-finger-tip`])];for(const chain of chains){for(let i=1;i<chain.length;i++)object.getObjectByName(chain[i-1])!.attach(object.getObjectByName(chain[i])!);}object.updateMatrixWorld(true);const bones:{bone:Bone;q:Quaternion;p:Vector3}[]=[];object.traverse(c=>{if(c instanceof Bone)bones.push({bone:c,q:c.quaternion.clone(),p:c.position.clone()});if(c instanceof Mesh){c.material=new MeshPhysicalMaterial({color:'#9b9892',roughness:.5,metalness:.05,clearcoat:.12});c.frustumCulled=false;}});return{object,bones};},[gltf]);
 useLayoutEffect(()=>()=>{rig.object.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshPhysicalMaterial)o.material.dispose();});},[rig]);
 const axis=useMemo(()=>new Vector3(1,0,0),[]),q=useMemo(()=>new Quaternion(),[]);
 useLayoutEffect(()=>{for(const {bone,q:rest,p} of rig.bones){bone.quaternion.copy(rest);bone.position.copy(p);const name=bone.name;if(name.includes('phalanx')){let bend=curl*(name.includes('proximal')?.55:name.includes('intermediate')?.9:.55);if(name.startsWith('thumb'))bend*=.35;if(name.startsWith('index'))bend*=1-pull*.85;bone.quaternion.multiply(q.setFromAxisAngle(axis,-bend));if(name==='index-finger-phalanx-proximal')bone.position.z-=pull*.006;}}rig.object.updateMatrixWorld(true);},[rig,curl,pull,axis,q]);
 return <group position={position} rotation={rotation} scale={[left?-1:1,1,1]}><group rotation={[0,Math.PI/2,Math.PI]} scale={scale} position={[.15,-.8,0]}><primitive object={rig.object}/></group></group>;
};
export const BoneHand:React.FC<{rotation?:V3;scale?:number;position?:V3;dark?:boolean}>=({rotation=[0,0,0],scale=1,position=[0,0,0],dark=false})=>{const gltf=useLoader(GLTFLoader,staticFile('knuckle-crack/hand-bones.glb'));const meshes=useMemo(()=>{const list:Mesh[]=[];gltf.scene.traverse(o=>{if(o instanceof Mesh)list.push(o)});return list;},[gltf]);return <group rotation={rotation} scale={scale} position={position}>{meshes.map(m=><mesh key={m.name} geometry={m.geometry}><meshPhysicalMaterial color={dark?'#b4b0a5':'#838079'} roughness={.32} metalness={.16}/></mesh>)}</group>;};
export const Joint:React.FC<{gap:number;cavity:number;capsule?:boolean;scan?:boolean;rotation?:V3;scale?:number}>=({gap,cavity,capsule=true,scan=false,rotation=[0,0,0],scale=1})=>{
 const gltf=useLoader(GLTFLoader,staticFile('knuckle-crack/index-mcp.glb'));const meshes=useMemo(()=>{const list:Mesh[]=[];gltf.scene.traverse(o=>{if(o instanceof Mesh)list.push(o)});return list;},[gltf]);
 return <group rotation={rotation} scale={scale}>
 {meshes.map(m=><mesh key={m.name} geometry={m.geometry} position={[0,m.name==='FMA24451'?gap*.5:-gap*.5,0]}><meshPhysicalMaterial color={scan?'#888888':'#aaa69e'} roughness={.34} metalness={.08}/></mesh>)}
 {capsule&&<><mesh scale={[1.15,1.25+gap*.3,.85]}><sphereGeometry args={[1,32,24]}/><meshPhysicalMaterial color={P.paper} roughness={.12} transmission={.55} thickness={.2} transparent opacity={.22} depthWrite={false} side={DoubleSide}/></mesh><mesh scale={[1,1+gap*.3,.7]}><sphereGeometry args={[1,24,18]}/><meshPhysicalMaterial color="#ffffff" roughness={.08} transmission={.88} thickness={.35} ior={1.335} transparent opacity={.3} depthWrite={false}/></mesh></>}
 {cavity>0&&<mesh position={[.05,.03,.48]} scale={[.63*cavity,.32*cavity,.45*cavity]}><sphereGeometry args={[1,32,20]}/><meshPhysicalMaterial color={scan?P.ink:P.paper} metalness={0} roughness={.05} transmission={scan?0:.9} thickness={.25} ior={1.08} transparent={!scan} opacity={scan?1:.92} clearcoat={1}/></mesh>}
 </group>;
};
