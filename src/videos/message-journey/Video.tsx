import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {CinematicTitle, Captions, Glow, ParticleField, SceneLayer, SceneTransition} from '../../components/Motion';
import {MessageBubble, Phone, SendIcon} from '../../components/Phone';
import {AudioTracks} from '../../components/AudioTracks';
import {NetworkGlobe, PacketTunnel, ThreeStage} from '../../three/Scenes';
import {clamp, ease, lerp, progress, tween, useStoryTime} from '../../motion';
import {fonts, palette} from '../../theme';
import {presets} from '../../../studio.config.mjs';
import type {Brief, VideoProps} from '../../types';
import briefData from './brief.json';

const brief: Brief = briefData;
const boundaries = [0, 3.5, 7, 11, 17, 21.5, 26, 30];

const Micro: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => <div style={{position: 'absolute', fontFamily: fonts.mono, fontSize: 20, letterSpacing: '0.12em', color: palette.muted, ...style}}>{children}</div>;

const Radar: React.FC<{time: number; received?: boolean}> = ({time, received = false}) => <svg width={1000} height={900} viewBox="0 0 1000 900" style={{position: 'absolute', inset: 0}}>
  <defs><radialGradient id={received ? 'radar-received' : 'radar-send'}><stop stopColor={palette.cyan} stopOpacity={0.14}/><stop offset="1" stopColor={palette.cyan} stopOpacity={0}/></radialGradient></defs>
  <circle cx={500} cy={450} r={430} fill={`url(#${received ? 'radar-received' : 'radar-send'})`}/>
  {[200, 290, 380].map((r, i) => <circle key={r} cx={500} cy={450} r={r + Math.sin(time * 1.7 + i) * 8} fill="none" stroke={palette.cyan} strokeOpacity={0.11 - i * 0.02} strokeWidth={1.5}/>)}
  {Array.from({length: 48}, (_, i) => {const a = i / 48 * Math.PI * 2; return <line key={i} x1={500 + Math.cos(a) * 414} y1={450 + Math.sin(a) * 414} x2={500 + Math.cos(a) * (i % 4 ? 420 : 432)} y2={450 + Math.sin(a) * (i % 4 ? 420 : 432)} stroke={palette.cyan} strokeOpacity={i % 4 ? 0.15 : 0.45}/>;})}
</svg>;

const Hook: React.FC<{time: number}> = ({time}) => {
  const p = tween(time, 0.15, 1.5); const lift = tween(time, 2.65, 3.6);
  return <>
    <Radar time={time}/>
    <div style={{position: 'absolute', left: 265, top: 215, width: 470, height: 470, borderRadius: '50%', background: 'linear-gradient(140deg,#b8ffee,#5de1cf 80%)', boxShadow: 'inset 0 3px 2px #ffffffaa, inset 0 -16px 40px #125a5566, 0 0 100px #8affec30, 0 35px 100px #0009', display: 'grid', placeItems: 'center', transform: `perspective(1200px) rotateX(${15 - p * 15}deg) rotateZ(${-12 + p * 12}deg) scale(${0.08 + p * 0.92 + lift * 0.1}) translateY(${-lift * 30}px)`, opacity: p}}><SendIcon size={240}/></div>
    <Micro style={{left: 95, top: 164, opacity: p}}>01 / THE MOMENT</Micro>
    <Micro style={{right: 80, bottom: 130, color: palette.cyan, opacity: p}}>A WORLD BEHIND ONE TAP</Micro>
    <svg width={1000} height={900} style={{position: 'absolute'}}><path d="M155 200 H260 M740 700 H845" stroke={palette.cyan} strokeOpacity={0.4}/></svg>
  </>;
};

const SendPhone: React.FC<{time: number}> = ({time}) => {
  const p = tween(time, 0, 1); const depart = tween(time, 2, 3.45);
  return <>
    <Radar time={time}/>
    <Phone time={time} showMessage={time < 2.25} style={{position: 'absolute', left: 293, top: 38, transform: `perspective(1600px) rotateY(${-16 + p * 9}deg) rotateZ(${-9 + p * 3}deg) translateY(${(1 - p) * 130}px) scale(${0.95 + p * 0.05 - depart * 0.07})`}}/>
    {time >= 2 && <MessageBubble style={{position: 'absolute', left: lerp(403, 260, depart), top: lerp(480, 280, depart), opacity: tween(time, 2, 2.25), transform: `scale(${lerp(0.76, 1.5, depart)}) rotate(${lerp(-6, 0, depart)}deg)`, transformOrigin: 'left center'}}/>}
    <Micro style={{left: 52, top: 690, opacity: p}}>YOU</Micro><Micro style={{right: 40, top: 220, color: palette.cyan, opacity: p}}>TRANSMITTING ↗</Micro>
  </>;
};

const Packetize: React.FC<{time: number}> = ({time}) => {
  const split = tween(time, 0.35, 1.65); const depart = ease(progress(time, 2.65, 4.15));
  return <>
    <Glow size={850} style={{left: 75, top: 30}} opacity={0.1}/>
    <svg width={1000} height={900} style={{position: 'absolute'}}>{Array.from({length: 4}, (_, i) => <path key={i} d={`M500 140 C${70 + i * 270} 350 ${70 + i * 270} 550 500 790`} stroke={palette.blue} strokeOpacity={0.2} fill="none" strokeWidth={2}/>)}</svg>
    <MessageBubble style={{position: 'absolute', top: 320, left: 240, fontSize: 58, padding: '38px 54px', opacity: 1 - progress(time, 0.35, 0.85), transform: `scale(${1 + split * 0.2})`}}/>
    {Array.from({length: 12}, (_, i) => {
      const col = i % 4; const row = Math.floor(i / 4); const x = 140 + col * 185; const y = 265 + row * 135;
      const endX = 500 + (x - 500) * (1 + depart * 3); const endY = y - depart * (800 + i * 30);
      return <div key={i} style={{position: 'absolute', left: lerp(410, endX, split), top: lerp(340, endY, split), width: 162, height: 104, borderRadius: 16, padding: '15px 17px', border: `1.5px solid ${i % 3 === 0 ? '#cefff2' : '#619eae'}`, background: i % 3 === 0 ? 'linear-gradient(135deg,#b5ffe9,#60d8c7)' : 'linear-gradient(135deg,#244859,#132936)', color: i % 3 === 0 ? palette.ink : palette.cyan, opacity: progress(time, 0.45 + i * 0.025, 0.85 + i * 0.025), transform: `rotate(${depart * (col - 1.5) * 20}deg) scale(${0.5 + split * 0.5})`, boxShadow: i % 3 === 0 ? '0 0 25px #8affec20' : undefined}}>
        <div style={{fontFamily: fonts.mono, fontSize: 15, letterSpacing: 1, opacity: 0.65}}>PACKET {String(i + 1).padStart(2, '0')}</div>
        <div style={{fontFamily: fonts.mono, fontSize: 25, marginTop: 14}}>{['01001111', '01101110', '00100000', '01101101'][i % 4]}</div>
      </div>;
    })}
    <Micro style={{top: 145, left: 140}}>MESSAGE → BINARY → PACKETS</Micro>
    <Micro style={{top: 760, left: 140, opacity: split, fontSize: 16}}>SCHEMATIC · PACKET SIZES VARY</Micro>
  </>;
};

const Receive: React.FC<{time: number}> = ({time}) => {
  const p = tween(time, 0, 1.1); const arrival = tween(time, 0.25, 1.5);
  return <>
    <Radar time={time} received/>
    <Phone time={time - 0.85} received showMessage={time > 1} style={{position: 'absolute', left: 293, top: 35, transform: `perspective(1600px) rotateY(${15 - p * 8}deg) rotateZ(${8 - p * 3}deg) translateY(${(1 - p) * 90}px)`}}/>
    {Array.from({length: 10}, (_, i) => {const a = i / 10 * Math.PI * 2; return <div key={i} style={{position: 'absolute', left: lerp(500 + Math.cos(a) * 540, 545, arrival), top: lerp(450 + Math.sin(a) * 540, 496, arrival), width: 36, height: 25, borderRadius: 5, background: palette.cyan, transform: `rotate(${i * 35 * (1 - arrival)}deg)`, boxShadow: '0 0 24px #8affec77', opacity: (1 - progress(time, 1.05, 1.55)) * p}}/>;})}
    <div style={{position: 'absolute', left: 700, top: 175, width: 105, height: 105, borderRadius: '50%', display: 'grid', placeItems: 'center', background: palette.cyan, color: palette.ink, fontSize: 55, fontWeight: 600, transform: `scale(${tween(time, 1.4, 2.1)})`, boxShadow: '0 0 70px #8affec30'}}>✓</div>
    <Micro style={{left: 50, top: 200, opacity: p}}>ALEX</Micro>
    <Micro style={{right: 35, top: 735, color: palette.cyan, opacity: tween(time, 1.5, 2.1)}}>MESSAGE RECEIVED</Micro>
  </>;
};

const Connection: React.FC<{time: number}> = ({time}) => {
  const p = tween(time, 0, 1.2); const merge = tween(time, 1, 2.3); const close = tween(time, 3.25, 4.0);
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - close * 0.94})`, opacity: 1 - close * 0.65}}>
    <Radar time={time}/>
    <svg width={1000} height={900} viewBox="0 0 1000 900" style={{position: 'absolute'}}>
      <path d="M230 450 C350 250 650 650 770 450" fill="none" stroke={palette.line} strokeWidth={2}/>
      <path d="M230 450 C350 250 650 650 770 450" fill="none" stroke={palette.cyan} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}/>
      <circle cx={lerp(230, 440, merge)} cy={450} r={12 + merge * 4} fill={palette.cyan}/>
      <circle cx={lerp(770, 560, merge)} cy={450} r={12 + merge * 4} fill={palette.cyan}/>
      <path d="M350 330 Q350 300 380 300 H620 Q650 300 650 330 V510 Q650 540 620 540 H475 L390 610 V540 H380 Q350 540 350 510 Z" fill="#0e242b" stroke={palette.cyan} strokeWidth={4} opacity={merge} style={{filter: 'drop-shadow(0 0 18px #8affec40)'}}/>
      {[440, 500, 560].map((x, i) => <circle key={x} cx={x} cy={420} r={13} fill={palette.cyan} opacity={merge} transform={`translate(0 ${Math.sin(time * 3 - i * 0.8) * 10})`}/>)}
    </svg>
    <Micro style={{left: 355, top: 690, color: palette.cyan, opacity: merge}}>DISTANCE. REIMAGINED.</Micro>
  </div>;
};

export const Video: React.FC<VideoProps> = (props) => {
  const {width, height} = useVideoConfig(); const time = useStoryTime();
  const wide = width > height; const square = width === height;
  const artScale = wide ? 0.88 : square ? 0.59 : 1;
  const centerX = wide ? 1350 : width / 2;
  const centerY = wide ? 540 : square ? 625 : 1070;
  const headingX = wide ? 110 : 85; const headingY = wide ? 255 : square ? 134 : 235;
  const headingSize = wide ? 100 : square ? 73 : 110;
  const captionBottom = wide ? 75 : square ? 90 : 255;
  const sceneIndex = Math.min(6, boundaries.findIndex((b, i) => time >= b && time < boundaries[i + 1]));
  const heading = (lines: string[], local: number, accent = -1) => <CinematicTitle lines={lines} time={local} start={0.05} size={headingSize} accentLine={accent} style={{position: 'absolute', left: headingX, top: headingY, width: wide ? 780 : 950}}/>;
  const art = (children: React.ReactNode) => <div style={{position: 'absolute', left: centerX - 500 * artScale, top: centerY - 450 * artScale, width: 1000, height: 900, transform: `scale(${artScale})`, transformOrigin: 'top left'}}>{children}</div>;
  return <AbsoluteFill style={{background: palette.ink, color: palette.paper, fontFamily: fonts.body, overflow: 'hidden'}}>
    <style>{`* {box-sizing:border-box}`}</style>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%,#16303b55,transparent 62%),linear-gradient(135deg,#0c151e,#050a10)'}}/>
    <AbsoluteFill style={{opacity: 0.2, backgroundImage: 'linear-gradient(#66869b13 1px,transparent 1px),linear-gradient(90deg,#66869b13 1px,transparent 1px)', backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse,#000,transparent 75%)'}}/>
    <ParticleField count={presets[props.quality].particles} seed="message-journey" period={900}/>
    <div style={{position: 'absolute', top: wide ? 75 : square ? 65 : 123, left: headingX, display: 'flex', alignItems: 'center', gap: 15, fontSize: 24, letterSpacing: 5, fontWeight: 600}}><span style={{width: 14, height: 14, borderRadius: '50%', background: palette.cyan, boxShadow: '0 0 25px #8affec55'}}/>SIGNAL<span style={{marginLeft: 13, color: '#6d8795', fontSize: 17, letterSpacing: 2}}> / UNDER THE SURFACE</span></div>
    <Micro style={{right: wide ? 110 : 110, top: wide ? 81 : square ? 71 : 130, fontSize: 16}}>01</Micro>

    <SceneLayer time={time} start={0} end={3.65} fade={0.16}>
      {heading(['What happens', 'after you', 'hit send?'], time, 2)}{art(<Hook time={time}/>)}
    </SceneLayer>
    <SceneLayer time={time} start={3.35} end={7.15}>
      {heading(['One tap.', 'An invisible', 'journey.'], time - 3.35, 2)}{art(<SendPhone time={time - 3.35}/>)}
    </SceneLayer>
    <SceneLayer time={time} start={6.85} end={11.15}>
      {heading(['Your words.', 'In pieces.'], time - 6.85, 1)}{art(<Packetize time={time - 6.85}/>)}
    </SceneLayer>
    <SceneLayer time={time} start={10.85} end={17.15}>
      {heading(['A world of', 'connections.'], time - 10.85, 1)}
      {art(<><Glow size={850} style={{left: 75, top: 50}} opacity={0.1}/><ThreeStage width={1000} height={900} quality={props.quality}><NetworkGlobe time={time - 10.85} quality={props.quality}/></ThreeStage><Micro style={{left: 50, top: 92}}>THE NETWORK</Micro><Micro style={{right: 30, bottom: 70, color: palette.cyan}}>HOP {String(1 + Math.floor(progress(time, 11, 17) * 7)).padStart(2, '0')} / ROUTING</Micro></>)}
    </SceneLayer>
    <SceneLayer time={time} start={16.85} end={21.65}>
      {heading(['Always', 'moving.'], time - 16.85, 1)}
      {art(<><ThreeStage width={1000} height={900} quality={props.quality}><PacketTunnel time={time - 16.85} quality={props.quality}/></ThreeStage><Micro style={{left: 60, bottom: 70}}>CABLE · FIBER · RADIO</Micro><Micro style={{right: 60, top: 100, color: palette.cyan}}>→ DESTINATION</Micro></>)}
    </SceneLayer>
    <SceneLayer time={time} start={21.35} end={26.15}>
      {heading(['Back into', 'words.'], time - 21.35, 1)}{art(<Receive time={time - 21.35}/>)}
    </SceneLayer>
    <SceneLayer time={time} start={25.85} end={30.5}>
      {heading(['A tiny message.', 'A massive', 'journey.'], time - 25.85, 2)}{art(<Connection time={time - 25.85}/>)}
    </SceneLayer>
    {boundaries.slice(1, -1).map((b) => <SceneTransition key={b} time={time} at={b}/>)}
    {props.captions && <Captions cues={brief.narration} time={time} bottom={captionBottom} fontSize={wide ? 32 : square ? 28 : 37} width={wide ? 1500 : 830}/>}
    <div style={{position: 'absolute', left: headingX, right: wide ? 110 : 140, bottom: wide ? 36 : square ? 40 : 160, display: 'flex', gap: 10}}>{boundaries.slice(0, -1).map((b, i) => <div key={b} style={{height: 3, flex: 1, background: '#243641', overflow: 'hidden'}}><div style={{height: '100%', width: `${clamp((time - b) / (boundaries[i + 1] - b)) * 100}%`, background: palette.cyan}}/></div>)}</div>
    {!square && !wide && <Micro style={{left: headingX, bottom: 112, fontSize: 14}}>THE INVISIBLE EVERYDAY</Micro>}
    <AudioTracks brief={brief} enabled={props.audio}/>
  </AbsoluteFill>;
};
