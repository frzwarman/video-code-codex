import React,{useMemo} from 'react';
import {PerspectiveCamera,Vector3} from 'three';
import {Blur,backOut,MONO,SERIF} from '../showreel/kit';
import {clamp,lerp} from '../../motion';
import {C,ramp,impactTime,type V3} from './timeline';
import {cameraAt} from './camera';

export const Kinetic:React.FC<{lines:string[];age:number;size?:number;top?:number;color?:string;fixed?:boolean;align?:'left'|'center';outline?:boolean;strikeLine?:number}>=({lines,age,size=160,top=275,color=C.pearl,fixed=false,align='left',outline=false,strikeLine})=>{
 const x=(a:number)=>fixed?0:(1-backOut(clamp(impactTime(a)/.48),1.05))*1060;
 const position=x(age),velocity=x(age)-x(age-1/60);
 return <Blur id="ear-type-blur" vx={velocity} k={.38} style={{position:'absolute',top,left:84,right:124,transform:`translateX(${position}px)`,textAlign:align}}>
  {lines.map((line,i)=><div key={`${i}-${line}`} style={{fontWeight:900,fontSize:size,lineHeight:.94,letterSpacing:'-.065em',color:outline?'transparent':color,WebkitTextStroke:outline?`2px ${color}`:undefined,whiteSpace:'nowrap'}}>
   {i===strikeLine?<span style={{position:'relative',display:'inline-block'}}>{line}<span aria-hidden style={{position:'absolute',left:0,right:0,top:'50%',height:'.07em',background:C.coral,transform:`translateY(-50%) scaleX(${ramp(age,.16,.6)})`,transformOrigin:'left center',pointerEvents:'none'}}/></span>:line}
  </div>)}
 </Blur>;
};
export const Aside:React.FC<React.PropsWithChildren<{top?:number;color?:string}>>=({children,top=1420,color=C.mint})=><div style={{position:'absolute',left:90,right:125,top,fontFamily:SERIF,fontStyle:'italic',fontSize:35,lineHeight:1.3,color}}>{children}</div>;
export const Chip:React.FC<React.PropsWithChildren<{top:number;left?:number;color?:string}>>=({children,top,left=86,color=C.mint})=><div style={{position:'absolute',top,left,fontFamily:MONO,fontSize:23,letterSpacing:1,color,border:`1px solid ${color}66`,padding:'10px 16px',borderRadius:30,background:`${C.ink}dd`}}>{children}</div>;

export const WorldLabel:React.FC<{time:number;scene:number;anchor:V3;text:string;x:number;y:number;color?:string}>=({time,scene,anchor,text,x,y,color=C.mint})=>{
 const camera=useMemo(()=>new PerspectiveCamera(38,1080/1920,.05,70),[]),pose=cameraAt(time,scene);
 camera.position.set(...pose.position);camera.lookAt(...pose.target);camera.updateMatrixWorld();
 const p=new Vector3(...anchor).project(camera),px=(p.x+1)*540,py=(1-p.y)*960;
 if(p.z< -1||p.z>1)return null;
 return <svg width={1080} height={1920} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
  <path d={`M ${px} ${py} L ${x+35} ${y-22} L ${x+250} ${y-22}`} stroke={color} strokeWidth={1.7} fill="none" opacity={.7}/>
  <circle cx={px} cy={py} r={6} fill={color}/>
  <text x={x+35} y={y+12} fill={color} fontFamily={MONO} fontSize={25}>{text}</text>
 </svg>;
};

export const SignalTrace:React.FC<{time:number;damaged?:boolean;top?:number}>=({time,damaged=false,top=1430})=>{
 const paths=Array.from({length:3},(_,row)=>Array.from({length:100},(_,i)=>{
  const x=90+i*8.6,drop=damaged&&((i>28&&i<42)||(i>66&&i<76));
  const y=top+row*16+(drop?0:Math.sin(i*.34-time*7+row*.18)*19*Math.sin(i/99*Math.PI));
  return `${i===0?'M':'L'} ${x} ${y}`;
 }).join(' '));
 return <svg width={1080} height={1920} style={{position:'absolute',inset:0}}>{paths.map((d,i)=><path key={i} d={d} fill="none" stroke={damaged?C.coral:C.mint} strokeWidth={i===0?3:1} opacity={1-i*.28}/>)}</svg>;
};

export const Exposure:React.FC<{age:number}>=({age})=>{
 const volume=ramp(age,.2,2.4),duration=ramp(age,3.6,6.1);
 return <div style={{position:'absolute',left:100,right:140,top:1070,padding:'32px 36px',background:`${C.ink}ed`,border:`1px solid ${C.mint}55`,borderRadius:28}}>
  {[['KERASNYA',volume],['LAMANYA',duration]].map(([name,value],i)=><div key={String(name)} style={{marginBottom:i===0?34:0}}>
   <div style={{display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:26,color:C.pearl,marginBottom:12}}><span>{name}</span><span style={{color:C.coral}}>↑</span></div>
   <div style={{display:'flex',gap:7}}>{Array.from({length:28},(_,k)=><div key={k} style={{height:30,flex:1,borderRadius:3,background:k/28<.15+Number(value)*.85?k>20?C.coral:C.mint:'#29413C'}}/>)}</div>
  </div>)}
  <div style={{fontFamily:MONO,fontSize:19,letterSpacing:1.5,color:C.muted,marginTop:24}}>ILUSTRASI PAPARAN · BUKAN PENGUKURAN</div>
 </div>;
};

export const VolumeDial:React.FC<{age:number;quiet?:boolean}>=({age,quiet=false})=>{
 const p=quiet?.28:lerp(.9,.3,ramp(age,0,1.3));
 return <div style={{position:'absolute',top:quiet?1320:1350,left:100,right:150,color:quiet?C.pearl:C.ink}}>
  <div style={{display:'flex',alignItems:'center',gap:25}}><span style={{fontFamily:MONO,fontSize:24}}>VOLUME</span><div style={{height:8,flex:1,background:quiet?'#42615B':'#AABCB3',borderRadius:10,position:'relative'}}><div style={{width:`${p*100}%`,height:8,background:quiet?C.mint:C.ink,borderRadius:10}}/><div style={{position:'absolute',left:`${p*100}%`,top:-11,width:30,height:30,background:quiet?C.mint:C.ink,borderRadius:'50%'}}/></div></div>
 </div>;
};

/** Lens / lumen match transition. The annulus hides the cut while its aperture passes camera. */
export const LumenTransition:React.FC<{time:number;at:number;color?:string}>=({time,at,color=C.ink})=>{
 const d=time-at;if(Math.abs(d)>.42)return null;
 const radius=Math.pow(Math.abs(d)/.42,1.65)*1450;
 return <svg width={1080} height={1920} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
  <defs><mask id={`lumen-${at}`}><rect width={1080} height={1920} fill="white"/><circle cx={520} cy={970} r={radius} fill="black"/></mask></defs>
  <rect width={1080} height={1920} fill={color} mask={`url(#lumen-${at})`}/>
  <circle cx={520} cy={970} r={radius+4} fill="none" stroke={C.mint} strokeWidth={8} opacity={.7}/>
  {radius<300&&<path d="M 480 970 L 500 970 L 510 943 L 528 992 L 542 970 L 560 970" stroke={C.mint} strokeWidth={3} fill="none"/>}
 </svg>;
};

/** A moving fluid front, not an opacity dissolve. Full cover at the edit. */
export const FluidWipe:React.FC<{time:number;at:number}>=({time,at})=>{
 const d=time-at;if(Math.abs(d)>.32)return null;
 const p=(d+.32)/.64,x=lerp(2100,-2500,p),trail=1800;
 return <svg width={1080} height={1920} style={{position:'absolute',inset:0}}>
  <path d={`M ${x} -100 C ${x-300} 450 ${x+380} 1250 ${x-30} 2020 L ${x+trail} 2020 C ${x+trail+450} 1300 ${x+trail-320} 350 ${x+trail} -100 Z`} fill={C.mint}/>
  <path d={`M ${x-10} -100 C ${x-310} 450 ${x+370} 1250 ${x-40} 2020`} stroke={C.pearl} strokeWidth={6} fill="none"/>
 </svg>;
};
