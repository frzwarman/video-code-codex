import {interpolate, Easing, random, useCurrentFrame, useVideoConfig} from 'remotion';

export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (t: number, start: number, end: number) => clamp((t - start) / (end - start));
export const ease = (t: number) => Easing.bezier(0.22, 1, 0.36, 1)(clamp(t));
export const smooth = (t: number) => {const p = clamp(t); return p * p * (3 - 2 * p);};
export const tween = (t: number, start: number, end: number, a = 0, b = 1) => lerp(a, b, ease(progress(t, start, end)));
export const envelope = (t: number, start: number, end: number, fade = 0.35) =>
  Math.min(progress(t, start, start + fade), 1 - progress(t, end - fade, end));
export const loopPhase = (frame: number, period: number) => ((frame % period) + period) % period / period;
export const seeded = (seed: string, i: number, axis = 'x') => random(`${seed}:${i}:${axis}`);
export const useSeconds = () => {const frame = useCurrentFrame(); return frame / useVideoConfig().fps;};
export const useStoryTime = (canonicalDuration = 30) => {
  const frame = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
  return frame / durationInFrames * canonicalDuration;
};
export {interpolate};
