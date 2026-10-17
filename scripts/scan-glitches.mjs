import {execFileSync} from 'node:child_process';

// Finds render glitches that metadata validation cannot see: frames unlike BOTH neighbours while the
// neighbours match each other (garbled captures, blank 3D frames, pops), and black runs.
// Hard cuts are not flagged (the frame after a cut matches its successor). Intentional blackouts are listed for review.
const file = process.argv[2]; if (!file) throw Error('Usage: npm run scan -- <video.mp4>');
const [w, h] = [96, 96];
const fps = (() => {const [n, d] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', file]).toString().trim().split('/'); return n / d;})();
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${w}:${h},format=gray`, '-f', 'rawvideo', '-'], {maxBuffer: 1 << 30});
const n = raw.length / (w * h); const px = w * h;
const diff = (a, b) => {let s = 0; for (let i = 0; i < px; i++) s += Math.abs(raw[a * px + i] - raw[b * px + i]); return s / px;};
const mean = (a) => {let s = 0; for (let i = 0; i < px; i++) s += raw[a * px + i]; return s / px;};
const flags = [];
for (let f = 1; f < n - 1; f++) {const o = Math.min(diff(f, f - 1), diff(f, f + 1)) - diff(f + 1, f - 1); if (o > 6) flags.push({t: +(f / fps).toFixed(3), frame: f, kind: 'one-frame outlier', score: +o.toFixed(1)});}
for (let f = 1; f < n - 2; f++) {const o = Math.min(diff(f, f - 1), diff(f + 1, f + 2)) - diff(f + 2, f - 1); if (o > 6 && diff(f, f + 1) < o) flags.push({t: +(f / fps).toFixed(3), frame: f, kind: 'two-frame outlier', score: +o.toFixed(1)});}
const black = []; for (let f = 0; f < n; f++) if (mean(f) < 6) {const last = black.at(-1); if (last && last.to === f - 1) last.to = f; else black.push({from: f, to: f});}
const report = {file, fps, frames: n, glitches: flags, blackRuns: black.map((b) => ({from: +(b.from / fps).toFixed(2), to: +((b.to + 1) / fps).toFixed(2)}))};
console.log(JSON.stringify(report, null, 2));
if (flags.length) process.exitCode = 1;
