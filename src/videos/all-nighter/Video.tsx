import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import {useStoryTime} from '../../motion';
import {AudioTracks} from '../../components/AudioTracks';
import type {VideoProps} from '../../types';
import {Blur,Flash,Grain,Wipe,shake,MONO,SERIF} from '../showreel/kit';
import {C,timing,sceneAt,hoursAt,impairment,blackout,afterSleep,ramp} from './timeline';
import {Title,Aside,Small,Silhouette,Clock,Gauge,Reaction,Food} from './Graphics';
import {World} from './World';
import brief from './brief.json';

export const Video:React.FC<VideoProps>=(props)=>{
 const t=useStoryTime(65),frame=Math.floor(t*60+.0001),s=sceneAt(t),local=t-timing.cuts[s];
 const {width,height}=useVideoConfig(),fit=Math.min(width/1080,height/1920);
 const cover=s===0||t>=timing.loopCoverAt,clean=s===9,quiet=t>=58&&t<62,level=impairment(t),hours=hoursAt(t);
 const color=clean?C.navy:C.dawn,cue=brief.narration.find(c=>t>=c.start&&t<c.end);
 const [sx,sy]=shake(t,[1.15,15,28,35],5+level*8);const drift=level*Math.sin(t*.9)*1.25;
 const sub=s===2?Math.floor(local/2.35):Math.floor(local/2.5);
 return <AbsoluteFill style={{background:C.navy,alignItems:'center',justifyContent:'center',fontFamily:'Inter'}}>
 <div style={{width:1080,height:1920,position:'relative',overflow:'hidden',flexShrink:0,transform:`scale(${fit})`,background:clean?C.dawn:C.navy,color}}>
 <svg width={0} height={0} style={{position:'absolute'}}><filter id="night-rgb" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix in="SourceGraphic" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feOffset in="r" dx={level*7} result="ro"/><feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="gb"/><feOffset in="gb" dx={-level*3} result="gbo"/><feBlend in="ro" in2="gbo" mode="screen"/></filter></svg>
 <AbsoluteFill style={{transform:`translate(${sx}px,${sy}px) rotate(${drift}deg) scale(${1+level*.025})`,filter:level?`url(#night-rgb) blur(${level*.28}px)`:undefined}}>
 {cover&&<Silhouette time={t>=timing.loopCoverAt?0:t}/>}
 {[2,6,8].includes(s)&&<World time={t} scene={s} quality={props.quality}/>}
 <div style={{position:'absolute',top:105,left:85,fontFamily:MONO,fontSize:23,letterSpacing:2}}>INSIDE YOU · EP 03</div>
 <div style={{position:'absolute',right:110,top:105,fontFamily:MONO,fontSize:20,opacity:.6}}>NIGHT SHIFT</div>
 <div style={{position:'absolute',top:quiet?215:cover?235:205,left:85,right:125,textAlign:quiet?'left':'center',fontFamily:MONO,fontSize:quiet?22:25,letterSpacing:5,color:cover?C.amber:color}}>HOURS AWAKE {quiet&&<span>{hours.toString().padStart(2,'0')}</span>}</div>
 {!quiet&&<div style={{position:'absolute',top:cover?300:245,left:40,right:60,textAlign:'center',fontWeight:900,fontSize:cover?350:210,lineHeight:1,letterSpacing:'-.075em',color:cover?C.dawn:color}}>{String(hours).padStart(2,'0')}{cover&&<div style={{fontSize:120,letterSpacing:'-.04em',color:C.amber,marginTop:-5}}>HRS</div>}</div>}
 {s===0&&<><Aside top={1500}>one missed night. a very different brain.</Aside>{local>1.15&&<Blur id="drunk-stamp" vx={Math.max(0,1-ramp(local,1.15,1.6))*100} style={{position:'absolute',top:825,left:205,transform:`rotate(-12deg) scale(${.85+ramp(local,1.15,1.4)*.15})`}}><div style={{fontSize:155,fontWeight:900,color:C.red,border:`8px solid ${C.red}`,padding:'0 25px',letterSpacing:'-.06em'}}>DRUNK?</div></Blur>}</>}
 {s===1&&<><Title lines={local<2.2?['HOUR BY']:['HOUR.']} age={local%2.2} key={Math.floor(local/2.2)} strength={0} size={160} top={500}/><Clock time={local}/><Aside top={1490}>watch what changes.</Aside></>}
 {s===2&&<><Title lines={sub===0?['SLEEP']:sub===1?['PRESSURE']:['BUILDS.']} key={sub} age={local%2.35} strength={level} top={510} size={160}/><Small top={1375} color={C.amber}>ADENOSINE / SIGNALING MOLECULE</Small><Aside top={1450}>the pressure to sleep keeps rising.</Aside><Small top={1530}>PARTICLES = CONCEPTUAL ACCUMULATION</Small></>}
 {s===3&&<><Title lines={sub===0?['REACTION']:sub===1?['DELAYED.']:['≈ 0.05%']} key={sub} age={local%2.5} strength={level} top={505} size={145}/><Reaction time={local}/><Gauge value={.05*ramp(local,.5,2.4)}/><Aside top={1480}>17–19 h awake · some tests.</Aside><Small top={1550}>WILLIAMSON & FEYER / 2000</Small></>}
 {s===4&&<><Title lines={afterSleep(frame)?['MICRO','SLEEP.']:local<2.5?['STILL','WITH ME?']:['YOU CAN','MISS IT.']} age={local} strength={level} fixed top={570} size={165}/><div style={{position:'absolute',top:1110,left:95,right:125,height:2,background:C.amber}}/><div style={{position:'absolute',top:1100,left:100+(local*145)%850,width:20,height:24,background:C.red}}/><Aside top={1370}>brief sleep. no warning required.</Aside><Small top={1480}>CAN OCCUR · NO UNIVERSAL ONSET HOUR</Small></>}
 {s===5&&<><Title lines={sub===0?['≈ 0.10%']:sub===1?['PAST THE']:['LINE.']} key={sub} age={local%2.5} strength={level} top={515} size={170}/><Gauge value={.05+.05*ramp(local,0,1.8)}/><Aside top={1480}>0.08% · most US states; Utah: 0.05%.</Aside><Small top={1550}>TASK PERFORMANCE COMPARISON / DAWSON & REID, 1997</Small></>}
 {s===6&&<><Title lines={sub===0?['NEXT DAY.']:sub===1?[`+${Math.round(ramp(local,2.5,3.8)*60)}%`]:['ON EDGE.']} key={sub} age={local%2.5} strength={level} top={515} size={sub===1?215:155}/><Small top={1350} color={C.red}>AMYGDALA REACTIVITY TO NEGATIVE IMAGES</Small><Aside top={1440}>roughly 35 h awake · group comparison.</Aside><Small top={1530}>YOO ET AL. / 2007 · LOCATION SCHEMATIC</Small></>}
 {s===7&&<><Title lines={sub===0?['GHRELIN ↑']:sub===1?['HUNGRIER.']:['STILL UP.']} key={sub} age={local%2.5} strength={level} top={520} size={140}/><Food time={local}/><Aside top={1440}>hunger can rise after one sleepless night.</Aside><Small top={1530}>SCHMID ET AL. / 2008 · NINE HEALTHY MEN</Small></>}
 {s===8&&<><Title lines={sub===0?['COFFEE?']:sub===1?['SIGNAL','BLOCKED.']:['NOT SLEEP.']} key={sub} age={local%2.5} strength={level*.7} top={495} size={140}/><Small top={1370} color={C.amber}>CAFFEINE / RECEPTOR INTERACTION IS SCHEMATIC</Small><Aside top={1450}>the pressure is still there.</Aside><Small top={1535}>CALLBACK / INSIDE YOU · COFFEE</Small></>}
 {s===9&&<><Title lines={['RECOVERY','SLEEP.']} age={local} strength={0} color={C.navy} top={quiet?470:515} size={150}/><Clock time={0} clean/>{!quiet&&<Aside top={1490} light>recovery helps. complete recovery can take longer.</Aside>}</>}
 {s===10&&!cover&&<><Title lines={['LONGEST','YOU’VE STAYED','AWAKE?']} age={local} strength={0} size={125} top={quiet?470:510}/><div style={{position:'absolute',top:1020,left:130,right:150,textAlign:'center',fontFamily:SERIF,fontSize:40,fontStyle:'italic',color:C.amber}}>tell me in the comments <span style={{display:'inline-block',transform:`translateY(${Math.sin(local*3)*6}px)`}}>↓</span></div><Small top={1760}>Educational, not medical advice.</Small></>}
 {s===10&&cover&&<Aside top={1500}>one missed night. a very different brain.</Aside>}
 </AbsoluteFill>
 {props.captions&&cue&&!quiet&&!cover&&<div style={{position:'absolute',left:85,right:125,bottom:220,fontSize:30,fontWeight:550,lineHeight:1.4,textAlign:'center',color,background:clean?'#e8f1fff0':'#0a0f1ef0',padding:'16px 20px',borderTop:`1px solid ${clean?'#0a0f1e33':'#e8f1fF44'}`}}>{cue.text}</div>}
 {timing.cuts.slice(1,-1).filter(at=>at!==60).map(at=><Wipe key={at} t={t} at={at} color={at===54?C.dawn:C.navy} span={.3}/>)}
 <Flash t={t} at={54} strength={.3}/>
 {!quiet&&<div style={{position:'absolute',left:0,top:0,width:1080,height:1080,transform:'scaleY(1.77777778)',transformOrigin:'top left',pointerEvents:'none'}}><Grain frame={cover?0:frame} opacity={clean?.015:.025+level*.018}/></div>}
 {blackout(frame)&&<AbsoluteFill style={{background:'#000'}}/>}
 </div>
 <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={.08}/>
 </AbsoluteFill>;
};
