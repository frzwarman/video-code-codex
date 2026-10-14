# Production workflow

## From a brief to a film

1. Write a brief using `briefs/example.json`. Set a unique kebab-case `id`, a clear title/topic, a platform, duration in seconds, FPS, visual style, category, scene descriptions, narration cues, and audio paths.
2. Run `npm run new -- --brief briefs/<name>.json`. This creates a dedicated composition and configuration, then registers vertical, landscape, and square variants.
3. Direct Codex to replace the renderable category foundation with original choreography in `src/videos/<id>/Video.tsx`. Reuse motion primitives, but choose visual metaphors and timing appropriate to the subject.
4. Preview with `npm run studio`. Scrub forward and backward; moving to a frame must produce the same content every time.
5. Render a draft with `npm run render -- <id> --preset preview`. Check the hook, reading time, transitions, and sound timing.
6. Render the final with `npm run render -- <id>`. The command validates metadata and writes delivery files.
7. Inspect representative frames from the encoded MP4 and review its pacing before publication. Check platform overlays in the destination app because their placement can change.

## Brief fields

| Field | Meaning |
| --- | --- |
| `id` | Unique directory/composition identifier, e.g. `how-orbits-work` |
| `title`, `topic` | Editorial title and scope |
| `platform` | `youtube`, `shorts`, `tiktok`, `reels`, or `square` |
| `duration`, `fps` | Seconds and frames per second; default example is 30/30 |
| `style` | Art direction, palette, typography, motion character |
| `category` | `education`, `technology`, `science`, `data`, `satisfying`, or `product` |
| `output` | `mp4` |
| `scenes` | Ordered, contiguous ranges with `start`, `end`, `title`, and `description` |
| `narration` | Ordered ranges with `start`, `end`, and `text`; may be empty |
| `audio` | `narration`, `music`, and `effects`, each a path relative to `public/` or `null` |

Scene ranges cover the complete video. Narration may contain deliberate pauses. Paths stay within `public/`. The validator rejects overlapping/out-of-order cues, invalid durations, path traversal, and unknown formats/categories.

## Timing and sound

The demo uses a 30-second canonical timeline: `useStoryTime()` maps the requested frame onto that timeline. Changing the FPS preserves the same timing in seconds. Changing duration stretches the visual story and SRT cues proportionally. This is useful for rough variants, but editorial retiming is preferable for substantial duration changes.

The standard renderer changes the playback rate of background audio when duration changes. The optional FFmpeg assembly fallback uses `atempo` to preserve its pitch. Neither retimes a supplied narration recording automatically: update the voice recording and brief together.

No voice service is configured. When a recording is supplied, set `audio.narration`, align the cue times to the recording, and review the mix. Background music automatically lowers when a narration path exists. Caption emphasis currently interpolates word timing within each cue; replace those timings with word-level alignment if precise spoken-word highlighting is required.

## Demonstration direction

The demo simplifies packet transport to explain the core idea. It is not a protocol trace, a world map, or a claim that every message follows exactly the route shown. Packet sizes, counts, route length, and screen times are illustrative. Messaging service infrastructure, encryption, acknowledgements, retransmission, and protocol differences are outside this short film's scope.

The sound bed uses an original sparse arpeggio, soft bass, short transition sweeps, packet ticks, and a two-note delivery chime. Its synthesized sources are in `scripts/create-audio.mjs`. Nothing has been sampled from the reference videos.

## Archive

Keep source, briefs, and original assets in version control. Keep final MP4s, SRTs, and `.render.json`/`.validation.json` files in a separate delivery archive. Do not treat `.cache/` or intermediate JPEG frames as source assets; they can be regenerated.
