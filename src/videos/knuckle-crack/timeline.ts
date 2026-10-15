import {clamp,smooth} from '../../motion';
export const P={paper:'#F2F0EB',ink:'#0B0B0C',red:'#E5242B'};
export const cuts=[0,3,8,16,25,33,41,48,57,62];
export const edits=[0,.4,1.6,3,5.5,8,10.5,13,16,18.5,21,23.5,25,25.5,28,30.5,33,35.5,38,41,43.5,46,48,50.5,53,55.5,57,59.5,61.5];
export const ramp=(t:number,a:number,b:number)=>smooth(clamp((t-a)/(b-a)));
export const sceneAt=(t:number)=>Math.min(8,cuts.findIndex((v,i)=>t>=v&&t<cuts[i+1]));
export const holdTime=(t:number)=>{for(const hit of [.4,3,8,16,25.5,33,41,48,57])if(t>=hit&&t<hit+3/60)return hit;return t;};
export type V3=[number,number,number];
