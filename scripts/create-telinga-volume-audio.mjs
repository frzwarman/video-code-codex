import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib.mjs';

// Original synthesis only: no samples, borrowed melody, generated voice, or external service.
const timeline=JSON.parse(fs.readFileSync(path.join(root,'src/videos/telinga-volume/timing.json'),'utf8'));
const rate=48000,length=timeline.duration*rate,tau=Math.PI*2;
const music=[new Float64Array(length),new Float64Array(length)];
const effects=[new Float64Array(length),new Float64Array(length)];
let seed=0x736f756e;
const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
const clamp=x=>Math.max(0,Math.min(1,x));
function add(track,at,duration,fn,pan=0){
 const start=Math.round(at*rate),l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);
 for(let k=0;k<Math.ceil(duration*rate);k++){
  const i=start+k;if(i<0||i>=length)continue;
  const t=k/rate,p=t/duration,edge=Math.min(1,t/.003,(duration-t)/.012),v=fn(t,p)*Math.max(0,edge);
  track[0][i]+=v*l;track[1][i]+=v*r;
 }
}
const note=m=>440*2**((m-69)/12);
function pluck(track,at,m,g=.06,pan=0,len=.6){
 const f=note(m);
 add(track,at,len,t=>(Math.sin(tau*f*t+1.8*Math.exp(-t*12)*Math.sin(tau*f*2*t))+.14*Math.sin(tau*f*3*t))*Math.exp(-t*7)*g,pan);
}
function kick(track,at,g=.18){
 add(track,at,.38,t=>Math.sin(tau*(48*t+2.8*(1-Math.exp(-t*28))))*Math.exp(-t*11)*g);
}
function noiseHit(track,at,len,g=.05,pan=0){
 let low=0;
 add(track,at,len,t=>{low=low*.78+noise()*.22;return low*Math.exp(-t*35)*g;},pan);
}
const chords=[[50,57,60,64],[53,57,60,67],[46,53,57,60],[43,50,53,57]];
// 120 BPM; a restrained broken-beat groove leaves room for conversational voice.
for(let beat=0;beat<130;beat++){
 const at=beat*.5,ch=chords[Math.floor(beat/8)%4];
 const sparse=at>=43&&at<49,gain=sparse?.4:at<4?.7:1;
 if(!sparse||beat%4===0)kick(music,at,.17*gain);
 if(beat%2===1&&!sparse)noiseHit(music,at,.14,.20,.1);
 noiseHit(music,at+.27,.055,.08*gain,beat%2?.32:-.32);
 pluck(music,at+.125,ch[(beat*3)%4]+12,.075*gain,-.22);
 if(beat%2===0)pluck(music,at+.375,ch[(beat+1)%4]+24,.026*gain,.32,.9);
 add(music,at,.45,t=>(Math.sin(tau*note(ch[0]-12)*t)+.25*Math.sin(tau*note(ch[0])*t))*Math.exp(-t*6)*.09*gain);
 if(beat%4===0)ch.forEach((m,j)=>add(music,at,2.5,t=>(Math.sin(tau*note(m)*t)+.3*Math.sin(tau*note(m)*1.002*t))*Math.min(1,t/.25)*Math.exp(-t*.9)*.015,(j-1.5)*.3));
}
// Modest low-pass filtering is expressive sound design, NOT a diagnostic hearing-loss simulation.
for(let c=0;c<2;c++){
 let one=0,two=0;
 for(let i=0;i<length;i++){
  const t=i/rate,inside=t>=4&&t<9,muffled=t>=timeline.filterStart&&t<timeline.filterEnd;
  const cut=muffled?1700-1100*clamp((t-35)/8):inside?2600:8500;
  const a=1-Math.exp(-tau*cut/rate);one+=a*(music[c][i]-one);two+=a*(one-two);music[c][i]=two;
 }
}
// Short, band-limited spatial whooshes on the same cuts as the animation.
for(const [i,at] of timeline.cuts.slice(1,-1).entries()){
 let smoothNoise=0;
 add(effects,at-.25,.5,(t,p)=>{smoothNoise=.84*smoothNoise+.16*noise();return smoothNoise*Math.sin(Math.PI*p)**2*.45;},i%2?.45:-.45);
 kick(effects,at,at===35?.20:.12);
}
for(const at of timeline.impacts){pluck(effects,at,at>=49?81:74,.045,0,.22);}
// Tiny membrane taps and transduction clicks, kept below the narration bed.
for(let at=9;at<14;at+=.5)pluck(effects,at,55,.03,0,.12);
for(let at=19;at<27;at+=.5)pluck(effects,at+.18,86,.025,Math.sin(at)*.4,.16);
// Quiet missing-signal beat at UNDO, no harsh tinnitus tone or loudness jump.
add(effects,46,.18,t=>Math.sin(tau*135*t)*Math.exp(-t*35)*.10);
for(const [i,m] of [62,69,74].entries())pluck(effects,49+i*.1,m,.07,(i-1)*.25,1.2);
// End rises gently toward the opening without extending the planned 65 seconds.
let endNoise=0;
add(effects,64,.95,(t,p)=>{endNoise=.9*endNoise+.1*noise();return endNoise*Math.sin(Math.PI*p)**2*.11;});
for(let i=0;i<length;i++){
 const fade=Math.min(1,i/(rate*.006),(length-1-i)/(rate*.035));
 for(const track of [music,effects])for(let c=0;c<2;c++)track[c][i]*=Math.max(0,fade);
}
const dir=path.join(root,'public/telinga-volume');fs.mkdirSync(dir,{recursive:true});
function write(name,track,target){
 let peak=0;for(let i=0;i<length;i++)for(let c=0;c<2;c++)peak=Math.max(peak,Math.abs(track[c][i]));
 const gain=target/peak,b=Buffer.alloc(44+length*4);
 b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(length*4,40);
 for(let i=0;i<length;i++)for(let c=0;c<2;c++){const sample=Math.round(track[c][i]*gain*32767);b.writeInt16LE(sample,44+i*4+c*2);track[c][i]=sample/32768;}
 fs.writeFileSync(path.join(dir,name+'.wav'),b);
}
write('score',music,.46);write('effects',effects,.32);
let peak=0,sum=0;
const frameRms=[];
for(let f=0;f<timeline.duration*timeline.fps;f++){
 let energy=0;const start=f*rate/timeline.fps,end=(f+1)*rate/timeline.fps;
 for(let i=start;i<end;i++)for(let c=0;c<2;c++){
  const v=music[c][i]*.85+effects[c][i]*.7;peak=Math.max(peak,Math.abs(v));energy+=v*v;sum+=v*v;
 }
 frameRms.push(Math.sqrt(energy/((end-start)*2)));
}
const maxRms=Math.max(...frameRms);
fs.writeFileSync(path.join(root,'src/videos/telinga-volume/audio-levels.json'),JSON.stringify({fps:timeline.fps,levels:frameRms.map(x=>Number((x/maxRms).toFixed(3)))}));
const audit={duration:timeline.duration,sampleRate:rate,channels:2,bpm:timeline.bpm,narration:null,source:'Original deterministic synthesis; no samples',mixGains:{music:.85,effects:.7},mixSamplePeakDbFS:20*Math.log10(peak),mixRmsDbFS:20*Math.log10(Math.sqrt(sum/(length*2))),peakLimitDbFS:-1,passed:20*Math.log10(peak)<=-1,note:'WAV source mix only. Encoded AAC and voice alignment remain pending user-authorized rendering.'};
fs.writeFileSync(path.join(dir,'audio-audit.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));
