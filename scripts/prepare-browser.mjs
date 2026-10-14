import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {args, root, loadBrief, renderSettings} from './lib.mjs';
import {registerVideos} from './register.mjs';

// Optional file:// capture adapter for restricted agent sessions without server access.
// Uses the same Remotion 4.0.535 bundle/seek handshake as the renderer.
const o = args(); const brief = loadBrief(o._[0]); const settings = renderSettings(brief, o);
const quality = o.preset || 'final';
registerVideos();
const dir = path.join(root, '.cache/browser-bundle');
await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir: dir, publicDir: path.join(root, 'public')});
const file = path.join(dir, 'index.html'); let html = fs.readFileSync(file, 'utf8');
const flags = `window.remotion_puppeteerTimeout=90000;window.remotion_isMainTab=true;window.remotion_initialFrame=0;window.remotion_attempt=1;window.remotion_logLevel="error";window.remotion_inputProps="{}";window.process={env:{NODE_ENV:"production"}};`;
const props = {quality, duration: settings.duration, fps: settings.fps, captions: true, audio: false};
const config = {type: 'composition', compositionName: `${brief.id}-${settings.format}`, serializedResolvedPropsWithSchema: JSON.stringify(props), compositionDurationInFrames: settings.durationInFrames, compositionFps: settings.fps, compositionHeight: settings.height, compositionWidth: settings.width};
const handshake = `
window.studioSelect = () => window.remotion_setBundleMode(${JSON.stringify(config)});
window.studioSeek = async (frame) => {
  window.remotion_setFrame(frame, ${JSON.stringify(config.compositionName)}, 1);
  await new Promise((resolve,reject) => {
    const started = Date.now();
    function check() {
      if(window.remotion_cancelledError) return reject(new Error(window.remotion_cancelledError));
      if(window.remotion_renderReady) return resolve();
      if(Date.now()-started>85000) return reject(new Error("Frame readiness timed out"));
      setTimeout(check, 5);
    }
    check();
  });
  await document.fonts.ready;
  return frame;
};`;
html = html.replace('<script src="./bundle.js"></script>', `<script>${flags}</script><script src="./bundle.js"></script><script>${handshake}</script>`);
fs.writeFileSync(file, html);
fs.mkdirSync(path.join(root, 'out', brief.id, 'frames'), {recursive: true});
fs.writeFileSync(path.join(root, 'out', brief.id, 'browser-capture.json'), JSON.stringify({briefId: brief.id, settings, props}, null, 2));
console.log(`Prepared ${file} (${settings.width}×${settings.height}, ${settings.durationInFrames} frames)`);
