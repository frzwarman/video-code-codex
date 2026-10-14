import React from 'react';
import {receptorGeometry} from './geometry';
import {AnimatedMolecule} from './AnimatedMolecule';
import {CinematicCamera} from './CinematicStage';
import {C,ramp,mix3} from './timeline';
export const ReceptorScene:React.FC<{time:number}>=({time})=>{
 const bind=ramp(time,.25,1.9),reject=ramp(time,1.65,3.1),dive=ramp(time,3.05,3.7);
 return <><CinematicCamera position={mix3([3.7-time*.28,3.8,9.2],[0,1.1,1.3],dive)} target={[0,.6,0]} fov={38}/><fog attach="fog" args={['#0b1a1f',15,36]}/>
 <mesh geometry={receptorGeometry}><meshPhysicalMaterial color={C.bronze} metalness={.45} roughness={.28} clearcoat={.3}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.2,0]}><planeGeometry args={[22,22,1,1]}/><meshPhysicalMaterial color="#16363a" roughness={.6} metalness={.25} transparent opacity={.86}/></mesh>
 {Array.from({length:18},(_,i)=><mesh key={i} position={[(i%6-2.5)*2,-1.08,(Math.floor(i/6)-1)*2.3]}><sphereGeometry args={[.24,12,8]}/><meshStandardMaterial color="#3c757c" roughness={.4}/></mesh>)}
 <AnimatedMolecule time={time} scale={.26} position={mix3([3,3.6,0],[0,1.2,0],bind)} rotation={[.3,.15,0]}/>
 <AnimatedMolecule kind="adenosine" time={time} scale={.24} position={mix3([-3.5,2.8,0],[-2.1-reject*1.3,2.2+reject*.8,0],ramp(time,0,1.6))} rotation={[.1,-.3,-.35]}/>
 <mesh rotation={[Math.PI/2,0,0]} position={[0,1.17,0]}><torusGeometry args={[.68,.015,8,64]}/><meshBasicMaterial color={C.cyan} transparent opacity={bind*.7}/></mesh>
 <pointLight position={[0,2.3,2]} intensity={18} color={C.cyan} distance={10}/>
 </>;
};
