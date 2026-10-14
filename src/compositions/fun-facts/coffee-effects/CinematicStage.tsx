import React,{useLayoutEffect,useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {PMREMGenerator,PerspectiveCamera,Vector3} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {useVideoConfig} from 'remotion';
import type {Quality} from '../../../types';
import {C,V3} from './timeline';

export const CinematicCamera:React.FC<{position:V3;target:V3;fov?:number;roll?:number}>=({position,target,fov=38,roll=0})=>{const {camera}=useThree();useLayoutEffect(()=>{const c=camera as PerspectiveCamera;c.position.set(...position);c.up.set(Math.sin(roll),Math.cos(roll),0);c.lookAt(...target);c.fov=fov;c.updateProjectionMatrix();c.updateMatrixWorld();},[camera,...position,...target,fov,roll]);return null;};
const StudioReflections=()=>{const {gl,scene}=useThree();useLayoutEffect(()=>{const room=new RoomEnvironment();const pmrem=new PMREMGenerator(gl);const map=pmrem.fromScene(room,.04);scene.environment=map.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();return()=>{scene.environment=null;map.dispose();};},[gl,scene]);return null;};
export const CinematicLighting:React.FC<{cool?:boolean}>=({cool=false})=><><ambientLight intensity={.2}/><directionalLight position={[-4,7,5]} intensity={3.3} color={cool?'#bceef2':'#fff0d6'}/><directionalLight position={[5,2,-3]} intensity={4.5} color={cool?C.cyan:C.bronze}/><pointLight position={[-3,-1,4]} intensity={18} color={cool?C.cyan:'#b46f35'} distance={22} decay={2}/></>;
export const CinematicStage:React.FC<React.PropsWithChildren<{quality:Quality;cool?:boolean}>>=({children,quality,cool=false})=>{const {width,height}=useVideoConfig();return <ThreeCanvas width={width} height={height} dpr={1} camera={{fov:38,near:.06,far:140,position:[0,0,10]}} gl={{antialias:quality==='final',alpha:true,powerPreference:'high-performance'}} style={{position:'absolute',inset:0}}><StudioReflections/><CinematicLighting cool={cool}/>{children}</ThreeCanvas>;};

// A smooth absolute camera path, sampled from explicit story time.
export const CameraSpline:React.FC<{points:V3[];target:V3;t:number;fov?:number}>=({points,target,t,fov})=>{const p=Math.max(0,Math.min(.999999,t))*(points.length-1),i=Math.floor(p),u=p-i;const v=useMemo(()=>new Vector3(),[]);v.set(...points[i]).lerp(new Vector3(...points[Math.min(i+1,points.length-1)]),u*u*(3-2*u));return <CinematicCamera position={v.toArray() as V3} target={target} fov={fov}/>;};
