# video-code-codex

A private, code-driven video production studio using TypeScript, React, Remotion, Three.js, React Three Fiber, and FFmpeg. **SIGNAL** is the first visual identity: dark technical editorial, mint accents, luminous networks, and large kinetic typography.

## Watch the demonstration

[What Happens When You Send a Message?](out/message-journey/vertical-final.mp4) — 30 seconds, 1080 × 1920, 30 FPS. Includes animated captions, an original synthesized stereo score, and synchronized sound effects. Voice-over from the supplied recording `public/audio/voicestudio-871f5264.wav`, with each line placed at its caption cue (`public/audio/message-journey-narration.wav`); the score ducks under it.

- [Frames from the finished MP4](out/review/encoded-storyboard.png)
- [Narration script](out/message-journey/narration.txt)
- [SRT captions](out/message-journey/vertical-final.srt)
- [Output validation](out/message-journey/vertical-final.validation.json)
- [Creative brief and scene timing](src/videos/message-journey/brief.json)

`out/` is a local delivery folder and is excluded from Git. Keep or copy final exports separately when archiving or sharing the repository.

## Start locally

Use Node.js 22 or newer, npm, Chrome/Chromium, and FFmpeg (`ffmpeg` and `ffprobe` on PATH).

```sh
npm ci
npm run studio
```

Select `message-journey-vertical` in Remotion Studio. `message-journey-landscape` and `message-journey-square` use layouts composed for those dimensions. `library-showcase` previews the six content foundations. Studio is Remotion's development preview; the repository contains no custom editor interface or backend.

The renderer uses installed Google Chrome on macOS when available. Set `REMOTION_BROWSER_EXECUTABLE` to use another browser. Otherwise, Remotion manages its browser download. Keep the Remotion packages at the same version when upgrading.

## Render and inspect

```sh
# Fast half-resolution draft: 540 × 960, one render worker
npm run render -- message-journey --preset preview

# Final vertical MP4: 1080 × 1920, H.264 + AAC
npm run render -- message-journey

# Landscape, square, or all three layouts
npm run render -- message-journey --format landscape
npm run render -- message-journey --format square
npm run render:all -- message-journey

# Different timing, captions, or audio
npm run render -- message-journey --duration 20 --fps 24
npm run render -- message-journey --captions false --audio false

# Representative stills, or specific frame numbers
npm run stills -- message-journey
npm run stills -- message-journey --frames 45,150,270,420,570,720,840

# Validate an export; reads its adjacent render manifest
npm run validate -- out/message-journey/vertical-final.mp4

# TypeScript and workflow checks
npm run check
```

Each full render also validates the dimensions, FPS, frame count, duration, H.264 pixel format, and AAC stream. It writes an MP4, SRT, render manifest, and validation report under `out/<video-id>/`. Repeating a render replaces the matching output file.

| Format | Final dimensions | Platforms |
| --- | --- | --- |
| `vertical` | 1080 × 1920 | YouTube Shorts, TikTok, Instagram Reels |
| `landscape` | 1920 × 1080 | YouTube |
| `square` | 1080 × 1080 | Square social videos |

The first demonstration was captured from the actual Remotion render bundle using the browser tool and encoded with FFmpeg, because the development agent's sandbox blocked direct Chrome launch and local server sockets. See [rendering notes](docs/rendering.md) for the reproducible fallback and verification details. The normal terminal workflow above uses Remotion's renderer API.

## Create the next video

Tell Codex:

> Create a new video about [TOPIC], lasting [DURATION], using [VISUAL STYLE], for [PLATFORM]. Reuse this repository's components, develop original scene choreography, and render and inspect the result.

Or start from a creative brief:

```sh
# Edit the example or create your own JSON brief first
npm run new -- --brief briefs/example.json
npm run studio
npm run render -- how-orbits-work --preset preview
```

The creation command validates the brief, creates `src/videos/<id>/brief.json` and `Video.tsx`, and registers three compositions. It produces a working storyboard foundation. Codex then develops original scene animation from the descriptions; the script does not generate a finished bespoke film from prose by itself.

Edit `Video.tsx` for direction and choreography. Edit its `brief.json` for duration, FPS, narration cues, and asset paths. Run `npm run register` if adding or moving video folders manually. See [the production guide](docs/production.md) and [component library](docs/motion-library.md).

## Audio and assets

Keep assets inside `public/` and reference them with `staticFile()`. The font files and their SIL Open Font Licenses are bundled. The demo's music and effects are original sample-based synthesis, reproducible with `npm run audio`.

Set `audio.narration` in the brief to a recording under `public/`, or leave it `null`. Missing music/effect paths can also be `null`; exports then include silence when needed. Use `npm run captions -- <id>` to export the timed narration script and SRT. Caption emphasis follows the cue timing and evenly spaces words; it is not speech recognition or forced alignment.

## Project map

```text
src/
  components/       Typography, captions, diagrams, charts, particles, phone, audio
  three/            ThreeCanvas stage, camera rig, object reveal, network, tunnel
  templates/        Six category foundations and their showcase
  videos/<id>/      Each video's composition and creative brief
  motion.ts         Pure timing, easing, seeded randomness, loop helpers
  Root.tsx          Composition registration and metadata
scripts/            Creation, registration, rendering, audio, captions, validation
briefs/             Input creative briefs
public/             Local fonts, audio, and future assets
out/                Generated deliveries and inspection frames (ignored by Git)
docs/               Production, component, rendering, and reference notes
```

All animated values derive from the requested frame or an explicit scene time. There are no application-owned animation loops, timers, live physics, or external asset requests during rendering. The optional browser capture adapter polls only for Remotion's render readiness.
