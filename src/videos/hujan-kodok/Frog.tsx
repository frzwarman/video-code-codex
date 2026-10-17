import React, {useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {LatheGeometry, PMREMGenerator, Vector2} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {lerp, progress} from '../../motion';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {backOut} from '../showreel/kit';
import {beatPulse, H, K, sing, W} from './look';

const Reflections = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {const room = new RoomEnvironment(); const pm = new PMREMGenerator(gl); const map = pm.fromScene(room, 0.04); scene.environment = map.texture; scene.environmentIntensity = 0.55; room.dispose(); pm.dispose(); return () => {scene.environment = null; map.dispose();};}, [gl, scene]);
  return null;
};
// Eight-panel umbrella canopy (low lathe segment count gives the panel look).
const canopy = new LatheGeometry(Array.from({length: 14}, (_, k) => {const u = k / 13; return new Vector2(Math.sin(u * Math.PI / 2) * 1.9, Math.cos(u * Math.PI / 2) * 1.0);}), 8);
const clay = {roughness: 0.62, sheen: 0.6, clearcoat: 0.12, clearcoatRoughness: 0.5};

/** A soft clay-toy frog holding a yellow umbrella. Every pose value is a function of song time. */
export const Frog: React.FC<{t: number; quality: Quality; x: number}> = ({t, quality, x}) => {
  const pulse = beatPulse(t); const mouth = sing(t);
  const pop = backOut(progress(t, -0.45, 0.15), 1.8);
  const hop = (a: number) => {const p = progress(t, a, a + 0.45); return Math.sin(p * Math.PI) * 1.1;};
  const leap = progress(t, 12.0, 12.6); const leapY = Math.sin(leap * Math.PI) * 2.4; const leapX = lerp(0, -2.8, leap);
  const y = -0.4 + hop(7.2) + hop(7.8) + hop(8.4) + hop(9.0) + leapY - pulse * 0.06;
  const squash = 1 - pulse * 0.07 + (leap > 0 && leap < 1 ? 0.1 : 0);
  const blink = [2.0, 5.3, 8.9, 11.4, 14.0].some((b) => t > b && t < b + 0.14) ? 0.1 : 1;
  const sway = Math.sin(t * Math.PI * 2 / (60 / 100 * 2)) * 0.07;
  return <ThreeCanvas width={W} height={H} dpr={1} camera={{fov: 30, near: 0.1, far: 100, position: [0, 0, 16]}} gl={{antialias: quality === 'final', alpha: true}} style={{position: 'absolute', inset: 0}}>
    <Reflections/>
    <CameraRig position={[Math.sin(t * 0.2) * 0.6, 0.8, 16]} target={[0, 0.3, 0]}/>
    <ambientLight intensity={0.55}/><directionalLight position={[-4, 6, 6]} intensity={2.6} color="#fff6e0"/><directionalLight position={[5, 2, -3]} intensity={1.4} color="#bfe6ff"/>
    <group position={[x + leapX, y, 0]} scale={pop} rotation={[0, -0.25, sway]}>
      <group scale={[1 / squash ** 0.5, squash, 1 / squash ** 0.5]}>
        <mesh scale={[1.45, 1.15, 1.25]}><sphereGeometry args={[1, 48, 32]}/><meshPhysicalMaterial color={K.grass} sheenColor="#c8ff9a" {...clay}/></mesh>
        <mesh position={[0, -0.25, 0.75]} scale={[0.95, 0.75, 0.55]}><sphereGeometry args={[1, 40, 24]}/><meshPhysicalMaterial color="#E5F79A" {...clay}/></mesh>
        {[-1, 1].map((s) => <group key={s} position={[s * 0.62, 0.95, 0.35]}>
          <mesh scale={0.52}><sphereGeometry args={[1, 32, 24]}/><meshPhysicalMaterial color={K.grass} {...clay}/></mesh>
          <mesh position={[0, 0.02, 0.3]} scale={[0.4, 0.4 * blink, 0.32]}><sphereGeometry args={[1, 32, 24]}/><meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.6}/></mesh>
          <mesh position={[0.02 * s, 0.02, 0.56]} scale={[0.2, 0.22 * blink, 0.12]}><sphereGeometry args={[1, 24, 16]}/><meshPhysicalMaterial color="#141020" roughness={0.15} clearcoat={1}/></mesh>
          <mesh position={[0.07, 0.1, 0.66]} scale={0.055 * blink}><sphereGeometry args={[1, 12, 8]}/><meshBasicMaterial color="#ffffff"/></mesh>
          <mesh position={[s * 0.34, -0.55, 0.42]} scale={[0.22, 0.13, 0.08]}><sphereGeometry args={[1, 20, 12]}/><meshPhysicalMaterial color={K.pink} roughness={0.7}/></mesh>
        </group>)}
        <mesh position={[0, 0.28, 1.08]} rotation={[0, 0, Math.PI]} scale={[1, 0.7 + mouth * 0.2, 1]}><torusGeometry args={[0.32, 0.045, 10, 32, Math.PI]}/><meshStandardMaterial color="#3a2530"/></mesh>
        <mesh position={[0, 0.16, 1.06]} scale={[0.26 + mouth * 0.06, 0.02 + mouth * 0.2, 0.1]}><sphereGeometry args={[1, 24, 16]}/><meshStandardMaterial color="#7a2238" roughness={0.6}/></mesh>
        {[-1, 1].map((s) => <mesh key={'f' + s} position={[s * 0.85, -1.05, 0.55]} scale={[0.45, 0.16, 0.4]}><sphereGeometry args={[1, 24, 16]}/><meshPhysicalMaterial color={K.grass2} {...clay}/></mesh>)}
        <mesh position={[-0.95, -0.15, 0.7]} scale={[0.22, 0.4, 0.22]} rotation={[0, 0, 0.5]}><sphereGeometry args={[1, 20, 14]}/><meshPhysicalMaterial color={K.grass} {...clay}/></mesh>
        <mesh position={[0.95, 0.05, 0.75]} scale={[0.22, 0.42, 0.22]} rotation={[0, 0, -0.9]}><sphereGeometry args={[1, 20, 14]}/><meshPhysicalMaterial color={K.grass} {...clay}/></mesh>
      </group>
      <group position={[1.0, 0.1, 0.85]} rotation={[-0.42, 0, 0.3 + Math.sin(t * 2.2) * 0.05 + pulse * 0.04]} scale={0.8}>
        <mesh position={[0, 1.45, 0]}><cylinderGeometry args={[0.06, 0.06, 3.0, 12]}/><meshStandardMaterial color="#c9a227" roughness={0.4}/></mesh>
        <mesh position={[0.12, -0.08, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.14, 0.05, 10, 20, Math.PI]}/><meshStandardMaterial color="#c9a227" roughness={0.4}/></mesh>
        <group position={[0, 2.9, 0]}>
          <mesh geometry={canopy}><meshPhysicalMaterial color={K.yellow} roughness={0.35} clearcoat={0.5} side={2}/></mesh>
          <mesh position={[0, 1.05, 0]} scale={0.12}><sphereGeometry args={[1, 16, 12]}/><meshPhysicalMaterial color={K.yellow} roughness={0.3}/></mesh>
          {Array.from({length: 8}, (_, k) => {const a = k / 8 * Math.PI * 2; return <mesh key={k} position={[Math.cos(a) * 1.9, -0.02, Math.sin(a) * 1.9]} scale={0.1}><sphereGeometry args={[1, 12, 8]}/><meshPhysicalMaterial color="#ffb703" roughness={0.3}/></mesh>;})}
        </group>
      </group>
    </group>
  </ThreeCanvas>;
};
