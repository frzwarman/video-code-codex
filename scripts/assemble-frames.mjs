import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, root, loadBrief, captionSrt, ensureAssets} from './lib.mjs';
import {presets} from '../studio.config.mjs';
import {validateOutput} from './validate.mjs';

const o = args(); const b = loadBrief(o._[0]); const dir = path.join(root,'out',b.id);
const capture = JSON.parse(fs.readFileSync(path.join(dir,'browser-capture.json')));
const {settings, props} = capture;const {durationInFrames, fps} = settings;
ensureAssets(b);
if (b.audio.narration && settings.duration !== b.duration) throw Error('Recorded narration must be retimed editorially.');
for(let f=0;f<durationInFrames;f++) if(!fs.existsSync(path.join(dir,'frames',`${String(f).padStart(5,'0')}.jpg`))) throw Error(`Missing frame ${f}`);
const output = path.join(dir,`${settings.format}-${props.quality}.mp4`);
const inputArgs=['-hide_banner','-loglevel','warning','-framerate',String(fps),'-start_number','0','-i',path.join(dir,'frames','%05d.jpg')];
const filters=[];const labels=[];let index=1;
for(const [name,file] of Object.entries(b.audio)) if(file){
  inputArgs.push('-i',path.join(root,'public',file));
  const gain = name === 'narration' ? 1 : name === 'effects' ? 0.7 : b.audio.narration ? 0.38 : 0.85;
  const speed=b.duration/settings.duration;
  // Compose legal atempo factors for large retimes.
  const rates=[];let r=speed;while(r>2){rates.push(2);r/=2;}while(r<0.5){rates.push(0.5);r/=0.5;}rates.push(r);
  const rateFilter = name === 'narration' ? '' : rates.map(v=>`atempo=${v}`).join(',')+',';
  filters.push(`[${index}:a]${rateFilter}volume=${gain},afade=t=in:st=0:d=0.4,afade=t=out:st=${Math.max(0,settings.duration-0.8)}:d=0.8[a${index}]`);labels.push(`[a${index}]`);index++;
}
if(!labels.length){inputArgs.push('-f','lavfi','-i','anullsrc=r=48000:cl=stereo');filters.push('[1:a]anull[a1]');labels.push('[a1]');}
filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0,apad,atrim=duration=${settings.duration}[mix]`);
const preset=presets[props.quality];
execFileSync('ffmpeg',[...inputArgs,'-filter_complex',filters.join(';'),'-map','0:v:0','-map','[mix]','-vf','scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p','-frames:v',String(durationInFrames),'-t',String(durationInFrames/fps),'-c:v','libx264','-crf',String(preset.crf),'-preset','medium','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-y',output],{stdio:'inherit'});
fs.writeFileSync(output.replace('.mp4','.render.json'),JSON.stringify({id:`${b.id}-${settings.format}`,preset:props.quality,renderer:'Remotion frame handshake via browser capture + FFmpeg',expected:settings,inputProps:props,narration:b.audio.narration?'supplied recording':'not recorded',audio:b.audio},null,2));
fs.writeFileSync(output.replace('.mp4','.srt'),captionSrt(b.narration,settings.duration/b.duration));
console.log(JSON.stringify(validateOutput(output,settings),null,2));
