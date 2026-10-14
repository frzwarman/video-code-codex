import React,{useLayoutEffect,useMemo,useRef} from 'react';
import {BackSide,InstancedMesh,Object3D} from 'three';
import {cellGeometry,vesselGeometry} from './geometry';
import {CinematicCamera} from './CinematicStage';
import {AnimatedMolecule} from './AnimatedMolecule';
import {seeded} from '../../../motion';
import {C,ramp,mix,phase} from './timeline';
const cellData=Array.from({length:54},(_,i)=>{const a=seeded('rbc',i)*Math.PI*2,r=1.65+seeded('rbc',i,'r')*2.65;return{x:Math.cos(a)*r,y:Math.sin(a)*r,z:seeded('rbc',i,'z')*58,scale:.55+seeded('rbc',i,'s')*.6,a};});
export const BloodstreamScene:React.FC<{time:number;preview?:boolean}>=({time,preview=false})=>{
 const cells=useRef<InstancedMesh>(null);const matrix=useMemo(()=>new Object3D(),[]);const cz=6-time*4.8;const count=preview?36:54;
 useLayoutEffect(()=>{if(!cells.current)return;cellData.slice(0,count).forEach((c,i)=>{matrix.position.set(c.x+.22*Math.sin(time*.8+i),c.y+.2*Math.cos(time+i),8-phase(c.z-time*2.7,58)*58);matrix.rotation.set(c.a*.5+time*.22,c.a+time*.15,.2+Math.sin(i)*.5);matrix.scale.setScalar(c.scale);matrix.updateMatrix();cells.current!.setMatrixAt(i,matrix.matrix);});cells.current.instanceMatrix.needsUpdate=true;},[time,matrix,count]);
 return <><CinematicCamera position={[Math.sin(time*.5)*.4,Math.cos(time*.6)*.3,cz]} target={[Math.sin(time*.5+.2)*.3,0,cz-12]} fov={52+ramp(time,4.9,6)*16} roll={Math.sin(time*.6)*.08}/>
 <fog attach="fog" args={['#240e13',6,28]}/><mesh geometry={vesselGeometry}><meshStandardMaterial color="#4b1820" side={BackSide} roughness={.47} metalness={.15}/></mesh>
 <instancedMesh ref={cells} args={[cellGeometry,undefined,count]} frustumCulled={false}><meshPhysicalMaterial color="#8f2d35" roughness={.27} metalness={.13} clearcoat={.4}/></instancedMesh>
 <pointLight position={[-1,1,cz-2]} intensity={95} color="#ffe0c1" distance={16}/><pointLight position={[2,-2,cz-8]} intensity={110} color={C.cyan} distance={22}/>
 <group position={[Math.sin(time*.7)*.35,-.2,cz-5-ramp(time,4.7,6)*12]} scale={.26}><AnimatedMolecule time={time*.7} hydrogens={false}/></group>
 <mesh position={[0,0,-38]}><circleGeometry args={[4.2,64]}/><meshBasicMaterial color={C.cream}/></mesh>
 </>;
};
