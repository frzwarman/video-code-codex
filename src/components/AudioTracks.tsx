import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import type {Brief} from '../types';
import {clamp} from '../motion';

export const AudioTracks: React.FC<{brief: Brief; enabled: boolean}> = ({brief, enabled}) => {
  const {durationInFrames, fps} = useVideoConfig();
  if (!enabled) return null;
  const fade = (f: number) => Math.min(clamp(f / (fps * 0.4)), clamp((durationInFrames - f) / (fps * 0.8)));
  return <>
    {brief.audio.music && <Audio src={staticFile(brief.audio.music)} volume={(f) => fade(f) * (brief.audio.narration ? 0.38 : 0.85)} playbackRate={brief.duration / (durationInFrames / fps)}/>}
    {brief.audio.effects && <Audio src={staticFile(brief.audio.effects)} volume={(f) => fade(f) * 0.7} playbackRate={brief.duration / (durationInFrames / fps)}/>}
    {brief.audio.narration && <Audio src={staticFile(brief.audio.narration)} volume={1}/>}
  </>;
};
