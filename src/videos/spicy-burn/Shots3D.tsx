import React, {useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AdditiveBlending, BufferAttribute, BufferGeometry, Color, LatheGeometry, PMREMGenerator, Quaternion, Vector2, Vector3} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {lerp, progress, seeded} from '../../motion';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {backOut, expoIn, expoOut, Label} from '../showreel/kit';
import {useWordTargets} from '../showreel/Shots3D';
import capsaicin from './capsaicin.json';
import {Aside, Embers, Headline, Mono, P, SANS, VH, VW} from './look';

type V3 = [number, number, number];
const Stage: React.FC<React.PropsWithChildren<{quality: Quality; fov?: number}>> = ({quality, fov = 35, children}) => <ThreeCanvas width={VW} height={VH} dpr={1} camera={{fov, near: 0.1, far: 200, position: [0, 0, 10]}} gl={{antialias: quality === 'final', alpha: true, powerPreference: 'high-performance'}} style={{position: 'absolute', inset: 0}}>{children}</ThreeCanvas>;
const Reflections = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {const room = new RoomEnvironment(); const pm = new PMREMGenerator(gl); const map = pm.fromScene(room, 0.04); scene.environment = map.texture; scene.environmentIntensity = 0.8; room.dispose(); pm.dispose(); return () => {scene.environment = null; map.dispose();};}, [gl, scene]);
  return null;
};

// A sculpted chili: lathe profile, organic lobes, and a curved tip, all computed once.
const chiliGeometry = (() => {
  const L = 5.2; const pts: Vector2[] = [];
  for (let k = 0; k <= 48; k++) {const u = k / 48; pts.push(new Vector2(0.62 * Math.min(1, Math.sqrt(u / 0.07)) * Math.pow(1 - u, 0.75) + 0.002, -u * L));}
  const g = new LatheGeometry(pts, 48); const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const u = -y / L; const th = Math.atan2(z, x);
    const lobe = 1 + 0.05 * Math.sin(3 * th + u * 2.5);
    p.setXYZ(i, x * lobe + 1.4 * u * u * u, y + 0.25 * u * u, z * lobe);
  }
  g.computeVertexNormals(); g.translate(-0.3, L / 2, 0); return g;
})();

export const Chili: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 3; const pop = backOut(progress(s, 0, 0.55), 1.7); const a = -0.5 + s * 0.45;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, #3a0f0a, ${P.ink} 70%)`}}>
    <Embers t={t} count={34}/>
    <Stage quality={quality}>
      <Reflections/>
      <CameraRig position={[Math.sin(a) * 12, 0.4, Math.cos(a) * 12]} target={[0, -1.4, 0]}/>
      <ambientLight intensity={0.2}/>
      <directionalLight position={[-5, 4, 5]} intensity={4} color="#ffd9b0"/>
      <directionalLight position={[6, -1, -4]} intensity={7} color={P.flame}/>
      <pointLight position={[0, -4, 3]} intensity={30} color={P.red} distance={14}/>
      <group rotation={[0.25, s * 0.5, -1.05 + Math.sin(s * 1.3) * 0.08]} scale={pop * 0.85} position={[0, -3.1, 0]}>
        <mesh geometry={chiliGeometry}><meshPhysicalMaterial color="#c8120a" roughness={0.18} clearcoat={1} clearcoatRoughness={0.06} sheen={0.4} sheenColor="#ff6a3d"/></mesh>
        <mesh position={[-0.3, 2.62, 0]} scale={[1, 0.35, 1]}><sphereGeometry args={[0.66, 32, 16]}/><meshStandardMaterial color="#2f6b1f" roughness={0.6}/></mesh>
        <mesh position={[-0.12, 3.15, 0]} rotation={[0, 0, -0.45]}><cylinderGeometry args={[0.09, 0.14, 1.1, 12]}/><meshStandardMaterial color="#3d7a26" roughness={0.55}/></mesh>
      </group>
    </Stage>
    <Headline lines={['IT JUST', 'THINKS', 'IT IS.']} t={t} at={3.25} out={7.7} size={190} accent={1} top={230}/>
    <Label n={2} text="THE CULPRIT" t={t} at={4.2} style={{left: 60, top: 1500}}/>
  </AbsoluteFill>;
};

// Real PubChem conformer (CID 1548943), assembled atom by atom along the chain.
type Atom = {element: number; position: number[]};
const atoms = capsaicin.atoms as Atom[];
const order = atoms.map((a, i) => ({i, x: a.position[0]})).sort((p, q) => p.x - q.x).map((o, rank) => ({...o, rank}));
const born = new Map(order.map((o) => [o.i, o.rank / atoms.length]));
const bonds = capsaicin.bonds.map((b) => {
  const a = new Vector3(...(atoms[b.a].position as V3)); const z = new Vector3(...(atoms[b.b].position as V3)); const axis = z.clone().sub(a);
  return {a: b.a, b: b.b, mid: a.clone().add(z).multiplyScalar(0.5).toArray() as V3, q: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axis.clone().normalize()), len: axis.length(), h: atoms[b.a].element === 1 || atoms[b.b].element === 1};
});
const atomColor = (e: number) => e === 6 ? '#3b302d' : e === 8 ? P.red : e === 7 ? P.cool : P.milk;

export const Molecule: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 8; const build = progress(s, 0.3, 3.2);
  const grow = (i: number) => backOut(clampP((build - (born.get(i) ?? 0) * 0.85) / 0.15), 2.2);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #241310, ${P.ink} 72%)`}}>
    <Stage quality={quality}>
      <Reflections/>
      <CameraRig position={[Math.sin(s * 0.18) * 3, 1.2, lerp(38, 30, expoOut(progress(s, 0, 4)))]} target={[0, 1.2, 0]}/>
      <ambientLight intensity={0.25}/><directionalLight position={[4, 6, 8]} intensity={3.5} color="#fff1e0"/><directionalLight position={[-6, -2, -4]} intensity={5} color={P.flame}/>
      <group rotation={[0.3 + Math.sin(s * 0.4) * 0.15, s * 0.35, 0.5]} scale={0.95} position={[0, -1.0, 0]}>
        {bonds.map((b, i) => {const g = Math.min(grow(b.a), grow(b.b)); return g > 0.01 && (!b.h || quality === 'final') ? <mesh key={'b' + i} position={b.mid} quaternion={b.q} scale={[1, g, 1]}><cylinderGeometry args={[b.h ? 0.05 : 0.09, b.h ? 0.05 : 0.09, b.len, 10]}/><meshStandardMaterial color="#d9c9bd" metalness={0.5} roughness={0.25}/></mesh> : null;})}
        {atoms.map((a, i) => {const g = grow(i); return g > 0.01 ? <mesh key={i} position={a.position as V3} scale={g}><sphereGeometry args={[a.element === 1 ? 0.2 : a.element === 6 ? 0.4 : 0.38, 24, 16]}/><meshPhysicalMaterial color={atomColor(a.element)} roughness={0.2} clearcoat={0.8} metalness={0.15} emissive={a.element === 8 ? P.red : '#000'} emissiveIntensity={a.element === 8 ? 0.35 : 0}/></mesh> : null;})}
      </group>
    </Stage>
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', fontFamily: SANS, fontSize: 150, letterSpacing: '-0.04em', color: P.milk, lineHeight: 1}}>
      {'CAPSAICIN'.split('').map((ch, i) => {const w = 0.5 + 0.5 * Math.sin((s * 1.2 - i * 0.11) * Math.PI * 2); const rise = expoOut(progress(s, 0.1 + i * 0.04, 0.6 + i * 0.04));
        return <div key={i} style={{overflow: 'hidden'}}><div style={{fontWeight: Math.round(lerp(200, 900, w)), color: i === 4 ? P.flame : P.milk, transform: `translateY(${(1 - rise) * 170}px)`}}>{ch}</div></div>;})}
    </div>
    <Mono text="C18H27NO3 · PUBCHEM CID 1548943" t={t} at={8.8} top={430} color={P.yolk}/>
    <Aside text="the molecule behind the burn" t={t} at={9.4} top={500}/>
    <Mono text={`ATOMS ${Math.round(build * atoms.length)}/${atoms.length}`} t={t} at={8.5} top={1470} left={60} color={P.milk}/>
  </AbsoluteFill>;
};
const clampP = (v: number) => Math.max(0, Math.min(1, v));

// Nerve signals race upward and organise into FIRE, then disperse.
export const FireParticles: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 24; const n = quality === 'final' ? 5000 : 2500; const targets = useWordTargets('FIRE', n);
  const geometry = useMemo(() => {
    const g = new BufferGeometry(); const col = new Float32Array(n * 3); const c = new Color();
    for (let i = 0; i < n; i++) {const r = seeded('fire-col', i); c.set(r < 0.4 ? P.flame : r < 0.7 ? P.red : P.yolk); col.set([c.r, c.g, c.b], i * 3);}
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new BufferAttribute(col, 3)); return g;
  }, [n]);
  useLayoutEffect(() => {
    if (!targets) return; const pos = geometry.getAttribute('position') as BufferAttribute; const o = pos.array as Float32Array;
    const burst = expoIn(progress(s, 6.3, 7));
    for (let i = 0; i < n; i++) {
      const lane = seeded('fire-lane', i) - 0.5; const lag = seeded('fire-lag', i) * 1.4;
      const travel = progress(s, lag, lag + 1.1); const settle = progress(s, 1.2 + lag * 0.6, 2.4 + lag * 0.6); const e = settle * settle * (3 - 2 * settle);
      const ny = lerp(-26, 3 + lane * 2, travel); const nx = lane * 1.2 + Math.sin(ny * 0.5 + i) * 0.25;
      const flick = Math.sin(s * 9 + i) * 0.05 * e;
      o[i * 3] = lerp(nx, targets[i * 3], e) + (targets[i * 3] * 0.4 + lane * 3) * burst * 6;
      o[i * 3 + 1] = lerp(ny, targets[i * 3 + 1], e) + flick + (seeded('fire-up', i) * 4 + 2) * burst * 5;
      o[i * 3 + 2] = lerp(0, targets[i * 3 + 2], e) + (seeded('fire-z', i) - 0.5) * burst * 20;
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere(); // bounds move with the points; stale bounds get the cloud culled
  }, [geometry, targets, s, n]);
  const ui = (k: number) => backOut(progress(s, 4.2 + k * 0.18, 4.7 + k * 0.18), 1.6);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #2a0b06, ${P.ink} 70%)`}}>
    <Stage quality={quality}>
      <CameraRig position={[Math.sin(s * 0.3) * 1.5, 0.2, 27 - s * 0.4]}/>
      <points geometry={geometry}><pointsMaterial size={quality === 'final' ? 0.14 : 0.18} vertexColors transparent opacity={0.95} depthWrite={false} blending={AdditiveBlending} sizeAttenuation/></points>
    </Stage>
    <Headline lines={['YOUR BRAIN', 'GETS ONE', 'MESSAGE:']} t={t} at={24.2} out={30.6} size={110} top={250}/>
    {[{label: 'SENSOR', value: '43°C+', color: P.red, sub: 'HEAT DETECTED'}, {label: 'ACTUAL', value: '37°C', color: P.cool, sub: 'BODY TEMPERATURE'}].map((c, k) => <div key={k} style={{position: 'absolute', left: 90 + k * 460, top: 1180, width: 440, padding: '26px 30px', borderRadius: 26, background: '#1b100ecc', border: `2px solid ${c.color}`, transform: `translateY(${(1 - ui(k)) * 300}px) scale(${0.9 + ui(k) * 0.1})`, opacity: Math.min(1, ui(k) * 1.5) * (1 - expoIn(progress(s, 6.3, 6.8)))}}>
      <div style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 22, letterSpacing: '0.2em', color: c.color}}>{c.label}</div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, color: P.milk, letterSpacing: '-0.04em'}}>{c.value}</div>
      <div style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, letterSpacing: '0.16em', color: '#ffffff99'}}>{c.sub}</div>
    </div>)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.2em', color: P.red, opacity: s > 4.9 && s < 6.4 && Math.floor(s * 4) % 2 === 0 ? 1 : 0}}>FALSE ALARM</div>
  </AbsoluteFill>;
};
