import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../components/AudioTracks';
import {useStoryTime} from '../../motion';
import type {VideoProps} from '../../types';
import brief from './brief.json';
import {Flash, Grain, shake, Wipe} from '../showreel/kit';
import {CaptionBar, Chrome, CUTS, VH, VW, Y} from './look';
import {Contagion, Cta, Hook, Kids, Network, Oxygen, Stopwatch, Womb, WordWall} from './Shots';
import {BrainCool} from './Shots3D';

// Designed natively for 1080×1920; softer cuts and shake than the louder episodes to match the late-night mood.
export const Video: React.FC<VideoProps> = (props) => {
  const t = useStoryTime(brief.duration); const frame = Math.round(t * 60);
  const {width, height} = useVideoConfig(); const fit = Math.min(width / VW, height / VH);
  const loop = t >= 61.6;
  const shot = loop ? 0 : CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]);
  const [sx, sy] = shake(t, [0, 3.5, 16, 31, 52], 6);
  return <AbsoluteFill style={{background: Y.deep, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: VW, height: VH, position: 'relative', overflow: 'hidden', transform: `scale(${fit})`, flexShrink: 0}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        {shot === 0 && <Hook t={loop ? 0 : t}/>}
        {shot === 1 && <WordWall t={t}/>}
        {shot === 2 && <Oxygen t={t}/>}
        {shot === 3 && <BrainCool t={t} quality={props.quality}/>}
        {shot === 4 && <Stopwatch t={t}/>}
        {shot === 5 && <Contagion t={t}/>}
        {shot === 6 && <Network t={t}/>}
        {shot === 7 && <Kids t={t}/>}
        {shot === 8 && <Womb t={t}/>}
        {shot === 9 && <Cta t={t}/>}
      </AbsoluteFill>
      <Wipe t={t} at={3.5} color={Y.lavender} w={VW}/><Wipe t={t} at={16} color={Y.teal} w={VW} angle={90}/>
      <Wipe t={t} at={31} color={Y.peach} w={VW} angle={-30}/><Wipe t={t} at={46} color={Y.lavender} w={VW}/><Wipe t={t} at={57} color={Y.peach} w={VW} angle={90}/>
      <Flash t={t} at={9} strength={0.35}/><Flash t={t} at={24} strength={0.35}/><Flash t={t} at={39} strength={0.35}/><Flash t={t} at={52} strength={0.5}/><Flash t={t} at={61.6} strength={0.5}/>
      {!loop && <CaptionBar cues={brief.narration} t={t}/>}
      <Chrome t={t} light={false}/>
      <Grain frame={frame} w={VW} h={VH} opacity={0.07}/>
    </div>
    <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={0.05}/>
  </AbsoluteFill>;
};
