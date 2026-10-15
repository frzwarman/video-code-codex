import React from 'react';
import {AbsoluteFill, continueRender, delayRender, cancelRender, staticFile} from 'remotion';
import {clamp, lerp, progress} from '../../motion';

export const W = 1920; export const H = 1080; export const FPS = 60;
export const R = {ink: '#08080A', bone: '#F2EEE6', hot: '#FF4A1C', violet: '#7B6CFF', smoke: '#8B8790', panel: '#141418'};
export const SANS = 'Inter'; export const SERIF = 'Reel Serif'; export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
// Cut points on the 120 BPM grid; shot i runs from CUTS[i] to CUTS[i + 1].
export const CUTS = [0, 2, 4, 6, 7.5, 9.5, 11, 12.5, 15];
export const SHOTS = ['KINETIC', 'TYPE', 'DEPTH', 'SYSTEMS', 'PARTICLES', 'INTERFACE', 'FLUID', 'SIGNATURE'];

if (typeof document !== 'undefined') {
  const hold = delayRender('Loading reel serif');
  new FontFace(SERIF, `url(${staticFile('fonts/LibreBaskerville-Italic.ttf')})`, {style: 'italic', weight: '400'}).load()
    .then((f) => {document.fonts.add(f); continueRender(hold);}).catch(cancelRender);
}

export const backOut = (p: number, s = 1.9) => {const x = clamp(p) - 1; return 1 + (s + 1) * x * x * x + s * x * x;};
export const expoOut = (p: number) => {const x = clamp(p); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);};
export const expoIn = (p: number) => {const x = clamp(p); return x === 0 ? 0 : Math.pow(2, 10 * x - 10);};
export const anim = (t: number, a: number, b: number, from: number, to: number, curve: (p: number) => number = expoOut) => lerp(from, to, curve(progress(t, a, b)));
/** Per-frame velocity of an animated value, for motion blur. */
export const speed = (f: (t: number) => number, t: number) => f(t) - f(t - 1 / FPS);

/** Directional blur driven by velocity (px per frame). Pure SVG filter: no dependency, no state. */
export const Blur: React.FC<React.PropsWithChildren<{id: string; vx?: number; vy?: number; k?: number; style?: React.CSSProperties}>> = ({id, vx = 0, vy = 0, k = 0.45, style, children}) => {
  const bx = Math.min(80, Math.abs(vx) * k); const by = Math.min(80, Math.abs(vy) * k);
  const on = bx > 0.3 || by > 0.3;
  return <div style={{...style, filter: on ? `url(#${id})` : undefined}}>
    {on && <svg width={0} height={0} style={{position: 'absolute'}}><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`}/></filter></svg>}
    {children}
  </div>;
};

export const Label: React.FC<{n: number; text: string; t: number; at: number; color?: string; style?: React.CSSProperties}> = ({n, text, t, at, color = R.bone, style}) => {
  const p = expoOut(progress(t, at, at + 0.45));
  const chars = `${String(n).padStart(2, '0')} — ${text}`;
  return <div style={{position: 'absolute', fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color, ...style}}>
    {chars.slice(0, Math.round(chars.length * p))}<span style={{opacity: p < 1 || Math.floor(t * 4) % 2 ? 1 : 0, color: R.hot}}>▍</span>
  </div>;
};

/** Skewed panel that fully covers the frame exactly at `at`. */
export const Wipe: React.FC<{t: number; at: number; color: string; angle?: number; span?: number}> = ({t, at, color, angle = 0, span = 0.36}) => {
  const p = progress(t, at - span / 2, at + span / 2);
  if (p <= 0 || p >= 1) return null;
  const x = (f: number) => lerp(1.35, -1.35, f < 0.5 ? expoIn(f * 2) / 2 : 0.5 + expoOut(f * 2 - 1) / 2);
  const xp = x(p); const v = (xp - x(progress(t - 1 / FPS, at - span / 2, at + span / 2))) * W;
  return <AbsoluteFill style={{transform: `rotate(${angle}deg)`, pointerEvents: 'none'}}>
    <Blur id={`wipe-${at}`} vx={v} k={0.25} style={{position: 'absolute', left: '50%', top: '-40%', width: W * 1.45, height: '180%', marginLeft: -W * 0.725, transform: `translateX(${xp * W}px) skewX(-12deg)`}}>
      <div style={{width: '100%', height: '100%', background: color}}/>
    </Blur>
  </AbsoluteFill>;
};

export const Flash: React.FC<{t: number; at: number; strength?: number}> = ({t, at, strength = 0.85}) => {
  const d = t - at; if (d < 0 || d > 0.2) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: strength * Math.exp(-d * 28), mixBlendMode: 'screen'}}/>;
};

/** Decaying camera shake summed over impacts. */
export const shake = (t: number, hits: number[], amp = 14) => hits.reduce(([x, y], c) => {
  const d = t - c; if (d < 0 || d > 0.4) return [x, y];
  const e = Math.exp(-d * 14) * amp; return [x + Math.sin(d * 97) * e, y + Math.cos(d * 83) * e * 0.7];
}, [0, 0]);

const tc = (frame: number) => {const f = frame % FPS; const s = Math.floor(frame / FPS); return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;};

export const Hud: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const shot = Math.max(0, CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]));
  const mark = (s: React.CSSProperties) => <div style={{position: 'absolute', width: 34, height: 34, borderColor: R.bone, borderStyle: 'solid', borderWidth: 0, ...s}}/>;
  return <AbsoluteFill style={{mixBlendMode: 'difference', color: R.bone, fontFamily: MONO, fontSize: 18, letterSpacing: '0.16em', pointerEvents: 'none'}}>
    {mark({left: 48, top: 48, borderLeftWidth: 2, borderTopWidth: 2})}{mark({right: 48, top: 48, borderRightWidth: 2, borderTopWidth: 2})}
    {mark({left: 48, bottom: 48, borderLeftWidth: 2, borderBottomWidth: 2})}{mark({right: 48, bottom: 48, borderRightWidth: 2, borderBottomWidth: 2})}
    <div style={{position: 'absolute', left: 104, top: 58}}><span style={{opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}}>●</span> REC&nbsp;&nbsp;TC {tc(frame)}</div>
    <div style={{position: 'absolute', right: 104, top: 58}}>CLAUDE / MOTION REEL 2026</div>
    <div style={{position: 'absolute', left: 104, bottom: 58}}>{String(shot + 1).padStart(2, '0')} / 08&nbsp;&nbsp;{SHOTS[shot]}</div>
    <div style={{position: 'absolute', right: 104, bottom: 64, display: 'flex', gap: 6}}>
      {SHOTS.map((_, i) => <div key={i} style={{width: 34, height: 3, background: R.bone, opacity: 0.25}}>
        <div style={{height: '100%', width: `${clamp((t - CUTS[i]) / (CUTS[i + 1] - CUTS[i])) * 100}%`, background: R.bone}}/>
      </div>)}
    </div>
  </AbsoluteFill>;
};

/** Seeded per-frame film grain. */
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.07}) => <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
  <svg width={W} height={H}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width={W} height={H} filter="url(#grain)"/></svg>
</AbsoluteFill>;
