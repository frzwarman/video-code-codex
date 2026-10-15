import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original 120 BPM synthesis for the showreel. Deterministic noise (mulberry32), no samples.
const rate = 48000; const duration = 15; const length = rate * duration; const tau = Math.PI * 2;
const beat = 0.5; const cuts = [2, 4, 6, 7.5, 9.5, 11, 12.5];
const score = [new Float64Array(length), new Float64Array(length)];
const fx = [new Float64Array(length), new Float64Array(length)];
let seed = 0x5eed;
const noise = () => {seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 2147483648 - 1;};
const add = (track, i, v, pan) => {if (i >= 0 && i < length) {track[0][i] += v * Math.sqrt((1 - pan) / 2); track[1][i] += v * Math.sqrt((1 + pan) / 2);}};

function kick(track, at, gain = 1) {
  let phase = 0;
  for (let k = 0; k < 0.45 * rate; k++) {const t = k / rate; phase += tau * (45 + 110 * Math.exp(-t * 28)) / rate; add(track, Math.round(at * rate) + k, Math.sin(phase) * Math.exp(-t * 7) * gain, 0);}
}
// Band-limited noise burst: one-pole high-pass then low-pass.
function hiss(track, at, seconds, gain, hp, lp, decay, pan = 0, attack = 0.002) {
  const a = Math.exp(-tau * hp / rate); const b = Math.exp(-tau * lp / rate); let x1 = 0, h = 0, l = 0;
  for (let k = 0; k < seconds * rate; k++) {
    const t = k / rate; const x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l;
    add(track, Math.round(at * rate) + k, l * gain * Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (seconds - t) / 0.01), pan);
  }
}
function tone(track, at, seconds, f, gain, pan = 0, decay = 4, harmonics = [1, 0.3, 0.12]) {
  for (let k = 0; k < seconds * rate; k++) {
    const t = k / rate; const env = Math.min(1, t / 0.006) * Math.exp(-t * decay) * Math.min(1, (seconds - t) / 0.05);
    add(track, Math.round(at * rate) + k, harmonics.reduce((s, h, n) => s + h * Math.sin(tau * f * (n + 1) * t), 0) * gain * env, pan);
  }
}
// Rising filtered noise into a cut.
function whoosh(end, seconds, gain, pan = 0) {
  const start = end - seconds; let l = 0, h = 0, x1 = 0;
  for (let k = 0; k < seconds * rate; k++) {
    const p = k / (seconds * rate); const lp = 400 + 9000 * p * p; const b = Math.exp(-tau * lp / rate); const a = Math.exp(-tau * 120 / rate);
    const x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l;
    add(fx, Math.round(start * rate) + k, l * gain * Math.pow(p, 2.2), pan * (p * 2 - 1));
  }
}
function impact(at, gain = 1) {kick(fx, at, 0.8 * gain); hiss(fx, at, 0.9, 0.5 * gain, 300, 7000, 5);}

// Drums: four on the floor to the signature, claps on 2 and 4, sixteenth hats with offbeat accents.
for (let n = 0; n < 25; n++) {
  const at = n * beat; kick(score, at, 0.95);
  if (n % 2 === 1) hiss(score, at, 0.25, 0.42, 900, 5000, 18, 0, 0.001);
  for (let s = 0; s < 4; s++) hiss(score, at + s * beat / 4, s === 2 ? 0.16 : 0.05, s === 2 ? 0.16 : 0.07, 7000, 16000, s === 2 ? 14 : 60, s % 2 ? 0.35 : -0.35, 0.0005);
}
// Bass and stabs follow A minor: Am, F, C, G per two-second bar; ducked after each kick.
const roots = [55, 43.65, 65.41, 49]; const chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
for (let n = 0; n < 50; n++) {
  const at = n * beat / 2; if (at >= 12.5) break; const bar = Math.floor(at / 2) % 4;
  tone(score, at, 0.24, roots[bar] * (n % 4 === 3 ? 2 : 1), 0.34, 0, 9, [1, 0.5, 0.33, 0.25, 0.2]);
  if (n % 4 === 2) chords[bar].forEach((f, j) => tone(score, at, 0.32, f * 2, 0.05, (j - 1) * 0.5, 10, [1, 0.45, 0.2, 0.1]));
}
for (let i = 0; i < length; i++) {const t = (i / rate) % beat; const duck = i / rate < 12.5 ? 0.35 + 0.65 * Math.min(1, t / 0.18) : 1; score[0][i] *= duck; score[1][i] *= duck;}
// Signature: sustained chord and final hit.
[220, 261.63, 329.63, 440].forEach((f, j) => tone(score, 12.5, 2.5, f, 0.07, (j - 1.5) * 0.4, 1.1, [1, 0.25, 0.08]));
kick(score, 12.5, 1.1); tone(score, 12.5, 2.5, 55, 0.4, 0, 1.4, [1, 0.3]);

// Effects locked to picture.
cuts.forEach((c, i) => {whoosh(c, 0.4, 0.55, i % 2 ? 1 : -1); impact(c, c === 12.5 ? 1.3 : 0.7);});
impact(0, 1.2);
[0, 0.25, 0.5, 0.75, 1, 1.25].forEach((t, i) => {tone(fx, t, 0.12, 1800 - i * 120, 0.12, (i - 2.5) * 0.25, 30); hiss(fx, t, 0.06, 0.25, 2000, 12000, 50);});
whoosh(9.3, 0.5, 0.5, 1);
tone(fx, 10.42, 0.05, 3200, 0.2, 0.3, 80); hiss(fx, 10.42, 0.03, 0.3, 3000, 14000, 120, 0.3);
[11.25, 11.6, 11.95].forEach((t, i) => tone(fx, t, 0.3, 300 + i * 90, 0.18, (i - 1) * 0.4, 12, [1, 0.2]));
tone(fx, 12.25, 0.25, 180, 0.25, 0, 10, [1]);
tone(fx, 13.0, 1.6, 1567.98, 0.12, 0.1, 2.2, [1, 0.15]); tone(fx, 13.03, 1.6, 2349.32, 0.06, -0.1, 2.6, [1]);

function writeWav(name, track, targetPeak) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(track[0][i]), Math.abs(track[1][i]));
  const gain = peak ? targetPeak / peak : 1; const buffer = Buffer.alloc(44 + length * 4);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22); buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 4, 28); buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) {const fade = Math.min(1, (length - 1 - i) / (rate * 0.6)); for (let c = 0; c < 2; c++) buffer.writeInt16LE(Math.round(Math.tanh(track[c][i] * gain * fade * 1.2) / Math.tanh(1.2) * 32767), 44 + i * 4 + c * 2);}
  fs.writeFileSync(path.join(root, 'public/audio', name), buffer); console.log(`${name}: 48kHz stereo, ${duration}s`);
}
writeWav('showreel-score.wav', score, 0.5); writeWav('showreel-effects.wav', fx, 0.42);
