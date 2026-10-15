import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, progress, seeded} from '../../motion';
import {backOut, expoOut, Label} from '../showreel/kit';
import {Aside, beatPulse, beatsBetween, bpmAt, Eq, heartPulse, heartRateAt, heartsBetween, Headline, M, Mono, SANS, VW} from './look';

type Shot = {t: number};

// 01 — cover: THIS SONG is already on frame 0, over bars driven by the real mix.
export const Hook: React.FC<Shot> = ({t}) => <AbsoluteFill style={{background: `radial-gradient(circle at 50% 80%, #3a0f4f, ${M.ink} 70%)`}}>
  <Eq t={t} top={980} height={640} bars={22}/>
  <Headline lines={['THIS SONG']} t={t} at={-1} out={2.75} size={190} color={M.cream} top={260}/>
  <Headline lines={['IS CHANGING', 'YOUR BODY']} t={t} at={0.35} out={2.75} size={140} accent={1} accentColor={M.magenta} color={M.cream} top={470}/>
  <Aside text="right now." t={t} at={1.6} top={800} color={M.lime} size={64}/>
</AbsoluteFill>;

// 04 — monitor UI: the soundtrack's tempo climbs and the illustrative heart trace follows.
const ecg = (x: number) => {const p = ((x % 1) + 1) % 1; return p < 0.08 ? Math.sin(p / 0.08 * Math.PI) * 0.12 : p < 0.12 ? -(p - 0.08) / 0.04 * 0.25 : p < 0.15 ? -0.25 + (p - 0.12) / 0.03 * 1.45 : p < 0.19 ? 1.2 - (p - 0.15) / 0.04 * 1.55 : p < 0.23 ? -0.35 + (p - 0.19) / 0.04 * 0.35 : p > 0.4 && p < 0.55 ? Math.sin((p - 0.4) / 0.15 * Math.PI) * 0.22 : 0;};
export const Trace: React.FC<{t: number; from: number; color: string; width?: number; height?: number}> = ({t, from, color, width = 900, height = 260}) => {
  const hearts = heartsBetween(from - 2, t + 0.001);
  const window = 3.2; const pts: string[] = [];
  for (let k = 0; k <= 180; k++) {
    const tt = t - window + k / 180 * window; const i = hearts.filter((h) => h <= tt).length - 1;
    const y = i < 0 ? 0 : ecg((tt - hearts[i]) / (hearts[i + 1] ? hearts[i + 1] - hearts[i] : 0.8));
    pts.push(`${(k / 180 * width).toFixed(1)},${(height * 0.6 - y * height * 0.45).toFixed(1)}`);
  }
  return <svg width={width} height={height} style={{overflow: 'visible'}}><polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${color})`}}/></svg>;
};
export const Monitor: React.FC<Shot> = ({t}) => {
  const s = t - 15; const hp = heartPulse(t); const card = (k: number) => backOut(progress(s, 0.1 + k * 0.12, 0.6 + k * 0.12), 1.5);
  const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * lerp(0.25, 0.45, progress(s, 0, 8)));
  return <AbsoluteFill style={{background: M.ink}}>
    <Headline lines={['TEMPO UP.', 'HEART UP.']} t={t} at={15.15} out={22.4} size={150} accent={1} accentColor={M.magenta} color={M.cream} top={230}/>
    <div style={{position: 'absolute', left: 90, top: 600, width: 900, transform: `translateY(${(1 - card(0)) * 400}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '0.18em', fontSize: 22, color: M.cyan}}><span>MUSIC TEMPO</span><span>HEART · ILLUSTRATIVE</span></div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: M.cream, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{bpmAt(t)}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <svg width={70} height={64} viewBox="0 0 24 22" style={{transform: `scale(${1 + hp * 0.3})`, filter: `drop-shadow(0 0 ${14 * hp}px ${M.magenta})`}}><path d="M12 21 C 4 14, 0 10, 3 5 C 5 2, 10 2, 12 6 C 14 2, 19 2, 21 5 C 24 10, 20 14, 12 21 Z" fill={M.magenta}/></svg>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: M.magenta, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{heartRateAt(t)}</div>
        </div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 90, top: 880, opacity: card(1)}}><Trace t={t} from={15} color={M.magenta}/></div>
    <div style={{position: 'absolute', left: VW / 2 - 130, top: 1190, width: 260, height: 260, borderRadius: '50%', border: `4px solid ${M.cyan}`, transform: `scale(${(0.65 + breath * 0.35) * card(2)})`, boxShadow: `0 0 40px ${M.cyan}66 inset`}}/>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '0.2em', fontSize: 22, color: M.cyan, opacity: card(2)}}>BREATH</div>
    <Label n={4} text="BERNARDI ET AL. 2006" t={t} at={15.8} style={{left: 60, top: 1500}}/>
  </AbsoluteFill>;
};

// 05 — true silence: inverted frame, the heart slows and dips below where it started.
export const Stop: React.FC<Shot> = ({t}) => {
  const s = t - 23; const riser = progress(s, 4, 5); const shakeX = riser * Math.sin(s * 80) * 18 * riser;
  return <AbsoluteFill style={{background: riser > 0.6 ? lerpHex(M.cream, M.ink, (riser - 0.6) / 0.4) : M.cream, transform: `translateX(${shakeX}px)`}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 330, letterSpacing: '-0.06em', color: M.ink, transform: `scale(${lerp(1.3, 1, expoOut(progress(s, 0, 0.35)))})`, opacity: 1 - riser}}>STOP.</div>
    <Aside text="and they fall" t={t} at={23.5} top={640} color={M.ink} size={64}/>
    <div style={{position: 'absolute', left: 90, top: 860, opacity: 1 - riser}}>
      <div style={{position: 'absolute', left: 0, top: 156, width: 900, borderTop: `3px dashed ${M.magenta}`}}/>
      <div style={{position: 'absolute', left: 0, top: 120, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 20, letterSpacing: '0.16em', color: M.magenta}}>WHERE YOU STARTED · {72} BPM</div>
      <div style={{transform: `translateY(${expoOut(progress(s, 1.5, 4)) * 60}px)`}}><Trace t={t} from={20} color={M.ink}/></div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 150, color: M.ink, fontVariantNumeric: 'tabular-nums', opacity: 1 - riser}}>{heartRateAt(t)}<span style={{fontSize: 44, marginLeft: 12}}>BPM</span></div>
    <Mono text="SILENCE · NO MUSIC" t={t} at={23.4} top={1440} color={M.ink}/>
  </AbsoluteFill>;
};
const lerpHex = (a: string, b: string, p: number) => {const h = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(h(a, i), h(b, i), clamp(p)))).join(',')})`;};

// 07 — beat grid: footprints land exactly on the soundtrack's beat lines.
export const Run: React.FC<Shot> = ({t}) => {
  const s = t - 37; const beats = beatsBetween(36, 44.5); const pxPerSec = 520; const nowX = 300;
  return <AbsoluteFill style={{background: M.ink}}>
    <Headline lines={['STEPS LOCK', 'TO THE BEAT']} t={t} at={37.15} out={43.75} size={140} accent={1} accentColor={M.lime} color={M.cream} top={230}/>
    <div style={{position: 'absolute', left: 0, top: 640, width: VW, height: 520, overflow: 'hidden'}}>
      {beats.map((b, k) => {const x = nowX + (b - t) * pxPerSec; const hit = Math.exp(-Math.abs(t - b) * 10); return <React.Fragment key={k}>
        <div style={{position: 'absolute', left: x, top: 0, width: 4, height: 520, background: t >= b ? M.lime : '#ffffff33', boxShadow: t >= b ? `0 0 ${20 * hit}px ${M.lime}` : 'none'}}/>
        <svg width={70} height={110} viewBox="0 0 20 32" style={{position: 'absolute', left: x - 35, top: k % 2 ? 300 : 110, opacity: t >= b - 0.02 ? 1 : 0.15, transform: `scale(${1 + hit * 0.25}) rotate(${k % 2 ? 8 : -8}deg)`}}><ellipse cx="10" cy="11" rx="7" ry="10" fill={M.cream}/><ellipse cx="10" cy="26" rx="5" ry="5" fill={M.cream}/></svg>
      </React.Fragment>;})}
      <div style={{position: 'absolute', left: nowX - 2, top: 0, width: 4, height: 520, background: M.magenta}}/>
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 1220}}>
      <div style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 22, letterSpacing: '0.18em', color: '#ffffffaa'}}>PERCEIVED EFFORT</div>
      {[['NO MUSIC', 0.82, '#ffffff55'], ['WITH MUSIC', 0.64, M.lime]].map(([label, v, c], k) => {const g = expoOut(progress(s, 1.5 + k * 0.6, 2.4 + k * 0.6)); return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 18}}>
        <div style={{width: 210, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: M.cream}}>{label}</div>
        <div style={{height: 40, width: (v as number) * 640 * g, borderRadius: 10, background: c as string}}/></div>;})}
      <div style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, letterSpacing: '0.14em', color: '#ffffff66', marginTop: 16}}>ILLUSTRATIVE · KARAGEORGHIS · VAN DYCK ET AL. 2015</div>
    </div>
  </AbsoluteFill>;
};

// 08 — a jagged pain line relaxes into a smooth wave.
export const Pain: React.FC<Shot> = ({t}) => {
  const s = t - 44; const calm = expoOut(progress(s, 0.6, 3.6)); const pts: string[] = [];
  for (let k = 0; k <= 120; k++) {const x = k / 120 * 900; const jag = (seeded('pain', k) - 0.5) * 340 * (k % 2 ? 1 : -0.6); const wave = Math.sin(k / 120 * Math.PI * 4 + s * 2) * 70; pts.push(`${x.toFixed(1)},${(200 + lerp(jag, wave, calm)).toFixed(1)}`);}
  const col = calm > 0.5 ? M.cyan : M.magenta;
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${lerpHex('#3a0a1e', '#0b2433', calm)}, ${M.ink})`}}>
    <Headline lines={['LESS PAIN.', 'LESS ANXIETY.']} t={t} at={44.2} out={49.75} size={130} accent={1} accentColor={M.cyan} color={M.cream} top={240}/>
    <svg width={900} height={420} style={{position: 'absolute', left: 90, top: 640, overflow: 'visible'}}><polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 12px ${col})`}}/></svg>
    <Aside text="after surgery, with music" t={t} at={44.8} top={1150} color={M.cream}/>
    <Mono text="HOLE ET AL., THE LANCET, 2015 · 73 TRIALS" t={t} at={45.4} top={1250} color={M.cyan}/>
  </AbsoluteFill>;
};

// 09 — earworm: a chain of notes loops a figure-eight around a head.
export const Earworm: React.FC<Shot> = ({t}) => {
  const s = t - 50; const n = 16; const count = Math.round(lerp(0, 9, expoOut(progress(s, 1.6, 2.6))));
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 52%, #2b1650, ${M.ink} 72%)`}}>
    <Headline lines={['STUCK IN', 'YOUR HEAD?']} t={t} at={50.2} out={55.75} size={150} accent={1} accentColor={M.lime} color={M.cream} top={230}/>
    <svg width={VW} height={900} viewBox="0 0 1080 900" style={{position: 'absolute', top: 560}}>
      <path d="M540 120 C 680 120 760 220 760 360 C 760 430 790 470 820 520 C 830 540 810 560 790 560 L 780 640 C 775 690 730 710 680 700 L 640 690 L 640 800 L 420 800 L 420 640 C 330 590 300 480 320 360 C 340 210 430 120 540 120 Z" fill="#ffffff0d" stroke={M.cream} strokeOpacity={0.35} strokeWidth={3}/>
      {Array.from({length: n}, (_, i) => {const u = s * 0.55 - i * 0.035; const a = u * Math.PI * 2; const x = 540 + Math.sin(a) * 210; const y = 380 + Math.sin(a * 2) * 110; const sc = 1 - i / n * 0.6; const p = beatPulse(t - i * 0.03, 8);
        return <g key={i} transform={`translate(${x} ${y}) scale(${sc * (1 + p * 0.25)})`} opacity={1 - i / n * 0.5}><ellipse cx={0} cy={18} rx={16} ry={12} fill={i % 3 ? M.lime : M.magenta} transform="rotate(-20)"/><rect x={12} y={-30} width={5} height={48} fill={i % 3 ? M.lime : M.magenta}/></g>;})}
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 120, color: M.lime, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{count} IN 10</div>
    <Mono text="GET AN EARWORM EVERY WEEK · LIIKKANEN 2012" t={t} at={52} top={1480} color="#ffffffaa" size={20}/>
  </AbsoluteFill>;
};

// 10 — the question, then the cover again for a loop.
export const Cta: React.FC<Shot> = ({t}) => <AbsoluteFill style={{background: `radial-gradient(circle at 50% 85%, #3a0f4f, ${M.ink} 70%)`}}>
  <Eq t={t} top={1050} height={520} bars={22} opacity={0.9}/>
  <Headline lines={['WHICH SONG', 'GIVES YOU', 'CHILLS?']} t={t} at={56.15} size={150} accent={2} accentColor={M.lime} color={M.cream} top={300}/>
  <Aside text="drop it in the comments" t={t} at={57} top={830} color={M.cyan} size={60}/>
  <div style={{position: 'absolute', left: VW / 2 - 30, top: 920 + Math.abs(Math.sin((t - 56) * 5)) * 26, opacity: expoOut(progress(t, 57.3, 57.6))}}><svg width={60} height={80} viewBox="0 0 24 32"><path d="M12 2 V28 M3 19 L12 28 L21 19" stroke={M.cyan} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
</AbsoluteFill>;
