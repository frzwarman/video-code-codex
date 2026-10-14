import React,{useMemo,useLayoutEffect} from 'react';
import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Mesh,MeshPhysicalMaterial} from 'three';
import {staticFile} from 'remotion';
import {C,ramp} from './timeline';
import {CinematicCamera} from './CinematicStage';
import {neuronGeometry} from './geometry';
export const BrainScene:React.FC<{time:number}>=({time})=>{
 const gltf=useLoader(GLTFLoader,staticFile('coffee/brain.glb'));
 const object=useMemo(()=>{const o=gltf.scene.clone(true);o.traverse(child=>{if(child instanceof Mesh){const original=child.material;child.material=new MeshPhysicalMaterial({color:'#d7b9a0',map:original.map,roughness:.44,metalness:.12,clearcoat:.15,transparent:true});}});return o;},[gltf]);
 const dive=ramp(time,2.25,3.3);
 useLayoutEffect(()=>{object.traverse(c=>{if(c instanceof Mesh){c.material.opacity=1-dive*.82;c.material.depthWrite=dive<.25;}});},[object,dive]);
 return <><CinematicCamera position={[Math.sin(time*.35-.4)*(9-dive*7),1.1,Math.cos(time*.35-.4)*(10-dive*8.8)]} target={[0,.1,0]} fov={38}/><fog attach="fog" args={['#0c171c',14,45]}/>
 <group scale={32} position={[0,-2.08,0]} rotation={[0,.2,0]}><primitive object={object}/></group>
 <mesh geometry={neuronGeometry} scale={.3} position={[0,0,1]}><meshStandardMaterial color={C.cyan} metalness={.4} roughness={.4} transparent opacity={dive*.7}/></mesh>
 <pointLight position={[0,1,-3]} intensity={60} color={C.cyan} distance={12}/>
 </>;
};
