import React from 'react';
import {AnimatedMolecule} from './AnimatedMolecule';
import {CinematicCamera} from './CinematicStage';
import {C,ramp,mix} from './timeline';
export const CaffeineMetabolismScene:React.FC<{time:number}>=({time})=>{const p=ramp(time,0,1),exit=ramp(time,6.8,8);return <>
 <CinematicCamera position={[Math.sin(time*.1)*1.3,1.7,12-exit*10]} target={[0,.5,0]} fov={38}/><fog attach="fog" args={['#0c151a',18,45]}/>
 <group position={[0,.7,0]} rotation={[.1,0,-.2]}>
 <AnimatedMolecule time={time} scale={.57} opacity={1-ramp(time,4,8)*.7}/>
 <mesh rotation={[.1,.15,0]}><torusGeometry args={[2.7,.016,6,128]}/><meshStandardMaterial color={C.bronze} metalness={.7} roughness={.25}/></mesh>
 {Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;return <mesh key={i} position={[Math.sin(a)*2.7,Math.cos(a)*2.7,0]} rotation={[0,0,-a]}><boxGeometry args={[.015,i%4===0?.14:.055,.018]}/><meshBasicMaterial color={C.cream} transparent opacity={i/48>time/8?.22:.85}/></mesh>;})}
 <mesh position={[Math.sin(time/8*Math.PI*2)*2.7,Math.cos(time/8*Math.PI*2)*2.7,0]}><sphereGeometry args={[.09,16,10]}/><meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={.6}/></mesh>
 </group>
 {[0,1,2].map(i=><AnimatedMolecule key={i} time={time+i} position={[(i-1)*3.8,-1.7-ramp(time,1+i,5+i)*5,-3-ramp(time,1+i,5+i)*10]} scale={.21} opacity={1-ramp(time,2+i,6+i)} hydrogens={false}/>)}
 </>;};
