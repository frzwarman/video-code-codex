import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AdditiveBlending, BufferAttribute, BufferGeometry, Color, PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {lerp, progress, seeded} from '../../motion';
import {CameraRig} from '../../three/Scenes';
import type {Quality} from '../../types';
import {anim, backOut, expoIn, expoOut, H, Label, R, SANS, W} from './kit';

type V3 = [number, number, number];
const Stage: React.FC<React.PropsWithChildren<{quality: Quality}>> = ({quality, children}) => <ThreeCanvas width={W} height={H} dpr={1} camera={{fov: 35, near: 0.1, far: 100, position: [0, 0, 10]}} gl={{antialias: quality === 'final', alpha: true, powerPreference: 'high-performance'}} style={{position: 'absolute', inset: 0}}>{children}</ThreeCanvas>;

const Reflections = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const room = new RoomEnvironment(); const pmrem = new PMREMGenerator(gl); const map = pmrem.fromScene(room, 0.04);
    scene.environment = map.texture; scene.environmentIntensity = 0.9; room.dispose(); pmrem.dispose();
    return () => {scene.environment = null; map.dispose();};
  }, [gl, scene]);
  return null;
};

// 03 — iridescent chrome knot threaded between two layers of type.
export const Depth: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 4; const a = -0.7 + s * 0.55;
  const r = lerp(10.5, 7.6, expoOut(progress(s, 0, 1.4))) - expoIn(progress(s, 1.6, 2)) * 5.8;
  const pop = backOut(progress(s, 0, 0.5), 1.8);
  const word = (style: React.CSSProperties) => <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 440, letterSpacing: '-0.06em', lineHeight: 1, transform: `translateX(${anim(s, 0, 2, 120, -120, (p) => p)}px) scale(${anim(s, 0, 0.6, 1.25, 1)})`, ...style}}>DEPTH</div>;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, #17141f, ${R.ink} 65%)`}}>
    {word({color: 'transparent', WebkitTextStroke: `3px ${R.bone}`, opacity: 0.85})}
    <Stage quality={quality}>
      <Reflections/>
      <CameraRig position={[Math.sin(a) * r, 0.8 + Math.sin(s * 1.2) * 0.35, Math.cos(a) * r]}/>
      <ambientLight intensity={0.15}/>
      <directionalLight position={[-6, 3, 4]} intensity={5} color={R.hot}/>
      <directionalLight position={[6, 1, -5]} intensity={8} color={R.violet}/>
      <directionalLight position={[0, 8, 3]} intensity={2.5} color="#ffffff"/>
      <mesh rotation={[s * 0.6, s * 0.9, 0.3]} scale={pop}>
        <torusKnotGeometry args={[1.45, 0.46, quality === 'final' ? 240 : 120, quality === 'final' ? 36 : 18, 2, 3]}/>
        <meshPhysicalMaterial color="#e4e0ff" metalness={1} roughness={0.13} iridescence={1} iridescenceIOR={1.7} iridescenceThicknessRange={[120, 780]} clearcoat={1} clearcoatRoughness={0.08}/>
      </mesh>
      {[0, 1, 2].map((i) => {const b = s * 1.7 + i * 2.094; return <mesh key={i} position={[Math.cos(b) * 3, Math.sin(b * 1.3 + i) * 0.9, Math.sin(b) * 3]} scale={pop * (i === 0 ? 0.36 : 0.22)}>
        <sphereGeometry args={[1, 40, 24]}/><meshPhysicalMaterial color={i === 1 ? R.violet : R.hot} roughness={0.22} clearcoat={1} metalness={0.1}/>
      </mesh>;})}
      {[0, 1].map((i) => <mesh key={i} rotation={[Math.PI / 2 + 0.35 + i * 0.5, i * 0.6, s * 0.2]} scale={pop}><torusGeometry args={[3.35 + i * 0.25, 0.007, 4, 160]}/><meshBasicMaterial color={R.bone} transparent opacity={0.45}/></mesh>)}
    </Stage>
    {word({color: R.bone, clipPath: 'inset(56% 0 0 0)'})}
    <Label n={3} text="3D / LOOKDEV — IRIDESCENT CHROME" t={t} at={4.2} style={{left: 140, top: 140}}/>
  </AbsoluteFill>;
};

export const useWordTargets = (word: string, n: number) => {
  const [handle] = useState(() => delayRender(`Sampling ${word}`));
  const [targets, setTargets] = useState<Float32Array | null>(null);
  useEffect(() => {
    document.fonts.load(`900 340px ${SANS}`).then(() => {
      const c = document.createElement('canvas'); c.width = 1500; c.height = 440; const g = c.getContext('2d')!;
      g.font = `900 340px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 750, 230);
      const data = g.getImageData(0, 0, c.width, c.height).data; const hits: number[] = [];
      for (let y = 0; y < c.height; y += 3) for (let x = 0; x < c.width; x += 3) if (data[(y * c.width + x) * 4 + 3] > 128) hits.push(x, y);
      const out = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const k = Math.floor(seeded('flow-pick', i) * (hits.length / 2)) * 2;
        out[i * 3] = (hits[k] - 750) / 112; out[i * 3 + 1] = -(hits[k + 1] - 220) / 112; out[i * 3 + 2] = (seeded('flow-z', i) - 0.5) * 0.35;
      }
      setTargets(out); continueRender(handle);
    }).catch(cancelRender);
  }, [handle, n, word]);
  return targets;
};

// 05 — a sphere of points reorganises into a word, then detonates.
export const Particles: React.FC<{t: number; quality: Quality}> = ({t, quality}) => {
  const s = t - 7.5; const n = quality === 'final' ? 6000 : 3000;
  const targets = useWordTargets('FLOW', n);
  const geometry = useMemo(() => {
    const g = new BufferGeometry(); const colors = new Float32Array(n * 3); const c = new Color();
    for (let i = 0; i < n; i++) {const r = seeded('flow-col', i); c.set(r < 0.22 ? R.hot : r < 0.3 ? R.violet : R.bone); colors.set([c.r, c.g, c.b], i * 3);}
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new BufferAttribute(colors, 3)); return g;
  }, [n]);
  useLayoutEffect(() => {
    if (!targets) return;
    const pos = geometry.getAttribute('position') as BufferAttribute; const out = pos.array as Float32Array;
    const spin = s * 0.9; const blast = expoIn(progress(s, 1.5, 2));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i + 0.5) / n * 2; const rr = Math.sqrt(1 - y * y); const ang = i * 2.399963 + spin;
      const sphere: V3 = [Math.cos(ang) * rr * 2.4, y * 2.4, Math.sin(ang) * rr * 2.4];
      const lag = seeded('flow-lag', i) * 0.45; const m = progress(s, 0.3 + lag, 0.95 + lag); const p = m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2;
      const swirl = Math.sin(p * Math.PI) * 1.4;
      for (let k = 0; k < 3; k++) {
        const base = lerp(sphere[k], targets[i * 3 + k], p);
        const dir = (k === 2 ? 1.2 : 1) * (targets[i * 3 + k] + (seeded('flow-d', i, String(k)) - 0.5) * 3);
        out[i * 3 + k] = base + (k === 0 ? Math.sin(i + s * 3) : k === 1 ? Math.cos(i * 1.3 + s * 3) : Math.sin(i * 0.7)) * swirl * 0.4 + dir * blast * 4;
      }
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere(); // bounds move with the points; stale bounds get the cloud culled
  }, [geometry, targets, s, n]);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #120f18, ${R.ink} 70%)`}}>
    <Stage quality={quality}>
      <CameraRig position={[Math.sin(s * 0.5 - 0.4) * 2.2, 0.4 - s * 0.15, 9.5 - s * 0.7]}/>
      <points geometry={geometry}><pointsMaterial size={quality === 'final' ? 0.05 : 0.07} vertexColors transparent opacity={0.95} depthWrite={false} blending={AdditiveBlending} sizeAttenuation/></points>
    </Stage>
    <Label n={5} text={`PARTICLES — ${n.toLocaleString('en-US')} POINTS`} t={t} at={7.7} style={{left: 140, top: 140}}/>
  </AbsoluteFill>;
};
