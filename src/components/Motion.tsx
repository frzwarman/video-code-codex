import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease, envelope, loopPhase, progress, seeded, tween} from '../motion';
import {fonts, palette} from '../theme';
import type {Cue} from '../types';

export const KineticText: React.FC<{text: string; time: number; start?: number; stagger?: number; style?: React.CSSProperties}> = ({text, time, start = 0, stagger = 0.065, style}) => <div style={style}>{text.split(' ').map((word, i) => {
  const p = tween(time, start + i * stagger, start + i * stagger + 0.65);
  return <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', marginRight: '0.22em'}}><span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`, opacity: p}}>{word}</span></span>;
})}</div>;

export const CinematicTitle: React.FC<{lines: string[]; time: number; start?: number; size?: number; accentLine?: number; style?: React.CSSProperties}> = ({lines, time, start = 0, size = 110, accentLine = -1, style}) => <div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: size, lineHeight: 0.99, letterSpacing: '-0.065em', ...style}}>{lines.map((line, i) => <KineticText key={i} text={line} time={time} start={start + i * 0.13} style={{color: i === accentLine ? palette.cyan : palette.paper}} />)}</div>;

export const Glow: React.FC<{color?: string; size?: number; opacity?: number; style?: React.CSSProperties}> = ({color = palette.cyan, size = 600, opacity = 0.16, style}) => <div style={{position: 'absolute', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color}, transparent 66%)`, opacity, pointerEvents: 'none', ...style}} />;

export const ParticleField: React.FC<{count?: number; seed?: string; color?: string; period?: number}> = ({count = 50, seed = 'field', color = palette.cyan, period = 300}) => {
  const frame = useCurrentFrame(); const {width, height} = useVideoConfig();
  const phase = loopPhase(frame, period) * Math.PI * 2;
  return <AbsoluteFill style={{overflow: 'hidden'}}>{Array.from({length: count}, (_, i) => {
    const size = 1.5 + seeded(seed, i, 'size') * 3;
    return <div key={i} style={{position: 'absolute', left: seeded(seed, i) * width + Math.sin(phase + i) * 22, top: seeded(seed, i, 'y') * height + Math.cos(phase + i) * 22, width: size, height: size, background: color, borderRadius: '50%', opacity: 0.12 + 0.32 * (0.5 + Math.sin(phase + i) * 0.5)}} />;
  })}</AbsoluteFill>;
};

export const SceneTransition: React.FC<{time: number; at: number; duration?: number; color?: string}> = ({time, at, duration = 0.5, color = palette.cyan}) => {
  const p = progress(time, at - duration / 2, at + duration / 2);
  if (p <= 0 || p >= 1) return null;
  return <AbsoluteFill style={{background: color, transform: `translateX(${(-1 + p * 2) * 130}%) skewX(-18deg)`, opacity: Math.sin(p * Math.PI) * 0.11, pointerEvents: 'none'}} />;
};

export const Captions: React.FC<{cues: Cue[]; time: number; bottom?: number; fontSize?: number; width?: number}> = ({cues, time, bottom = 230, fontSize = 38, width = 850}) => {
  const cue = cues.find((item) => time >= item.start && time < item.end);
  if (!cue) return null;
  const words = cue.text.split(' '); const p = progress(time, cue.start, cue.end);
  return <div style={{position: 'absolute', bottom, left: '50%', transform: `translateX(-50%) translateY(${(1 - tween(time, cue.start, cue.start + 0.15)) * 8}px)`, width, textAlign: 'center', fontFamily: fonts.body, fontSize, fontWeight: 500, lineHeight: 1.5, color: palette.paper}}><span style={{background: '#070c13e8', boxDecorationBreak: 'clone', padding: '10px 20px', borderRadius: 12}}>{words.map((word, i) => <span key={i} style={{color: i <= Math.floor(p * words.length) ? palette.paper : palette.muted}}>{word}{i < words.length - 1 ? ' ' : ''}</span>)}</span></div>;
};

export const AnimatedDiagram: React.FC<{labels: string[]; time: number; width?: number; accent?: string}> = ({labels, time, width = 800, accent = palette.cyan}) => {
  const step = (width - 130) / Math.max(1, labels.length - 1);
  return <svg width={width} height={200} viewBox={`0 0 ${width} 200`}>
    <path d={`M65 80 H${width - 65}`} stroke={palette.line} strokeWidth={3} />
    <path d={`M65 80 H${width - 65}`} pathLength={1} stroke={accent} strokeWidth={3} strokeDasharray={1} strokeDashoffset={1 - tween(time, 0.2, 2.5)} />
    {labels.map((label, i) => <g key={i} opacity={tween(time, i * 0.3, i * 0.3 + 0.5)}><circle cx={65 + i * step} cy={80} r={28} fill={palette.ink} stroke={accent} strokeWidth={3} /><circle cx={65 + i * step} cy={80} r={6} fill={accent} /><text x={65 + i * step} y={151} textAnchor="middle" fontFamily={fonts.body} fill={palette.paper} fontSize={23}>{label}</text></g>)}
  </svg>;
};

export const AnimatedChart: React.FC<{data: {label: string; value: number}[]; time: number; width?: number; height?: number; unit?: string}> = ({data, time, width = 760, height = 450, unit = ''}) => {
  const max = Math.max(1, ...data.map((d) => d.value)); const step = width / Math.max(1, data.length);
  return <svg width={width} height={height + 90}>
    {[0, 0.25, 0.5, 0.75, 1].map((v) => <line key={v} x1={0} x2={width} y1={height * (1 - v)} y2={height * (1 - v)} stroke={palette.line} />)}
    {data.map((d, i) => {const p = tween(time, i * 0.12, 1.3 + i * 0.12); const h = d.value / max * (height - 55) * p; return <g key={d.label}><rect x={i * step + 18} y={height - h} width={step - 36} height={Math.max(0, h)} rx={10} fill={i % 2 ? palette.blue : palette.cyan} /><text x={i * step + step / 2} y={height - h - 16} textAnchor="middle" fontFamily={fonts.display} fill={palette.paper} fontSize={30}>{Math.round(d.value * p)}{unit}</text><text x={i * step + step / 2} y={height + 42} textAnchor="middle" fontFamily={fonts.body} fill={palette.muted} fontSize={24}>{d.label}</text></g>;})}
  </svg>;
};

export const OrbitDiagram: React.FC<{time: number; size?: number}> = ({time, size = 700}) => <svg width={size} height={size} viewBox="0 0 700 700">
  {[140, 220, 300].map((r, i) => {const angle = time * (0.7 - i * 0.14) + i * 2; return <g key={r}><circle cx={350} cy={350} r={r} fill="none" stroke={palette.line} strokeWidth={2}/><circle cx={350 + Math.cos(angle) * r} cy={350 + Math.sin(angle) * r} r={12 + i * 6} fill={i === 1 ? palette.orange : palette.cyan} /></g>;})}
  <circle cx={350} cy={350} r={48} fill={palette.paper}/>
</svg>;

export const RevealPanel: React.FC<React.PropsWithChildren<{time: number; start?: number; style?: React.CSSProperties}>> = ({children, time, start = 0, style}) => {
  const p = ease(progress(time, start, start + 0.7));
  return <div style={{border: `1px solid ${palette.line}`, borderRadius: 30, padding: 36, background: '#101b24', transform: `translateY(${(1 - p) * 60}px) scale(${0.92 + p * 0.08})`, opacity: clamp(p), ...style}}>{children}</div>;
};

export const SceneLayer: React.FC<React.PropsWithChildren<{time: number; start: number; end: number; fade?: number}>> = ({children, time, start, end, fade = 0.3}) => {
  if (time < start || time >= end) return null;
  return <AbsoluteFill style={{opacity: envelope(time, start, end, fade)}}>{children}</AbsoluteFill>;
};
