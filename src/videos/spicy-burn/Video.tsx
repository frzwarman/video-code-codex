import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../components/AudioTracks';
import {useStoryTime} from '../../motion';
import type {VideoProps} from '../../types';
import brief from './brief.json';
import {Flash, Grain, shake, Wipe} from '../showreel/kit';
import {CaptionBar, Chrome, CUTS, P, VH, VW} from './look';
import {Birds, Cta, Hook, MilkWater, Scoville, Sensor, Sweat} from './Shots';
import {Chili, FireParticles, Molecule} from './Shots3D';

// Designed natively for 1080×1920; other formats letterbox the same picture.
export const Video: React.FC<VideoProps> = (props) => {
  const t = useStoryTime(brief.duration); const frame = Math.round(t * 60);
  const {width, height} = useVideoConfig(); const fit = Math.min(width / VW, height / VH);
  const loop = t >= 61.6; // last 0.4 s returns to the frame-0 cover for a seamless loop
  const shot = loop ? 0 : CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]);
  const [sx, sy] = shake(t, [0, 3, 8, 15, 18.6, 21.5, 24, 31, 38, 46, 53, 58], 12);
  const light = [5, 8].includes(shot);
  return <AbsoluteFill style={{background: P.ink, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: VW, height: VH, position: 'relative', overflow: 'hidden', transform: `scale(${fit})`, flexShrink: 0}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        {shot === 0 && <Hook t={loop ? 0 : t}/>}
        {shot === 1 && <Chili t={t} quality={props.quality}/>}
        {shot === 2 && <Molecule t={t} quality={props.quality}/>}
        {shot === 3 && <Sensor t={t}/>}
        {shot === 4 && <FireParticles t={t} quality={props.quality}/>}
        {shot === 5 && <Sweat t={t}/>}
        {shot === 6 && <Scoville t={t}/>}
        {shot === 7 && <MilkWater t={t}/>}
        {shot === 8 && <Birds t={t}/>}
        {shot === 9 && <Cta t={t}/>}
      </AbsoluteFill>
      <Wipe t={t} at={3} color={P.ink} w={VW}/><Wipe t={t} at={15} color={P.red} w={VW} angle={90}/>
      <Wipe t={t} at={31} color={P.yolk} w={VW} angle={-30}/><Wipe t={t} at={46} color={P.cool} w={VW}/><Wipe t={t} at={58} color={P.red} w={VW} angle={90}/>
      <Flash t={t} at={8}/><Flash t={t} at={24} strength={0.6}/><Flash t={t} at={38} strength={0.5}/><Flash t={t} at={53} strength={0.5}/><Flash t={t} at={61.6} strength={0.7}/>
      {!loop && <CaptionBar cues={brief.narration} t={t}/>}
      <Chrome t={t} light={light}/>
      <Grain frame={frame} w={VW} h={VH} opacity={0.06}/>
    </div>
    <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={0.05}/>
  </AbsoluteFill>;
};
