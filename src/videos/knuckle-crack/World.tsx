import React,{useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {useVideoConfig} from 'remotion';
import {CameraRig} from '../../three/Scenes';
import {RiggedHand,BoneHand,Joint} from './Models';
import {P,ramp,V3} from './timeline';
import {Quality} from '../../types';
const Reflections=()=>{const {gl,scene}=useThree();useLayoutEffect(()=>{const pmrem=new PMREMGenerator(gl),room=new RoomEnvironment(),target=pmrem.fromScene(room,.04);scene.environment=target.texture;scene.environmentIntensity=.35;pmrem.dispose();room.dispose();return()=>{scene.environment=null;target.dispose();}},[gl,scene]);return null;};
export const World:React.FC<{time:number;scene:number;quality:Quality;paper:boolean}>=({time:t,scene:s,quality,paper})=>{
 const {width,height}=useVideoConfig();const intro=s===0||s===8;const loop=t>=61.5?ramp(t,61.5,61.9):0;const pose=intro?(s===0?t:Math.max(0,t-57)*(1-loop)):t;
 const hit=s===0?Math.max(0,1-(t-.4)*10)*(t>=.4?1:0):0;let camera:V3=[0,0,16],target:V3=[0,0,0];
 if(s===1){camera=[Math.sin((t-3)*.28)*3,.3,14-(t-3)*.3];target=[0,.1,0];}
 if(s>=2&&s<=6){const local=t-[0,3,8,16,25,33,41][s];camera=[Math.sin(local*.25)*1.4,Math.sin(local*.2)*.35, s===5?12:10.5];target=[0,0,0];}
 if(intro){camera=[.3+Math.sin(pose*.5)*.5+Math.sin(t*120)*hit*.1,.2,15.5-ramp(pose,1.4,2.8)*1.3];}
 return <ThreeCanvas width={width} height={height} dpr={1} camera={{fov:36,near:.05,far:80,position:[0,0,16]}} gl={{antialias:quality==='final',alpha:true,powerPreference:'high-performance'}} style={{position:'absolute',inset:0}}><Reflections/><CameraRig position={camera} target={target}/><ambientLight intensity={.25}/><directionalLight position={[-4,6,7]} intensity={2.2}/><directionalLight position={[5,2,-4]} intensity={2.5}/><pointLight position={[0,-4,6]} intensity={12} color="#ffffff"/>
 {intro&&<group position={[0,-.3,0]} rotation={[.06,.05,-.12]}><RiggedHand curl={.35+ramp(pose,.1,.4)*.48} position={[-1.5+ramp(pose,.1,.4)*.5,-.1,.25]} rotation={[.15,-.15,-1.45]} scale={23}/><RiggedHand left curl={.45+ramp(pose,.1,.4)*.4} position={[1.5-ramp(pose,.1,.4)*.5,.58,-.25]} rotation={[-.15,.15,1.45]} scale={23}/></group>}
 {s===1&&<BoneHand rotation={[.15,-.3+(t-3)*.12,-.15]} scale={.79} position={[0,-.7,0]}/>}
 {s===2&&<Joint gap={.12} cavity={0} rotation={[.05,-.45+ramp(t,10.5,13)*.7,-.35]} scale={.96+ramp(t,8,10)*.14}/>}
 {s===3&&(t<18.5?<group><RiggedHand curl={.7} pull={ramp(t,16,18.5)} rotation={[.2,-.1,-.1]} scale={30}/><RiggedHand left curl={1.5} position={[-1.4,2.7,.6]} rotation={[0,.3,-1.55]} scale={24}/></group>:<Joint gap={.12+ramp(t,18.5,24)*.8} cavity={0} rotation={[0,-.25,-.2]}/>)}
 {s===4&&<Joint gap={t>=25.5?.95:.25} cavity={t>=25.5?1:0} rotation={[.1,Math.sin((t-25)*.3)*.25,-.2]}/>}
 {s===5&&<Joint gap={.9} cavity={1} capsule={false} scan rotation={[0,0,-Math.PI/2]} scale={.96}/>}
 {s===6&&<Joint gap={.55+.04*Math.sin(t*5)} cavity={1-ramp(t,41,47.8)*.78} rotation={[.12,-.2,-.25]}/>}
 {s===7&&<group position={[0,-.25,0]}><RiggedHand curl={.2+Math.sin((t-48)*2)*.13} left position={[-1.9,0,0]} rotation={[0,.1,.05]} scale={23}/><RiggedHand curl={.12} position={[1.9,0,0]} rotation={[0,-.1,-.05]} scale={23}/></group>}
 </ThreeCanvas>;
};
