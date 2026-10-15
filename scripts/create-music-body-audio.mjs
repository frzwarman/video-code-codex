import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original synthesis for music-body. The score demonstrates the script: groove, tempo ramp, true silence, drop.
// Also writes per-frame band energies, beat and heartbeat times so visuals react to the real audio.
const rate = 48000; const duration = 62; const length = rate * duration; const tau = Math.PI * 2; const FPS = 60;
const score = [new Float64Array(length), new Float64Array(length)];
const fx = [new Float64Array(length), new Float64Array(length)];
let seed = 0x6d75;
const noise = () => {seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 2147483648 - 1;};
const add = (tr, i, v, pan) => {if (i >= 0 && i < length) {tr[0][i] += v * Math.sqrt((1 - pan) / 2); tr[1][i] += v * Math.sqrt((1 + pan) / 2);}};
function kick(tr, at, g = 1) {let ph = 0; for (let k = 0; k < 0.38 * rate; k++) {const t = k / rate; ph += tau * (46 + 130 * Math.exp(-t * 32)) / rate; add(tr, Math.round(at * rate) + k, Math.sin(ph) * Math.exp(-t * 8.5) * g, 0);}}
function hiss(tr, at, sec, g, hp, lp, decay, pan = 0, attack = 0.002) {
  const a = Math.exp(-tau * hp / rate), b = Math.exp(-tau * lp / rate); let x1 = 0, h = 0, l = 0;
  for (let k = 0; k < sec * rate; k++) {const t = k / rate, x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(tr, Math.round(at * rate) + k, l * g * Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.01), pan);}
}
function tone(tr, at, sec, f, g, pan = 0, decay = 4, harm = [1, 0.3, 0.12], glide = 0, attack = 0.006, detune = 0) {
  let p1 = 0, p2 = 0;
  for (let k = 0; k < sec * rate; k++) {
    const t = k / rate; const ff = f * (1 + glide * t / sec); p1 += tau * ff * (1 + detune) / rate; p2 += tau * ff * (1 - detune) / rate;
    const env = Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.05);
    let v = 0; for (let n = 0; n < harm.length; n++) v += harm[n] * (Math.sin(p1 * (n + 1)) + (detune ? Math.sin(p2 * (n + 1)) : 0));
    add(tr, Math.round(at * rate) + k, v * g * env * (detune ? 0.5 : 1), pan);
  }
}
const saw = [1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14];
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
// A minor: Am F C G.
const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; const roots = [45, 41, 48, 43];
const melody = [[76, 74, 72, 76], [77, 76, 72, 69], [79, 76, 72, 76], [74, 71, 67, 71]];

// Beat clock: piecewise tempo, the 15–23 s ramp integrated so every kick lands on the grid.
const beats = []; const sections = [[0, 15, 100, 100, 'groove'], [15, 23, 100, 140, 'ramp'], [28, 44, 124, 124, 'drop'], [50, 56, 124, 124, 'earworm'], [56, 61.6, 100, 100, 'groove']];
for (const [a, b, b0, b1, kind] of sections) {
  let phase = 0, t = a; beats.push({t: a, kind, i: 0}); let i = 1;
  while (t < b) {const dt = 1 / rate * 16; phase += (b0 + (b1 - b0) * (t - a) / (b - a)) / 60 * dt; t += dt; if (phase >= i && t < b - 0.05) beats.push({t, kind, i: i++});}
}
beats.forEach((bt, n) => {
  const next = beats[n + 1] && beats[n + 1].kind === bt.kind ? beats[n + 1].t : bt.t + 60 / 124; const len = next - bt.t;
  const bar = Math.floor(bt.i / 4) % 4; const ch = chords[bar]; const drop = bt.kind === 'drop'; const run = drop && bt.t >= 37;
  kick(score, bt.t, drop ? 1 : 0.9);
  if (bt.i % 2 === 1) hiss(score, bt.t, 0.22, 0.38, 900, 5200, 17, 0, 0.001);
  const sub = drop ? 4 : bt.kind === 'earworm' ? 2 : 2;
  for (let s = 0; s < sub; s++) {const off = s * len / sub + (sub === 2 ? len / 2 : 0); if (sub === 2 && s === 1) continue; hiss(score, bt.t + off, 0.05, 0.08, 7000, 16000, 55, s % 2 ? 0.35 : -0.35, 0.0005);}
  if (sub === 4) for (let s = 0; s < 4; s++) hiss(score, bt.t + s * len / 4, 0.04, s === 2 ? 0.1 : 0.06, 7000, 16000, 60, s % 2 ? 0.35 : -0.35, 0.0005);
  // Bass.
  tone(score, bt.t, len * 0.45, N(roots[bar] - 12), 0.3, 0, 6, saw.slice(0, 5));
  if (bt.kind !== 'earworm') tone(score, bt.t + len * 0.75, len * 0.22, N(roots[bar] - (drop ? 0 : 12)), 0.18, 0, 9, saw.slice(0, 4));
  // Harmony and lead.
  if (bt.kind === 'groove' || bt.kind === 'ramp') { if (bt.i % 2 === 0) ch.forEach((m, j) => tone(score, bt.t + len * 0.5, len * 0.4, N(m + 12), 0.035, (j - 1) * 0.5, 12, [1, 0.5, 0.25]));}
  if (drop && !run && bt.i % 4 === 0) ch.forEach((m, j) => tone(score, bt.t, len * 4, N(m + 12), 0.05, (j - 1) * 0.6, 0.6, saw, 0, 0.08, 0.004));
  if (drop && !run) tone(score, bt.t, len * 0.9, N(melody[bar][bt.i % 4]), 0.07, 0.15, 2.5, [1, 0.4, 0.2, 0.1], 0, 0.01, 0.002);
  if (run) for (let s = 0; s < 4; s++) tone(score, bt.t + s * len / 4, len / 4, N(ch[s % 3] + 24), 0.03, s % 2 ? 0.4 : -0.4, 14, [1, 0.3]);
  if (bt.kind === 'earworm') {tone(score, bt.t, len * 0.8, N(melody[bar][bt.i % 4]), 0.08, 0, 3, [1, 0.5, 0.25, 0.12]); tone(score, bt.t + len / 2, len * 0.4, N(melody[bar][(bt.i + 2) % 4]), 0.04, 0.3, 5, [1, 0.3]);}
});
// Calm 44–50: pads and bells, no drums.
for (let k = 0; k < 3; k++) {const at = 44 + k * 2; chords[(k + 1) % 4].forEach((m, j) => tone(score, at, 2.6, N(m), 0.05, (j - 1) * 0.5, 0.7, [1, 0.3, 0.1], 0, 0.4)); [0, 0.5, 1, 1.5].forEach((o, n) => tone(score, at + o, 1.2, N(chords[(k + 1) % 4][n % 3] + 24), 0.025, 0.3, 3, [1, 0.2]));}
// Riser 27–28 into the drop.
for (let k = 0; k < 24; k++) {const at = 27 + 1 - 1 / (1 + k * 0.08) * 1; hiss(score, at, 0.04, 0.12 + k * 0.01, 900, 6000, 30);}
hiss(score, 27, 1.0, 0.25, 400, 9000, -1.2, 0, 0.9); tone(score, 27, 1.0, 220, 0.05, 0, 0, saw.slice(0, 3), 1.0, 0.8);
const beatOf = beats.map((b) => +b.t.toFixed(4));

// Effects locked to picture.
const whoosh = (end, sec, g, pan = 0) => {let l = 0, h = 0, x1 = 0; const a = Math.exp(-tau * 150 / rate); for (let k = 0; k < sec * rate; k++) {const p = k / (sec * rate), b = Math.exp(-tau * (500 + 9000 * p * p) / rate), x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(fx, Math.round((end - sec) * rate) + k, l * g * Math.pow(p, 2.2), pan * (p * 2 - 1));}};
const impact = (at, g = 1) => {kick(fx, at, 0.8 * g); hiss(fx, at, 0.8, 0.45 * g, 300, 7000, 5);};
[3, 8, 15, 37, 44, 50, 56].forEach((c, i) => {whoosh(c, 0.36, 0.45, i % 2 ? 1 : -1); impact(c, c === 44 ? 0.4 : 0.6);});
impact(0, 1.1); impact(28, 1.5); hiss(fx, 28, 2.2, 0.35, 200, 12000, 1.4);
tone(fx, 22.55, 0.45, 220, 0.25, 0, 0, saw.slice(0, 4), -0.85, 0.005);
const hearts = [];
let ht = 15.2; while (ht < 27.2) {const bpm = ht < 23 ? 72 + 24 * (ht - 15) / 8 : 92 - 32 * Math.min(1, (ht - 23) / 4); hearts.push(+ht.toFixed(3)); const g = ht < 23 ? 0.25 : 0.6; kick(fx, ht, g); kick(fx, ht + 0.16, g * 0.6); ht += 60 / bpm;}
beats.filter((b) => b.kind === 'groove' && b.t > 3 && b.t < 8).forEach((b) => tone(fx, b.t, 0.07, 1200, 0.12, 0.2, 40, [1, 0.5]));
beats.filter((b) => b.kind === 'drop' && b.t >= 37 && b.t < 44).forEach((b, k) => hiss(fx, b.t, 0.09, 0.3, 120, 2500, 30, k % 2 ? 0.4 : -0.4));

function writeWav(name, tr, peakTarget) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(tr[0][i]), Math.abs(tr[1][i]));
  const g = peakTarget / peak; const buf = Buffer.alloc(44 + length * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(buf.length - 8, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) for (let c = 0; c < 2; c++) {tr[c][i] = Math.tanh(tr[c][i] * g * 1.2) / Math.tanh(1.2); buf.writeInt16LE(Math.round(tr[c][i] * 32767), 44 + i * 4 + c * 2);}
  fs.writeFileSync(path.join(root, 'public/music-body', name), buf); console.log(`${name}: 48kHz stereo, ${duration}s`);
}
writeWav('score.wav', score, 0.5); writeWav('effects.wav', fx, 0.42);

// Per-frame analysis of the mix as AudioTracks plays it (music .85, effects .7): 12 log-spaced Goertzel bands.
const freqs = Array.from({length: 12}, (_, i) => 50 * Math.pow(200, i / 11)); const W = 1024;
const hann = Float64Array.from({length: W}, (_, i) => 0.5 - 0.5 * Math.cos(tau * i / (W - 1)));
const frames = duration * FPS; const raw = []; const level = [];
for (let f = 0; f < frames; f++) {
  const c = Math.round(f / FPS * rate); const row = []; let e = 0;
  for (const fr of freqs) {
    const w = tau * fr / rate; const co = 2 * Math.cos(w); let s1 = 0, s2 = 0;
    for (let k = 0; k < W; k++) {const i = c - W / 2 + k; const x = i >= 0 && i < length ? ((score[0][i] + score[1][i]) * 0.425 + (fx[0][i] + fx[1][i]) * 0.35) * hann[k] : 0; const s0 = x + co * s1 - s2; s2 = s1; s1 = s0;}
    row.push(Math.sqrt(s1 * s1 + s2 * s2 - co * s1 * s2));
  }
  for (let k = -400; k < 400; k += 4) {const i = c + k; if (i >= 0 && i < length) e += score[0][i] ** 2;} level.push(Math.sqrt(e / 200));
  raw.push(row);
}
const norm = freqs.map((_, b) => {const v = raw.map((r) => r[b]).sort((x, y) => x - y); return v[Math.floor(v.length * 0.98)] || 1;});
const lmax = [...level].sort((x, y) => x - y)[Math.floor(level.length * 0.98)] || 1;
const prev = new Array(12).fill(0);
const bands = raw.map((r) => r.map((v, b) => {const x = Math.min(1, v / norm[b]); prev[b] = Math.max(x, prev[b] * 0.82); return +prev[b].toFixed(2);}));
fs.writeFileSync(path.join(root, 'src/videos/music-body/analysis.json'), JSON.stringify({fps: FPS, bands, level: level.map((l) => +Math.min(1, l / lmax).toFixed(2)), beats: beatOf, hearts}));
console.log(`analysis.json: ${frames} frames × 12 bands, ${beatOf.length} beats, ${hearts.length} heartbeats`);
