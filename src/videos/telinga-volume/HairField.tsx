import React,{useLayoutEffect,useMemo,useRef} from 'react';
import {Color,CylinderGeometry,InstancedMesh,LatheGeometry,Object3D,Vector2,Vector3} from 'three';
import {curve,sweep} from './geometry';
import {HAIRS_PER_CELL,HAIRS_PER_RANK,hairCellGeometry,hairCells,hairState,stereociliumGeometry,tissueHeight} from './hair';

const up=new Vector3(0,1,0);
const supportTiles=Array.from({length:13*9},(_,i)=>{
 const row=Math.floor(i/13),x=(i%13-6)*.64+(row%2)*.32,z=(row-4)*.56;
 return {x,z,y:tissueHeight(x,z)-.09,scale:1+Math.sin(i*13.1)*.08};
}).filter(p=>!hairCells.some(c=>Math.hypot((p.x-c.x)/.49,(p.z-c.z)/.39)<1));

// Repeated cell architecture is instanced; no textures, postprocessing or live physics.
export const HairField:React.FC<{time:number;damage:number}>=({time,damage})=>{
 const bodies=useRef<InstancedMesh>(null),hairs=useRef<InstancedMesh>(null),links=useRef<InstancedMesh>(null),tissue=useRef<InstancedMesh>(null);
 const resources=useMemo(()=>({dummy:new Object3D(),color:new Color(),body:hairCellGeometry(),hair:stereociliumGeometry(),
  link:new CylinderGeometry(1,1,1,5,1),support:new LatheGeometry([[0,-.2],[.25,-.19],[.37,-.08],[.39,-.025],[.35,.035],[.21,.07],[0,.085]].map(([r,y])=>new Vector2(r,y)),6)}),[]);
 useLayoutEffect(()=>()=>{resources.body.dispose();resources.hair.dispose();resources.link.dispose();resources.support.dispose();},[resources]);
 useLayoutEffect(()=>{
  if(!bodies.current||!hairs.current||!links.current||!tissue.current)return;
  const {dummy:d,color}=resources;
  const mapPoint=(v:Vector3,c:typeof hairCells[number])=>v.clone().multiplyScalar(c.scale).applyAxisAngle(up,c.turn).add(new Vector3(c.x,c.y,c.z));
  for(const c of hairCells){
   d.position.set(c.x,c.y,c.z);d.rotation.set(0,c.turn,0);d.scale.set(c.scale,c.scale,c.scale*.8);d.updateMatrix();bodies.current.setMatrixAt(c.index,d.matrix);
   color.set(c.row===0?'#B09C79':'#73988B').lerp(new Color('#334C46'),c.selected?damage*.75:0);bodies.current.setColorAt(c.index,color);
   for(let j=0;j<HAIRS_PER_CELL;j++){
    const state=hairState(c,j,time,damage),direction=state.direction.clone().applyAxisAngle(up,c.turn);
    d.position.copy(mapPoint(state.root,c));d.quaternion.setFromUnitVectors(up,direction);
    d.scale.set(Math.max(.00001,state.width*c.scale),Math.max(.00001,state.height*c.scale),Math.max(.00001,state.width*c.scale));d.updateMatrix();hairs.current.setMatrixAt(c.index*HAIRS_PER_CELL+j,d.matrix);
    color.set(state.rank===2?'#E5E3C4':state.rank===1?'#CBD6B0':'#AEBE99').lerp(new Color('#B77557'),state.loss*.55);hairs.current.setColorAt(c.index*HAIRS_PER_CELL+j,color);
    if(state.rank<2){
     const next=hairState(c,j+HAIRS_PER_RANK,time,damage);
     const a=mapPoint(state.root.clone().addScaledVector(state.direction,state.height*.97),c);
     const b=mapPoint(next.root.clone().addScaledVector(next.direction,Math.min(next.height*.92,state.height+ .06)),c);
     d.position.copy(a).lerp(b,.5);d.quaternion.setFromUnitVectors(up,b.clone().sub(a).normalize());
     const visible=state.height>.03&&next.height>.03;
     d.scale.set(visible?.004:.00001,visible?a.distanceTo(b):.00001,visible?.004:.00001);d.updateMatrix();links.current.setMatrixAt(c.index*HAIRS_PER_RANK*2+j,d.matrix);
    }
   }
  }
  for(const [i,p] of supportTiles.entries()){
   d.position.set(p.x,p.y,p.z);d.rotation.set(0,(i%2)*.18,0);d.scale.set(p.scale,1,p.scale);d.updateMatrix();tissue.current.setMatrixAt(i,d.matrix);
   color.set('#25473F').lerp(new Color('#547268'),.16+.16*Math.sin(i*3.7));tissue.current.setColorAt(i,color);
  }
  for(const mesh of [bodies.current,hairs.current,links.current,tissue.current]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
 },[time,damage,resources]);
 return <>
  <instancedMesh ref={tissue} args={[resources.support,undefined,supportTiles.length]} frustumCulled={false}>
   <meshPhysicalMaterial roughness={.72} metalness={0} clearcoat={.08} envMapIntensity={.28}/>
  </instancedMesh>
  <instancedMesh ref={bodies} args={[resources.body,undefined,hairCells.length]} frustumCulled={false}>
   <meshPhysicalMaterial roughness={.48} metalness={0} clearcoat={.14} clearcoatRoughness={.55} envMapIntensity={.3}/>
  </instancedMesh>
  <instancedMesh ref={hairs} args={[resources.hair,undefined,hairCells.length*HAIRS_PER_CELL]} frustumCulled={false}>
   <meshPhysicalMaterial roughness={.48} metalness={0} clearcoat={.12} clearcoatRoughness={.5} envMapIntensity={.35}/>
  </instancedMesh>
  <instancedMesh ref={links} args={[resources.link,undefined,hairCells.length*HAIRS_PER_RANK*2]} frustumCulled={false}>
   <meshStandardMaterial color="#9AA88D" roughness={.7}/>
  </instancedMesh>
  <Nerves time={time} damage={damage}/>
 </>;
};

const nervePaths=Array.from({length:7},(_,i)=>curve([[(i-3)*1.02,-.42,1.55],[(i-3)*.95,-.6,2.25],[(i-3)*.6,-.7,2.8],[.1,-.85,3.5]]));
const Nerves:React.FC<{time:number;damage:number}>=({time,damage})=>{
 const geometries=useMemo(()=>nervePaths.map(p=>sweep(p,28,6,()=>.018)),[]);
 useLayoutEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries]);
 return <group>{geometries.map((g,i)=><group key={i}>
  <mesh geometry={g}><meshStandardMaterial color="#57766B" roughness={.65}/></mesh>
  {time>2.8&&!(damage>.7&&i%3===1)&&<mesh position={nervePaths[i].getPointAt((time*.35+i*.13)%1)} scale={.035}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#DDFB6A"/></mesh>}
 </group>)}</group>;
};
