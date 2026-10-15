import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../components/AudioTracks';
import {useStoryTime} from '../../motion';
import type {VideoProps} from '../../types';
import brief from './brief.json';
import {Flash, Grain, shake, Wipe} from '../showreel/kit';
import {beatPulse, CaptionBar, Chrome, CUTS, M, VH, VW} from './look';
import {Cta, Earworm, Hook, Monitor, Pain, Run, Stop} from './Shots';
import {Brain, Chills, Speaker} from './Shots3D';

// Designed natively for 1080×1920; every pulse comes from the analysed soundtrack.
export const Video: React.FC<VideoProps> = (props) => {
  const t = useStoryTime(brief.duration); const frame = Math.round(t * 60);
  const {width, height} = useVideoConfig(); const fit = Math.min(width / VW, height / VH);
  const loop = t >= 61.6;
  const shot = loop ? 0 : CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]);
  const silent = t >= 23 && t < 27;
  const [sx, sy] = shake(t, [0, 3, 8, 15, 28, 37, 50, 56], 12);
  const bump = silent ? 1 : 1 + beatPulse(t, 12) * 0.012; // the whole frame breathes on the kick, and goes still in the silence
  return <AbsoluteFill style={{background: M.ink, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: VW, height: VH, position: 'relative', overflow: 'hidden', transform: `scale(${fit})`, flexShrink: 0}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${bump})`}}>
        {shot === 0 && <Hook t={loop ? 0 : t}/>}
        {shot === 1 && <Speaker t={t} quality={props.quality}/>}
        {shot === 2 && <Brain t={t} quality={props.quality}/>}
        {shot === 3 && <Monitor t={t}/>}
        {shot === 4 && <Stop t={t}/>}
        {shot === 5 && <Chills t={t} quality={props.quality}/>}
        {shot === 6 && <Run t={t}/>}
        {shot === 7 && <Pain t={t}/>}
        {shot === 8 && <Earworm t={t}/>}
        {shot === 9 && <Cta t={t}/>}
      </AbsoluteFill>
      <Wipe t={t} at={3} color={M.magenta} w={VW}/><Wipe t={t} at={15} color={M.lime} w={VW} angle={90}/>
      <Wipe t={t} at={37} color={M.cyan} w={VW} angle={-30}/><Wipe t={t} at={50} color={M.violet} w={VW}/><Wipe t={t} at={56} color={M.magenta} w={VW} angle={90}/>
      <Flash t={t} at={8} strength={0.5}/><Flash t={t} at={28} strength={1}/><Flash t={t} at={44} strength={0.3}/><Flash t={t} at={61.6} strength={0.7}/>
      {!loop && <CaptionBar cues={brief.narration} t={t}/>}
      <Chrome t={t} light={shot === 4 && t < 27.6}/>
      <Grain frame={frame} w={VW} h={VH} opacity={0.06}/>
    </div>
    <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={0.05}/>
  </AbsoluteFill>;
};
