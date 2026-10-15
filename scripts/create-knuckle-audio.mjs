import fs from 'node:fs';
// Original deterministic synthesis, no recordings or third-party samples.
const sr=48000,seconds=62,n=sr*seconds,tau=2*Math.PI;
const score=[new Float64Array(n),new Float64Array(n)],fx=[new Float64Array(n),new Float64Array(n)];
let seed=20821;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
function sound(track,at,dur,fn,pan=0){for(let k=0;k<dur*sr;k++){const i=Math.round(at*sr)+k;if(i<0||i>=n)continue;const t=k/sr,v=fn(t,t/dur);track[0][i]+=v*Math.sqrt((1-pan)/2);track[1][i]+=v*Math.sqrt((1+pan)/2);}}
// 120 BPM: dry kick, restrained snare, shuffled metallic hats and a D minor ostinato.
for(let b=0;b<124;b++){
 const at=b*.5,section=at>=33&&at<41?.55:at>=41&&at<48?.38:1;
 sound(score,at,.34,t=>Math.sin(tau*(46*t+4*(1-Math.exp(-t*28))))*Math.exp(-t*15)*.4*section);
 if(b%2) sound(score,at,.14,t=>(noise()*.8+Math.sin(tau*185*t)*.2)*Math.exp(-t*38)*.12*section);
 for(let h=0;h<2;h++)sound(score,at+h*.25,.07,t=>noise()*Math.exp(-t*85)*.035*section,h?.5:-.5);
 const notes=[73.416,73.416,110,87.307,73.416,65.406,87.307,110],f=notes[b%8];
 sound(score,at+.125,.31,t=>(Math.sin(tau*f*t)+.16*Math.sin(tau*f*3*t))*Math.min(1,t/.008)*Math.exp(-t*12)*.11*section);
 if(b%4===0)for(const f of [146.832,174.614,220])sound(score,at,1.8,(t,p)=>Math.sin(tau*f*t)*Math.sin(Math.PI*p)**2*.016,Math.sin(f)*.5);
}
// Sub drop starts at frame zero; retain the attack in the export (no global fade-in).
sound(fx,0,.8,t=>Math.sin(tau*(32*t+4*(1-Math.exp(-t*8))))*Math.min(1,t/.003)*Math.exp(-t*5)*.48);
for(const at of [.4,25.5])sound(fx,at,.13,t=>(noise()*.58+Math.sin(tau*(520*t-1200*t*t))*.42)*Math.exp(-t*75)*.8);
for(const at of [3,8,16,25,33,41,48,57]){
 sound(fx,at-.16,.34,(t,p)=>(noise()*.7+Math.sin(tau*(130*t+1600*t*t))*.3)*Math.sin(Math.PI*p)**3*.22);
 sound(fx,at,.15,t=>Math.sin(tau*78*t)*Math.exp(-t*30)*.2);
}
for(let at=41.5;at<48;at+=.5)sound(fx,at,.045,t=>(Math.sin(tau*1800*t)*.65+noise()*.35)*Math.exp(-t*130)*.15);
for(const at of [5.5,10.5,13,18.5,21,23.5,28,30.5,35.5,38,50.5,53,55.5,59.5])sound(fx,at,.08,t=>noise()*Math.exp(-t*65)*.08);
function write(name,track,peak){let max=0;for(let i=0;i<n;i++)max=Math.max(max,Math.abs(track[0][i]),Math.abs(track[1][i]));const out=Buffer.alloc(44+n*4);out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(n*4,40);for(let i=0;i<n;i++)for(let c=0;c<2;c++){const fade=Math.min(1,(n-1-i)/(sr*.04));out.writeInt16LE(Math.round((name==='score'?Math.tanh(track[c][i]/max*3)/Math.tanh(3):track[c][i]/max)*peak*fade*32767),44+i*4+c*2);}fs.writeFileSync(`public/knuckle-crack/${name}.wav`,out);console.log(`${name}: ${seconds}s stereo PCM, peak ${20*Math.log10(peak)} dBFS`);}
write('score',score,.48);write('effects',fx,.62);
