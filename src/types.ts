export type Format = 'vertical' | 'landscape' | 'square';
export type Quality = 'preview' | 'final';
export type Category = 'education' | 'technology' | 'science' | 'data' | 'satisfying' | 'product';
export type Cue = {start: number; end: number; text: string};
export type SceneBrief = {start: number; end: number; title: string; description: string};
export type Brief = {
  id: string; title: string; topic: string; platform: string; duration: number;
  fps: number; style: string; category: string; output: string;
  scenes: SceneBrief[]; narration: Cue[];
  audio: {narration: string | null; music: string | null; effects: string | null};
};
export type VideoProps = {quality: Quality; duration: number; fps: number; captions: boolean; audio: boolean};
