# Rendering and verification

## Normal terminal workflow

Run `npm run studio` for Remotion Studio, or `npm run render -- message-journey` for the final vertical export. The render script bundles the source, resolves composition metadata, opens Chrome, renders with Remotion, and checks the resulting MP4 with FFprobe. It uses local assets and writes delivery files under `out/<id>/`.

| Preset | Resolution scale | Workers | CRF | JPEG quality | Particle budget |
| --- | --- | --- | --- | --- | --- |
| `preview` | 0.5 | 1 | 25 | 80 | 30 |
| `final` | 1 | 2 | 17 | 95 | 72 |

Both use H.264, `yuv420p`, AAC at 192 kbps, and a 30 FPS default. The composition can override FPS and duration. Three.js uses DPR 1, modest geometry, simple materials, and no postprocessing stack or large textures. Close unnecessary browser tabs during final renders on the M1/16 GB machine. Reduce final concurrency to 1 in `studio.config.mjs` if memory becomes constrained.

The normal renderer and Studio commands are configured, but could not be exercised end to end inside this agent sandbox: local server sockets and direct Chrome launch were blocked. The delivered video was successfully rendered using the following fallback.

## Browser capture fallback

This optional adapter uses the actual bundled Remotion composition and its frame/readiness handshake. It does not recreate the animation in another engine. It requires the separately installed `agent-browser` CLI and is tied to the pinned Remotion version; prefer the supported Remotion renderer in a regular terminal.

The adapter supports native-resolution `final` captures. Run these commands from the repository root for the 30-second vertical demo:

```sh
node scripts/prepare-browser.mjs message-journey

agent-browser --session video-capture --allow-file-access \
  --args '--use-gl=angle,--use-angle=metal' \
  open "file://$PWD/.cache/browser-bundle/index.html"
agent-browser --session video-capture set viewport 1080 1920
agent-browser --session video-capture eval 'window.studioSelect(); "selected"'

for ((frame = 0; frame < 900; frame++)); do
  agent-browser --session video-capture eval "window.studioSeek($frame)" || break
  agent-browser --session video-capture --screenshot-format jpeg \
    --screenshot-quality 95 screenshot \
    "out/message-journey/frames/$(printf '%05d' "$frame").jpg" || break
done

node scripts/assemble-frames.mjs message-journey
agent-browser --session video-capture close
```

`studioSeek()` waits for Remotion's render-ready signal and loaded fonts. Its timer only polls readiness; animation values still derive exclusively from the requested frame. For efficient agent execution, pairs of `eval` and `screenshot` commands can be grouped with `agent-browser batch --bail`.

The assembly script checks that every frame exists, explicitly converts full-range JPEG/BT.601 to limited-range BT.709, encodes H.264, mixes the local audio, writes SRT/manifest files, and validates the export. Missing audio becomes a silent AAC track. Recorded narration is never synthesized.

For another format, duration, or FPS, pass the same options supported by `renderSettings` to `prepare-browser.mjs`, then use the viewport and frame count from `out/<id>/browser-capture.json`. Reopen the bundle before selecting a different composition. Capture the entire new sequence after changing source, assets, format, or timing; do not mix old and new frames. A render replaces its matching delivery file.

## Verified demonstration

The final file is `out/message-journey/vertical-final.mp4`:

- 1080 × 1920, 30 FPS, 900 frames, exactly 30.000 seconds.
- H.264 / `yuv420p`, BT.709, limited range; stereo 48 kHz AAC.
- Rendered with the normal `npm run render -- message-journey` Remotion path (`colorSpace: 'bt709'`, so output is `yuv420p`, BT.709, limited range).
- 11,263,689 bytes, approximately 10.7 MiB.
- Integrated audio loudness: −19.1 LUFS. The soundtrack contains the supplied voice-over, an original synthesized score (ducked to 0.38) and effects.

### Voice-over alignment

The supplied recording `public/audio/voicestudio-871f5264.wav` (24 kHz mono, 20.6 s) reads the eight script lines with shorter pauses than the 30 s cut. Each line was cut at the measured silence between lines (0.12 s lead, 0.15 s tail, short fades) and delayed so speech begins at its brief cue start, producing the 30 s, 48 kHz stereo `public/audio/message-journey-narration.wav`. The video frames and captions are unchanged. Line onsets in the aligned track: 0.40, 3.70, 7.10, 11.25, 14.30, 17.20, 21.75, 26.20 s; every line ends before its cue ends. A speech-to-text pass over the encoded MP4 confirmed the wording and order.

The coffee-effects voice-over (`public/audio/voicestudio-73efe5b2.wav`, 36.0 s) was aligned the same way into the 45 s `public/coffee/narration.wav`. Cuts fall midway between lines where pauses are short. The recording repeats a garbled "sleep pressure" at 19.80–20.72 s; that fragment is dropped. Speech-to-text hears line 5 as "Adenosine normally helps sleep pressure", without "build", while the caption keeps the brief's wording. The brief's `coffee/score.wav` and `coffee/effects.wav` never existed, so they are `null` and the export carries voice only.
- Full video/audio decode completed without errors. FFprobe validation passed for dimensions, frame rate, duration, frame count, codecs, and pixel format.

Eight frames were extracted from the encoded MP4 at frames 45, 150, 270, 420, 570, 720, 840, and 899 and visually inspected for composition, text, captions, and 3D rendering. See [the encoded storyboard](../out/review/encoded-storyboard.png). Landscape and square layouts were checked with stills; their full MP4s are configured but have not been exported. All six category foundations were rendered as stills and inspected in [the library contact sheet](../out/review/library-storyboard.png).

Repeated out-of-order seeks to the same 2D and 3D frames preserved motion/layout. GPU/browser rasterization introduced negligible single-level pixel differences (PSNR above 100 dB), so cross-capture byte equality is not promised. Animation state is frame-deterministic; rasterization can vary across browser/GPU versions.

TypeScript and all five workflow tests pass. Tests cover platform/timing settings, invalid briefs and paths, CLI argument parsing and caption retiming, creation/registration without overwriting work, and validation against a real encoded fixture.

To recheck the delivery:

```sh
npm run validate -- out/message-journey/vertical-final.mp4
ffmpeg -v error -i out/message-journey/vertical-final.mp4 -f null -
npm run check
```

Metadata and decode checks complement visual review; they do not assess artistic pacing. Review the finished film with sound before publishing.

## Showreel

`npm run render -- showreel` produces `out/showreel/landscape-final.mp4`: 15 s, 1920 × 1080, 60 fps, 900 frames, H.264 BT.709 + AAC. Integrated loudness is −19.8 LUFS with a −1.1 dBFS peak, and full decode is clean. The score and effects are original 120 BPM synthesis from `node scripts/create-showreel-audio.mjs`, with impacts measured on every cut (0, 2, 4, 6, 7.5, 9.5, 11, 12.5 s). Source is in `src/videos/showreel/` (`kit.tsx` for velocity blur, wipes, HUD and grain; `Shots.tsx` for 2D shots; `Shots3D.tsx` for the chrome knot and the 6,000-point particle morph). The picture is designed on a 1920 × 1080 stage, so vertical and square formats letterbox it and have not been exported. Inspection: `out/showreel/stills-sheet.png`, `stills-sheet2.png` (cut points), `encoded-sheet.png` (from the MP4).

## Glitch scan (run after every final render)

`npm run validate` checks metadata only. `npm run scan -- out/<id>/<file>.mp4` decodes every frame and flags isolated one- and two-frame outliers: frames unlike both neighbours while the neighbours match each other. These are garbled or half-black Chrome captures, blank frames where a 3D model was still loading, and pops. Hard cuts are not flagged. Black runs are listed for review. The script exits 1 when it finds a glitch.

Found and fixed on 2026-10-16:
- Random capture glitches (a frame tiled into strips, or half-black) in all-nighter at 9.7 s and yawn at 29.5 s and 39.8 s. The code was fine; the frames are re-rendered. They appeared in renders made while another project was rendering on the same machine, so render one video at a time.
- A black frame at the first frame of a GLB shot (music-body at 8.0 s, yawn at 16.0 s): `useLoader` suspended when the shot mounted mid-render. Those videos now load the model in the always-mounted root with `src/three/useGltf.ts` (delayRender until the model is in state) and pass it down. Prefer this over `useLoader` for any model in a shot that mounts mid-video.

Intentional black frames: all-nighter's three 8-frame microsleeps (23.2, 25.1, 26.9 s), spicy-burn's ink wipe at 3.0 s and the showreel's grid start at 6.05 s. Deliberate still holds (knuckle-crack's three-frame impact holds and slow beats, all-nighter's cover, recovery clock and final question) are design, not freezes.
