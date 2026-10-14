import {clamp, smooth, lerp} from '../../../motion';
export const C = {ink:'#08090B', espresso:'#241610', bronze:'#B77742', cream:'#F4E9D8', cyan:'#66D9E8'};
export const beats = {cup:0, absorption:4, blood:10, brain:16, receptor:19.3, alert:23, metabolism:31, return:39, end:45} as const;
export const ramp = (t:number,a:number,b:number)=>smooth(clamp((t-a)/(b-a)));
export const mix = lerp;
export const phase = (t:number,period:number)=>((t%period)+period)%period/period;
export type V3=[number,number,number];
export const mix3 = (a:V3,b:V3,p:number):V3=>a.map((v,i)=>lerp(v,b[i],p)) as V3;
export const localShot = (t:number)=>t<4?'cup':t<10?'absorption':t<16?'blood':t<19.3?'brain':t<23?'receptor':t<31?'alert':t<39?'metabolism':'return';
