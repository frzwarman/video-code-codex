import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AnimatedChart, AnimatedDiagram, Captions, CinematicTitle, OrbitDiagram, ParticleField, RevealPanel} from '../components/Motion';
import {Phone} from '../components/Phone';
import {AudioTracks} from '../components/AudioTracks';
import {ThreeStage, ObjectReveal, NetworkGlobe} from '../three/Scenes';
import {fonts, palette} from '../theme';
import {useStoryTime} from '../motion';
import type {Brief, VideoProps} from '../types';

// A renderable storyboard foundation. Replace this with original scene choreography.
export const BriefVideo: React.FC<VideoProps & {brief: Brief}> = ({brief, ...props}) => {
  const {width, height} = useVideoConfig(); const time = useStoryTime(brief.duration);
  const index = Math.max(0, brief.scenes.findIndex((s) => time >= s.start && time < s.end));
  const scene = brief.scenes[index]; const local = time - scene.start;
  const wide = width > height; const square = width === height;
  const scale = wide ? 0.88 : square ? 0.6 : 0.95;
  const cx = wide ? width * 0.7 : width / 2; const cy = wide ? 550 : square ? 630 : 1070;
  let visual: React.ReactNode;
  if (brief.category === 'data') visual = <AnimatedChart time={local} data={[{label: 'A', value: 24}, {label: 'B', value: 48}, {label: 'C', value: 75}, {label: 'D', value: 92}]}/>;
  else if (brief.category === 'science') visual = <OrbitDiagram time={time}/>;
  else if (brief.category === 'satisfying') visual = <ThreeStage width={800} height={800} quality={props.quality}><ObjectReveal time={time} loop/></ThreeStage>;
  else if (brief.category === 'technology') visual = <ThreeStage width={800} height={800} quality={props.quality}><NetworkGlobe time={local} quality={props.quality}/></ThreeStage>;
  else if (brief.category === 'product') visual = <Phone time={local} style={{margin: '0 auto'}}/>;
  else visual = <RevealPanel time={local}><AnimatedDiagram time={local} width={700} labels={['Input', 'Process', 'Output']}/><p style={{fontSize: 35, color: palette.muted}}>One idea. A clear visual explanation.</p></RevealPanel>;
  return <AbsoluteFill style={{background: palette.ink, color: palette.paper, fontFamily: fonts.body}}>
    <style>{'* {box-sizing:border-box}'}</style><ParticleField count={35}/>
    <div style={{position: 'absolute', left: 85, top: 70, fontSize: 22, letterSpacing: 4, color: palette.cyan}}>{brief.category.toUpperCase()} / {index + 1}</div>
    <CinematicTitle key={index} lines={[scene.title]} time={local} size={square ? 72 : 100} style={{position: 'absolute', left: 85, top: wide ? 260 : 170, width: wide ? 680 : 900}}/>
    <div style={{position: 'absolute', left: cx - 400 * scale, top: cy - 400 * scale, width: 800, height: 800, display: 'grid', alignContent: 'center', transform: `scale(${scale})`, transformOrigin: 'top left'}}>{visual}</div>
    {props.captions && <Captions cues={brief.narration} time={time} width={wide ? 1400 : 820} bottom={wide ? 90 : square ? 70 : 245} fontSize={square ? 28 : 36}/>}
    <AudioTracks brief={brief} enabled={props.audio}/>
  </AbsoluteFill>;
};
