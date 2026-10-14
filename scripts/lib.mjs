import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {formats, platforms, categories} from '../studio.config.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function args(argv = process.argv.slice(2)) {
  const result = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {result._.push(a); continue;}
    const [key, inline] = a.slice(2).split('=');
    if (inline !== undefined) result[key] = inline;
    else if (['stills', 'all-formats'].includes(key)) result[key] = true;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) result[key] = argv[++i];
    else result[key] = true;
  }
  return result;
}
export function validateBrief(b) {
  if (!b || typeof b !== 'object') throw Error('Brief must be a JSON object.');
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(b.id)) throw Error('id must be a lowercase kebab-case identifier.');
  for (const field of ['title', 'topic', 'style']) if (typeof b[field] !== 'string' || !b[field].trim()) throw Error(`${field} is required.`);
  if (!Object.hasOwn(platforms, b.platform)) throw Error(`Unknown platform: ${b.platform}`);
  if (!categories.includes(b.category)) throw Error(`Unknown category: ${b.category}`);
  if (!Number.isFinite(b.duration) || b.duration <= 0 || b.duration > 3600) throw Error('duration must be in (0, 3600] seconds.');
  if (!Number.isFinite(b.fps) || b.fps < 1 || b.fps > 120) throw Error('fps must be in [1, 120].');
  if (Math.round(b.duration * b.fps) < 1) throw Error('Duration must contain at least one frame.');
  if (b.output !== 'mp4') throw Error('This workflow exports MP4. Set output to mp4.');
  if (!Array.isArray(b.scenes) || b.scenes.length === 0) throw Error('At least one scene is required.');
  if (!Array.isArray(b.narration)) throw Error('narration must be an array (may be empty).');
  for (const [name, list] of [['scenes', b.scenes], ['narration', b.narration]]) {
    let previousEnd = 0;
    for (const cue of list) {
      if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start || cue.end > b.duration) throw Error(`${name} must contain ordered, non-overlapping ranges within the duration.`);
      if (name === 'narration' && (typeof cue.text !== 'string' || !cue.text.trim())) throw Error('Each narration cue needs text.');
      if (name === 'scenes' && [cue.title, cue.description].some((v) => typeof v !== 'string' || !v.trim())) throw Error('Each scene needs title and description.');
      previousEnd = cue.end;
    }
  }
  if (b.scenes[0].start !== 0 || b.scenes.at(-1).end !== b.duration || b.scenes.some((s, i) => i && s.start !== b.scenes[i - 1].end)) throw Error('Scenes must cover the complete duration without gaps.');
  if (!b.audio || typeof b.audio !== 'object') throw Error('audio is required; use null for missing assets.');
  for (const name of ['narration', 'music', 'effects']) {
    const value = b.audio[name];
    if (value !== null && (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('..') || value.includes(':') || value.includes('\\'))) throw Error(`audio.${name} must be null or a relative public asset path.`);
  }
  return b;
}
export function loadBrief(id = 'message-journey') {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) throw Error('Invalid video id.');
  return validateBrief(JSON.parse(fs.readFileSync(path.join(root, 'src/videos', id, 'brief.json'), 'utf8')));
}
export function renderSettings(brief, options = {}) {
  const format = options.format || platforms[brief.platform];
  if (!Object.hasOwn(formats, format)) throw Error(`Unknown format: ${format}`);
  const duration = Number(options.duration ?? brief.duration); const fps = Number(options.fps ?? brief.fps);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 3600 || !Number.isFinite(fps) || fps < 1 || fps > 120) throw Error('Invalid duration or frame rate.');
  const durationInFrames = Math.round(duration * fps);
  if (durationInFrames < 1) throw Error('Duration must contain at least one frame.');
  return {format, ...formats[format], fps, duration, durationInFrames};
}
export function ensureAssets(brief) {
  for (const value of Object.values(brief.audio)) if (value && !fs.existsSync(path.join(root, 'public', value))) throw Error(`Missing public/${value}. Supply the asset, set its brief entry to null, or run npm run audio for the demo.`);
}
export function captionSrt(cues, scale = 1) {
  const stamp = (seconds) => {const ms = Math.round(seconds * scale * 1000);return `${String(Math.floor(ms / 3600000)).padStart(2,'0')}:${String(Math.floor(ms / 60000) % 60).padStart(2,'0')}:${String(Math.floor(ms / 1000) % 60).padStart(2,'0')},${String(ms % 1000).padStart(3,'0')}`;};
  return cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n');
}
