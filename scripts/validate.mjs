import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, loadBrief, renderSettings} from './lib.mjs';

export function validateOutput(file, expected) {
  const result = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], {encoding: 'utf8'}));
  const v = result.streams.find((s) => s.codec_type === 'video');
  if (!v) throw Error('No video stream.');
  const [n, d] = v.avg_frame_rate.split('/').map(Number); const fps = n / d;
  const duration = Number(v.duration || result.format.duration);
  const frameCount = Number(v.nb_frames);
  const failures = [];
  if (v.width !== expected.width || v.height !== expected.height) failures.push(`Dimensions ${v.width}×${v.height}, expected ${expected.width}×${expected.height}`);
  if (Math.abs(fps - expected.fps) > 0.001) failures.push(`FPS ${fps}, expected ${expected.fps}`);
  if (Math.abs(duration - expected.durationInFrames / expected.fps) > 1 / expected.fps + 0.01) failures.push(`Duration ${duration} does not match expected duration`);
  if (Number.isFinite(frameCount) && frameCount !== expected.durationInFrames) failures.push(`Frame count ${frameCount}, expected ${expected.durationInFrames}`);
  if (v.codec_name !== 'h264' || v.pix_fmt !== 'yuv420p') failures.push(`Unexpected video encoding ${v.codec_name}/${v.pix_fmt}`);
  if (!result.streams.some((s) => s.codec_type === 'audio' && s.codec_name === 'aac')) failures.push('Missing AAC audio track (silence is acceptable).');
  const report = {passed: failures.length === 0, file: path.resolve(file), width: v.width, height: v.height, fps, duration, frameCount, codec: v.codec_name, pixelFormat: v.pix_fmt, audio: result.streams.filter((s) => s.codec_type === 'audio').map((s) => ({codec: s.codec_name, sampleRate: s.sample_rate, channels: s.channels})), bytes: Number(result.format.size), failures};
  fs.writeFileSync(file.replace(/\.mp4$/i, '') + '.validation.json', JSON.stringify(report, null, 2) + '\n');
  if (failures.length) throw Error(failures.join('; '));
  return report;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const o = args(); const file = o._[0];
  if (!file) throw Error('Usage: npm run validate -- out/video.mp4 [--id message-journey --format vertical --preset final]');
  const manifestFile = file.replace(/\.mp4$/i, '') + '.render.json';
  const expected = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile)).expected : renderSettings(loadBrief(o.id), o);
  if (!fs.existsSync(manifestFile) && o.preset === 'preview') {expected.width /= 2;expected.height /= 2;}
  console.log(JSON.stringify(validateOutput(file, expected), null, 2));
}
