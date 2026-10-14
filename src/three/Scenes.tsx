import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import {Line} from '@react-three/drei/core/Line';
import {CatmullRomCurve3, Vector3, AdditiveBlending} from 'three';
import {palette} from '../theme';
import {lerp, progress, seeded, tween} from '../motion';
import type {Quality} from '../types';

type V3 = [number, number, number];

export const CameraRig: React.FC<{position: V3; target?: V3}> = ({position, target = [0, 0, 0]}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.updateMatrixWorld();
  }, [camera, ...position, ...target]);
  return null;
};

export const ThreeStage: React.FC<React.PropsWithChildren<{width: number; height: number; quality?: Quality; style?: React.CSSProperties}>> = ({width, height, quality = 'final', children, style}) => <ThreeCanvas width={width} height={height} dpr={1} camera={{fov: 40, near: 0.1, far: 100, position: [0, 0, 10]}} gl={{antialias: quality === 'final', alpha: true, powerPreference: 'high-performance'}} style={{position: 'absolute', ...style}}>
  <ambientLight intensity={1.4}/><directionalLight position={[3, 6, 8]} intensity={3} color="#c7fff4"/><directionalLight position={[-6, -1, 4]} intensity={2} color={palette.blue}/>
  {children}
</ThreeCanvas>;

export const GlowingNode: React.FC<{position?: V3; radius?: number; color?: string; pulse?: number}> = ({position = [0, 0, 0], radius = 0.06, color = palette.cyan, pulse = 1}) => <group position={position}>
  <mesh scale={pulse}><sphereGeometry args={[radius, 12, 8]}/><meshBasicMaterial color={color}/></mesh>
  <mesh scale={pulse}><sphereGeometry args={[radius * 2.8, 12, 8]}/><meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} blending={AdditiveBlending}/></mesh>
</group>;

export const ObjectReveal: React.FC<{time: number; loop?: boolean; color?: string}> = ({time, loop = false, color = palette.cyan}) => {
  const p = loop ? 1 : tween(time, 0, 1.1);
  return <group rotation={[0.35 + Math.sin(time * Math.PI / 3) * 0.18, time * Math.PI / 3, 0.25]} scale={p}>
    <RoundedBox args={[2.2, 2.2, 2.2]} radius={0.2} smoothness={3}><meshStandardMaterial color={color} metalness={0.55} roughness={0.3}/></RoundedBox>
    {[0, 1, 2].map((i) => <mesh key={i} rotation={[i === 0 ? Math.PI / 2 : 0, i === 1 ? Math.PI / 2 : 0, 0]}><torusGeometry args={[2.2 + i * 0.25, 0.018, 6, 64]}/><meshBasicMaterial color={i === 1 ? palette.blue : palette.paper} transparent opacity={0.5}/></mesh>)}
  </group>;
};

// Fibonacci distribution: immutable geometry, no simulation state to accumulate.
const nodes: V3[] = Array.from({length: 38}, (_, i) => {
  const y = 1 - i / 37 * 2; const r = Math.sqrt(1 - y * y); const a = i * 2.399963;
  return [Math.cos(a) * r * 2.7, y * 2.7, Math.sin(a) * r * 2.7];
});
const edges = nodes.flatMap((a, i) => nodes.flatMap((b, j) => j > i && new Vector3(...a).distanceTo(new Vector3(...b)) < 1.65 ? [[i, j] as const] : []));
const route = [29, 21, 13, 5, 0, 3, 11, 19];
const routeCurve = new CatmullRomCurve3(route.map((i) => new Vector3(...nodes[i])));

export const NetworkGlobe: React.FC<{time: number; quality?: Quality}> = ({time, quality = 'final'}) => {
  const reveal = tween(time, 0, 1.1, 0.75, 1);
  const points = useMemo(() => routeCurve.getPoints(90), []);
  const t = progress(time, 0.6, 6.2);
  return <>
    <CameraRig position={[Math.sin(time * 0.13) * 1.5, 0.5 + Math.sin(time * 0.16) * 0.5, 10.8 - tween(time, 0, 5, 0, 1.1)]}/>
    <group rotation={[0.12, -0.35 + time * 0.08, -0.1]} scale={reveal}>
      <mesh><sphereGeometry args={[2.65, 24, 16]}/><meshBasicMaterial color="#173343" transparent opacity={0.09} wireframe/></mesh>
      {edges.map(([a, b], i) => <Line key={i} points={[nodes[a], nodes[b]]} color={palette.blue} lineWidth={1.1} transparent opacity={0.22 + (Math.sin(time + i) + 1) * 0.1}/>) }
      <Line points={points} color={palette.cyan} lineWidth={2.4} transparent opacity={0.65}/>
      {nodes.map((point, i) => <GlowingNode key={i} position={point} color={route.includes(i) ? palette.cyan : '#668bb0'} radius={route.includes(i) ? 0.07 : 0.035} pulse={1 + Math.sin(time * 3 - i) * 0.15}/>)}
      {Array.from({length: quality === 'final' ? 12 : 6}, (_, i) => {
        const p = Math.max(0, t - i * 0.017); const v = routeCurve.getPoint(p);
        return <GlowingNode key={i} position={v.toArray() as V3} radius={i === 0 ? 0.13 : 0.045} color={i === 0 ? palette.paper : palette.cyan}/>;
      })}
      {[0, 1, 2].map((i) => <mesh key={i} rotation={[Math.PI / 2 + i * 0.6, i * 0.4, 0]}><torusGeometry args={[3.05 + i * 0.13, 0.006, 4, 96]}/><meshBasicMaterial color={palette.cyan} transparent opacity={0.2}/></mesh>)}
    </group>
  </>;
};

export const PacketTunnel: React.FC<{time: number; quality?: Quality}> = ({time, quality = 'final'}) => {
  const cameraZ = lerp(9, -10, progress(time, 0, 5));
  return <>
    <fog attach="fog" args={[palette.ink, 10, 35]}/>
    <CameraRig position={[Math.sin(time * 0.4) * 0.5, Math.cos(time * 0.3) * 0.35, cameraZ]} target={[0, 0, cameraZ - 15]}/>
    {Array.from({length: 12}, (_, i) => <group key={i} position={[Math.sin(i) * 0.7, Math.cos(i) * 0.5, 4 - i * 3.6]} rotation={[0, 0, i * 0.28]}>
      <mesh><torusGeometry args={[3.2, 0.024, 5, 6]}/><meshBasicMaterial color={i % 3 === 0 ? palette.cyan : palette.blue} transparent opacity={0.55}/></mesh>
      {Array.from({length: 6}, (_, j) => <GlowingNode key={j} position={[Math.cos(j * Math.PI / 3) * 3.2, Math.sin(j * Math.PI / 3) * 3.2, 0]} radius={0.07}/>) }
    </group>)}
    {Array.from({length: quality === 'final' ? 24 : 12}, (_, i) => {
      const x = (seeded('tunnel', i) - 0.5) * 6; const y = (seeded('tunnel', i, 'y') - 0.5) * 6;
      return <Line key={i} points={[[x, y, 8], [x, y, -40]]} color={palette.blue} lineWidth={0.8} transparent opacity={0.22}/>;
    })}
    <group position={[Math.sin(time * 1.3) * 0.3, Math.cos(time * 1.1) * 0.2, cameraZ - 5]} rotation={[time * 0.4, time * 0.7, 0.3]}>
      <RoundedBox args={[0.55, 0.55, 0.55]} radius={0.07} smoothness={3}><meshStandardMaterial color={palette.paper} emissive={palette.cyan} emissiveIntensity={0.7} metalness={0.3} roughness={0.2}/></RoundedBox>
      <mesh scale={1.2}><boxGeometry args={[0.55, 0.55, 0.55]}/><meshBasicMaterial color={palette.cyan} wireframe transparent opacity={0.3}/></mesh>
    </group>
  </>;
};
