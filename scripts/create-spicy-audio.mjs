import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original 120 BPM synthesis for spicy-burn. Deterministic noise (mulberry32), no samples.
const rate = 48000; const duration = 62; const length = rate * duration; const tau = Math.PI * 2;
const beat = 0.5; const cuts = [3, 8, 15, 24, 31, 38, 46, 53, 58];
const score = [new Float64Array(length), new Float64Array(length)];
const fx = [new Float64Array(length), new Float64Array(length)];
let seed = 0xc4a1;
const noise = () => {seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 2147483648 - 1;};
const add = (track, i, v, pan) => {if (i >= 0 && i < length) {track[0][i] += v * Math.sqrt((1 - pan) / 2); track[1][i] += v * Math.sqrt((1 + pan) / 2);}};
function kick(track, at, gain = 1) {let ph = 0; for (let k = 0; k < 0.4 * rate; k++) {const t = k / rate; ph += tau * (48 + 120 * Math.exp(-t * 30)) / rate; add(track, Math.round(at * rate) + k, Math.sin(ph) * Math.exp(-t * 8) * gain, 0);}}
function hiss(track, at, seconds, gain, hp, lp, decay, pan = 0, attack = 0.002) {
  const a = Math.exp(-tau * hp / rate), b = Math.exp(-tau * lp / rate); let x1 = 0, h = 0, l = 0;
  for (let k = 0; k < seconds * rate; k++) {const t = k / rate, x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(track, Math.round(at * rate) + k, l * gain * Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (seconds - t) / 0.01), pan);}
}
function tone(track, at, seconds, f, gain, pan = 0, decay = 4, harmonics = [1, 0.3, 0.12], glide = 0) {
  let ph = 0;
  for (let k = 0; k < seconds * rate; k++) {const t = k / rate; ph += tau * f * (1 + glide * t / seconds) / rate; const env = Math.min(1, t / 0.006) * Math.exp(-t * decay) * Math.min(1, (seconds - t) / 0.04); add(track, Math.round(at * rate) + k, harmonics.reduce((s, h, n) => s + h * Math.sin(ph * (n + 1)), 0) * gain * env, pan);}
}
function whoosh(end, seconds, gain, pan = 0) {
  let l = 0, h = 0, x1 = 0; const start = end - seconds, a = Math.exp(-tau * 150 / rate);
  for (let k = 0; k < seconds * rate; k++) {const p = k / (seconds * rate), b = Math.exp(-tau * (500 + 9000 * p * p) / rate), x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(fx, Math.round(start * rate) + k, l * gain * Math.pow(p, 2.2), pan * (p * 2 - 1));}
}
const impact = (at, g = 1) => {kick(fx, at, 0.8 * g); hiss(fx, at, 0.8, 0.45 * g, 300, 7000, 5);};

// Drums and bass: E minor, a Phrygian lean for heat (Em, F, Em, D per two-second bar).
for (let n = 0; n < 124; n++) {
  const at = n * beat; const quiet = at >= 58 && at < 61.5;
  if (!quiet) kick(score, at, 0.9);
  if (n % 2 === 1 && !quiet) hiss(score, at, 0.22, 0.4, 900, 5000, 18, 0, 0.001);
  for (let s = 0; s < 4; s++) if (!quiet) hiss(score, at + s * beat / 4, s === 2 ? 0.15 : 0.05, s === 2 ? 0.14 : 0.06, 7000, 16000, s === 2 ? 14 : 60, s % 2 ? 0.35 : -0.35, 0.0005);
}
const roots = [41.2, 43.65, 41.2, 36.71]; const chords = [[164.81, 196, 246.94], [174.61, 220, 261.63], [164.81, 196, 246.94], [146.83, 185, 220]];
for (let n = 0; n < 248; n++) {
  const at = n * beat / 2; if (at >= 58 && at < 61.5) continue; const bar = Math.floor(at / 2) % 4;
  tone(score, at, 0.22, roots[bar] * (n % 4 === 3 ? 2 : 1), 0.32, 0, 9, [1, 0.5, 0.33, 0.25, 0.2]);
  if (n % 8 === 2) chords[bar].forEach((f, j) => tone(score, at, 0.3, f * 2, 0.045, (j - 1) * 0.5, 10, [1, 0.45, 0.2, 0.1]));
}
for (let i = 0; i < length; i++) {const t = (i / rate) % beat; const d = 0.4 + 0.6 * Math.min(1, t / 0.18); score[0][i] *= d; score[1][i] *= d;}
[164.81, 196, 246.94, 329.63].forEach((f, j) => tone(score, 58, 3.4, f, 0.06, (j - 1.5) * 0.4, 1.0, [1, 0.25]));

// Sizzle bed: sparse crackles throughout, denser on fire beats.
for (let t = 0; t < duration; t += 0.035) {const dense = (t > 24 && t < 31) || t < 3 ? 0.55 : 0.18; if ((noise() + 1) / 2 < dense) hiss(fx, t + (noise() + 1) * 0.015, 0.012, 0.09 + (noise() + 1) * 0.05, 2500, 15000, 220, noise() * 0.8, 0.0003);}
// Picture-locked effects.
cuts.forEach((c, i) => {whoosh(c, 0.38, 0.5, i % 2 ? 1 : -1); impact(c, 0.7);});
impact(0, 1.2); whoosh(62, 0.45, 0.5, 1);
[0.35, 0.5, 0.65, 0.8, 0.95, 1.1, 1.25, 1.4, 1.55, 1.7, 1.85, 2.0, 2.15].forEach((t, i) => tone(fx, t, 0.08, 1500 - i * 40, 0.09, ((i % 5) - 2) * 0.2, 35));
tone(fx, 18.6, 0.9, 1318.5, 0.14, 0, 3, [1, 0.2]);
tone(fx, 21.5, 0.9, 1318.5, 0.14, 0, 3, [1, 0.2]);
for (let k = 0; k < 8; k++) tone(fx, 24.5 + k * 0.25, 0.14, k % 2 ? 880 : 1174.66, 0.1, 0, 6, [1, 0.6, 0.3]);
for (let k = 0; k < 9; k++) tone(fx, 31.6 + k * 0.62, 0.22, 900 + ((k * 37) % 5) * 120, 0.12, ((k % 3) - 1) * 0.5, 14, [1], -0.45);
for (let k = 0; k < 6; k++) tone(fx, 39.2 + k * 1.05, 0.06, 2600 + k * 180, 0.1, 0.2, 60);
hiss(fx, 46.4, 0.9, 0.3, 200, 3000, 4); hiss(fx, 49.2, 0.7, 0.25, 300, 4000, 5, 0.4);
for (let k = 0; k < 6; k++) tone(fx, 53.6 + k * 0.55, 0.16, 2400 + (k % 3) * 400, 0.06, k % 2 ? 0.6 : -0.6, 10, [1, 0.1], 0.6);
tone(fx, 61.5, 0.5, 220, 0.12, 0, 1, [1, 0.4], 1.5);

function writeWav(name, track, targetPeak) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(track[0][i]), Math.abs(track[1][i]));
  const gain = peak ? targetPeak / peak : 1; const buffer = Buffer.alloc(44 + length * 4);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22); buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 4, 28); buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) for (let c = 0; c < 2; c++) buffer.writeInt16LE(Math.round(Math.tanh(track[c][i] * gain * 1.2) / Math.tanh(1.2) * 32767), 44 + i * 4 + c * 2);
  const out = path.join(root, 'public/spicy', name); fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, buffer); console.log(`${name}: 48kHz stereo, ${duration}s`);
}
writeWav('score.wav', score, 0.5); writeWav('effects.wav', fx, 0.42);
