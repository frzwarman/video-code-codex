import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../components/AudioTracks';
import {useStoryTime} from '../../motion';
import type {VideoProps} from '../../types';
import brief from './brief.json';
import {CUTS, Flash, Grain, H, Hud, R, shake, W, Wipe} from './kit';
import {Breathe, Fluid, Interface, Kinetic, Signature, Systems} from './Shots';
import {Depth, Particles} from './Shots3D';

// Designed on a 1920×1080 stage; other formats letterbox the same picture.
export const Video: React.FC<VideoProps> = (props) => {
  const t = useStoryTime(brief.duration); const frame = Math.round(t * 60);
  const {width, height} = useVideoConfig(); const fit = Math.min(width / W, height / H);
  const shot = CUTS.findIndex((c, i) => t >= c && t < CUTS[i + 1]);
  const [sx, sy] = shake(t, [0, 2, 4, 7.5, 9.5, 12.5]);
  const punch = 1 + 0.06 * Math.exp(-Math.max(0, t - 4) * 18) * (t >= 4 ? 1 : 0) + 0.04 * Math.exp(-Math.max(0, t - 7.5) * 18) * (t >= 7.5 ? 1 : 0);
  return <AbsoluteFill style={{background: R.ink, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', transform: `scale(${fit})`, flexShrink: 0}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${punch})`}}>
        {shot === 0 && <Kinetic t={t}/>}
        {shot === 1 && <Breathe t={t}/>}
        {shot === 2 && <Depth t={t} quality={props.quality}/>}
        {shot === 3 && <Systems t={t}/>}
        {shot === 4 && <Particles t={t} quality={props.quality}/>}
        {shot === 5 && <Interface t={t}/>}
        {shot === 6 && <Fluid t={t}/>}
        {shot === 7 && <Signature t={t}/>}
      </AbsoluteFill>
      <Wipe t={t} at={0} color={R.hot}/><Wipe t={t} at={2} color={R.hot}/>
      <Wipe t={t} at={6} color={R.violet} angle={90}/>
      <Wipe t={t} at={11} color={R.hot} angle={-35}/>
      <Flash t={t} at={4}/><Flash t={t} at={7.5} strength={0.5}/><Flash t={t} at={9.5} strength={0.6}/>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, #0008 100%)', pointerEvents: 'none'}}/>
      <Hud t={t} frame={frame}/>
      <Grain frame={frame}/>
    </div>
    <AudioTracks brief={brief} enabled={props.audio} fadeInSeconds={0} fadeOutSeconds={0.4}/>
  </AbsoluteFill>;
};
