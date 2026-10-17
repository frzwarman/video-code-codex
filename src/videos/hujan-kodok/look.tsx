import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {clamp, progress} from '../../motion';
import {backOut} from '../showreel/kit';
import song from './song.json';

export const W = 1920; export const H = 1080;
export const K = {sky1: '#7FCBF2', sky2: '#D4F1FF', grass: '#6FCF5B', grass2: '#4FB548', dark: '#2A2340', yellow: '#FFD43B', white: '#FFFFFF', puddle: '#5AB8EA', pink: '#FF8FA3', orange: '#FF7A3D'};
export const FONT = 'Inter';
export type Syl = {line: number; i: number; text: string; wordStart: boolean; t: number; midi: number};
export const SONG = song as {bpm: number; bar: number; syllables: Syl[]; beats: number[]; lines: string[][]};

/** 1 on each beat, decaying after it. */
export const beatPulse = (t: number, decay = 7) => {let last = -1; for (const b of SONG.beats) if (b <= t) last = b; return last < 0 || t > 13.2 ? 0 : Math.exp(-(t - last) * decay);};
/** How open the mouth is: a syllable onset opens it, it closes over the eighth note. */
export const sing = (t: number) => {let v = 0; for (const s of SONG.syllables) {const d = t - s.t; if (d >= 0 && d < 0.4) v = Math.max(v, Math.sin(Math.min(1, d / 0.28) * Math.PI) * (s.i === 7 ? 1 : 0.8));} return v;};

/** Measure syllable widths with the loaded font (canvas), so the bouncing ball lands on real positions. */
export const useWidths = (texts: string[], size: number) => {
  const [handle] = useState(() => delayRender('Measuring lyrics'));
  const [w, setW] = useState<number[] | null>(null);
  useEffect(() => {
    document.fonts.load(`900 ${size}px ${FONT}`).then(() => {
      const g = document.createElement('canvas').getContext('2d')!; g.font = `900 ${size}px ${FONT}`;
      setW([...texts.map((s) => g.measureText(s).width), g.measureText(' ').width]); continueRender(handle);
    }).catch(cancelRender);
  }, [handle, size, texts]);
  return w;
};

/** Chunky kids' title type: SVG text with a thick rounded outline painted under the fill. */
export const Chunky: React.FC<{text: string; size: number; fill: string; x: number; y: number; rotate?: number; scale?: number; anchor?: 'start' | 'middle'}> = ({text, size, fill, x, y, rotate = 0, scale = 1, anchor = 'middle'}) => <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
  <text textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={K.dark} stroke={K.dark} strokeWidth={size * 0.2} strokeLinejoin="round" transform={`translate(${size * 0.03} ${size * 0.06})`}>{text}</text>
  <text textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={K.dark} strokeWidth={size * 0.14} strokeLinejoin="round" paintOrder="stroke">{text}</text>
</g>;

/** Letters that drop in with a squash-and-stretch bounce. */
// Rough Inter Black advances so chunky letters sit evenly without measuring.
const advance = (ch: string) => ('I!.,'.includes(ch) ? 0.45 : 'MW'.includes(ch) ? 1.0 : 0.8);
export const BounceWord: React.FC<{word: string; size: number; fill: string; x: number; y: number; t: number; at: number}> = ({word, size, fill, x, y, t, at}) => <>
  {word.split('').map((ch, i) => {
    const offset = word.slice(0, i).split('').reduce((a, c) => a + advance(c) * size, 0) + advance(ch) * size / 2;
    const p = progress(t, at + i * 0.07, at + i * 0.07 + 0.45); const drop = (1 - backOut(p, 2.4)) * -500; const land = clamp(1 - Math.abs(p - 0.55) * 6);
    const idle = Math.sin((t - at) * 6 + i) * 4 - beatPulse(t - i * 0.03) * 22; // letters hop on the beat
    return <Chunky key={i} text={ch} size={size} fill={fill} x={x + offset} y={y + drop + idle} rotate={(i % 2 ? 1 : -1) * 4 + Math.sin(t * 3 + i) * 2} scale={1 + land * 0.12}/>;
  })}
</>;
