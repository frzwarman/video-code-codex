import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import type {Brief} from '../types';
import {clamp} from '../motion';

export const AudioTracks: React.FC<{brief: Brief; enabled: boolean; fadeInSeconds?: number; fadeOutSeconds?: number}> = ({brief, enabled, fadeInSeconds = 0.4, fadeOutSeconds = 0.8}) => {
  const {durationInFrames, fps} = useVideoConfig();
  if (!enabled) return null;
  const fade = (f: number) => Math.min(fadeInSeconds === 0 ? 1 : clamp(f / (fps * fadeInSeconds)), fadeOutSeconds === 0 ? 1 : clamp((durationInFrames - f) / (fps * fadeOutSeconds)));
  return <>
    {brief.audio.music && <Audio src={staticFile(brief.audio.music)} volume={(f) => fade(f) * (brief.audio.narration ? 0.38 : 0.85)} playbackRate={brief.duration / (durationInFrames / fps)}/>}
    {brief.audio.effects && <Audio src={staticFile(brief.audio.effects)} volume={(f) => fade(f) * 0.7} playbackRate={brief.duration / (durationInFrames / fps)}/>}
    {brief.audio.narration && <Audio src={staticFile(brief.audio.narration)} volume={1}/>}
  </>;
};
