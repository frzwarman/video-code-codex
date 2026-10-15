import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, progress, seeded} from '../../motion';
import {backOut, expoIn, expoOut, Label} from '../showreel/kit';
import {Aside, Embers, Flames, Headline, Mono, P, SANS, SERIF, VH, VW} from './look';

type Shot = {t: number};
const Check: React.FC<{ok: boolean; size?: number; color: string}> = ({ok, size = 44, color}) => <svg width={size} height={size} viewBox="0 0 24 24"><path d={ok ? 'M4 12.5 L9.5 18 L20 6' : 'M5 5 L19 19 M19 5 L5 19'} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChiliIcon: React.FC<{size: number; color?: string}> = ({size, color = P.red}) => <svg width={size} height={size * 1.4} viewBox="0 0 20 28"><path d="M9 6 C14 6 16 10 15 16 C14 22 9 27 4 27 C8 23 9 18 7 12 C6 8 6 6 9 6 Z" fill={color}/><path d="M9 6 C9 3 11 1 13 1" stroke="#3d7a26" strokeWidth={2} fill="none" strokeLinecap="round"/></svg>;

// 01 — the cover: frame 0 is complete (ON FIRE? over flames); the setup line slams in above.
export const Hook: React.FC<Shot> = ({t}) => {
  const caret = expoOut(progress(t, 1.75, 2.15));
  return <AbsoluteFill style={{background: P.red}}>
    <Flames t={t} height={640}/>
    <Headline lines={["YOUR MOUTH", "ISN'T"]} t={t} at={0.3} out={2.75} size={150} color={P.milk} top={300}/>
    <div style={{position: 'absolute', top: 470, right: 150, fontFamily: SERIF, fontStyle: 'italic', fontSize: 66, color: P.yolk, transform: `rotate(-8deg) scale(${caret})`, transformOrigin: 'left bottom'}}>^actually</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 290, letterSpacing: '-0.06em', lineHeight: 0.86, color: P.ink}}>
      {['ON', 'FIRE?'].map((line, i) => <div key={i} style={{transform: `translate(${Math.sin(t * 11 + i * 2) * 4}px, ${Math.sin(t * 13 + i) * 3}px) skewX(${Math.sin(t * 6 + i) * 2}deg)`}}>{line}</div>)}
    </div>
  </AbsoluteFill>;
};

// 04 — a grid of TRPV1 channels: heat opens them at 43 °C, capsaicin opens them at 37 °C.
export const Sensor: React.FC<Shot> = ({t}) => {
  const s = t - 15; const heat = progress(s, 0.4, 3.6); const cool = progress(s, 4.4, 5.1);
  const temp = lerp(lerp(30, 43, heat), 37, cool);
  const openHeat = (d: number) => clamp((progress(s, 3.6 + d * 0.05, 4.0 + d * 0.05)) - progress(s, 4.4, 4.9));
  const dock = (i: number) => progress(s, 5.6 + seeded('dock', i) * 0.8, 6.3 + seeded('dock', i) * 0.8);
  const openCap = (i: number) => backOut(progress(s, 6.3 + seeded('dock', i) * 0.8, 6.6 + seeded('dock', i) * 0.8), 1.8);
  const hot = temp >= 42.9 || s > 6.4;
  return <AbsoluteFill style={{background: P.ink}}>
    <Headline lines={['TRPV1']} t={t} at={15.1} out={23.75} size={200} color={P.milk} top={230}/>
    <Aside text="your heat sensor" t={t} at={15.5} top={440}/>
    <div style={{position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.04em', color: s > 5 ? P.cool : hot ? P.red : P.milk, fontVariantNumeric: 'tabular-nums'}}>{temp.toFixed(1)}°C</div>
    <div style={{position: 'absolute', left: 160, right: 160, top: 700, height: 10, borderRadius: 5, background: '#ffffff22'}}>
      <div style={{width: `${(temp - 30) / 15 * 100}%`, height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${P.cool}, ${P.flame}, ${P.red})`}}/>
      <div style={{position: 'absolute', left: `${13 / 15 * 100}%`, top: -20, width: 3, height: 50, background: P.yolk}}/>
      <div style={{position: 'absolute', left: `${13 / 15 * 100}%`, top: 36, transform: 'translateX(-50%)', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 20, color: P.yolk, letterSpacing: '0.12em'}}>43°C TRIGGER</div>
    </div>
    {Array.from({length: 6 * 7}, (_, i) => {
      const cx = i % 6; const cy = Math.floor(i / 6); const d = Math.hypot(cx - 2.5, cy - 3);
      const open = Math.max(openHeat(d), openCap(i)); const show = backOut(progress(s, 0.1 + i * 0.012, 0.5 + i * 0.012), 1.8);
      const x = 120 + cx * 150; const y = 830 + cy * 92; const gap = open * 26;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: 110, height: 64, transform: `scale(${show})`}}>
        <div style={{position: 'absolute', left: 55 - gap / 2 - 6, top: 8, width: 12 + gap, height: 48, borderRadius: 8, background: open > 0.05 ? (s > 5 ? P.red : P.flame) : 'transparent', boxShadow: open > 0.05 ? `0 0 ${30 * open}px ${s > 5 ? P.red : P.flame}` : 'none', opacity: open}}/>
        <div style={{position: 'absolute', left: -gap / 2, top: 0, width: 52, height: 64, borderRadius: '30px 10px 10px 30px', background: '#5a4a46'}}/>
        <div style={{position: 'absolute', right: -gap / 2, top: 0, width: 52, height: 64, borderRadius: '10px 30px 30px 10px', background: '#5a4a46'}}/>
        {s > 5.4 && <div style={{position: 'absolute', left: 47, top: lerp(-260, 22, expoOut(dock(i))), width: 16, height: 16, borderRadius: 8, background: P.yolk, boxShadow: `0 0 12px ${P.flame}`, opacity: 1 - open * 0.6}}/>}
      </div>;
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 70, letterSpacing: '-0.02em', color: P.red, transform: `rotate(-4deg) scale(${backOut(progress(s, 6.5, 6.8), 3)})`}}>OPEN ANYWAY.</div>
    <Label n={4} text={s < 5 ? 'HEAT → CHANNEL OPENS' : 'CAPSAICIN DOCKS AT 37°C'} t={t} at={15.6} style={{left: 60, top: 1420}}/>
  </AbsoluteFill>;
};

// 06 — the body's fire drill: flush, beading sweat, checklist.
export const Sweat: React.FC<Shot> = ({t}) => {
  const s = t - 31; const flush = expoOut(progress(s, 0, 4));
  const drops = Array.from({length: 9}, (_, k) => {
    const born = 0.6 + k * 0.62; const p = progress(s, born, born + 2.2); const g = backOut(progress(s, born, born + 0.35), 2);
    const x = 180 + ((k * 263) % 720); const y0 = 760 + ((k * 151) % 260);
    return {x: x + Math.sin(k + s) * 6, y: y0 + expoIn(p) * 900, r: (34 + (k % 3) * 12) * g};
  });
  const items = ['SWEAT', 'FLUSH', 'RUNNY NOSE'];
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${lerpColor(P.skin, '#FF6B5A', flush)}, ${lerpColor('#E9A989', P.red, flush)})`}}>
    <Headline lines={['FAKE FIRE', 'DRILL.']} t={t} at={31.15} out={37.75} size={170} color={P.ink} accent={1} accentColor={P.milk} top={230}/>
    <svg width={VW} height={VH} style={{position: 'absolute'}}>
      <filter id="sweatGoo"><feGaussianBlur stdDeviation={14}/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter>
      <g filter="url(#sweatGoo)">{drops.flatMap((d, k) => [<circle key={k} cx={d.x} cy={d.y} r={d.r} fill="#E8FBFF"/>, <circle key={'t' + k} cx={d.x} cy={d.y - d.r * 1.1} r={d.r * 0.55} fill="#E8FBFF"/>])}</g>
      {drops.map((d, k) => <circle key={'h' + k} cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.3} r={d.r * 0.22} fill="#fff" opacity={0.9}/>)}
    </svg>
    <div style={{position: 'absolute', left: 120, top: 1180, display: 'flex', flexDirection: 'column', gap: 26}}>
      {items.map((it, k) => {const p = backOut(progress(s, 1.4 + k * 1.3, 1.8 + k * 1.3), 1.8); return <div key={it} style={{display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - p) * -700}px)`, fontFamily: SANS, fontWeight: 900, fontSize: 72, letterSpacing: '-0.03em', color: P.ink}}>
        <div style={{width: 70, height: 70, borderRadius: 18, background: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check ok color={P.yolk}/></div>{it}</div>;})}
    </div>
    <Aside text="cooling a fire that isn't there" t={t} at={32} top={600} color={P.ink}/>
  </AbsoluteFill>;
};
const lerpColor = (a: string, b: string, p: number) => {const h = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(h(a, i), h(b, i), p))).join(',')})`;};

// 07 — Scoville, honest log scale.
const peppers = [{name: 'BELL PEPPER', v: 0}, {name: 'JALAPEÑO', v: 8000}, {name: 'HABANERO', v: 350000}, {name: 'HOTTEST PEPPERS', v: 2000000, plus: true}, {name: 'PURE CAPSAICIN', v: 16000000}];
export const Scoville: React.FC<Shot> = ({t}) => {
  const s = t - 38; const max = Math.log10(16000001);
  return <AbsoluteFill style={{background: P.ink}}>
    <Embers t={t} count={18} color={P.red}/>
    <Headline lines={['SCOVILLE']} t={t} at={38.1} out={45.75} size={170} top={230}/>
    <Mono text="HEAT UNITS · LOG SCALE" t={t} at={38.6} top={420} color={P.yolk}/>
    {peppers.map((p, k) => {
      const a = 1.2 + k * 1.05; const g = expoOut(progress(s, a, a + 0.8)); const w = Math.log10(p.v + 1) / max * 780 * g;
      const show = backOut(progress(s, a - 0.1, a + 0.3), 1.6);
      return <div key={p.name} style={{position: 'absolute', left: 80, top: 540 + k * 175, opacity: Math.min(1, show * 2), transform: `translateX(${(1 - show) * -200}px)`}}>
        <div style={{fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 24, letterSpacing: '0.16em', color: '#ffffffaa'}}>{p.name}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10}}>
          <div style={{width: Math.max(10, w), height: 54, borderRadius: 12, background: `linear-gradient(90deg, ${P.yolk}, ${k > 2 ? P.red : P.flame})`, boxShadow: k > 2 ? `0 0 30px ${P.red}` : 'none'}}/>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, color: P.milk, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>{Math.round(p.v * g).toLocaleString('en-US')}{p.plus && g > 0.99 ? '+' : ''}</div>
        </div>
      </div>;
    })}
    <div style={{position: 'absolute', right: 90, top: 1350, transform: `scale(${backOut(progress(s, 5.6, 6), 2.4)}) rotate(${Math.sin(s * 8) * 4}deg)`}}><ChiliIcon size={70}/></div>
  </AbsoluteFill>;
};

// 08 — split screen: water spreads capsaicin, milk proteins capture it.
export const MilkWater: React.FC<Shot> = ({t}) => {
  const s = t - 46; const half = VH / 2;
  const wSpread = expoOut(progress(s, 0.3, 2.6)); const mGrab = expoOut(progress(s, 3.1, 5.4));
  const clusters = [[250, 1330], [560, 1290], [850, 1350], [400, 1480], [720, 1490]];
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: half, background: 'linear-gradient(180deg, #0b3a4a, #0e5a6e)', overflow: 'hidden'}}>
      {Array.from({length: 46}, (_, i) => {const a = seeded('wat', i) * Math.PI * 2; const r = 40 + seeded('wat', i, 'r') * 60 + wSpread * (200 + seeded('wat', i, 'r') * 300); return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r * 1.2, top: 560 + Math.sin(a) * r * 0.7, width: 18, height: 18, borderRadius: 9, background: P.red, boxShadow: `0 0 12px ${P.red}`}}/>;})}
      <div style={{position: 'absolute', left: 70, top: 250, display: 'flex', alignItems: 'center', gap: 20, fontFamily: SANS, fontWeight: 900, fontSize: 110, letterSpacing: '-0.04em', color: P.cool}}>WATER <Check ok={false} size={70} color={P.red}/></div>
      <Aside text="just spreads it around" t={t} at={46.6} top={390} color={P.milk}/>
    </div>
    <div style={{position: 'absolute', left: 0, top: half, width: VW, height: half, background: `linear-gradient(180deg, ${P.milk}, #f1e3cf)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 70, top: 70, display: 'flex', alignItems: 'center', gap: 20, fontFamily: SANS, fontWeight: 900, fontSize: 110, letterSpacing: '-0.04em', color: P.ink, opacity: expoOut(progress(s, 2.9, 3.3))}}>MILK <Check ok size={70} color="#1f9d55"/></div>
      <Aside text="proteins and fat pull it away" t={t} at={49.3} top={210} color={P.char}/>
    </div>
    {clusters.map(([x, y], k) => <div key={k} style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 70, background: 'radial-gradient(circle at 35% 35%, #ffffff, #efe2cf)', boxShadow: '0 10px 30px #0002', transform: `scale(${backOut(progress(s, 3.0 + k * 0.1, 3.4 + k * 0.1), 1.8)})`}}/>)}
    {Array.from({length: 40}, (_, i) => {const [cx, cy] = clusters[i % 5]; const a = seeded('milk', i) * Math.PI * 2; const r0 = 160 + seeded('milk', i, 'r') * 200;
      const r = lerp(r0, 30 + (i % 4) * 10, mGrab); return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a + mGrab) * r - 9, top: cy + Math.sin(a + mGrab) * r * 0.8 - 9, width: 18, height: 18, borderRadius: 9, background: P.red, opacity: (s > 2.9 ? 1 : 0) * (1 - mGrab * 0.55)}}/>;})}
    <div style={{position: 'absolute', left: 0, right: 0, top: half - 3, height: 6, background: P.ink}}/>
  </AbsoluteFill>;
};

// 09 — the flock: birds can't feel capsaicin and spread the seeds.
export const Birds: React.FC<Shot> = ({t}) => {
  const s = t - 53;
  return <AbsoluteFill style={{background: `linear-gradient(180deg, #FFB84D, ${P.yolk} 55%, #FFE9A8)`}}>
    <Headline lines={['BIRDS', "CAN'T FEEL", 'IT.']} t={t} at={53.15} out={57.75} size={170} color={P.ink} accent={1} accentColor={P.red} top={230}/>
    {Array.from({length: 14}, (_, i) => {
      const lag = seeded('bird', i) * 1.2; const p = (s - lag) / 4.2; if (p < 0 || p > 1) return null;
      const x = lerp(-200, VW + 200, p) + (i % 4) * 40; const y = 860 + (i % 5) * 110 + Math.sin(p * 6 + i) * 40 - p * 160;
      const flap = Math.sin((s + i) * 14); const sc = 0.7 + seeded('bird', i, 's') * 0.6;
      return <svg key={i} width={120} height={70} viewBox="0 0 60 35" style={{position: 'absolute', left: x, top: y, transform: `scale(${sc})`}}><path d={`M2 ${18 - flap * 12} Q 16 ${10 - flap * 6} 30 20 Q 44 ${10 - flap * 6} 58 ${18 - flap * 12} Q 44 ${18} 30 26 Q 16 18 2 ${18 - flap * 12} Z`} fill={P.ink}/></svg>;
    })}
    {Array.from({length: 22}, (_, i) => {const at = 0.6 + i * 0.17; const d = s - at; if (d < 0) return null; const x0 = 120 + ((i * 211) % 840); return <div key={i} style={{position: 'absolute', left: x0 + d * 60, top: 1000 + (i % 4) * 60 + d * d * 420, width: 12, height: 16, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: P.char, opacity: d < 1.6 ? 1 : 0}}/>;})}
    {[180, 420, 690, 900].map((x, k) => <div key={k} style={{position: 'absolute', left: x, top: 1500 - backOut(progress(s, 2 + k * 0.3, 2.5 + k * 0.3), 1.8) * 60, transform: `rotate(${(k % 2 ? 1 : -1) * 14}deg)`, opacity: progress(s, 2 + k * 0.3, 2.2 + k * 0.3)}}><ChiliIcon size={44} color={k % 2 ? P.red : '#2f6b1f'}/></div>)}
    <Label n={9} text="SEED DISPERSAL" t={t} at={53.6} color={P.ink} style={{left: 60, top: 1650}}/>
  </AbsoluteFill>;
};

// 10 — the question, then a match-cut back to the cover.
export const Cta: React.FC<Shot> = ({t}) => {
  const s = t - 58;
  return <AbsoluteFill style={{background: P.ink}}>
    <Embers t={t} count={30}/>
    <Headline lines={["WHAT'S THE", 'HOTTEST', 'THING', "YOU'VE EATEN?"]} t={t} at={58.1} size={130} accent={1} accentColor={P.red} top={360}/>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', gap: 40}}>
      {[0, 1, 2].map((k) => <div key={k} style={{transform: `scale(${backOut(progress(s, 0.9 + k * 0.15, 1.3 + k * 0.15), 2.5) * (1 + Math.sin(s * 8 + k) * 0.06)}) rotate(${(k - 1) * 12}deg)`}}><ChiliIcon size={90}/></div>)}
    </div>
    <Aside text="tell me in the comments" t={t} at={58.9} top={1250} color={P.yolk} size={58}/>
    <div style={{position: 'absolute', left: VW / 2 - 30, top: 1350 + Math.abs(Math.sin(s * 5)) * 30, opacity: expoOut(progress(s, 1.2, 1.5))}}><svg width={60} height={80} viewBox="0 0 24 32"><path d="M12 2 V28 M3 19 L12 28 L21 19" stroke={P.yolk} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 140, textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, letterSpacing: '0.14em', color: '#ffffff66'}}>EDUCATIONAL · NOT MEDICAL ADVICE</div>
  </AbsoluteFill>;
};
