import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, progress} from '../../motion';
import type {Cue} from '../../types';
import {backOut} from '../showreel/kit';
import {MONO, SANS} from '../spicy-burn/look';

export {Headline, Aside, Mono, SANS, SERIF, MONO, VW, VH} from '../spicy-burn/look';
export const Y = {navy: '#0B1026', deep: '#070A1A', lavender: '#B9A7FF', peach: '#FFB38A', cream: '#FFF6EA', teal: '#6FE3D6', red: '#FF6B6B', grey: '#5B6185'};
export const CUTS = [0, 3.5, 9, 16, 24, 31, 39, 46, 52, 57, 62];

/** One yawn: slow inhale (0→1), short hold, quick release. x is seconds since the yawn started. */
export const yawnEnv = (x: number, len = 2.2) => {
  if (x <= 0 || x >= len) return 0; const inhale = len * 0.6, hold = len * 0.15;
  if (x < inhale) {const p = x / inhale; return p * p * (3 - 2 * p);}
  if (x < inhale + hold) return 1;
  const q = (x - inhale - hold) / (len - inhale - hold); return Math.pow(1 - q, 2.2);
};

/** Type that yawns: letters stretch upward and drift apart on the inhale. */
export const YawnWord: React.FC<{text: string; t: number; at: number; size: number; color?: string; top: number; len?: number; stagger?: number; accent?: number}> = ({text, t, at, size, color = Y.cream, top, len = 2.4, stagger = 0.06, accent = -1}) => <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: size * 1.9, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1}}>
  {text.split('').map((ch, i) => {const y = yawnEnv(t - at - i * stagger, len); return <div key={i} style={{transform: `scale(${1 + y * 0.04}, ${1 + y * 0.85})`, transformOrigin: '50% 100%', margin: `0 ${y * size * 0.02}px`, color: i === accent ? Y.peach : color}}>{ch}</div>;})}
</div>;

/** A stylized face whose mouth opens with `open` (0–1); eyes squeeze shut on a yawn. */
export const Face: React.FC<{open: number; size: number; tone?: string; style?: React.CSSProperties}> = ({open, size, tone = Y.cream, style}) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
  <circle cx={50} cy={50} r={46} fill={tone}/>
  <circle cx={30} cy={58} r={7} fill={Y.peach} opacity={0.35 + open * 0.4}/><circle cx={70} cy={58} r={7} fill={Y.peach} opacity={0.35 + open * 0.4}/>
  {[34, 66].map((x) => <path key={x} d={open > 0.35 ? `M${x - 8} 42 Q ${x} ${38 + open * 2} ${x + 8} 42` : `M${x - 7} 40 Q ${x} 46 ${x + 7} 40`} stroke={Y.navy} strokeWidth={4} fill="none" strokeLinecap="round"/>)}
  <ellipse cx={50} cy={64 + open * 4} rx={6 + open * 8} ry={2 + open * 15} fill={Y.navy}/>
  {open > 0.4 && <ellipse cx={50} cy={72 + open * 6} rx={4 + open * 4} ry={2 + open * 4} fill={Y.red} opacity={0.8}/>}
</svg>;

export const Stars: React.FC<{t: number; count?: number}> = ({t, count = 60}) => <>
  {Array.from({length: count}, (_, i) => {const x = (i * 197) % 1080; const y = (i * 331) % 1920; const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (0.8 + (i % 5) * 0.3) + i)); return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: '50%', background: Y.cream, opacity: tw * 0.6}}/>;})}
</>;

export const Chrome: React.FC<{t: number; light: boolean}> = ({t, light}) => {
  const c = light ? Y.navy : Y.cream;
  return <AbsoluteFill style={{pointerEvents: 'none', fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: c}}>
    <div style={{position: 'absolute', left: 60, top: 70}}>INSIDE YOU · EP 06</div>
    <div style={{position: 'absolute', right: 60, top: 70, display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 12, height: 12, borderRadius: 6, background: Y.lavender, opacity: Math.floor(t * 1.2) % 2 ? 0.35 : 1}}/>LATE NIGHT</div>
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 90, display: 'flex', gap: 8}}>
      {CUTS.slice(0, -1).map((c0, i) => <div key={i} style={{flex: 1, height: 4, background: c, opacity: 0.22}}><div style={{height: '100%', width: `${clamp((t - c0) / (CUTS[i + 1] - c0)) * 100}%`, background: c}}/></div>)}
    </div>
  </AbsoluteFill>;
};

export const CaptionBar: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
  const cue = cues.find((c) => t >= c.start && t < c.end); if (!cue) return null;
  const words = cue.text.split(' '); const p = progress(t, cue.start, cue.end); const pop = backOut(progress(t, cue.start, cue.start + 0.25), 2);
  return <div style={{position: 'absolute', left: 90, right: 90, bottom: 190, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.45, transform: `scale(${0.9 + pop * 0.1})`}}>
    <span style={{background: '#070A1AE6', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '8px 18px', borderRadius: 14}}>
      {words.map((w, i) => <span key={i} style={{color: i <= Math.floor(p * words.length) ? Y.peach : '#ffffffaa'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
    </span>
  </div>;
};
