import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,loadBrief,captionSrt,ensureAssets} from './lib.mjs';
import {validateOutput} from './validate.mjs';
const preset=process.argv[2];if(!['preview','final'].includes(preset))throw Error('Use preview or final');
const b=loadBrief('knuckle-crack'),dir=path.join(root,'out',b.id),capture=JSON.parse(fs.readFileSync(path.join(dir,'browser-capture.json'))),{settings}=capture;
ensureAssets(b);for(let f=0;f<settings.durationInFrames;f++)if(!fs.existsSync(path.join(dir,'frames',`${String(f).padStart(5,'0')}.jpg`)))throw Error(`Missing frame ${f}`);
const scale=preset==='preview'?.5:1,expected={...settings,width:Math.round(settings.width*scale),height:Math.round(settings.height*scale)},output=path.join(dir,`vertical-${preset}.mp4`);
const input=['-hide_banner','-loglevel','warning','-framerate',String(settings.fps),'-i',path.join(dir,'frames','%05d.jpg')],filters=[],labels=[];let idx=1;
for(const [kind,file] of Object.entries(b.audio))if(file){input.push('-i',path.join(root,'public',file));const gain=kind==='narration'?1:kind==='effects'?.7:b.audio.narration?.38:.85;filters.push(`[${idx}:a]volume=${gain},afade=t=out:st=61.96:d=0.04[a${idx}]`);labels.push(`[a${idx++}]`);}
filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0,apad,atrim=duration=62[mix]`);
execFileSync('ffmpeg',[...input,'-filter_complex',filters.join(';'),'-map','0:v:0','-map','[mix]','-vf',`scale=${expected.width}:${expected.height}:in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709`,'-frames:v',String(settings.durationInFrames),'-t','62','-c:v','libx264','-crf',preset==='preview'?'25':'17','-preset','medium','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-ar','48000','-metadata','comment=BodyParts3D © DBCLS; STL Kevin Mattheus Moerman. Adapted film CC BY-SA 2.1 Japan. Full credits: public/knuckle-crack/CREDITS.txt. Original synthesized audio; no narration.','-movflags','+faststart','-y',output],{stdio:'inherit'});
fs.writeFileSync(output.replace('.mp4','.render.json'),JSON.stringify({id:'knuckle-crack-vertical',preset,expected,renderer:'Remotion readiness handshake / agent-browser / FFmpeg',inputProps:capture.props,narration:'not recorded',audio:b.audio},null,2));
fs.writeFileSync(output.replace('.mp4','.srt'),captionSrt(b.narration));
console.log(JSON.stringify(validateOutput(output,expected),null,2));
