import React,{useMemo} from 'react';
import {CylinderGeometry,Quaternion,Vector3} from 'three';
import caffeine from './caffeine.json';
import adenosine from './adenosine.json';
import {C,V3} from './timeline';
type MoleculeData=typeof caffeine;
const data={caffeine,adenosine};
const makeBonds=(d:MoleculeData)=>d.bonds.flatMap(b=>{const a=new Vector3(...d.atoms[b.a].position as V3),z=new Vector3(...d.atoms[b.b].position as V3),axis=z.clone().sub(a),q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),axis.clone().normalize());const offset=new Vector3(-axis.y,axis.x,0).normalize().multiplyScalar(.09);return Array.from({length:b.order===2?2:1},(_,i)=>({position:a.clone().add(z).multiplyScalar(.5).add(offset.clone().multiplyScalar(b.order===2?(i?1:-1):0)).toArray() as V3,quaternion:q,length:axis.length(),hydrogen:d.atoms[b.a].element===1||d.atoms[b.b].element===1}));});
const bondCache={caffeine:makeBonds(caffeine),adenosine:makeBonds(adenosine)};
export const AnimatedMolecule:React.FC<{kind?:'caffeine'|'adenosine';time:number;scale?:number;position?:V3;rotation?:V3;opacity?:number;hydrogens?:boolean}>=({kind='caffeine',time,scale=1,position=[0,0,0],rotation,opacity=1,hydrogens=true})=>{
 const d=data[kind];return <group position={position} scale={scale} rotation={rotation??[Math.sin(time*.3)*.18,time*.21,.15]}>
 {bondCache[kind].map((b,i)=>hydrogens||!b.hydrogen?<mesh key={'b'+i} position={b.position} quaternion={b.quaternion}><cylinderGeometry args={[b.hydrogen?.042:.07,b.hydrogen?.042:.07,b.length,8]}/><meshStandardMaterial color={C.cream} metalness={.6} roughness={.23} transparent={opacity<1} opacity={opacity}/></mesh>:null)}
 {d.atoms.map((a,i)=>hydrogens||a.element!==1?<mesh key={i} position={a.position as V3}><sphereGeometry args={[a.element===1?.15:a.element===8?.3:.34,20,14]}/><meshPhysicalMaterial color={a.element===6?'#554b43':a.element===7?C.cyan:a.element===8?C.bronze:C.cream} metalness={.35} roughness={.21} clearcoat={.6} transparent={opacity<1} opacity={opacity}/></mesh>:null)}
 </group>;
};
