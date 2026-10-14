import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {presets, formats} from '../studio.config.mjs';
import {args, root, loadBrief, renderSettings, ensureAssets, captionSrt} from './lib.mjs';
import {registerVideos} from './register.mjs';
import {validateOutput} from './validate.mjs';

const o = args(); const brief = loadBrief(o._[0]);
const presetName = o.preset || 'final';
if (!Object.hasOwn(presets, presetName)) throw Error('preset must be preview or final');
const preset = presets[presetName];
if (o.audio !== 'false') ensureAssets(brief);
if (brief.audio.narration && o.duration && Number(o.duration) !== brief.duration) throw Error('Retiming recorded narration requires an editorial change; update the brief and audio first.');
registerVideos();
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(root, '.cache/bundle'), publicDir: path.join(root, 'public')});
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || (fs.existsSync(chrome) ? chrome : undefined);
const chromiumOptions = {gl: 'angle'};
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
try {
  const outputFormats = o['all-formats'] ? Object.keys(formats) : [renderSettings(brief, o).format];
  for (const format of outputFormats) {
    const settings = renderSettings(brief, {...o, format});
    const inputProps = {quality: presetName, duration: settings.duration, fps: settings.fps, captions: o.captions !== 'false', audio: o.audio !== 'false'};
    const composition = await selectComposition({serveUrl, id: `${brief.id}-${format}`, inputProps, puppeteerInstance: browser, chromiumOptions});
    const dir = path.join(root, 'out', brief.id); fs.mkdirSync(dir, {recursive: true});
    const base = `${format}-${presetName}`;
    const common = {serveUrl, composition, inputProps, puppeteerInstance: browser, chromiumOptions, timeoutInMilliseconds: 90000};
    if (o.stills) {
      const frames = o.frames ? String(o.frames).split(',').map(Number) : brief.scenes.map((s) => Math.min(composition.durationInFrames - 1, Math.round((s.start + (s.end - s.start) * 0.55) / brief.duration * composition.durationInFrames)));
      for (const frame of frames) {
        if (!Number.isInteger(frame) || frame < 0 || frame >= composition.durationInFrames) throw Error(`Invalid frame ${frame}`);
        const output = path.join(dir, `${base}-frame-${String(frame).padStart(4, '0')}.png`);
        await renderStill({...common, frame, imageFormat: 'png', output, scale: preset.scale});
        console.log(`Still: ${output}`);
      }
      continue;
    }
    const outputLocation = path.join(dir, `${base}.mp4`);
    let previous = -1;
    console.log(`Rendering ${composition.id}: ${composition.durationInFrames} frames, ${composition.width}×${composition.height}, ${composition.fps} fps, ${presetName}`);
    const started = Date.now();
    await renderMedia({...common, outputLocation, codec: 'h264', audioCodec: 'aac', audioBitrate: '192k', pixelFormat: 'yuv420p', colorSpace: 'bt709', enforceAudioTrack: true, crf: preset.crf, scale: preset.scale, jpegQuality: preset.jpegQuality, concurrency: preset.concurrency, imageFormat: 'jpeg', x264Preset: 'medium', onProgress: ({progress}) => {const p = Math.floor(progress * 20);if (p > previous) {console.log(`${p * 5}%`);previous = p;}}});
    const expected = {...settings, width: Math.round(settings.width * preset.scale), height: Math.round(settings.height * preset.scale)};
    const manifest = {id: composition.id, preset: presetName, inputProps, expected, renderedAt: new Date().toISOString(), elapsedSeconds: (Date.now() - started) / 1000, narration: brief.audio.narration ? 'supplied recording' : 'not recorded', audio: brief.audio};
    fs.writeFileSync(path.join(dir, `${base}.render.json`), JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, `${base}.srt`), captionSrt(brief.narration, settings.duration / brief.duration));
    console.log(JSON.stringify(validateOutput(outputLocation, expected), null, 2));
  }
} finally {await browser.close({silent: true});}
