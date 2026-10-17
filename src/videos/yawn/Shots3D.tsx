import React, {useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import type {GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {AdditiveBlending, Box3, BufferAttribute, BufferGeometry, Color, Mesh, MeshPhysicalMaterial, Vector3} from 'three';
import {lerp, progress, seeded} from '../../motion';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {backOut, Label} from '../showreel/kit';
import {Aside, Headline, Mono, VH, VW, Y, yawnEnv} from './look';

const warm = new Color('#FF6B4A'); const cool = new Color(Y.teal);

// 04 — CC0 brain shifts from warm to cool as an inhale stream flows up into it (schematic hypothesis).
export const BrainCool: React.FC<{t: number; quality: Quality; gltf: GLTF}> = ({t, quality, gltf}) => {
  const s = t - 16; const inhale = yawnEnv(t - 17.0, 2.6); const cooled = progress(t, 18.2, 21.5);
  const brain = useMemo(() => {const root = gltf.scene.clone(true); root.updateMatrixWorld(true); const box = new Box3().setFromObject(root); const c = box.getCenter(new Vector3()), size = box.getSize(new Vector3()); root.position.sub(c); const mat = new MeshPhysicalMaterial({roughness: 0.45, clearcoat: 0.3, emissiveIntensity: 0.35}); root.traverse((o) => {if (o instanceof Mesh) o.material = mat;}); return {root, mat, scale: 4.0 / Math.max(size.x, size.y, size.z)};}, [gltf]);
  useLayoutEffect(() => {const c = warm.clone().lerp(cool, cooled); brain.mat.color.copy(c).lerp(new Color('#ffffff'), 0.25); brain.mat.emissive.copy(c);}, [brain, cooled]);
  const n = quality === 'final' ? 1600 : 800;
  const geometry = useMemo(() => {const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3)); return g;}, [n]);
  useLayoutEffect(() => {
    const pos = geometry.getAttribute('position') as BufferAttribute; const o = pos.array as Float32Array; const flow = progress(t, 16.8, 19.6);
    for (let i = 0; i < n; i++) {const lag = seeded('air', i); const u = ((flow * 1.6 - lag) % 1 + 1) % 1; const live = flow * 1.6 > lag ? 1 : 0; const sw = (seeded('air', i, 'r') - 0.5);
      o[i * 3] = sw * lerp(1.6, 0.5, u) + Math.sin(u * 9 + i) * 0.12; o[i * 3 + 1] = live ? lerp(-8.5, -1.2, u) : -40; o[i * 3 + 2] = (seeded('air', i, 'z') - 0.5) * lerp(1.2, 0.4, u);}
    pos.needsUpdate = true; geometry.computeBoundingSphere();
  }, [geometry, t, n]);
  const a = 0.4 + s * 0.25;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #1b2350, ${Y.deep} 72%)`}}>
    <ThreeCanvas width={VW} height={VH} dpr={1} camera={{fov: 35, near: 0.1, far: 200, position: [0, 0, 16]}} gl={{antialias: quality === 'final', alpha: true}} style={{position: 'absolute', inset: 0}}>
      <CameraRig position={[Math.sin(a) * 15, 1.5, Math.cos(a) * 15]} target={[0, -1.6, 0]}/>
      <ambientLight intensity={0.7}/><directionalLight position={[4, 6, 6]} intensity={2.4}/><directionalLight position={[-6, -2, -4]} intensity={2} color={Y.lavender}/>
      <group position={[0, -2.4, 0]} scale={brain.scale * backOut(progress(s, 0, 0.6), 1.5) * (1 + inhale * 0.04)}><primitive object={brain.root}/></group>
      <points geometry={geometry}><pointsMaterial size={quality === 'final' ? 0.07 : 0.1} color={Y.teal} transparent opacity={0.8} depthWrite={false} blending={AdditiveBlending} sizeAttenuation/></points>
    </ThreeCanvas>
    <Headline lines={['IT MIGHT', 'COOL YOUR', 'BRAIN']} t={t} at={16.15} out={23.75} size={130} accent={2} accentColor={Y.teal} color={Y.cream} top={230}/>
    <Aside text="one leading idea" t={t} at={16.8} top={660} color={Y.lavender}/>
    <div style={{position: 'absolute', right: 70, top: 1250, width: 60, height: 240, borderRadius: 30, border: `3px solid ${Y.cream}`, overflow: 'hidden'}}><div style={{position: 'absolute', bottom: 0, width: '100%', height: `${lerp(85, 45, cooled)}%`, background: `linear-gradient(0deg, ${Y.teal}, ${cooled > 0.5 ? Y.teal : '#FF6B4A'})`}}/></div>
    <Mono text="GALLUP & GALLUP 2007 · HYPOTHESIS · SCHEMATIC" t={t} at={17.5} top={1500} left={60} color="#ffffffaa" size={18}/>
    <Label n={4} text="BRAIN TEMP ↓" t={t} at={18.5} style={{left: 60, top: 1440}}/>
  </AbsoluteFill>;
};
