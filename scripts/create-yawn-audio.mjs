import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original sleepy lo-fi for the yawn episode: 76 BPM, Rhodes-style chords, dusty drums, vinyl crackle. No samples.
const rate = 48000; const duration = 62; const length = rate * duration; const tau = Math.PI * 2;
const beat = 60 / 76; const cuts = [3.5, 9, 16, 24, 31, 39, 46, 52, 57];
const score = [new Float64Array(length), new Float64Array(length)];
const fx = [new Float64Array(length), new Float64Array(length)];
let seed = 0x7a77;
const noise = () => {seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 2147483648 - 1;};
const add = (tr, i, v, pan) => {if (i >= 0 && i < length) {tr[0][i] += v * Math.sqrt((1 - pan) / 2); tr[1][i] += v * Math.sqrt((1 + pan) / 2);}};
function kick(tr, at, g = 1) {let ph = 0; for (let k = 0; k < 0.35 * rate; k++) {const t = k / rate; ph += tau * (44 + 80 * Math.exp(-t * 25)) / rate; add(tr, Math.round(at * rate) + k, Math.sin(ph) * Math.exp(-t * 9) * g, 0);}}
function hiss(tr, at, sec, g, hp, lp, decay, pan = 0, attack = 0.002) {
  const a = Math.exp(-tau * hp / rate), b = Math.exp(-tau * lp / rate); let x1 = 0, h = 0, l = 0;
  for (let k = 0; k < sec * rate; k++) {const t = k / rate, x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(tr, Math.round(at * rate) + k, l * g * Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.01), pan);}
}
function tone(tr, at, sec, f, g, pan = 0, decay = 3, harm = [1, 0.6, 0.2, 0.1], trem = 0, attack = 0.01, glide = 0) {
  let ph = 0;
  for (let k = 0; k < sec * rate; k++) {const t = k / rate; ph += tau * f * (1 + glide * t / sec) / rate; const env = Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.08) * (1 + trem * Math.sin(tau * 5 * t)); let v = 0; for (let n = 0; n < harm.length; n++) v += harm[n] * Math.sin(ph * (n + 1)); add(tr, Math.round(at * rate) + k, v * g * env, pan);}
}
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]; const roots = [41, 40, 38, 36];
const womb = (t) => t >= 52 && t < 57;

for (let n = 0; n * beat < duration - 0.4; n++) {
  const at = n * beat; const bar = Math.floor(n / 4) % 4; const b4 = n % 4;
  if (!womb(at)) {
    if (b4 === 0 || b4 === 2 || (b4 === 3 && n % 8 === 7)) kick(score, at + (b4 === 3 ? beat / 2 : 0), 0.85);
    if (b4 === 1 || b4 === 3) {hiss(score, at, 0.18, 0.3, 700, 4200, 22, 0, 0.001); tone(score, at, 0.08, 190, 0.08, 0, 30, [1]);}
    for (let s = 0; s < 2; s++) hiss(score, at + s * beat / 2 + (s ? 0.06 : 0), 0.05, s ? 0.07 : 0.045, 6000, 13000, 55, s ? 0.3 : -0.3, 0.0005);
    if (b4 === 0) tone(score, at, beat * 1.8, N(roots[bar]), 0.32, 0, 1.6, [1, 0.35, 0.1]);
    if (b4 === 2) tone(score, at + beat * 0.5, beat * 1.2, N(roots[bar] + (n % 16 < 8 ? 7 : 12)), 0.2, 0, 2.2, [1, 0.3]);
  }
  if (b4 === 0) chords[bar].forEach((m, j) => tone(score, at + j * 0.018, beat * 3.6, N(m), womb(at) ? 0.03 : 0.045, (j - 1.5) * 0.35, 0.9, [1, 0.55, 0.18, 0.08], 0.12, 0.012));
  if (b4 === 2 && n % 8 === 6 && !womb(at)) tone(score, at + beat * 0.5, 0.9, N(chords[bar][3] + 12), 0.03, 0.4, 3, [1, 0.3], 0.1);
}
// Vinyl: low hiss bed and sparse crackle.
for (let t = 0; t < duration; t += 0.5) hiss(score, t, 0.52, 0.012, 2000, 9000, 0, 0, 0.05);
for (let t = 0; t < duration; t += 0.05) if ((noise() + 1) / 2 < 0.22) hiss(score, t + (noise() + 1) * 0.02, 0.004, 0.07 + (noise() + 1) * 0.04, 3000, 14000, 300, noise() * 0.6, 0.0002);

// A yawn: slow filtered inhale rising, brief hold, quick sighing release.
function yawn(at, len = 2.2, g = 0.4, pan = 0) {
  let l = 0, h = 0, x1 = 0; const a = Math.exp(-tau * 90 / rate);
  for (let k = 0; k < len * rate; k++) {
    const p = k / (len * rate); const inhale = p < 0.62; const q = inhale ? p / 0.62 : (p - 0.62) / 0.38;
    const env = inhale ? Math.pow(q, 1.6) : Math.pow(1 - q, 1.4); const lp = inhale ? 300 + 2400 * q : 2700 - 2200 * q;
    const b = Math.exp(-tau * lp / rate); const x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l;
    add(fx, Math.round(at * rate) + k, l * g * env, pan);
  }
  tone(fx, at + len * 0.5, len * 0.45, 160, 0.05, pan, 2, [1, 0.5, 0.3], 0, 0.15, -0.35);
}
const thump = (at, g = 0.5) => {kick(fx, at, g); hiss(fx, at, 0.4, 0.15 * g, 200, 3000, 8);};
cuts.forEach((c) => thump(c, 0.45)); thump(0, 0.7);
yawn(0.5, 2.6, 0.5); [4.4, 5.2, 6.0, 6.8].forEach((t, i) => yawn(t, 1.4, 0.18, (i - 1.5) * 0.4)); yawn(17.0, 2.6, 0.45);
for (let k = 0; k < 13; k++) tone(fx, 24.6 + k * 0.5, 0.03, k % 2 ? 2400 : 2800, 0.08, 0.2, 80, [1]);
tone(fx, 25.45, 0.5, 1568, 0.1, -0.3, 6, [1, 0.2]); tone(fx, 31.0, 0.9, 1047, 0.1, 0.3, 3, [1, 0.2]);
for (let k = 0; k < 14; k++) {const at = 31.6 + k * 0.42 + (noise() + 1) * 0.04; tone(fx, at, 0.12, 500 + (k % 4) * 110, 0.07, ((k % 5) - 2) * 0.3, 18, [1], 0, 0.004, -0.4);}
[40.2, 40.8, 41.5].forEach((t, i) => tone(fx, t, 1.2, [1318.5, 1568, 1760][i], 0.06, (i - 1) * 0.5, 2.5, [1, 0.25]));
tone(fx, 48.6, 0.04, 3000, 0.12, 0, 90, [1, 0.5]); hiss(fx, 48.6, 0.02, 0.2, 2000, 12000, 200);
for (let at = 52.2; at < 56.9; at += 60 / 140) {hiss(fx, at, 0.16, 0.22, 60, 600, 18); hiss(fx, at + 0.12, 0.12, 0.14, 60, 600, 22);}
yawn(54.0, 1.8, 0.2); yawn(58.0, 2.4, 0.4);
tone(fx, 61.3, 1.0, 784, 0.07, 0, 2, [1, 0.3]);

function writeWav(name, tr, peakTarget) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(tr[0][i]), Math.abs(tr[1][i]));
  const g = peakTarget / peak; const buf = Buffer.alloc(44 + length * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(buf.length - 8, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.tanh(tr[c][i] * g * 1.2) / Math.tanh(1.2) * 32767), 44 + i * 4 + c * 2);
  fs.writeFileSync(path.join(root, 'public/yawn', name), buf); console.log(`${name}: 48kHz stereo, ${duration}s`);
}
writeWav('score.wav', score, 0.5); writeWav('effects.wav', fx, 0.45);
