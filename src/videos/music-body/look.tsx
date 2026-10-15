import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, progress} from '../../motion';
import type {Cue} from '../../types';
import {backOut} from '../showreel/kit';
import {SANS, MONO} from '../spicy-burn/look';
import analysis from './analysis.json';

export {Headline, Aside, Mono, SANS, SERIF, MONO, VW, VH} from '../spicy-burn/look';
export const M = {ink: '#0D0716', magenta: '#FF2E88', lime: '#C6FF3D', cyan: '#33E1FF', cream: '#FFF4E6', violet: '#7B5CFF'};
export const CUTS = [0, 3, 8, 15, 23, 28, 37, 44, 50, 56, 62];

// Audio-reactive lookups: every value comes from the analysed soundtrack at this frame.
const A = analysis as {fps: number; bands: number[][]; level: number[]; beats: number[]; hearts: number[]};
export const bandsAt = (t: number) => A.bands[clamp(Math.round(t * A.fps), 0, A.bands.length - 1)];
export const levelAt = (t: number) => A.level[clamp(Math.round(t * A.fps), 0, A.level.length - 1)];
const lastBefore = (list: number[], t: number) => {let lo = 0, hi = list.length - 1, r = -1; while (lo <= hi) {const m = (lo + hi) >> 1; if (list[m] <= t) {r = m; lo = m + 1;} else hi = m - 1;} return r;};
/** 1 on the beat, decaying after it; 0 before the first beat. */
export const beatPulse = (t: number, decay = 9) => {const i = lastBefore(A.beats, t); return i < 0 ? 0 : Math.exp(-(t - A.beats[i]) * decay);};
export const heartPulse = (t: number, decay = 10) => {const i = lastBefore(A.hearts, t); return i < 0 ? 0 : Math.exp(-(t - A.hearts[i]) * decay);};
export const bpmAt = (t: number) => {const i = lastBefore(A.beats, t); if (i < 1) return 100; return Math.round(60 / (A.beats[i] - A.beats[i - 1]));};
export const heartRateAt = (t: number) => {const i = lastBefore(A.hearts, t); if (i < 1) return 72; return Math.round(60 / (A.hearts[i] - A.hearts[i - 1]));};
export const beatCount = (t: number, from: number, to: number) => A.beats.filter((b) => b >= from && b <= Math.min(t, to)).length;
export const beatsBetween = (a: number, b: number) => A.beats.filter((x) => x >= a && x < b);
export const heartsBetween = (a: number, b: number) => A.hearts.filter((x) => x >= a && x < b);

export const Eq: React.FC<{t: number; height?: number; top: number; bars?: number; opacity?: number}> = ({t, height = 600, top, bars = 24, opacity = 1}) => {
  const b = bandsAt(t);
  return <div style={{position: 'absolute', left: 60, right: 60, top, height, display: 'flex', alignItems: 'flex-end', gap: 10, opacity}}>
    {Array.from({length: bars}, (_, i) => {const x = i / (bars - 1) * 11; const lo = Math.floor(x); const v = b[lo] + (b[Math.min(11, lo + 1)] - b[lo]) * (x - lo); const h = Math.max(0.04, v * (0.85 + 0.15 * Math.sin(i * 1.7))) * height;
      return <div key={i} style={{flex: 1, height: h, borderRadius: 10, background: `linear-gradient(0deg, ${M.magenta}, ${i % 3 === 0 ? M.lime : M.violet})`, boxShadow: `0 0 ${20 * v}px ${M.magenta}`}}/>;})}
  </div>;
};

export const Chrome: React.FC<{t: number; light: boolean}> = ({t, light}) => {
  const c = light ? M.ink : M.cream; const pulse = beatPulse(t);
  return <AbsoluteFill style={{pointerEvents: 'none', fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: c}}>
    <div style={{position: 'absolute', left: 60, top: 70}}>INSIDE YOU · EP 05</div>
    <div style={{position: 'absolute', right: 60, top: 70, display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 14, height: 14, borderRadius: 7, background: M.magenta, transform: `scale(${0.6 + pulse * 0.8})`}}/>{t >= 23.03 && t < 27 ? 'SILENCE' : `${bpmAt(t)} BPM`}</div>
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 90, display: 'flex', gap: 8}}>
      {CUTS.slice(0, -1).map((c0, i) => <div key={i} style={{flex: 1, height: 4, background: c, opacity: 0.22}}><div style={{height: '100%', width: `${clamp((t - c0) / (CUTS[i + 1] - c0)) * 100}%`, background: c}}/></div>)}
    </div>
  </AbsoluteFill>;
};

export const CaptionBar: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
  const cue = cues.find((c) => t >= c.start && t < c.end); if (!cue) return null;
  const words = cue.text.split(' '); const p = progress(t, cue.start, cue.end); const pop = backOut(progress(t, cue.start, cue.start + 0.25), 2);
  return <div style={{position: 'absolute', left: 90, right: 90, bottom: 190, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.45, transform: `scale(${0.9 + pop * 0.1})`}}>
    <span style={{background: '#0D0716E6', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '8px 18px', borderRadius: 14}}>
      {words.map((w, i) => <span key={i} style={{color: i <= Math.floor(p * words.length) ? M.lime : '#ffffffaa'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
    </span>
  </div>;
};
