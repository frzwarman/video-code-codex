import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import type {VideoProps} from '../../types';
import {useStoryTime} from '../../motion';
import {AudioTracks} from '../../components/AudioTracks';
import {Grain,MONO,Wipe,shake} from '../showreel/kit';
import {C,coverAt,ramp,sceneAt,timing} from './timeline';
import {World} from './World';
import {useGltf} from '../../three/useGltf';
import {middleAnchors} from './assets';
import {hairLabelAnchor} from './hair';
import {Aside,Chip,Exposure,FluidWipe,Kinetic,LumenTransition,SignalTrace,VolumeDial,WorldLabel} from './Graphics';
import brief from './brief.json';
import audioLevels from './audio-levels.json';

export const Video:React.FC<VideoProps>=(props)=>{
 // Hold the Remotion frame at the always-mounted root until all local GLBs load.
 // Loading inside a conditionally mounted ThreeCanvas shot can capture a blank model.
 const headphones=useGltf('telinga-volume/models/headphones.glb');
 const outer=useGltf('telinga-volume/models/outer-ear.glb');
 const inner=useGltf('telinga-volume/models/inner-ear.glb');
 const t=useStoryTime(65),s=sceneAt(t),age=t-timing.cuts[s],cover=coverAt(t);
 const {width,height}=useVideoConfig(),fit=Math.min(width/1080,height/1920);
 const visualTime=t>=timing.loopStart?0:t,visualScene=t>=timing.loopStart?0:s,clean=s===8;
 const energy=audioLevels.levels[Math.min(audioLevels.levels.length-1,Math.floor(visualTime*audioLevels.fps))]??0;
 const cue=brief.narration.find(c=>t>=c.start&&t<c.end);
 const [sx,sy]=shake(t,[1.5,27,35,43],4);
 const title=(lines:string[],size=158,at=0,color=clean?C.ink:C.pearl,top=275)=><Kinetic key={`${s}-${lines.join()}`} lines={lines} size={size} age={age-at} color={color} top={top}/>;
 if(!headphones||!outer||!inner)return null;
 return <AbsoluteFill style={{background:C.ink,alignItems:'center',justifyContent:'center',fontFamily:'Inter'}}>
  <div style={{width:1080,height:1920,flexShrink:0,position:'relative',overflow:'hidden',transform:`scale(${fit})`,color:clean?C.ink:C.pearl,background:clean?C.pearl:C.ink}}>
   <AbsoluteFill style={{background:clean?'radial-gradient(ellipse at 40% 55%, #FFFFFF, #D9E4DB 75%)':`radial-gradient(ellipse at 45% 57%, ${s>=6&&s<=7?'#49251D':'#17463E'}, ${C.ink} 64%)`}}/>
   <svg width={1080} height={1920} style={{position:'absolute',opacity:clean?.08:.09+energy*.09}}>
    {Array.from({length:11},(_,i)=><circle key={i} cx={535} cy={990} r={240+i*90} fill="none" stroke={clean?C.ink:C.mint} strokeWidth={1}/>)}
    <path d="M 540 120 V 1760 M 80 980 H 970" stroke={clean?C.ink:C.mint} strokeWidth={1}/>
   </svg>
   <div style={{position:'absolute',top:690,left:-50,right:-50,fontSize:230,fontWeight:900,letterSpacing:'-.08em',color:'transparent',WebkitTextStroke:`1px ${clean?'#07131622':'#f4f0e817'}`,transform:`translateX(${cover?0:Math.sin(t*.2)*65}px) rotate(-90deg)`,pointerEvents:'none'}}>DENGARIN.</div>
   <AbsoluteFill style={{transform:`translate(${cover?0:sx}px,${cover?0:sy}px)`}}>
    <World time={visualTime} scene={visualScene} quality={props.quality} assets={{headphones,outer,inner}}/>
    <div style={{position:'absolute',top:112,left:84,fontFamily:MONO,fontSize:22,letterSpacing:2}}>INSIDE YOU <span style={{opacity:.45}}> / </span> TELINGA</div>
    <div style={{position:'absolute',top:112,right:130,fontFamily:MONO,fontSize:21,color:clean?'#34544C':C.mint}}>ID · 65 DETIK</div>

    {cover&&<><Kinetic lines={['FULL','VOLUME?']} age={0} fixed size={182}/><Aside top={1435}>lagunya enak. telingamu gimana?</Aside><Chip top={1330}>MASUK KE DALAM TELINGAMU →</Chip></>}
    {s===0&&!cover&&<>{age<2.7?title(['MUSIKNYA','ENAK.'],164,1.5):title(['TELINGAMU?'],128,2.7)}<Aside top={1435}>coba kita lihat ke dalam.</Aside></>}
    {s===1&&<>{age<2.5?title(['MASUK.'],180):title(['SAMPAI','GENDANG.'],153,2.5)}<Chip top={1355}>01 / LIANG TELINGA</Chip><SignalTrace time={t} top={1455}/></>}
    {s===2&&<>{age<2.5?title(['GETARAN.'],158):title(['3 TULANG','KECIL.'],159,2.5)}
     {age<2.5?<WorldLabel time={t} scene={s} anchor={middleAnchors.eardrum} text="GENDANG TELINGA" x={100} y={1250}/>:<WorldLabel time={t} scene={s} anchor={middleAnchors.ossicles} text="TULANG PENDENGARAN" x={470} y={1250}/>}
     <Aside top={1420}>kecil-kecil, nyambungin suara.</Aside><Chip top={1350}>MESH CT · GERAK GETAR DIPERBESAR</Chip></>}
    {s===3&&<>{age<2.5?title(['RUMAH','SIPUT.'],175):title(['ADA','CAIRANNYA.'],134,2.5)}<Chip top={1350}>02 / POTONGAN KOKLEA · MESH CT</Chip><Aside top={1430}>kita masuk lebih dalam lagi.</Aside></>}
    {s===4&&<>{age<2.8?title(['RAMBUT','SUPERKECIL.'],129):age<5.5?title(['GERAK →','SINYAL.'],158,2.8):title(['BARU DEH,','KEDENGARAN.'],121,5.5)}
     {age<2.8&&<WorldLabel time={t} scene={s} anchor={hairLabelAnchor} text="RAMBUT SENSORIK" x={120} y={1300}/>}
     <SignalTrace time={t} top={1435}/><Chip top={1340}>03 / SEL RAMBUT → SARAF → OTAK</Chip></>}
    {s===5&&<>{age<3.5?title(['KERASNYA.'],141):title(['× LAMANYA.'],134,3.5)}<Exposure age={age}/><Aside top={1450}>dua-duanya ngaruh.</Aside></>}
    {s===6&&<>{age<3.5?title(['BISA','RUSAK.'],186,0,C.coral):title(['SUARANYA','MENDEM?'],143,3.5)}<SignalTrace time={t} damaged top={1440}/><Chip top={1350} color={C.coral}>ILUSTRASI KERUSAKAN · WAKTU DIPADATKAN</Chip></>}
    {s===7&&<>{age<3?title(['BISA','PERMANEN.'],144,0,C.coral):<Kinetic key="undo" lines={['NGGAK ADA','UNDO.']} size={142} age={age-3} strikeLine={1}/>}
     <Chip top={1340} color={C.coral}>SEL RAMBUT MATI TIDAK TUMBUH KEMBALI</Chip><Aside top={1430}>jangan tunggu sampai terasa.</Aside></>}
    {s===8&&<>{age<2.5?title(['TURUNIN','VOLUME.'],160):age<5?title(['KASIH','JEDA.'],178,2.5):title(['NOISE','CANCELLING.'],131,5)}
     <VolumeDial age={age}/><Aside top={1430} color="#385D53">{age<2.5?'lagunya tetap bisa dinikmatin.':age<5?'telinga juga butuh istirahat.':'biar nggak perlu ngelawan bising.'}</Aside></>}
    {s===9&&<>{title(['BAGIAN','FAVORIT =','VOLUME NAIK?'],119)}<VolumeDial age={age} quiet/><Aside top={1430}>jujur, kamu juga? ↓ tulis di komentar</Aside></>}
    {s===10&&!cover&&<>{title(['LAGU BISA','DIULANG.'],158)}<Aside top={1430}>telingamu? jaga dari sekarang.</Aside></>}
   </AbsoluteFill>
   {props.captions&&cue&&t<timing.loopStart&&<div style={{position:'absolute',top:1560,left:84,right:130,padding:'20px 22px',borderRadius:18,background:clean?'#ffffffdd':'#071316eb',borderTop:`1px solid ${clean?'#07131633':'#37e8cc44'}`,fontSize:34,lineHeight:1.32,fontWeight:520,textAlign:'center',color:clean?C.ink:C.pearl}}>{cue.text}</div>}
   <div style={{position:'absolute',left:86,right:130,top:1770,display:'flex',justifyContent:'space-between',fontFamily:MONO,fontSize:18,letterSpacing:1,opacity:.6}}>
    <span>{cover||s===0?'MUSIK TERLALU KERAS?':s>=1&&s<=7?'ANATOMI DISEDERHANAKAN · BUKAN SKALA ASLI':'EDUKASI, BUKAN NASIHAT MEDIS'}</span><span>{cover?'01':String(s+1).padStart(2,'0')} / 11</span>
   </div>
   <Grain frame={cover?0:Math.floor(t*60)} opacity={.027} w={1080} h={1920}/>
   <LumenTransition time={t} at={4}/>
   <FluidWipe time={t} at={14}/>
   <LumenTransition time={t} at={19} color="#143C35"/>
   {[9,27,35,49,62].map(at=><Wipe key={at} t={t} at={at} w={1080} color={at===49?C.pearl:at===35?C.coral:C.ink} span={.28}/>)}
  </div>
  <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={.05}/>
 </AbsoluteFill>;
};
