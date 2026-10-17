import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../components/AudioTracks';
import {clamp, lerp, progress, seeded, useStoryTime} from '../../motion';
import type {VideoProps} from '../../types';
import {expoOut} from '../showreel/kit';
import brief from './brief.json';
import {Frog} from './Frog';
import {BounceWord, Chunky, H, K, SONG, useWidths, W} from './look';

const PUDDLE = {x: 1050, y: 860, rx: 300, ry: 62};

const Sky: React.FC<{t: number}> = ({t}) => <>
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${K.sky1}, ${K.sky2} 75%)`}}/>
  {[[220, 170, 1.0], [760, 110, 0.8], [1350, 190, 1.15], [1750, 90, 0.7], [520, 300, 0.6]].map(([x, y, s], i) => <div key={i} style={{position: 'absolute', left: ((x + t * (14 + i * 4)) % 2200) - 200, top: y, transform: `scale(${s})`}}>
    {[[0, 30, 90], [70, 0, 110], [160, 25, 95], [90, 45, 100]].map(([dx, dy, r], k) => <div key={k} style={{position: 'absolute', left: dx, top: dy, width: r, height: r, borderRadius: '50%', background: '#F4FAFF', boxShadow: 'inset -10px -12px 0 #DCEBF5'}}/>)}
  </div>)}
</>;

const Ground: React.FC<{t: number}> = ({t}) => {
  const ripples = useMemo(() => SONG.beats.map((b, i) => ({at: b + 0.05, x: PUDDLE.x + (seeded('rip', i) - 0.5) * PUDDLE.rx * 1.2, y: PUDDLE.y + (seeded('rip', i, 'y') - 0.5) * PUDDLE.ry * 0.8})), []);
  const splash = progress(t, 12.6, 14.2);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <ellipse cx={420} cy={1180} rx={900} ry={360} fill={K.grass2}/>
    <ellipse cx={1500} cy={1200} rx={1000} ry={380} fill={K.grass}/>
    {Array.from({length: 26}, (_, i) => {const x = 60 + i * 72; const y = 930 + Math.sin(i * 1.7) * 40; return <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 2 + i) * 6})`}><path d="M0 0 Q -6 -26 -2 -40 M0 0 Q 6 -22 10 -34" stroke="#3E9E3A" strokeWidth={6} fill="none" strokeLinecap="round"/></g>;})}
    <ellipse cx={PUDDLE.x} cy={PUDDLE.y} rx={PUDDLE.rx} ry={PUDDLE.ry} fill={K.puddle} opacity={0.9}/>
    <ellipse cx={PUDDLE.x - 60} cy={PUDDLE.y - 14} rx={PUDDLE.rx * 0.55} ry={PUDDLE.ry * 0.3} fill="#ffffff" opacity={0.25}/>
    {ripples.map((r, i) => {const p = progress(t, r.at, r.at + 0.9); return p > 0 && p < 1 ? <ellipse key={i} cx={r.x} cy={r.y} rx={10 + p * 70} ry={(10 + p * 70) * 0.22} fill="none" stroke="#ffffff" strokeWidth={4} opacity={1 - p}/> : null;})}
    {[0, 0.15, 0.3].map((d, k) => {const p = clamp(splash - d); return p > 0 && p < 1 ? <ellipse key={'s' + k} cx={PUDDLE.x - 40} cy={PUDDLE.y} rx={40 + p * 380} ry={(40 + p * 380) * 0.2} fill="none" stroke="#ffffff" strokeWidth={8 - k * 2} opacity={1 - p}/> : null;})}
    {Array.from({length: 14}, (_, i) => {const p = progress(t, 12.6, 13.4); if (p <= 0 || p >= 1) return null; const a = -Math.PI * (0.15 + 0.7 * seeded('spl', i)); const v = 300 + seeded('spl', i, 'v') * 260; return <circle key={'d' + i} cx={PUDDLE.x - 40 + Math.cos(a) * v * p} cy={PUDDLE.y + Math.sin(a) * v * p + 600 * p * p} r={9 + (i % 3) * 3} fill="#E8F7FF"/>;})}
  </svg>;
};

const Rain: React.FC<{t: number}> = ({t}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
  {Array.from({length: 130}, (_, i) => {const speed = 900 + seeded('rain', i) * 500; const y = ((seeded('rain', i, 'y') * (H + 200) + t * speed) % (H + 200)) - 100; const x = seeded('rain', i, 'x') * (W + 200) - 100 - y * 0.12; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 46} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.55}/>;})}
</svg>;

// Sing-along: current line with per-syllable highlight and a bouncing ball measured against the real font.
const SIZE = 96;
const Lyrics: React.FC<{t: number}> = ({t}) => {
  const texts = useMemo(() => SONG.syllables.map((s) => s.text), []);
  const widths = useWidths(texts, SIZE);
  if (!widths) return null;
  const space = widths[widths.length - 1];
  const lineIdx = clamp(Math.floor((t - SONG.bar) / SONG.bar), 0, 3); const visible = t >= SONG.bar - 0.2 && t < 12.2;
  const sylls = SONG.syllables.filter((s) => s.line === lineIdx);
  const layout = sylls.map((s) => ({s, w: widths[SONG.syllables.indexOf(s)], gap: s.i > 0 && s.wordStart ? space * 1.3 + SIZE * 0.16 : 0}));
  const total = layout.reduce((a, l) => a + l.w + l.gap, 0); let x = W / 2 - total / 2;
  const pos = layout.map((l) => {x += l.gap; const p = {...l, x, cx: x + l.w / 2}; x += l.w; return p;});
  const k = sylls.filter((s) => s.t <= t).length - 1; const eighth = SONG.bar / 8;
  const from = k < 0 ? pos[0].cx - 160 : pos[k].cx; const to = k < 0 ? pos[0].cx : pos[Math.min(k + 1, 7)].cx;
  const ph = k < 0 ? progress(t, sylls[0].t - eighth, sylls[0].t) : k >= 7 ? 0 : progress(t, sylls[k].t, sylls[k].t + eighth);
  const ballX = lerp(from, to, ph); const ballY = 840 - Math.sin(ph * Math.PI) * 70 - (k >= 7 ? Math.abs(Math.sin((t - sylls[7].t) * 8)) * 30 : 0);
  const enter = expoOut(progress(t, lineIdx * SONG.bar + SONG.bar - 0.2, lineIdx * SONG.bar + SONG.bar + 0.1));
  const next = SONG.lines[lineIdx + 1];
  return visible ? <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <rect x={W / 2 - total / 2 - 50} y={850} width={total + 100} height={130} rx={65} fill="#ffffff" opacity={0.35 * enter}/>
    <g transform={`translate(0 ${(1 - enter) * 60})`} opacity={enter}>
      {pos.map((p, i) => <Chunky key={i} text={p.s.text} size={SIZE} fill={p.s.t <= t ? K.yellow : K.white} x={p.x} y={950} anchor="start" scale={1 + Math.max(0, 0.12 - (t - p.s.t) * 0.4) * (p.s.t <= t ? 1 : 0)}/>)}
      <ellipse cx={ballX} cy={955} rx={22} ry={6} fill={K.dark} opacity={0.25}/>
      <circle cx={ballX} cy={ballY} r={20} fill={K.orange} stroke={K.dark} strokeWidth={5}/>
      <circle cx={ballX - 6} cy={ballY - 7} r={6} fill="#ffffff" opacity={0.8}/>
    </g>
    {next && <text x={W / 2} y={1050} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={K.dark} opacity={0.55 * enter}>{next.reduce((a, s, i) => a + (i > 0 && SONG.syllables.find((y) => y.line === lineIdx + 1 && y.i === i)?.wordStart ? ' ' : '') + s, '')}</text>}
  </svg> : null;
};

export const Video: React.FC<VideoProps> = (props) => {
  const t = useStoryTime(brief.duration); const {width, height} = useVideoConfig(); const fit = Math.min(width / W, height / H);
  const toLogo = expoOut(progress(t, 2.15, 2.6)); const outro = t >= 12.6;
  return <AbsoluteFill style={{background: K.sky2, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', transform: `scale(${fit})`, flexShrink: 0}}>
      <Sky t={t}/>
      <Ground t={t}/>
      <Frog t={t} quality={props.quality} x={3.6}/>
      <Rain t={t}/>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${lerp(0, 40, toLogo)} ${lerp(0, -10, toLogo)}) scale(${lerp(1, 0.38, toLogo)})`} opacity={outro ? 1 - progress(t, 12.6, 12.9) : 1}>
          <BounceWord word="HUJAN" size={200} fill={K.yellow} x={180} y={360} t={t} at={-1.0}/>
          <BounceWord word="TURUN" size={200} fill={K.white} x={180} y={590} t={t} at={-0.85}/>
        </g>
        {outro && <>
          <BounceWord word="MARI" size={120} fill={K.white} x={100} y={230} t={t} at={12.8}/>
          <BounceWord word="BERNYANYI!" size={120} fill={K.yellow} x={100} y={385} t={t} at={13.1}/>
        </>}
      </svg>
      <Lyrics t={t}/>
    </div>
    <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={0.3}/>
  </AbsoluteFill>;
};
