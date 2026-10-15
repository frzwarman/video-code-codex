import fs from 'node:fs';
import {root} from './lib.mjs';
import path from 'node:path';
// Original sound design: no recordings, licensed samples, voice, or external services.
const timeline=JSON.parse(fs.readFileSync(path.join(root,'src/videos/all-nighter/timing.json')));
const rate=48000,n=timeline.duration*rate,tau=Math.PI*2;
const score=[new Float64Array(n),new Float64Array(n)],effects=[new Float64Array(n),new Float64Array(n)];
let seed=0x030365;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
function add(track,at,duration,fn,pan=0){for(let k=0;k<Math.ceil(duration*rate);k++){const i=Math.round(at*rate)+k;if(i<0||i>=n)continue;const v=fn(k/rate,k/(duration*rate));track[0][i]+=v*Math.sqrt((1-pan)/2);track[1][i]+=v*Math.sqrt((1+pan)/2);}}
// Low, restrained drone; rise in harmonic tension, then a clear major interval at recovery.
for(let i=0;i<n;i++){const t=i/rate,pressure=Math.min(1,t/40),attack=Math.min(1,t/.08),clean=t>=54;const v=clean?(Math.sin(tau*110*t)+.45*Math.sin(tau*165*t)+.3*Math.sin(tau*220*t))*.028:(Math.sin(tau*55*t)*.048+Math.sin(tau*(82.4*t+.03*Math.sin(t*.3)))*.025+Math.sin(tau*58.27*t)*.009*pressure);score[0][i]+=v*attack;score[1][i]+=v*attack;}
// Tick intervals contract from 0.85 to 0.24 seconds. Recovery restores a spacious pulse.
for(let at=0;at<65;){const clean=at>=54;add(score,at,.06,t=>(Math.sin(tau*1750*t)*.65+noise()*.35)*Math.exp(-t*95)*.10,Math.sin(at)*.25);at+=clean?.85:.85-.61*Math.min(1,at/42);}
// Anatomically suggestive two-part heartbeat, not a physiological measurement.
for(let at=15;at<54;at+=.78){const gain=.055+.09*Math.min(1,(at-15)/20);for(const [delay,g] of [[0,1],[.13,.55]])add(score,at+delay,.25,t=>Math.sin(tau*(48*t+1.5*(1-Math.exp(-t*20))))*Math.exp(-t*24)*gain*g);}
for(const at of timeline.cuts.slice(1,-1)){add(effects,at-.22,.40,(t,p)=>(noise()*.65+Math.sin(tau*(80*t+1500*t*t))*.35)*Math.sin(Math.PI*p)**3*.20,at%2?.35:-.35);}
add(effects,1.15,.2,t=>(Math.sin(tau*82*t)*.7+noise()*.3)*Math.exp(-t*32)*.22);
for(const [at,f] of [[54,440],[54.18,554.365],[54.36,659.255]])add(effects,at,2,(t,p)=>Math.sin(tau*f*t)*Math.min(1,t/.01)*Math.exp(-t*3)*.09);
add(effects,63.5,1.5,(t,p)=>Math.sin(tau*(95*t+80*t*t))*Math.sin(Math.PI*p)**2*.055);
function blackoutEnvelope(t){let env=1;for(const m of timeline.microsleeps){const a=m.frame/timeline.fps,b=(m.frame+m.length)/timeline.fps;if(t>=a&&t<b)return 0;if(t>=a-.004&&t<a)env=Math.min(env,(a-t)/.004);if(t>=b&&t<b+.004)env=Math.min(env,(t-b)/.004);}return env;}
for(let i=0;i<n;i++){const t=i/rate,e=blackoutEnvelope(t)*Math.min(1,(65-t)/.04);for(const track of [score,effects])for(let c=0;c<2;c++)track[c][i]*=e;}
const dir=path.join(root,'public/all-nighter');fs.mkdirSync(dir,{recursive:true});
function wav(name,track,target){let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(track[0][i]),Math.abs(track[1][i]));const gain=target/peak,b=Buffer.alloc(44+n*4);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*4,40);for(let i=0;i<n;i++)for(let c=0;c<2;c++){track[c][i]*=gain;b.writeInt16LE(Math.round(track[c][i]*32767),44+i*4+c*2);}fs.writeFileSync(path.join(dir,name+'.wav'),b);return target;}
wav('score',score,.38);wav('effects',effects,.48);
let peak=0;for(let i=0;i<n;i++)for(let c=0;c<2;c++)peak=Math.max(peak,Math.abs(score[c][i]*.85+effects[c][i]*.7));
const report={sampleRate:rate,channels:2,duration:65,voice:null,source:'original deterministic synthesis',musicGain:.85,effectsGain:.7,mixSamplePeakDbFS:20*Math.log10(peak),peakRequirementDbFS:-1,passed:20*Math.log10(peak)<=-1,blackouts:timeline.microsleeps,note:'Source mix measurement only. Check encoded AAC true peak after user-authorized rendering; no video was rendered.'};
fs.writeFileSync(path.join(dir,'audio-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
