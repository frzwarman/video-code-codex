import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original sample-driven synthesis. No recorded voice, external music, or random state.
const rate = 48000; const duration = 30; const length = rate * duration;
const score = [new Float64Array(length), new Float64Array(length)];
const effects = [new Float64Array(length), new Float64Array(length)];
const tau = Math.PI * 2;
function tone(track, at, seconds, frequency, gain, pan = 0, mode = 'bell') {
  for (let k = 0; k < seconds * rate; k++) {
    const i = Math.round(at * rate) + k; if (i >= length) break;
    const t = k / rate; const env = Math.min(1, t / 0.015) * Math.exp(-t * (mode === 'pad' ? 1 : 4)) * Math.min(1, (seconds - t) / 0.06);
    const v = (Math.sin(tau * frequency * t) + 0.22 * Math.sin(tau * frequency * 2 * t) + 0.08 * Math.sin(tau * frequency * 3 * t)) * gain * env;
    track[0][i] += v * Math.sqrt((1 - pan) / 2); track[1][i] += v * Math.sqrt((1 + pan) / 2);
  }
}
const chords = [[130.81, 196, 261.63, 329.63], [110, 164.81, 220, 329.63], [87.31, 130.81, 174.61, 261.63], [98, 146.83, 196, 293.66]];
for (let beat = 0; beat < 60; beat++) {
  const at = beat * 0.5; const chord = chords[Math.floor(beat / 16) % 4];
  tone(score, at, 1.7, chord[beat % 4] * 2, 0.052, Math.sin(beat * 1.7) * 0.45);
  if (beat % 4 === 0) {
    tone(score, at, 2.5, chord[0] / 2, 0.12, 0, 'pad');
    chord.forEach((f, j) => tone(score, at, 3.5, f, 0.032, (j - 1.5) * 0.25, 'pad'));
  }
  if (beat >= 22 && beat < 43) tone(score, at + 0.25, 0.3, chord[(beat + 2) % 4] * 4, 0.025, -0.5);
}
function sweep(at, seconds, gain, reverse = false) {
  for (let k = 0; k < seconds * rate; k++) {
    const i = Math.round(at * rate) + k; if (i >= length) break;
    const t = k / rate; const p = t / seconds; const env = Math.pow(Math.sin(Math.PI * p), 2);
    const phase = reverse ? 900 * t - 350 * t * t / seconds : 90 * t + 850 * t * t / seconds;
    const v = (Math.sin(tau * phase) * 0.7 + Math.sin(tau * phase * 1.017) * 0.3) * env * gain;
    effects[0][i] += v * (0.8 - p * 0.4); effects[1][i] += v * (0.4 + p * 0.4);
  }
}
[3.35, 6.85, 10.85, 16.85, 21.35, 25.85].forEach((t) => sweep(t - 0.2, 0.55, 0.09));
[5.45, 7.5, 7.62, 7.74, 7.86, 12.4, 13.5, 14.6, 15.7].forEach((t, i) => tone(effects, t, 0.4, 650 + i * 70, 0.085, Math.sin(i) * 0.4));
tone(effects, 23, 1.3, 880, 0.15, -0.15); tone(effects, 23.13, 1.5, 1174.66, 0.12, 0.15);
tone(effects, 26.3, 2.8, 523.25, 0.14, -0.2, 'pad'); tone(effects, 26.5, 2.8, 783.99, 0.1, 0.2, 'pad');
function writeWav(name, track, targetPeak) {
  let peak = 0; for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(track[0][i]), Math.abs(track[1][i]));
  const normalization = peak ? targetPeak / peak : 1;
  const buffer = Buffer.alloc(44 + length * 4);
  buffer.write('RIFF', 0);buffer.writeUInt32LE(buffer.length - 8, 4);buffer.write('WAVEfmt ', 8);buffer.writeUInt32LE(16, 16);buffer.writeUInt16LE(1, 20);buffer.writeUInt16LE(2, 22);buffer.writeUInt32LE(rate, 24);buffer.writeUInt32LE(rate * 4, 28);buffer.writeUInt16LE(4, 32);buffer.writeUInt16LE(16, 34);buffer.write('data', 36);buffer.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) {const fade = Math.min(1, i / rate, (length - 1 - i) / (rate * 1.2));for (let c = 0; c < 2; c++) buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, track[c][i] * normalization * fade)) * 32767), 44 + i * 4 + c * 2);}
  const output = path.join(root, 'public/audio', name);fs.mkdirSync(path.dirname(output), {recursive: true});fs.writeFileSync(output, buffer);console.log(`${name}: original stereo synthesis, 48kHz, 30s, peak ${(20 * Math.log10(peak * normalization)).toFixed(1)} dBFS`);
}
writeWav('message-journey-score.wav', score, 0.55); writeWav('message-journey-effects.wav', effects, 0.35);
