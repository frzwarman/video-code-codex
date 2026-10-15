import React, {useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader, useThree} from '@react-three/fiber';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {AdditiveBlending, Box3, BufferAttribute, BufferGeometry, Color, LatheGeometry, Mesh, MeshPhysicalMaterial, PMREMGenerator, Quaternion, Vector2, Vector3} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {lerp, progress, seeded} from '../../motion';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {backOut, expoIn, expoOut, Label} from '../showreel/kit';
import {useWordTargets} from '../showreel/Shots3D';
import dopamine from './dopamine.json';
import {Aside, bandsAt, beatPulse, bpmAt, Headline, M, Mono, SANS, VH, VW} from './look';

type V3 = [number, number, number];
const Stage: React.FC<React.PropsWithChildren<{quality: Quality}>> = ({quality, children}) => <ThreeCanvas width={VW} height={VH} dpr={1} camera={{fov: 35, near: 0.1, far: 200, position: [0, 0, 10]}} gl={{antialias: quality === 'final', alpha: true, powerPreference: 'high-performance'}} style={{position: 'absolute', inset: 0}}>{children}</ThreeCanvas>;
const Reflections = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {const room = new RoomEnvironment(); const pm = new PMREMGenerator(gl); const map = pm.fromScene(room, 0.04); scene.environment = map.texture; scene.environmentIntensity = 0.7; room.dispose(); pm.dispose(); return () => {scene.environment = null; map.dispose();};}, [gl, scene]);
  return null;
};

// 02 — a woofer whose cone excursion is the real low-band energy of the soundtrack.
const coneGeometry = new LatheGeometry(Array.from({length: 24}, (_, k) => {const u = k / 23; return new Vector2(0.35 + u * 2.05, -0.9 + Math.pow(u, 1.6) * 0.9);}), 64);
const capGeometry = new LatheGeometry(Array.from({length: 12}, (_, k) => {const u = k / 11; return new Vector2(Math.sin(u * Math.PI / 2) * 0.55, Math.cos(u * Math.PI / 2) * 0.28 - 0.9);}), 48);
export const Speaker: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 3; const b = bandsAt(t); const push = (b[0] * 0.7 + b[1] * 0.3) * 0.32; const pop = backOut(progress(s, 0, 0.5), 1.6);
  const pulse = beatPulse(t);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 58%, #2a1140, ${M.ink} 70%)`}}>
    <Stage quality={quality}>
      <Reflections/>
      <CameraRig position={[Math.sin(s * 0.25 - 0.3) * 5, -1.4 + Math.sin(s * 0.4) * 0.4, 21]} target={[0, -1.4, 0]}/>
      <ambientLight intensity={0.15}/><directionalLight position={[-6, 4, 6]} intensity={5} color={M.magenta}/><directionalLight position={[6, -3, 5]} intensity={6} color={M.cyan}/><directionalLight position={[0, 6, 8]} intensity={1.5}/>
      <group position={[0, -1.75, 0]} rotation={[0.08, -0.15, 0]} scale={pop * 0.8}>
        <mesh position={[0, 0, -0.6]}><boxGeometry args={[6.2, 6.2, 0.5]}/><meshPhysicalMaterial color="#141018" roughness={0.55} clearcoat={0.4}/></mesh>
        <mesh position={[0, 0, -0.3]}><torusGeometry args={[2.75, 0.18, 16, 96]}/><meshPhysicalMaterial color="#c7c3d1" metalness={1} roughness={0.18}/></mesh>
        <group position={[0, 0, push]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.62]} geometry={coneGeometry}><meshPhysicalMaterial color="#22202a" roughness={0.35} clearcoat={0.6} side={2}/></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.62]} geometry={capGeometry}><meshPhysicalMaterial color="#3a3540" metalness={0.6} roughness={0.2} clearcoat={1}/></mesh>
          <mesh position={[0, 0, 0.0]}><torusGeometry args={[2.42, 0.16, 16, 96]}/><meshPhysicalMaterial color="#1a1820" roughness={0.6}/></mesh>
        </group>
        {[0, 1, 2, 3].map((k) => <mesh key={k} position={[Math.cos(k * Math.PI / 2 + Math.PI / 4) * 2.75, Math.sin(k * Math.PI / 2 + Math.PI / 4) * 2.75, -0.1]}><sphereGeometry args={[0.12, 16, 10]}/><meshPhysicalMaterial color="#d8d4e2" metalness={1} roughness={0.2}/></mesh>)}
        <mesh position={[0, 0, -0.32]} scale={1 + pulse * 0.08}><torusGeometry args={[3.05, 0.03, 8, 128]}/><meshBasicMaterial color={M.magenta} transparent opacity={0.4 + pulse * 0.6}/></mesh>
      </group>
    </Stage>
    <Headline lines={['FEEL YOUR', 'FOOT?']} t={t} at={3.2} out={7.75} size={170} accent={1} accentColor={M.lime} color={M.cream} top={230}/>
    <Aside text="it's probably already tapping" t={t} at={3.7} top={560} color={M.cyan}/>
    <div style={{position: 'absolute', left: 60, top: 1420, fontFamily: SANS, fontWeight: 900, fontSize: 90, color: M.cream, letterSpacing: '-0.03em'}}>{bpmAt(t)}<span style={{fontSize: 34, color: M.magenta, marginLeft: 12}}>BPM</span></div>
    <div style={{position: 'absolute', right: 70, top: 1440, width: 70, height: 70, borderRadius: 35, background: M.lime, opacity: 0.25 + pulse * 0.75, transform: `scale(${0.7 + pulse * 0.4})`, boxShadow: `0 0 ${40 * pulse}px ${M.lime}`}}/>
  </AbsoluteFill>;
};

// 03 — CC0 brain; supplementary motor area and basal ganglia glow on the beat.
export const Brain: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 8; const gltf = useLoader(GLTFLoader, staticFile('coffee/brain.glb'));
  const brain = useMemo(() => {const root = gltf.scene.clone(true); root.updateMatrixWorld(true); const box = new Box3().setFromObject(root); const c = box.getCenter(new Vector3()), size = box.getSize(new Vector3()); root.position.sub(c); root.traverse((o) => {if (o instanceof Mesh) o.material = new MeshPhysicalMaterial({color: '#e9dcf5', roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.55, clearcoat: 0.2, depthWrite: false});}); return {root, scale: 4.2 / Math.max(size.x, size.y, size.z)};}, [gltf]);
  const pulse = beatPulse(t, 7); const a = 0.6 + s * 0.3;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, #1c1033, ${M.ink} 70%)`}}>
    <Stage quality={quality}>
      <CameraRig position={[Math.sin(a) * 14, 2.4, Math.cos(a) * 14]} target={[0, -1.2, 0]}/>
      <ambientLight intensity={0.5}/><directionalLight position={[4, 6, 6]} intensity={2.5}/><directionalLight position={[-6, -2, -4]} intensity={4} color={M.violet}/>
      <group position={[0, -1.7, 0]} scale={brain.scale * backOut(progress(s, 0, 0.6), 1.5)}><primitive object={brain.root}/></group>
      {[[0, 1.25, -0.1, 0.3, M.lime], [0.5, 0.0, 0.1, 0.22, M.magenta], [-0.5, 0.0, 0.1, 0.22, M.magenta]].map(([x, y, z, r, c], k) => <group key={k} position={[x as number, (y as number) - 1.7, z as number]}>
        <mesh scale={1 + pulse * 0.5}><sphereGeometry args={[r as number, 24, 16]}/><meshBasicMaterial color={c as string} transparent opacity={0.35 + pulse * 0.6} depthWrite={false} blending={AdditiveBlending}/></mesh>
        <mesh scale={2.2 + pulse * 1.4}><sphereGeometry args={[r as number, 24, 16]}/><meshBasicMaterial color={c as string} transparent opacity={0.1 + pulse * 0.2} depthWrite={false} blending={AdditiveBlending}/></mesh>
      </group>)}
    </Stage>
    <Headline lines={['MOVEMENT', 'AREAS FIRE']} t={t} at={8.2} out={14.75} size={150} accent={1} accentColor={M.lime} color={M.cream} top={230}/>
    <Aside text="even when you're sitting still" t={t} at={8.8} top={520} color={M.cyan}/>
    <Mono text="● SUPPLEMENTARY MOTOR AREA" t={t} at={9.4} top={1380} left={60} color={M.lime}/>
    <Mono text="● BASAL GANGLIA" t={t} at={9.8} top={1420} left={60} color={M.magenta}/>
    <Mono text="GRAHN & BRETT 2007 · SCHEMATIC" t={t} at={10.2} top={1460} left={60} color="#ffffff88" size={18}/>
  </AbsoluteFill>;
};

// 06 — the drop: points burst into CHILLS, then the real dopamine molecule (PubChem CID 681).
type Atom = {element: number; position: number[]};
const atoms = dopamine.atoms as Atom[];
const bonds = dopamine.bonds.map((b) => {const a = new Vector3(...(atoms[b.a].position as V3)); const z = new Vector3(...(atoms[b.b].position as V3)); const ax = z.clone().sub(a); return {mid: a.clone().add(z).multiplyScalar(0.5).toArray() as V3, q: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), ax.clone().normalize()), len: ax.length(), h: atoms[b.a].element === 1 || atoms[b.b].element === 1};});
export const Chills: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 28; const n = quality === 'final' ? 5000 : 2500; const targets = useWordTargets('CHILLS', n);
  const geometry = useMemo(() => {const g = new BufferGeometry(); const col = new Float32Array(n * 3); const c = new Color(); for (let i = 0; i < n; i++) {const r = seeded('ch-col', i); c.set(r < 0.4 ? M.magenta : r < 0.65 ? M.lime : r < 0.85 ? M.cyan : M.cream); col.set([c.r, c.g, c.b], i * 3);} g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new BufferAttribute(col, 3)); return g;}, [n]);
  const pulse = beatPulse(t, 6);
  useLayoutEffect(() => {
    if (!targets) return; const pos = geometry.getAttribute('position') as BufferAttribute; const o = pos.array as Float32Array;
    const form = expoOut(progress(s, 0.15, 1.6)); const leave = expoIn(progress(s, 4.2, 4.7));
    for (let i = 0; i < n; i++) {
      const th = seeded('ch-th', i) * Math.PI * 2, ph = Math.acos(2 * seeded('ch-ph', i) - 1), r = 9 + seeded('ch-r', i) * 7;
      for (let k = 0; k < 3; k++) {
        const burst = k === 0 ? Math.sin(ph) * Math.cos(th) * r : k === 1 ? Math.cos(ph) * r * 0.8 : Math.sin(ph) * Math.sin(th) * r;
        const tgt = targets[i * 3 + k] * (k < 2 ? 0.5 : 1) * (1 + pulse * 0.04);
        o[i * 3 + k] = lerp(burst * (1 - Math.min(1, s * 4) * 0.0), tgt, form) + burst * leave * 1.5 + (k === 1 ? Math.sin(s * 3 + i) * 0.04 : 0);
      }
    }
    pos.needsUpdate = true; geometry.computeBoundingSphere();
  }, [geometry, targets, s, n, pulse]);
  const mol = progress(s, 4.3, 5.2);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${s < 0.3 ? '#3b1060' : '#1d0b33'}, ${M.ink} 72%)`}}>
    <Stage quality={quality}>
      <Reflections/>
      <CameraRig position={[Math.sin(s * 0.2) * 1.5, 0.3, 22 - s * 0.5]}/>
      <ambientLight intensity={0.3}/><directionalLight position={[4, 6, 8]} intensity={3}/><directionalLight position={[-6, -2, -4]} intensity={5} color={M.magenta}/>
      {s < 4.8 && <points geometry={geometry}><pointsMaterial size={quality === 'final' ? 0.12 : 0.16} vertexColors transparent opacity={0.95} depthWrite={false} blending={AdditiveBlending} sizeAttenuation/></points>}
      {mol > 0 && <group rotation={[0.4, s * 0.6, 0.2]} scale={backOut(mol, 1.8) * 0.7 * (1 + pulse * 0.05)}>
        {bonds.map((b, i) => <mesh key={'b' + i} position={b.mid} quaternion={b.q}><cylinderGeometry args={[b.h ? 0.05 : 0.09, b.h ? 0.05 : 0.09, b.len, 10]}/><meshStandardMaterial color="#e6def0" metalness={0.5} roughness={0.25}/></mesh>)}
        {atoms.map((a, i) => <mesh key={i} position={a.position as V3}><sphereGeometry args={[a.element === 1 ? 0.2 : 0.38, 24, 16]}/><meshPhysicalMaterial color={a.element === 6 ? '#2d2340' : a.element === 8 ? M.magenta : a.element === 7 ? M.cyan : M.cream} roughness={0.2} clearcoat={0.8} emissive={a.element === 8 ? M.magenta : '#000'} emissiveIntensity={a.element === 8 ? 0.4 : 0}/></mesh>)}
      </group>}
    </Stage>
    {s > 4.3 && <Headline lines={['DOPAMINE']} t={t} at={32.4} out={36.75} size={170} color={M.cream} top={250}/>}
    {s > 4.3 && <Mono text="C8H11NO2 · PUBCHEM CID 681 · REWARD" t={t} at={32.8} top={440} color={M.lime}/>}
    {s > 6 && <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: M.lime, transform: `rotate(-3deg) scale(${backOut(progress(s, 6, 6.35), 2.6)})`}}>DID YOU GET CHILLS?</div>}
    <Label n={6} text="SALIMPOOR ET AL. 2011" t={t} at={33} style={{left: 60, top: 1480}}/>
  </AbsoluteFill>;
};
