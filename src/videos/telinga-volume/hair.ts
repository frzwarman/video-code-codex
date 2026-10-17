import {LatheGeometry,Vector2,Vector3} from 'three';

// An authored microscopic illustration, not a scan or a literal cell count.
export const HAIRS_PER_RANK=11;
export const HAIRS_PER_CELL=HAIRS_PER_RANK*3;
export const tissueHeight=(x:number,z:number)=>-.12+.045*Math.sin(x*.7)-.022*z*z;
export const hairCells=Array.from({length:28},(_,i)=>{
 const column=Math.floor(i/4),row=i%4,x=(column-3)*1.02+(row%2)*.14;
 const z=[-1.5,-.28,.65,1.55][row]+.075*Math.sin(x*.6);
 return {x,z,y:tissueHeight(x,z)+.055,row,index:i,selected:i===14||i%7===1,
  turn:Math.sin(i*12.7)*.045,scale:1+Math.sin(i*7.13)*.045};
});
export const heroCell=hairCells[14];
export const hairLabelAnchor:[number,number,number]=[heroCell.x,heroCell.y+.8,heroCell.z];

/** Flattened apical plate with rounded shoulders; bundles sit on the plate. */
export function hairCellGeometry(){
 const profile=[new Vector2(0,-.52),new Vector2(.2,-.5),new Vector2(.35,-.35),new Vector2(.42,-.12),new Vector2(.44,.025)];
 for(const r of [.85,.6,.3,0])profile.push(new Vector2(.44*r,.065-.04*r*r));
 return new LatheGeometry(profile,24);
}

/** Narrow insertion, straight shaft, rounded tip. Origin is the insertion point. */
export function stereociliumGeometry(){
 return new LatheGeometry([[0,0],[.38,0],[.64,.045],[.94,.13],[1,.35],[1,.9],[.92,.96],[.6,.99],[0,1]].map(([r,y])=>new Vector2(r,y)),8);
}

export function hairState(cell:typeof hairCells[number],j:number,time:number,damage:number){
 const rank=Math.floor(j/HAIRS_PER_RANK),k=j%HAIRS_PER_RANK-5;
 // Inner cells have a broad, shallow arc; outer cells have chevron bundles.
 const x=k*.052,z=(rank-1)*.09+(cell.row===0?k*k*.0045:Math.abs(k)*.035)-.08;
 const radius2=(x/.44)**2+(z/.352)**2;
 const root=new Vector3(x,.065-.04*radius2-.006,z);
 const loss=cell.selected?damage:0;
 const wave=Math.sin(cell.x*1.3-time*4.3)*.075;
 const tilt=wave+loss*(.75+.12*Math.sin(j*2.4));
 const direction=new Vector3(Math.sin(tilt)*.18,Math.cos(tilt),Math.sin(tilt)).normalize();
 // Collapse a damaged bundle gradually; every later scene keeps that loss.
 const disappear=Math.min(1,Math.max(0,(loss-(.62+(j%5)*.045))/.16));
 const height=(.36+rank*.19)*(1+.025*Math.cos(k*1.2))*(1-disappear);
 const width=.022*(1+.035*Math.sin(j*4.7))*(1-disappear);
 return {root,direction,height,width,loss,rank};
}
