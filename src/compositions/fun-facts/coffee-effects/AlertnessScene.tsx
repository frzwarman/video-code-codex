import React from 'react';
import {neuronGeometry} from './geometry';
import {CinematicCamera} from './CinematicStage';
import {C,ramp,mix} from './timeline';
import {seeded} from '../../../motion';
export const AlertnessScene:React.FC<{time:number}>=({time})=>{const active=ramp(time,2.5,4.6);const z=6-time*1.9;return <>
 <CinematicCamera position={[Math.sin(time*.3)*1.8,Math.cos(time*.22)*1.1,z]} target={[0,.3,z-14]} fov={mix(47,58,active)} roll={-.05+active*.1}/>
 <fog attach="fog" args={['#08171d',6,32]}/><mesh geometry={neuronGeometry}><meshPhysicalMaterial color={active>.5?'#709ba2':'#4e555b'} metalness={.35} roughness={.39} emissive={C.cyan} emissiveIntensity={active*.07}/></mesh>
 <pointLight position={[0,0,z-4]} color={C.cyan} intensity={mix(10,110,active)} distance={22}/><pointLight position={[-4,3,z-10]} color={C.bronze} intensity={mix(6,65,active)} distance={20}/>
 {Array.from({length:14},(_,i)=>{const x=(seeded('neuron',i)-.5)*18,y=(seeded('neuron',i,'y')-.5)*18,nz=3-seeded('neuron',i,'z')*38;const p=(Math.sin(time*1.3-i*.8)+1)/2;return <mesh key={i} position={[x,y,nz]} scale={.29+p*.14}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={active*p*.8} transparent opacity={.12+active*.23}/></mesh>;})}
 </>;};
