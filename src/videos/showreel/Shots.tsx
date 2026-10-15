import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, progress, seeded} from '../../motion';
import {anim, backOut, Blur, expoIn, expoOut, H, Label, MONO, R, SANS, SERIF, speed, W} from './kit';

type Shot = {t: number};
const center: React.CSSProperties = {display: 'flex', alignItems: 'center', justifyContent: 'center'};

// 01 — every letter of MOTION arrives with its own mechanic on an eighth note.
const mechanics: ((p: number) => {x?: number; y?: number; s?: number; sy?: number; r?: number})[] = [
  (p) => ({y: lerp(-900, 0, backOut(p))}),
  (p) => ({s: backOut(p, 2.4), r: lerp(-180, 0, expoOut(p))}),
  (p) => ({x: lerp(1500, 0, backOut(p, 1.4))}),
  (p) => ({sy: backOut(p, 2.6)}),
  (p) => ({x: lerp(-1500, 0, backOut(p, 1.4))}),
  (p) => ({y: lerp(900, 0, backOut(p))}),
];
export const Kinetic: React.FC<Shot> = ({t}) => {
  const exit = expoIn(progress(t, 1.55, 1.95));
  return <AbsoluteFill style={{background: R.ink, ...center}}>
    <div style={{display: 'flex', fontFamily: SANS, fontWeight: 900, fontSize: 380, letterSpacing: '-0.06em', color: R.bone, transform: `scale(${1 + exit * 0.25})`}}>
      {'MOTION'.split('').map((ch, i) => {
        const at = i * 0.25 - 0.08; const f = (tt: number) => mechanics[i](clamp((tt - at) / 0.38));
        const m = f(t); const prev = f(t - 1 / 60);
        const split = (i % 2 ? 1 : -1) * exit * 900;
        return <Blur key={i} id={`k${i}`} vx={(m.x ?? 0) - (prev.x ?? 0) + speed(() => split, t)} vy={(m.y ?? 0) - (prev.y ?? 0)} style={{transform: `translate(${(m.x ?? 0)}px, ${(m.y ?? 0) + split}px) rotate(${m.r ?? 0}deg) scale(${m.s ?? 1}, ${(m.s ?? 1) * (m.sy ?? 1)})`, transformOrigin: '50% 80%', color: i === 3 ? R.hot : R.bone}}>{ch}</Blur>;
      })}
    </div>
    <div style={{position: 'absolute', left: 260, right: 260, top: 760, height: 3, background: R.hot, transform: `scaleX(${expoOut(progress(t, 1.2, 1.65)) * (1 - exit)})`, transformOrigin: 'left'}}/>
    <Label n={1} text="KINETIC TYPE" t={t} at={1.25} style={{left: 260, top: 790}}/>
  </AbsoluteFill>;
};

// 02 — a weight wave rolls through a variable font.
export const Breathe: React.FC<Shot> = ({t}) => {
  const s = t - 2; const exit = progress(t, 3.72, 3.98);
  const guides = expoOut(progress(s, 0.15, 0.7));
  return <AbsoluteFill style={{background: R.bone, ...center}}>
    {[['CAP HEIGHT', 352], ['X-HEIGHT', 452], ['BASELINE', 640]].map(([name, y], i) => <div key={i} style={{position: 'absolute', left: 0, top: y as number, width: '100%', height: 1, background: R.ink, opacity: 0.18, transform: `scaleX(${guides})`, transformOrigin: i % 2 ? 'right' : 'left'}}>
      <span style={{position: 'absolute', left: 120, top: -26, fontFamily: MONO, fontSize: 16, letterSpacing: '0.2em', color: R.ink, opacity: 0.7}}>{name}</span>
    </div>)}
    <div style={{position: 'absolute', top: 205, left: 430, fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: R.ink, opacity: expoOut(progress(s, 0.3, 0.8)), transform: `translateY(${anim(s, 0.3, 0.8, 30, 0)}px)`}}>type that</div>
    <div style={{display: 'flex', fontFamily: SANS, fontSize: 330, letterSpacing: '-0.045em', color: R.ink, lineHeight: 1, marginTop: 40}}>
      {'BREATHE'.split('').map((ch, i) => {
        const wave = 0.5 + 0.5 * Math.sin((s * 1.15 - i * 0.12) * Math.PI * 2);
        const rise = (tt: number) => lerp(360, 0, expoOut(progress(tt - 2, i * 0.045, i * 0.045 + 0.5)));
        const out = (tt: number) => (i % 2 ? -1 : 1) * 1100 * expoIn(progress(tt, 3.72 + i * 0.015, 3.98));
        const y = rise(t) + out(t);
        return <div key={i} style={{overflow: 'hidden', paddingBottom: 10}}>
          <Blur id={`b${i}`} vy={speed(rise, t) + speed(out, t)} style={{transform: `translateY(${y}px)`, fontWeight: Math.round(lerp(120, 900, wave)), color: i === 4 ? R.hot : R.ink, width: lerp(0.62, 0.86, wave) * 330 * (ch === 'H' || ch === 'R' ? 1.02 : 1), textAlign: 'center'}}>{ch}</Blur>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', right: 160, top: 700, fontFamily: MONO, fontSize: 20, color: R.ink, opacity: 0.6 * (1 - exit), letterSpacing: '0.16em', textAlign: 'right'}}>
      wght {Math.round(lerp(120, 900, 0.5 + 0.5 * Math.sin(s * 1.15 * Math.PI * 2)))}<br/>Inter Variable 100—900
    </div>
    <Label n={2} text="VARIABLE TYPE" t={t} at={2.35} color={R.ink} style={{left: 160, top: 700}}/>
  </AbsoluteFill>;
};

// 04 — a radial wave rewrites a 16×9 tile grid.
export const Systems: React.FC<Shot> = ({t}) => {
  const s = t - 6; const collapse = expoIn(progress(t, 7.3, 7.5));
  return <AbsoluteFill style={{background: R.ink}}>
    {Array.from({length: 16 * 9}, (_, i) => {
      const cx = i % 16; const cy = Math.floor(i / 16); const d = Math.hypot(cx - 7.5, (cy - 4) * 1.15);
      const born = backOut(progress(s, cy * 0.02 + cx * 0.008, cy * 0.02 + cx * 0.008 + 0.3), 2.2);
      const a = progress(s, 0.18 + d * 0.055, 0.5 + d * 0.055); const peak = Math.sin(a * Math.PI);
      const b = Math.sin(progress(s, 0.75 + (9 - d) * 0.04, 1.05 + (9 - d) * 0.04) * Math.PI);
      const scale = (0.32 + peak * 0.72 + a * 0.12 - b * 0.2) * born * (1 - collapse);
      const color = peak > 0.55 ? R.hot : b > 0.5 ? R.violet : R.bone;
      return <div key={i} style={{position: 'absolute', left: cx * 120 + 20, top: cy * 120 + 20, width: 80, height: 80, background: color, borderRadius: `${a * 50}%`, transform: `translate(${(7.5 - cx) * 120 * collapse}px, ${(4 - cy) * 120 * collapse}px) rotate(${a * 90 + b * 45}deg) scale(${scale})`}}/>;
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.05em', color: R.bone, mixBlendMode: 'difference', transform: `scale(${anim(s, 0.1, 0.6, 1.4, 1)})`, opacity: expoOut(progress(s, 0.1, 0.4)) * (1 - collapse)}}>SYSTEMS</div>
    <Label n={4} text={`GENERATIVE GRID — ${16 * 9} CELLS`} t={t} at={6.2} style={{left: 140, top: 140, mixBlendMode: 'difference'}}/>
  </AbsoluteFill>;
};

// 06 — product UI cards in perspective; chart draws, counter climbs, cursor clicks.
const chart = Array.from({length: 13}, (_, i) => 300 - (i * 17 + Math.sin(i * 1.7) * 28 + seeded('chart', i) * 22));
export const Interface: React.FC<Shot> = ({t}) => {
  const s = t - 9.5; const draw = expoOut(progress(s, 0.25, 1.05)); const click = 0.92;
  const card = (i: number) => ({transform: `translateY(${lerp(700, 0, backOut(progress(s, i * 0.08, i * 0.08 + 0.5), 1.3))}px)`, background: R.panel, borderRadius: 28, border: '1px solid #2a2a33', boxShadow: '0 40px 80px #0009', position: 'absolute' as const, padding: 36});
  const path = chart.map((y, i) => `${i ? 'L' : 'M'}${i * 60} ${y}`).join(' ');
  const len = 900; const pressed = Math.max(0, 1 - Math.abs(s - click) * 14);
  const toggled = s > click; const ripple = progress(s, click, click + 0.35);
  const cursor = {x: anim(s, 0.35, 0.9, 1820, 1532, expoOut), y: anim(s, 0.35, 0.9, 1080, 668, expoOut)};
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #1b1b24, ${R.ink} 70%)`}}>
    <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
      <div style={{position: 'absolute', inset: 0, transform: `rotateX(14deg) rotateY(${anim(s, 0, 1.5, -24, -14, expoOut)}deg) translateZ(-80px)`, transformStyle: 'preserve-3d'}}>
        <div style={{...card(0), left: 300, top: 250, width: 820, height: 520}}>
          <div style={{fontFamily: SANS, fontSize: 24, color: R.smoke, fontWeight: 500}}>Retention</div>
          <div style={{fontFamily: SANS, fontSize: 92, fontWeight: 800, color: R.bone, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{(98.6 * expoOut(progress(s, 0.25, 1.1))).toFixed(1)}%</div>
          <svg width={740} height={320} style={{position: 'absolute', left: 40, bottom: 30, overflow: 'visible'}}>
            <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={R.hot} stopOpacity={0.45}/><stop offset="1" stopColor={R.hot} stopOpacity={0}/></linearGradient></defs>
            <path d={`${path} L720 320 L0 320 Z`} fill="url(#area)" opacity={draw}/>
            <path d={path} fill="none" stroke={R.hot} strokeWidth={5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)}/>
            <circle cx={720 * draw} cy={chart[Math.min(12, Math.round(draw * 12))]} r={11} fill={R.bone} opacity={draw > 0.02 ? 1 : 0}/>
          </svg>
        </div>
        <div style={{...card(1), left: 1170, top: 250, width: 440, height: 250, display: 'flex', alignItems: 'flex-end', gap: 18}}>
          {[0.4, 0.7, 0.55, 0.9, 0.65, 1, 0.8].map((v, i) => <div key={i} style={{flex: 1, height: `${v * 100 * backOut(progress(s, 0.35 + i * 0.05, 0.75 + i * 0.05), 2)}%`, background: i === 5 ? R.hot : '#3a3a46', borderRadius: 8}}/>)}
        </div>
        <div style={{...card(2), left: 1170, top: 540, width: 440, height: 230}}>
          <div style={{fontFamily: SANS, fontSize: 28, color: R.bone, fontWeight: 600}}>Publish reel</div>
          <div style={{fontFamily: SANS, fontSize: 20, color: R.smoke, marginTop: 8}}>1920 × 1080 · 60 fps</div>
          <div style={{position: 'absolute', right: 36, bottom: 40, width: 120, height: 64, borderRadius: 32, background: toggled ? R.hot : '#3a3a46', transform: `scale(${1 - pressed * 0.08})`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: 6, left: toggled ? 62 : 6, width: 52, height: 52, borderRadius: 26, background: R.bone, transition: 'none'}}/>
            <div style={{position: 'absolute', left: 60, top: 32, width: 300 * ripple, height: 300 * ripple, marginLeft: -150 * ripple, marginTop: -150 * ripple, borderRadius: '50%', background: '#fff', opacity: 0.35 * (1 - ripple)}}/>
          </div>
        </div>
      </div>
    </div>
    <svg width={48} height={60} viewBox="0 0 24 30" style={{position: 'absolute', left: cursor.x, top: cursor.y, transform: `scale(${1 - pressed * 0.15})`, filter: 'drop-shadow(0 6px 10px #0008)'}}><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L20 16 Z" fill={R.bone} stroke={R.ink} strokeWidth={1.5} strokeLinejoin="round"/></svg>
    <Label n={6} text="INTERFACE / PRODUCT" t={t} at={9.7} style={{left: 140, top: 140}}/>
  </AbsoluteFill>;
};

// 07 — gooey metaballs split, orbit, and merge into one dot.
export const Fluid: React.FC<Shot> = ({t}) => {
  const s = t - 11; const merge = expoIn(progress(s, 0.95, 1.3)); const settle = backOut(progress(s, 1.25, 1.45), 2);
  const blobs = Array.from({length: 7}, (_, i) => {
    const born = i < 1 ? 1 : backOut(progress(s, 0.25 + Math.floor((i - 1) / 2) * 0.35, 0.6 + Math.floor((i - 1) / 2) * 0.35), 1.6);
    const a = i * 0.9 + s * (1.4 + i * 0.12); const r = (180 + 90 * Math.sin(i * 2.3 + s * 2)) * born * (1 - merge);
    return {x: W / 2 + Math.cos(a) * r * 1.5, y: H / 2 + Math.sin(a * 1.3) * r * 0.75, r: i ? 70 + 30 * Math.sin(i) : lerp(130, 90, merge) * (1 + (settle - 1) * 0.3)};
  });
  return <AbsoluteFill style={{background: R.bone}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 300, color: R.ink, opacity: 0.08 + 0.92 * (1 - merge), letterSpacing: '-0.03em', transform: `translateX(${anim(s, 0, 1.5, 80, -80, (p) => p)}px)`}}>fluid</div>
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <filter id="goo"><feGaussianBlur stdDeviation={24}/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"/></filter>
      <g filter="url(#goo)">{blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={R.hot}/>)}</g>
    </svg>
    <Label n={7} text="FLUID / METABALLS" t={t} at={11.15} color={R.ink} style={{left: 140, top: 140}}/>
  </AbsoluteFill>;
};

// 08 — the dot floods the frame, an ink iris opens on the signature.
export const Signature: React.FC<Shot> = ({t}) => {
  const s = t - 12.5; const flood = expoIn(progress(s, 0, 0.2)); const iris = expoOut(progress(s, 0.16, 0.5));
  const push = 1 + progress(s, 0.3, 2.5) * 0.05;
  const tags = ['KINETIC', 'TYPE', '3D', 'SYSTEMS', 'PARTICLES', 'INTERFACE', 'FLUID'];
  return <AbsoluteFill style={{background: R.hot}}>
    <div style={{position: 'absolute', left: W / 2, top: H / 2, width: 180, height: 180, margin: -90, borderRadius: '50%', background: R.hot, transform: `scale(${1 + flood * 14})`}}/>
    <AbsoluteFill style={{background: R.ink, clipPath: `circle(${iris * 1150}px at 50% 50%)`}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, ...center, flexDirection: 'column'}}>
        <div style={{display: 'flex', fontFamily: SANS, fontWeight: 900, fontSize: 290, letterSpacing: '-0.06em', color: R.bone, lineHeight: 0.9}}>
          {'CLAUDE'.split('').map((ch, i) => {
            const y = (tt: number) => lerp(330, 0, expoOut(progress(tt - 12.5, 0.2 + i * 0.04, 0.75 + i * 0.04)));
            return <div key={i} style={{overflow: 'hidden', padding: '0 4px 14px'}}><Blur id={`c${i}`} vy={speed(y, t)} style={{transform: `translateY(${y(t)}px)`}}>{ch}</Blur></div>;
          })}
          <span style={{color: R.hot, transform: `scale(${backOut(progress(s, 0.5, 0.8), 3)})`}}>.</span>
        </div>
        <div style={{width: 1180, height: 6, background: R.hot, marginTop: 10, transform: `scaleX(${expoOut(progress(s, 0.5, 1.0))})`, transformOrigin: 'left'}}/>
        <div style={{display: 'flex', width: 1180, justifyContent: 'space-between', alignItems: 'baseline', marginTop: 30}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: R.bone, opacity: expoOut(progress(s, 0.6, 1.1)), transform: `translateY(${anim(s, 0.6, 1.1, 24, 0)}px)`}}>Motion Designer</div>
          <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: R.smoke, opacity: expoOut(progress(s, 0.8, 1.2))}}>REEL 2026 — 15s @ 60fps — made in code</div>
        </div>
        <div style={{display: 'flex', gap: 34, marginTop: 70, fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: R.bone}}>
          {tags.map((tag, i) => {const p = expoOut(progress(s, 0.75 + i * 0.07, 1.1 + i * 0.07)); return <div key={tag} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}><div style={{width: 10, height: 10, background: i % 2 ? R.violet : R.hot}}/>{tag}</div>;})}
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
