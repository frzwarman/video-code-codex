import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original song for hujan-kodok: lyrics, melody and arrangement are new (not "Tik Tik Tik" by Ibu Sud).
// Writes the score, effects, and song.json (syllable timing) so visuals follow the exact melody.
const rate = 48000; const duration = 15; const length = rate * duration; const tau = Math.PI * 2;
const bpm = 100; const beat = 60 / bpm; const bar = beat * 4; const eighth = beat / 2;
const score = [new Float64Array(length), new Float64Array(length)];
const fx = [new Float64Array(length), new Float64Array(length)];
let seed = 0x4b0d;
const noise = () => {seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 2147483648 - 1;};
const add = (tr, i, v, pan) => {if (i >= 0 && i < length) {tr[0][i] += v * Math.sqrt((1 - pan) / 2); tr[1][i] += v * Math.sqrt((1 + pan) / 2);}};
function tone(tr, at, sec, f, g, pan = 0, decay = 4, harm = [1, 0.3], attack = 0.004, glide = 0) {
  let ph = 0;
  for (let k = 0; k < sec * rate; k++) {const t = k / rate; ph += tau * f * (1 + glide * t / sec) / rate; const env = Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.03); let v = 0; for (let n = 0; n < harm.length; n++) v += harm[n] * Math.sin(ph * (n + 1)); add(tr, Math.round(at * rate) + k, v * g * env, pan);}
}
function hiss(tr, at, sec, g, hp, lp, decay, pan = 0, attack = 0.002) {
  const a = Math.exp(-tau * hp / rate), b = Math.exp(-tau * lp / rate); let x1 = 0, h = 0, l = 0;
  for (let k = 0; k < sec * rate; k++) {const t = k / rate, x = noise(); h = a * (h + x - x1); x1 = x; l = (1 - b) * h + b * l; add(tr, Math.round(at * rate) + k, l * g * Math.min(1, t / attack) * Math.exp(-t * decay) * Math.min(1, (sec - t) / 0.01), pan);}
}
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
const note = {C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74};
// Bars: 0 intro, 1–4 the four lines, 5 outro (then the splash tail).
const chords = [[48, 52, 55, 60], [48, 52, 55, 60], [43, 50, 55, 59], [41, 48, 53, 57], [43, 50, 55, 59], [48, 52, 55, 60], [48, 52, 55, 60]];
const lines = [
  {text: ['Plik', 'plok', 'plik', 'plok,', 'hu', 'jan', 'tu', 'run'], words: [1, 1, 1, 1, 2, 0, 2, 0], notes: ['G4', 'E4', 'G4', 'E4', 'F4', 'E4', 'D4', 'C4']},
  {text: ['Ka', 'tak', 'ke', 'cil', 'pa', 'kai', 'pa', 'yung'], words: [2, 0, 2, 0, 2, 0, 2, 0], notes: ['D4', 'G4', 'G4', 'A4', 'B4', 'A4', 'G4', 'D4']},
  {text: ['Lom', 'pat', 'lom', 'pat', 'di', 'ge', 'nang', 'an'], words: [2, 0, 2, 0, 1, 3, 0, 0], notes: ['C5', 'A4', 'C5', 'A4', 'G4', 'F4', 'A4', 'F4']},
  {text: ['Ma', 'ri', 'ber', 'nya', 'nyi', 'ber', 'sa', 'ma'], words: [2, 0, 3, 0, 0, 3, 0, 0], notes: ['G4', 'G4', 'A4', 'B4', 'C5', 'B4', 'D5', 'C5']},
];
const syllables = [];
lines.forEach((l, li) => l.text.forEach((s, k) => {const t = bar * (li + 1) + k * eighth; syllables.push({line: li, i: k, text: s, wordStart: l.words[k] > 0, t: +t.toFixed(3), midi: note[l.notes[k]]}); tone(score, t, k === 7 ? beat * 1.6 : eighth * 1.6, N(note[l.notes[k]] + 12), 0.11, 0.1, k === 7 ? 1.8 : 3.2, [1, 0, 0.32, 0, 0.12], 0.002); tone(score, t, eighth * 0.9, N(note[l.notes[k]]), 0.05, -0.1, 6, [1, 0.5, 0.2]);}));

// Ukulele strums on every eighth (down on beats, lighter up-strums), bass on beats 1 and 3, claps on 2 and 4, shaker 16ths.
const beatsList = [];
for (let n = 0; n * beat < 13.2; n++) {
  const at = n * beat; const c = chords[Math.min(chords.length - 1, Math.floor(at / bar))]; beatsList.push(+at.toFixed(3));
  for (let h = 0; h < 2; h++) {const st = at + h * eighth; const strings = h ? [...c].reverse() : c; strings.forEach((m, j) => tone(score, st + j * 0.012, eighth * 1.8, N(m + 12), h ? 0.03 : 0.045, (j - 1.5) * 0.3, 5, [1, 0.5, 0.3, 0.15]));}
  if (n % 2 === 0) tone(score, at, beat * 0.9, N(c[0] - 12), 0.22, 0, 3, [1, 0.3, 0.1]);
  if (n % 2 === 1) hiss(score, at, 0.15, 0.22, 1200, 6000, 24, 0, 0.001);
  for (let s = 0; s < 4; s++) hiss(score, at + s * beat / 4, 0.05, s % 2 ? 0.035 : 0.05, 5000, 12000, 50, 0.4, 0.002);
}
// Outro: final strum and a glockenspiel arpeggio.
[48, 52, 55, 60, 64].forEach((m, j) => tone(score, 13.2 + j * 0.03, 1.8, N(m + 12), 0.05, (j - 2) * 0.3, 1.5, [1, 0.5, 0.3, 0.15]));
[72, 76, 79, 84].forEach((m, j) => tone(score, 13.2 + j * 0.15, 1.2, N(m + 12), 0.08, 0.2, 2, [1, 0, 0.32, 0, 0.12]));

// Rain: soft bed, random high drips, "plik plok" drops on the intro beats and the first line's onomatopoeia.
for (let t = 0; t < duration; t += 0.5) hiss(fx, t, 0.52, 0.05, 1500, 9000, 0, 0, 0.05);
for (let t = 0.1; t < duration; t += 0.11) if ((noise() + 1) / 2 < 0.35) tone(fx, t + (noise() + 1) * 0.04, 0.06, 1800 + (noise() + 1) * 1400, 0.02, noise() * 0.8, 40, [1], 0.001, -0.3);
const drop = (at, f, g = 0.18) => {tone(fx, at, 0.14, f, g, 0, 22, [1, 0.2], 0.001, -0.55);};
[0.3, 0.9, 1.5, 2.1].forEach((t, i) => drop(t, i % 2 ? 900 : 1300, 0.14));
syllables.filter((s) => s.line === 0 && s.i < 4).forEach((s, i) => drop(s.t, i % 2 ? 850 : 1250));
hiss(fx, 0, 0.5, 0.25, 200, 4000, 6); tone(fx, 0, 0.5, 520, 0.12, 0, 6, [1], 0.002, 0.6);
// Hops on line 3, then the splash.
[7.2, 7.8].forEach((t) => tone(fx, t, 0.18, 300, 0.12, 0, 14, [1, 0.3], 0.002, 1.2));
hiss(fx, 12.6, 0.9, 0.45, 300, 7000, 4.5); drop(12.6, 600, 0.3); drop(12.75, 1100, 0.2); drop(12.9, 1500, 0.14);
tone(fx, 12.0, 0.3, 260, 0.14, 0, 10, [1, 0.3], 0.002, 1.5);

function writeWav(name, tr, peakTarget) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(tr[0][i]), Math.abs(tr[1][i]));
  const g = peakTarget / peak; const buf = Buffer.alloc(44 + length * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(buf.length - 8, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) {const fade = Math.min(1, (length - 1 - i) / (rate * 0.4)); for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.tanh(tr[c][i] * g * fade * 1.1) / Math.tanh(1.1) * 32767), 44 + i * 4 + c * 2);}
  fs.writeFileSync(path.join(root, 'public/hujan-kodok', name), buf); console.log(`${name}: 48kHz stereo, ${duration}s`);
}
writeWav('score.wav', score, 0.5); writeWav('effects.wav', fx, 0.4);
fs.writeFileSync(path.join(root, 'src/videos/hujan-kodok/song.json'), JSON.stringify({bpm, bar, syllables, beats: beatsList, lines: lines.map((l) => l.text)}, null, 1));
console.log(`song.json: ${syllables.length} syllables, ${beatsList.length} beats`);
