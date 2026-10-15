# All-nighter — NIGHT SHIFT / INSIDE YOU EP 03

**Status: source and audio prepared; rendering is explicitly deferred to the user.** No preview MP4, final MP4, cover image or contact sheet is claimed. Do not start Remotion rendering, browser captures, still exports, or video encoding unless the user asks.

65 seconds, 60 FPS, 3,900 frames, vertical 1080×1920. Main composition: `all-nighter-vertical`. The repository auto-registers other formats, but this production is designed and reviewed in code for vertical only; other formats are not delivered.

## Files and modification points

- `briefs/all-nighter.json`: editorial brief, contiguous scenes, revised narration and audio paths; copied to `src/videos/all-nighter/brief.json`. Keep both synchronized.
- `src/videos/all-nighter/Video.tsx`: original composition, the persistent counter, degradation, captions and blackout overlays.
- `World.tsx`: existing CC0 brain, existing caffeine molecule, 30/60 symbolic particles, schematic amygdala and receptor. Single ThreeCanvas, DPR 1, absolute CameraRig, no useFrame or autonomous motion. Brain materials are disposed on unmount; geometry is reused.
- `Graphics.tsx`: original clock, reaction schematic, BAC comparison gauge, food pictograms, sodium profile and type.
- `timeline.ts` / `timing.json`: centralized scene boundaries, severity and three 8-frame blackouts. Audio imports the same timing JSON. Eight frames at 60 FPS is a visual editorial compression, not the actual duration of a clinical microsleep.
- Imports `Blur`, `Wipe`, `Flash`, `shake`, `Grain`, fonts and easing from the **existing showreel kit**. Its source is unchanged. The original episode HUD uses the same mono-corner framing idea, without copying showreel branding.
- `scripts/create-all-nighter-audio.mjs`: reproducible, original seeded synthesis. Stereo 48 kHz WAV source assets, clock acceleration, low drone, growing heartbeat, every transition whoosh, exact blackout dropouts, clean recovery chord, loop rise. No samples, narration or external service.
- `out/all-nighter/publish.md`: unpublished platform copy and credits. `captions.srt` / `narration.txt`: planned recording cues.

## Beat plan

| Time | Beat | Treatment |
|---|---|---|
| 0–3.5 | 24 HRS / DRUNK? | Finished-in-code cover from frame 0; sodium silhouette, full typography. Last 0.5 s reuses the same cover state. |
| 3.5–8 | Hour by hour | Spinning clock, counter locks at 16. |
| 8–15 | Adenosine | Warm brain, symbolic accumulation; sleep pressure, not literal grains in brain tissue. |
| 15–22 | 17–19 h | Lagging reaction display; ≈0.05% task-performance comparison. |
| 22–28 | Microsleeps | Frame 1392, 1506, 1614: eight-frame blackout and audio dropout; label on return. |
| 28–35 | 24 h | ≈0.10%, qualifying 0.08% label; heavier blur and RGB separation. |
| 35–42 | 35 h / next day | Brain dive, approximate bilateral amygdala glow, +60% response to negative images. |
| 42–48 | Hunger | Original food icons, GHRELIN ↑; small-study qualifier. |
| 48–54 | Coffee callback | Imported caffeine docks in schematic ring. Adenosine symbols dim but remain. |
| 54–60 | Recovery | Hard reset to clean dawn palette; counter 0 means hours awake, not zero biological sleep need. |
| 60–65 | Question / loop | Closing question and comment arrow. Quiet layout 58–62 s. Cover returns at 64.5. |

The counter is editorial, not a physiological prediction. Blackouts, wobble, RGB split, clock and camera all derive from frame time. The last cover fixes grain seed and silhouette pose to frame zero. No geometry is intended as a clinical simulation or individual diagnostic model.

## Recording script changes

The supplied prose was longer than its approximate word count and stated some results too generally. The revised script narrows the BAC analogy to test performance, qualifies the +60% response as one study of negative images, identifies the ghrelin study as small, and says recovery may take longer for some functions. 0.08% is labeled **most US states**, with Utah's 0.05% exception. The 17–19 h / 0.05%, 24 h / 0.10%, and approximately 35 h / +60% research framings remain.

Narration is null. Record from the generated `narration.txt`, then align phrases to the existing cues as in message-journey. Current checks measure planned reading time only. No recorded speech exists to align. The existing AudioTracks lowers music from .85 to .38 when a narration path is supplied. Recheck the whole mix's peak after voice is added.

## Checks that do not render video

```sh
node scripts/create-all-nighter-audio.mjs
npm run captions -- all-nighter
npm run check
```

The asset provenance check compares SHA-256 of the existing brain and a fresh Innerscene download. They match. Full record: `public/all-nighter/brain-provenance.json`; science notes and source links: `docs/references.md`.

## Commands for when the user decides to render

These are instructions only; they have **not** been executed for this video.

```sh
npm run studio
npm run render -- all-nighter --format vertical --preset preview
# Review preview and transition/blackout boundaries before final:
npm run render -- all-nighter --format vertical --preset final
npm run stills -- all-nighter --format vertical --preset final --frames 0
# Copy the approved vertical-final-frame-0000.png to out/all-nighter/cover.png.
npm run validate -- out/all-nighter/vertical-final.mp4
ffmpeg -v error -i out/all-nighter/vertical-final.mp4 -f null -
ffmpeg -hide_banner -i out/all-nighter/vertical-final.mp4 -af ebur128=peak=true:framelog=verbose -vn -f null -
```

After authorization, check final AAC true peak ≤ −1 dBFS, actual voice synchronization if supplied, encoded dimensions/duration/frame count, first/last cover match, type margins and brain/camera framing. Inspect 8 encoded frames at 0, 6, 11, 18, 25, 31, 38 and 57 seconds, plus blackout and CTA boundaries. Source-only review does not establish visual polish, clipping-free renders or encoded audio quality.
