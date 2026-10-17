import {clamp, lerp, smooth} from '../../motion';
import timing from './timing.json';
export {timing};
export const C = {ink:'#071316', pearl:'#F4F0E8', mint:'#37E8CC', coral:'#FF684C', acid:'#DDFB6A', muted:'#91A8A4'};
export type V3 = [number,number,number];
export const ramp = (t:number,a:number,b:number) => smooth(clamp((t-a)/(b-a)));
export const sceneAt = (t:number) => Math.max(0,timing.cuts.findIndex((a,i)=>t>=a&&t<timing.cuts[i+1]));
export const coverAt = (t:number) => t<1.5||t>=timing.loopStart;
export const damageAt = (t:number) => ramp(t,35.5,42);
export const pulse = (t:number,rate=2) => Math.exp(-((t*rate)%1)*8);
export const mix3 = (a:V3,b:V3,p:number):V3 => [lerp(a[0],b[0],p),lerp(a[1],b[1],p),lerp(a[2],b[2],p)];
// Impact holds are explicit and independent of playback history.
export const impactTime = (age:number) => age<.13?age:age<.18?.13:age-.05;
