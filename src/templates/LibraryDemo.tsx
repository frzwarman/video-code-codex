import React from 'react';
import {BriefVideo} from './BriefVideo';
import {useSeconds} from '../motion';
import type {Brief} from '../types';

export const LibraryDemo: React.FC = () => {
  const time = useSeconds();
  const categories = ['education', 'technology', 'science', 'data', 'satisfying', 'product'];
  const i = Math.min(5, Math.floor(time / 3));
  const b: Brief = {id: 'library', title: 'Motion library', topic: 'Six foundations', platform: 'youtube', duration: 18, fps: 30, style: 'Signal', category: categories[i], output: 'mp4', audio: {narration: null, music: null, effects: null}, narration: [], scenes: categories.map((c, j) => ({start: j * 3, end: (j + 1) * 3, title: c[0].toUpperCase() + c.slice(1), description: 'Reusable motion foundation'}))};
  return <BriefVideo brief={b} duration={18} fps={30} quality="preview" captions={false} audio={false}/>;
};
