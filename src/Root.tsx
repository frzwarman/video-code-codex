import React from 'react';
import {Composition, Folder} from 'remotion';
import {formats} from '../studio.config.mjs';
import {videos} from './registry';
import type {VideoProps} from './types';
import {LibraryDemo} from './templates/LibraryDemo';
import './fonts';

// Pure browser metadata logic: never import Node filesystem modules here.
const metadata = (props: VideoProps, width: number, height: number) => {
  if (!Number.isFinite(props.duration) || props.duration <= 0 || props.duration > 3600 || !Number.isFinite(props.fps) || props.fps < 1 || props.fps > 120) throw Error('Invalid duration / fps.');
  if (!['preview', 'final'].includes(props.quality)) throw Error('quality must be preview or final.');
  return {width, height, durationInFrames: Math.max(1, Math.round(props.duration * props.fps)), fps: props.fps};
};

export const Root: React.FC = () => <>
  {videos.map(({brief, component}) => <Folder key={brief.id} name={brief.id}>
    {Object.entries(formats).map(([format, size]) => <Composition key={format} id={`${brief.id}-${format}`} component={component} {...size} fps={brief.fps} durationInFrames={Math.round(brief.duration * brief.fps)} defaultProps={{quality: 'preview', duration: brief.duration, fps: brief.fps, captions: true, audio: true} as VideoProps} calculateMetadata={({props}) => metadata(props, size.width, size.height)}/>) }
  </Folder>)}
  <Folder name="motion-library">
    <Composition id="library-showcase" component={LibraryDemo} width={1920} height={1080} fps={30} durationInFrames={540}/>
  </Folder>
</>;
