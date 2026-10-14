import React,{useMemo} from 'react';
import {C,ramp,mix} from './timeline';
import {ease,clamp} from '../../../motion';
export const KineticTypography:React.FC<{lines:string[];time:number;at?:number;size?:number;top?:number;color?:string;align?:'left'|'center';exit?:number}>=({lines,time,at=0,size=118,top=230,color=C.cream,align='left',exit=99})=>{const out=ramp(time,exit,exit+.35);return <div style={{position:'absolute',top,left:82,right:110,fontSize:size,fontWeight:820,letterSpacing:-size*.065,lineHeight:.96,textAlign:align,color,transform:`translateY(${-out*110}px) scale(${1+out*.18})`,opacity:1-out}}>{lines.map((line,i)=>{const p=ease(clamp((time-at-i*.075)/.65));return <div key={line} style={{overflow:'hidden',paddingBottom:12}}><div style={{transform:`translateY(${(1-p)*110}%) rotate(${(1-p)*3}deg)`,transformOrigin:'left bottom'}}>{line}</div></div>;})}</div>;};
export const ScientificLabel:React.FC<React.PropsWithChildren<{top?:number;left?:number;color?:string;style?:React.CSSProperties}>>=({children,top=130,left=84,color=C.cream,style})=><div style={{position:'absolute',top,left,fontSize:23,letterSpacing:3,textTransform:'uppercase',fontWeight:550,color,...style}}>{children}</div>;

// Glyph masks become one continuous field of points during the transformation.
// Font loading is gated by the repository's FontFace/Remotion render hold.
const sampleGlyphs=(words:string[])=>{const c=document.createElement('canvas');c.width=900;c.height=400;const x=c.getContext('2d')!;x.font='850 170px Inter';x.textAlign='center';x.fillStyle='white';words.forEach((w,i)=>x.fillText(w,450,170+i*175));const d=x.getImageData(0,0,900,400).data;const pts:[number,number][]=[];for(let y=5;y<395;y+=8)for(let a=5;a<895;a+=8)if(d[(y*900+a)*4+3]>150)pts.push([a,y]);return pts;};
export const GlyphMorph:React.FC<{progress:number;top:number}>=({progress,top})=>{
 const pairs=useMemo(()=>{const a=sampleGlyphs(['LESS','SLEEPY']),b=sampleGlyphs(['MORE','ALERT']);const n=Math.max(a.length,b.length);return Array.from({length:n},(_,i)=>[a[Math.floor(i/n*a.length)],b[Math.floor(i/n*b.length)]]);},[]);
 const p=clamp(progress),q=p*p*(3-2*p);const points=pairs.map(([a,b],i)=>{const arc=Math.sin(q*Math.PI)*Math.sin(i*.08)*25;return `M${mix(a[0],b[0],q).toFixed(1)},${(mix(a[1],b[1],q)+arc).toFixed(1)}h.01`;}).join('');
 return <svg width={900} height={400} viewBox="0 0 900 400" style={{position:'absolute',left:80,top,overflow:'visible'}}>
 {p<.08&&<text x={450} y={170} fill={C.cream} textAnchor="middle" style={{fontSize:170,fontWeight:850,letterSpacing:-8,opacity:1-p/.08}}>LESS<tspan x={450} dy={175}>SLEEPY</tspan></text>}
 {p>.92&&<text x={450} y={170} fill={C.cyan} textAnchor="middle" style={{fontSize:170,fontWeight:850,letterSpacing:-8,opacity:(p-.92)/.08}}>MORE<tspan x={450} dy={175}>ALERT</tspan></text>}
 <path d={points} stroke={p<.5?C.cream:C.cyan} strokeWidth={6.5} strokeLinecap="round" opacity={Math.min(1,p/.08,(1-p)/.08)}/>
 </svg>;
};

// Spatial bridge: iris coverage hides the scale change; the warm/cool tint carries continuity.
export const CameraTransition:React.FC<{time:number;at:number;kind:'liquid'|'aperture'|'depth'|'match'}>=({time,at,kind})=>{const x=(time-at)/.42;if(Math.abs(x)>1)return null;const p=1-Math.abs(x);const color=kind==='liquid'?C.espresso:kind==='match'?C.bronze:kind==='aperture'?C.cream:C.cyan;return <div style={{position:'absolute',inset:0,pointerEvents:'none',background:color,clipPath:`circle(${p*115}% at 50% ${kind==='liquid'?56:50}%)`,opacity:kind==='depth'?.55:1,filter:kind==='depth'?'blur(24px)':undefined}}/>;};
export const DeclineCurve:React.FC<{time:number}>=({time})=>{const p=ramp(time,.7,5.5);return <svg width={900} height={380} viewBox="0 0 900 380" style={{position:'absolute',left:80,top:1125}}><defs><linearGradient id="curve-fill" x2="0" y2="1"><stop stopColor={C.cyan} stopOpacity={.2}/><stop offset="1" stopColor={C.cyan} stopOpacity={0}/></linearGradient></defs>
 <path d="M55 60 C190 70 225 190 380 235 S650 300 845 310 V325 H55Z" fill="url(#curve-fill)" opacity={p}/><path d="M55 325H845M55 325V40" stroke={C.cream} opacity={.18}/>
 <path d="M55 60 C190 70 225 190 380 235 S650 300 845 310" fill="none" stroke={C.cyan} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>
 <path d="M55 120H845" fill="none" stroke={C.bronze} strokeWidth={2} strokeDasharray="5 12" opacity={ramp(time,3,4)}/>
 <text x={55} y={22} fill={C.cyan} fontSize={25}>CAFFEINE IN THE BODY</text><text x={845} y={365} textAnchor="end" fill={C.cream} fontSize={23} opacity={.65}>TIME → · CONCEPTUAL</text>
 </svg>;};
