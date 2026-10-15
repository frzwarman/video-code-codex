import React from 'react';
import {AbsoluteFill} from 'remotion';
import {lerp, progress, seeded, smooth} from '../../motion';
import {backOut, expoOut, Label} from '../showreel/kit';
import {Aside, Face, Headline, Mono, MONO, SANS, SERIF, Stars, VW, Y, yawnEnv, YawnWord} from './look';

type Shot = {t: number};
const bg = (a: string, b: string = Y.deep) => `radial-gradient(circle at 50% 35%, ${a}, ${b} 75%)`;
const Moon: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><defs><mask id="moonM"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="38" r="40" fill="#000"/></mask></defs><circle cx="50" cy="50" r="44" fill={Y.cream} mask="url(#moonM)"/></svg>;

// 01 — cover: a giant mid-yawn YAWN on frame 0; TRY NOT TO slams in above.
export const Hook: React.FC<Shot> = ({t}) => <AbsoluteFill style={{background: bg('#1b2350')}}>
  <Stars t={t}/>
  <Moon size={180} style={{position: 'absolute', right: 120, top: 170, opacity: 0.9}}/>
  <Headline lines={['TRY NOT TO']} t={t} at={-1} out={3.25} size={150} color={Y.lavender} top={470}/>
  <YawnWord text="YAWN" t={t} at={-1.2} size={270} top={660} len={3.2} stagger={0.08} accent={1}/>
  <Aside text="while you watch this" t={t} at={1.4} top={1300} color={Y.peach} size={62}/>
</AbsoluteFill>;

// 02 — a wall of the word: a yawn wave rolls through it.
export const WordWall: React.FC<Shot> = ({t}) => <AbsoluteFill style={{background: bg('#161c40')}}>
  {Array.from({length: 46}, (_, i) => {
    const x = seeded('wall', i) * 900; const y = 280 + seeded('wall', i, 'y') * 1200; const size = 28 + Math.floor(seeded('wall', i, 's') * 5) * 26;
    const d = Math.hypot(x - 450, y - 900) / 900; const y0 = yawnEnv(t - 4.1 - d * 1.6, 1.6);
    const c = [Y.lavender, Y.cream, Y.peach, Y.teal][i % 4];
    return <div key={i} style={{position: 'absolute', left: x, top: y, fontFamily: i % 3 ? SANS : SERIF, fontStyle: i % 3 ? 'normal' : 'italic', fontWeight: i % 3 ? 900 : 400, fontSize: size, color: c, opacity: 0.25 + y0 * 0.6 + 0.15 * expoOut(progress(t, 3.6 + i * 0.01, 4 + i * 0.01)), transform: `scale(${1 + y0 * 0.1}, ${1 + y0 * 0.7})`, transformOrigin: '0 100%'}}>yawn</div>;
  })}
  <div style={{position: 'absolute', left: 60, right: 60, top: 760, padding: '36px 0', background: '#070A1Acc', borderRadius: 30}}>
    <Headline lines={['JUST READING', 'THE WORD…']} t={t} at={3.7} out={8.8} size={120} color={Y.cream} accent={1} accentColor={Y.peach} top={0}/>
  </div>
  <Label n={2} text="PROVINE 1986 · READING TRIGGERS IT" t={t} at={4.4} style={{left: 60, top: 1500}}/>
</AbsoluteFill>;

// 03 — lab cards: normal air vs pure oxygen, same yawns.
export const Oxygen: React.FC<Shot> = ({t}) => {
  const s = t - 9; const bar = expoOut(progress(s, 1.6, 3.2));
  return <AbsoluteFill style={{background: bg('#14204a')}}>
    <Headline lines={['NOT', 'OXYGEN.']} t={t} at={9.15} out={15.75} size={190} accent={1} accentColor={Y.teal} color={Y.cream} top={230}/>
    {[['NORMAL AIR', '21% O₂', Y.lavender], ['PURE OXYGEN', '100% O₂', Y.teal]].map(([name, sub, c], k) => {const p = backOut(progress(s, 0.4 + k * 0.15, 0.9 + k * 0.15), 1.5); return <div key={k} style={{position: 'absolute', left: 80 + k * 470, top: 720, width: 450, height: 620, borderRadius: 30, background: '#ffffff0d', border: `2px solid ${c}`, overflow: 'hidden', transform: `translateY(${(1 - p) * 500}px)`}}>
      {k === 1 && Array.from({length: 18}, (_, i) => {const life = 2 + (i % 4) * 0.5; const ph = ((s + i * 0.31) % life) / life; return <div key={i} style={{position: 'absolute', left: 30 + (i * 53) % 390, top: 600 - ph * 640, width: 14 + (i % 3) * 8, height: 14 + (i % 3) * 8, borderRadius: '50%', border: `2px solid ${Y.teal}`, opacity: Math.sin(ph * Math.PI) * 0.7}}/>;})}
      <div style={{position: 'absolute', left: 30, top: 30, fontFamily: MONO, fontSize: 22, letterSpacing: '0.16em', color: c as string}}>{name}</div>
      <div style={{position: 'absolute', left: 30, top: 66, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: Y.cream}}>{sub}</div>
      <div style={{position: 'absolute', left: 30, bottom: 30, right: 30, height: 360, display: 'flex', alignItems: 'flex-end', gap: 16}}>
        <div style={{flex: 1, height: `${80 * bar}%`, borderRadius: 14, background: c as string}}/>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.14em', color: '#ffffffaa', width: 120}}>YAWNS</div>
      </div>
    </div>;})}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: Y.teal, transform: `scale(${backOut(progress(s, 3.3, 3.6), 2.5)})`}}>= SAME</div>
    <Label n={3} text="PROVINE, TATE & GELDMACHER 1987" t={t} at={10} style={{left: 60, top: 1490}}/>
  </AbsoluteFill>;
};

// 05 — two stopwatches race in real time: mouse under a second, human about six.
const Watch: React.FC<{elapsed: number; label: string; color: string; x: number}> = ({elapsed, label, color, x}) => <div style={{position: 'absolute', left: x, top: 720, width: 420, textAlign: 'center'}}>
  <svg width={380} height={380} viewBox="0 0 100 100">
    <circle cx={50} cy={52} r={42} fill="#ffffff0a" stroke={Y.cream} strokeOpacity={0.4} strokeWidth={2}/>
    <rect x={45} y={3} width={10} height={6} rx={2} fill={Y.cream} opacity={0.6}/>
    {Array.from({length: 12}, (_, i) => <line key={i} x1={50} y1={14} x2={50} y2={18} stroke={Y.cream} strokeOpacity={0.5} strokeWidth={1.5} transform={`rotate(${i * 30} 50 52)`}/>)}
    <path d={`M50 52 L50 10 A42 42 0 ${elapsed / 10 > 0.5 ? 1 : 0} 1 ${50 + Math.sin(elapsed / 10 * Math.PI * 2) * 42} ${52 - Math.cos(elapsed / 10 * Math.PI * 2) * 42} Z`} fill={color} opacity={0.35}/>
    <line x1={50} y1={52} x2={50 + Math.sin(elapsed / 10 * Math.PI * 2) * 36} y2={52 - Math.cos(elapsed / 10 * Math.PI * 2) * 36} stroke={color} strokeWidth={3} strokeLinecap="round"/>
  </svg>
  <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, color: Y.cream, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em'}}>{elapsed.toFixed(1)}s</div>
  <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', color}}>{label}</div>
</div>;
export const Stopwatch: React.FC<Shot> = ({t}) => {
  const run = Math.max(0, t - 24.4);
  return <AbsoluteFill style={{background: bg('#1a1f47')}}>
    <Headline lines={['BIGGER BRAIN,', 'LONGER YAWN']} t={t} at={24.15} out={30.75} size={120} accent={1} accentColor={Y.peach} color={Y.cream} top={240}/>
    <Watch elapsed={Math.min(run, 0.8)} label="MOUSE" color={Y.lavender} x={70}/>
    <Watch elapsed={Math.min(run, 6.5)} label="HUMAN" color={Y.peach} x={590}/>
    <div style={{position: 'absolute', left: 140, top: 1310, opacity: run > 0.8 ? 1 : 0, transform: `scale(${backOut(progress(run, 0.8, 1.1), 2.4)})`, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: Y.lavender}}>DONE ✓</div>
    <div style={{position: 'absolute', left: 660, top: 1250}}><Face open={yawnEnv(run, 6.5)} size={140}/></div>
    <Label n={5} text="GALLUP ET AL. 2016 · 19 SPECIES" t={t} at={25} style={{left: 60, top: 1490}}/>
  </AbsoluteFill>;
};

// 06 — contagion: a yawn propagates through a crowd of faces; about half catch it.
export const Contagion: React.FC<Shot> = ({t}) => {
  const cols = 7, rows = 9; let caught = 0; const total = cols * rows;
  const faces = Array.from({length: total}, (_, i) => {const cx = i % cols, cy = Math.floor(i / cols); const d = Math.hypot(cx - 3, cy - 4); const catches = i === 31 || seeded('catch', i) < 0.5; const at = 31.6 + d * 0.42; const hit = catches && t >= at; if (hit) caught++; return {cx, cy, open: catches ? yawnEnv(t - at, 2.2) : 0, hit};});
  return <AbsoluteFill style={{background: bg('#151b44')}}>
    <Headline lines={['IT SPREADS.']} t={t} at={31.15} out={38.75} size={150} color={Y.cream} top={230}/>
    {faces.map((f, i) => <Face key={i} open={f.open} size={118} tone={f.hit ? Y.peach : Y.cream} style={{position: 'absolute', left: 60 + f.cx * 140, top: 430 + f.cy * 112, opacity: f.hit ? 1 : 0.4}}/>)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 90, color: Y.peach, fontVariantNumeric: 'tabular-nums'}}>{Math.round(caught / total * 100)}% CAUGHT</div>
  </AbsoluteFill>;
};

// 07 — network: yawn pulses reach family first, strangers last (and weaker).
const ring = [{g: 'FAMILY', n: 3, r: 230, arrive: 40.2, c: Y.peach, w: 10}, {g: 'FRIENDS', n: 3, r: 330, arrive: 40.8, c: Y.lavender, w: 6}, {g: 'STRANGERS', n: 4, r: 420, arrive: 41.5, c: Y.grey, w: 2}];
export const Network: React.FC<Shot> = ({t}) => {
  const cx = 540, cy = 960;
  return <AbsoluteFill style={{background: bg('#141a42')}}>
    <Headline lines={['FAMILY', 'FIRST.']} t={t} at={39.15} out={45.75} size={160} accent={1} accentColor={Y.peach} color={Y.cream} top={230}/>
    <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {ring.flatMap((g, gi) => Array.from({length: g.n}, (_, k) => {const a = -Math.PI / 2 + (gi * 0.7 + k * (Math.PI * 2 / g.n)); const x = cx + Math.cos(a) * g.r, y = cy + Math.sin(a) * g.r * 0.95; const p = progress(t, 39.6, g.arrive); const draw = expoOut(progress(t, 39.4 + gi * 0.1, 39.9 + gi * 0.1));
        return <g key={`${gi}-${k}`}><line x1={cx} y1={cy} x2={lerp(cx, x, draw)} y2={lerp(cy, y, draw)} stroke={g.c} strokeWidth={g.w} strokeOpacity={0.5} strokeLinecap="round"/>
          {p > 0 && p < 1 && <circle cx={lerp(cx, x, p)} cy={lerp(cy, y, p)} r={6 + g.w} fill={g.c}/>}</g>;}))}
    </svg>
    {ring.flatMap((g, gi) => Array.from({length: g.n}, (_, k) => {const a = -Math.PI / 2 + (gi * 0.7 + k * (Math.PI * 2 / g.n)); const x = cx + Math.cos(a) * g.r, y = cy + Math.sin(a) * g.r * 0.95; const catches = gi < 2 || k % 2 === 0;
      return <Face key={`f${gi}-${k}`} open={catches ? yawnEnv(t - g.arrive, 2) : 0} size={gi === 2 ? 70 : 92} tone={gi === 0 ? Y.peach : gi === 1 ? Y.lavender : '#9aa0c4'} style={{position: 'absolute', left: x - (gi === 2 ? 35 : 46), top: y - (gi === 2 ? 35 : 46), transform: `scale(${backOut(progress(t, 39.5 + gi * 0.12, 39.9 + gi * 0.12), 1.8)})`}}/>;}))}
    <Face open={yawnEnv(t - 39.6, 2)} size={130} tone={Y.cream} style={{position: 'absolute', left: cx - 65, top: cy - 65}}/>
    <div style={{position: 'absolute', left: cx - 40, top: cy + 70, fontFamily: MONO, fontSize: 22, letterSpacing: '0.2em', color: Y.cream}}>YOU</div>
    <div style={{position: 'absolute', left: 60, top: 1430, display: 'flex', gap: 30, fontFamily: MONO, fontSize: 20, letterSpacing: '0.16em'}}>{ring.map((g) => <span key={g.g} style={{color: g.c}}>● {g.g}</span>)}</div>
    <Label n={7} text="NORSCIA & PALAGI 2011" t={t} at={40} style={{left: 60, top: 1490}}/>
  </AbsoluteFill>;
};

// 08 — age ruler: the "catches yawns" switch flips around four to five.
export const Kids: React.FC<Shot> = ({t}) => {
  // age reaches 4.5 at ≈48.67 s, on the switch click
  const age = lerp(0, 8, smooth(progress(t, 46.4, 50.6))); const on = age >= 4.5; const flip = backOut(progress(t, 48.6, 48.9), 2);
  return <AbsoluteFill style={{background: bg('#1a2152')}}>
    <Headline lines={['NOT YET,', 'KID.']} t={t} at={46.15} out={51.75} size={160} accent={1} accentColor={Y.teal} color={Y.cream} top={230}/>
    <div style={{position: 'absolute', left: 90, right: 90, top: 980, height: 6, background: '#ffffff33', borderRadius: 3}}>
      <div style={{position: 'absolute', left: `${4 / 10 * 100}%`, width: `${1 / 10 * 100}%`, top: -10, height: 26, background: Y.teal, opacity: 0.35, borderRadius: 6}}/>
      {Array.from({length: 11}, (_, k) => <div key={k} style={{position: 'absolute', left: `${k * 10}%`, top: 22, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 22, color: '#ffffffaa'}}>{k}</div>)}
      <div style={{position: 'absolute', left: `${age * 10}%`, top: -170, transform: 'translateX(-50%)'}}><Face open={on ? yawnEnv(t - 48.7, 2) : 0} size={110 + age * 10}/></div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', color: '#ffffffaa'}}>AGE (YEARS)</div>
    <div style={{position: 'absolute', left: 240, top: 1220, display: 'flex', alignItems: 'center', gap: 26}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: Y.cream}}>CATCHES YAWNS</div>
      <div style={{width: 140, height: 72, borderRadius: 36, background: on ? Y.teal : '#ffffff22', position: 'relative'}}><div style={{position: 'absolute', top: 6, left: on ? 74 : 6, width: 60, height: 60, borderRadius: 30, background: Y.cream, transform: `scale(${on ? flip : 1})`}}/></div>
    </div>
    <Label n={8} text="ANDERSON & MENO 2003 · HELT ET AL. 2010" t={t} at={47} style={{left: 60, top: 1490}}/>
  </AbsoluteFill>;
};

// 09 — ultrasound-style sector scan; a stylized fetus yawns.
export const Womb: React.FC<Shot> = ({t}) => {
  const open = yawnEnv(t - 54.0, 1.9); const frame = Math.round(t * 60);
  return <AbsoluteFill style={{background: '#000'}}>
    <Headline lines={['BEFORE', 'BIRTH.']} t={t} at={52.15} out={56.75} size={170} color={Y.cream} top={230}/>
    <svg width={VW} height={1100} viewBox="0 0 1080 1100" style={{position: 'absolute', top: 560}}>
      <defs>
        <clipPath id="fan"><path d="M540 40 L120 760 A 520 520 0 0 0 960 760 Z"/></clipPath>
        <filter id="speckle"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 61}/><feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0.9 -0.2"/></filter>
        <filter id="soft"><feGaussianBlur stdDeviation={3}/></filter>
      </defs>
      <g clipPath="url(#fan)">
        <rect width={1080} height={1100} fill="#0b0b0b"/>
        <rect width={1080} height={1100} filter="url(#speckle)" opacity={0.35}/>
        <g filter="url(#soft)" opacity={0.92}>
          <ellipse cx={540} cy={560} rx={330} ry={250} fill="none" stroke="#bdbdbd" strokeWidth={10} opacity={0.5}/>
          <circle cx={460} cy={470} r={120} fill="#cfcfcf"/>
          <path d="M560 470 C 690 470 760 560 720 660 C 690 740 600 760 540 720 C 500 690 520 600 560 560 Z" fill="#bdbdbd"/>
          <ellipse cx={400} cy={520 + open * 10} rx={16 + open * 10} ry={4 + open * 20} fill="#151515"/>
          <path d="M420 430 Q 440 425 460 432" stroke="#151515" strokeWidth={6} fill="none" opacity={0.7}/>
        </g>
        <rect y={((t * 180) % 900) + 40} width={1080} height={6} fill="#ffffff" opacity={0.06}/>
      </g>
      <text x={60} y={60} fill="#9fd8ff" fontFamily="ui-monospace, Menlo, monospace" fontSize={22} letterSpacing={3}>4D ULTRASOUND · STYLIZED</text>
      <text x={60} y={92} fill="#9fd8ff" fontFamily="ui-monospace, Menlo, monospace" fontSize={22} letterSpacing={3}>REISSLAND ET AL. 2012</text>
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: Y.peach, opacity: open > 0.2 ? 1 : 0.0}}>yawning already</div>
  </AbsoluteFill>;
};

// 10 — the dare, answered; then the cover for a loop.
export const Cta: React.FC<Shot> = ({t}) => <AbsoluteFill style={{background: bg('#1b2350')}}>
  <Stars t={t}/>
  <Headline lines={['HOW MANY', 'TIMES DID', 'YOU YAWN?']} t={t} at={57.15} size={150} accent={2} accentColor={Y.peach} color={Y.cream} top={300}/>
  <Face open={yawnEnv(t - 58.0, 2.4)} size={260} style={{position: 'absolute', left: 410, top: 860}}/>
  <Aside text="be honest — tell me below" t={t} at={58.2} top={1170} color={Y.lavender} size={60}/>
  <div style={{position: 'absolute', left: VW / 2 - 30, top: 1260 + Math.abs(Math.sin((t - 57) * 5)) * 26, opacity: expoOut(progress(t, 58.6, 58.9))}}><svg width={60} height={80} viewBox="0 0 24 32"><path d="M12 2 V28 M3 19 L12 28 L21 19" stroke={Y.lavender} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
  <Mono text="EDUCATIONAL · NOT MEDICAL ADVICE" t={t} at={57.5} top={1600} color="#ffffff55" size={18}/>
</AbsoluteFill>;
