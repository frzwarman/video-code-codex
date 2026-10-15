import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, progress} from '../../motion';
import type {Cue} from '../../types';
import {backOut, Blur, expoIn, expoOut, MONO, SANS, SERIF, speed} from '../showreel/kit';

export const VW = 1080; export const VH = 1920;
export const P = {ink: '#0B0607', red: '#FF2D1A', flame: '#FF8A00', yolk: '#FFD23F', milk: '#FFF7EC', cool: '#3EE0FF', char: '#2A1A17', skin: '#F4C7A8'};
// Cut points on the 120 BPM grid (match brief scenes).
export const CUTS = [0, 3, 8, 15, 24, 31, 38, 46, 53, 58, 62];
export {SANS, SERIF, MONO};

/** Letters mask-rise into place with velocity blur; optional fly-out. */
export const Headline: React.FC<{lines: string[]; t: number; at: number; out?: number; size?: number; color?: string; accent?: number; accentColor?: string; top: number; stagger?: number; align?: 'center' | 'left'}> = ({lines, t, at, out = 1e9, size = 160, color = P.milk, accent = -1, accentColor = P.flame, top, stagger = 0.028, align = 'center'}) => {
  let n = 0;
  return <div style={{position: 'absolute', left: 60, right: 60, top, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '-0.055em', lineHeight: 0.92, textAlign: align}}>
    {lines.map((line, li) => <div key={li} style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', overflow: 'hidden', paddingBottom: size * 0.08, color: li === accent ? accentColor : color}}>
      {line.split('').map((ch, i) => {
        const k = n++; const dir = k % 2 ? 1 : -1;
        const y = (tt: number) => lerp(size * 1.25 * dir, 0, backOut(progress(tt, at + k * stagger, at + k * stagger + 0.4), 1.5)) - size * 1.4 * expoIn(progress(tt, out + k * 0.008, out + k * 0.008 + 0.25));
        return <Blur key={i} id={`h${top}-${li}-${i}`} vy={speed(y, t)} k={0.35} style={{transform: `translateY(${y(t)}px)`, whiteSpace: 'pre'}}>{ch}</Blur>;
      })}
    </div>)}
  </div>;
};

export const Aside: React.FC<{text: string; t: number; at: number; top: number; color?: string; size?: number}> = ({text, t, at, top, color = P.yolk, size = 54}) => <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color, opacity: expoOut(progress(t, at, at + 0.5)), transform: `translateY(${lerp(24, 0, expoOut(progress(t, at, at + 0.5)))}px)`}}>{text}</div>;

export const Mono: React.FC<{text: string; t: number; at: number; top: number; color?: string; left?: number; right?: number; size?: number}> = ({text, t, at, top, color = P.milk, left, right, size = 24}) => {
  const p = expoOut(progress(t, at, at + 0.5));
  return <div style={{position: 'absolute', top, left, right, fontFamily: MONO, fontSize: size, letterSpacing: '0.16em', color, textAlign: left === undefined ? 'right' : 'left', width: left === undefined && right === undefined ? '100%' : undefined}}>{text.slice(0, Math.round(text.length * p))}</div>;
};

/** Series bug, scene progress, grain-free chrome. */
export const Chrome: React.FC<{t: number; light: boolean}> = ({t, light}) => {
  const c = light ? P.ink : P.milk;
  return <AbsoluteFill style={{pointerEvents: 'none', fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: c}}>
    <div style={{position: 'absolute', left: 60, top: 70}}>INSIDE YOU · EP 04</div>
    <div style={{position: 'absolute', right: 60, top: 70, display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 12, height: 12, borderRadius: 6, background: P.red, opacity: Math.floor(t * 2) % 2 ? 0.35 : 1}}/>HEAT MAP</div>
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 90, display: 'flex', gap: 8}}>
      {CUTS.slice(0, -1).map((c0, i) => <div key={i} style={{flex: 1, height: 4, background: c, opacity: 0.22}}><div style={{height: '100%', width: `${clamp((t - c0) / (CUTS[i + 1] - c0)) * 100}%`, background: c}}/></div>)}
    </div>
  </AbsoluteFill>;
};

export const CaptionBar: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
  const cue = cues.find((c) => t >= c.start && t < c.end); if (!cue) return null;
  const words = cue.text.split(' '); const p = progress(t, cue.start, cue.end);
  const pop = backOut(progress(t, cue.start, cue.start + 0.25), 2);
  return <div style={{position: 'absolute', left: 90, right: 90, bottom: 190, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.45, transform: `scale(${0.9 + pop * 0.1})`}}>
    <span style={{background: '#0B0607E6', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '8px 18px', borderRadius: 14}}>
      {words.map((w, i) => <span key={i} style={{color: i <= Math.floor(p * words.length) ? P.yolk : '#ffffffaa'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
    </span>
  </div>;
};

/** Procedural flame tongues; every value is a function of time. */
export const Flames: React.FC<{t: number; height?: number; opacity?: number}> = ({t, height = 520, opacity = 1}) => <svg width={VW} height={height} viewBox={`0 0 ${VW} ${height}`} style={{position: 'absolute', left: 0, bottom: 0, opacity}}>
  <defs><linearGradient id="flameG" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stopColor={P.yolk}/><stop offset="0.45" stopColor={P.flame}/><stop offset="1" stopColor={P.red} stopOpacity="0"/></linearGradient></defs>
  {Array.from({length: 11}, (_, i) => {
    const x = i * 108 - 20; const h = height * (0.55 + 0.35 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i)); const sway = Math.sin(t * 5 + i * 2.2) * 40; const w = 150;
    return <path key={i} d={`M${x} ${height} C ${x} ${height - h * 0.5}, ${x + w * 0.5 + sway} ${height - h * 0.7}, ${x + w * 0.5 + sway * 1.6} ${height - h} C ${x + w * 0.55 + sway} ${height - h * 0.6}, ${x + w} ${height - h * 0.45}, ${x + w} ${height} Z`} fill="url(#flameG)" opacity={0.85}/>;
  })}
</svg>;

export const Embers: React.FC<{t: number; count?: number; color?: string}> = ({t, count = 40, color = P.flame}) => <>
  {Array.from({length: count}, (_, i) => {
    const life = 2.2 + (i % 5) * 0.4; const ph = ((t + i * 0.37) % life) / life;
    const x = ((i * 97) % VW) + Math.sin(t * 2 + i) * 30; const y = VH - ph * VH * 0.9;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: '50%', background: color, opacity: Math.sin(ph * Math.PI) * 0.8, boxShadow: `0 0 14px ${color}`}}/>;
  })}
</>;
