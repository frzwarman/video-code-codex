import React from 'react';
import {BackSide} from 'three';
import {CinematicCamera} from './CinematicStage';
import {AnimatedMolecule} from './AnimatedMolecule';
import {vesselGeometry} from './geometry';
import {C,ramp,mix,mix3} from './timeline';
export const CaffeineMoleculeScene:React.FC<{time:number}>=({time})=>{
 const settle=ramp(time,0,1.3),launch=ramp(time,4.8,6);
 return <><CinematicCamera position={mix3([0,0,2],[Math.sin(time*.18)*1.3,.2,10.5],settle)} target={[0,0,-launch*8]} fov={mix(65,38,settle)+launch*13} roll={-.12*(1-settle)}/>
 <fog attach="fog" args={['#251914',8,38]}/><mesh geometry={vesselGeometry} rotation={[0,0,time*.055]}><meshStandardMaterial color="#533222" side={BackSide} roughness={.31} metalness={.55}/></mesh>
 <pointLight position={[0,0,4]} color={C.bronze} intensity={80} distance={24}/><pointLight position={[0,2,-8]} color={C.cyan} intensity={70} distance={28}/>
 <group position={[0,-.2,-launch*24]} scale={mix(.24,.74,settle)}><AnimatedMolecule time={time} rotation={[.15+Math.sin(time*.4)*.16,time*.18-.35,.2]}/></group>
 {[0,1,2,3].map(i=><group key={i} position={[Math.sin(i*2.3)*3.4,Math.cos(i*2.3)*3.2,-8-i*6+time*.65]} scale={.28}><AnimatedMolecule time={time+i} hydrogens={false}/></group>)}
 </>;
};
