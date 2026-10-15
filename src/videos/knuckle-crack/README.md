# WHY YOUR KNUCKLES CRACK — KINETIC LAB

62 seconds · 1080×1920 · 60 fps. One original vertical film; other videos are untouched.

## Reproduce

```sh
node scripts/prepare-knuckle-assets.mjs # source STL → simplified anatomical GLB
node scripts/create-knuckle-audio.mjs  # original 120 BPM score + effects
npm run studio                       # knuckle-crack-vertical
npm run render -- knuckle-crack --preset preview
npm run render -- knuckle-crack --preset final
npm run validate -- out/knuckle-crack/vertical-final.mp4
npm run check
```

`briefs/knuckle-crack.json` is the editable production brief. Keep its copy `brief.json` synchronized. This video was created with `npm run new -- --brief briefs/knuckle-crack.json`. `Video.tsx` owns editorial type/captions; `World.tsx` owns camera and shot choreography; `Models.tsx` poses the licensed hand skeleton and real anatomical meshes. `Graphics.tsx` contains reusable velocity-blurred type, whip transitions, labels and gauge. `timeline.ts` owns cuts and three-frame impact holds. Every pose is calculated from scene time; no simulation or wall-clock animation is used.

## Shot / voice cue plan

| Seconds | Picture / purpose |
|---|---|
| 0–3 | Full opening frame; opposing hands, red POP, impact at .4 |
| 3–8 | Real hand anatomy, bone myth crossed out |
| 8–16 | Dive into index MCP; capsule and synovial fluid |
| 16–25 | Traction, increasing separation, falling conceptual pressure |
| 25–33 | Gas cavity appears exactly at 25.5; formation, not bursting |
| 33–41 | Grayscale MRI-style reconstruction, labeled as such |
| 41–48 | Approximate refractory period; conceptual cavity shrink/reset |
| 48–57 | Unger's unilateral experiment, explicitly one person, not proof |
| 57–62 | Closing question, return to opening hand pose and POP |

Editorial beats occur approximately every 2–3 seconds. The audio script is deterministic seeded synthesis, 48 kHz stereo PCM, with no samples or recordings. 120 BPM percussion, restrained bass motif, sub-drop, brief noise transients and stereo sweeps. AudioTracks uses the existing music gain of .85 without speech, .38 with speech, effects .7. A 40 ms tail release prevents a hard audio click at the loop. The visual ending returns to the opening pose.

## Voice-over

The supplied recording `public/audio/crack-joint.wav` (24 kHz mono, 52.8 s) is aligned into the 62 s track `public/knuckle-crack/narration.wav`, and `audio.narration` points to it in both brief copies. Each line was cut at measured silences (0.12 s lead, 0.15 s tail, midpoint cuts where pauses are short) and starts at its cue. Lines 1 and 2 split between "knuckles?" and "It's". The arthritis line (9.4 s) did not fit its 8.65 s cue, so its three internal pauses were tightened to 0.4 s; it now starts at the 48 s scene cut and its cue is 48.0–56.75 s. The final line's pause is tightened the same way, so speech ends at 60.97 s, before the loop. Music ducks to .38 under the voice.

Speech-to-text heard line 8 ambiguously ("can crack… as in… should take"); with the script as a hint it matches "can't crack the same knuckle again… takes about twenty minutes." Listen to that line before publishing.

Two accuracy edits to the supplied script: the reset line avoids asserting that complete dissolution precisely explains a fixed 20-minute timer; the Unger line includes “One person—not proof.” MRI imagery is an original 3D reconstruction, not recorded research data. Geometry exaggerates separation and cavity size for legibility; pressure and reset graphics are conceptual, not measurements.

## Assets and release credits

See [references](../../../../docs/references.md) and `public/knuckle-crack/asset-manifest.json`. WebXR's supplied rig is a modest polygon-count hand model, intentionally shaded as a neutral anatomical sculpture. The skeleton was reparented preserving bind transforms and is posed independently for each hand. BodyParts3D meshes are actual anatomical scans/models, reduced from 36,216 to 16,306 triangles across 27 bones; the MCP detail uses their real index metacarpal and proximal phalanx.

Keep `public/knuckle-crack/CREDITS.txt` with the film and include its attribution in the publication description. The BodyParts3D derivative assets and this combined film are supplied under CC BY-SA 2.1 Japan to preserve the source's share-alike condition. This does not relicense unrelated repository code or other videos. The WebXR MIT and font OFL notices remain bundled.

A 62-second export satisfies the requested over-one-minute duration; this alone does not establish TikTok account/program eligibility.

## Restricted environment export

If normal Remotion Chromium launch is blocked, use the existing `scripts/prepare-browser.mjs` frame-handshake fallback documented in `docs/rendering.md`. Capture all 3,720 frames at native resolution into `out/knuckle-crack/frames/`. Then run `node scripts/assemble-knuckle.mjs preview`, review the half-scale MP4, and run `node scripts/assemble-knuckle.mjs final`. Both encode the same deterministic frames and local audio; preview reduces resolution/bitrate without changing timing. This workaround introduces no new dependency.

For the browser fallback, warm the hand scene with `studioSeek(1)` before capturing frame zero, then seek back to zero and verify the hand is visible. The first cold capture exposed a blank ThreeCanvas at frame zero despite the readiness signal; the opening frames were recaptured after warming and checked in the encoded preview. On this Mac, an idle display also stalled headless GPU rendering; a temporary `caffeinate -d -i -u -t 3600` assertion restored it. Close only the capture session you own.

## Verified delivery

- `out/knuckle-crack/vertical-final.mp4` (with voice-over, normal `npm run render` path): 1080×1920, 60 fps, 3,720 frames, exactly 62.000 seconds, 13,511,820 bytes. −17.9 LUFS integrated, −3.0 dBFS sample peak. Speech-to-text on the encoded file places every line inside its cue. Frames: `review/voiced-contact-sheet.png`. H.264 / yuv420p, limited-range BT.709 including transfer and primaries; stereo AAC, 48 kHz.
- `out/knuckle-crack/vertical-preview.mp4`: 540×960, 60 fps, same 62-second timeline, 3,378,142 bytes.
- Both exports passed metadata validation and full audio/video decode. Reports are alongside the MP4s as `.validation.json` and `.render.json`.
- Final audio: −17.7 LUFS integrated, 4.1 LU loudness range, −0.9 dBFS true peak. Score dynamics are shaped before writing the WAV; the effects retain crisp attacks. No narration track is present.
- Eight encoded frames inspected at 1, 5, 12, 22, 26.5, 36.5, 44.5 and 52.5 seconds: `out/knuckle-crack/review/final-contact-sheet.png`. Additional strips inspect the whip, exact cavity formation frame, and loop boundary. Regenerate with `node scripts/review-knuckle.mjs final`.
- Captured frame 0 and frame 3719 have identical SHA-256: `58c9884e7c8e6747daa6d71ff04f454f52977d5b0ebd40db519ad7e4fdbece2b`. Inter-frame video compression can introduce small differences in the encoded copies.
- Cue audit: all ten cues fall within their corresponding scenes, at approximately 98–155 words/minute. This is a recording plan, not measured synchronization to a voice recording. See `review/final-cue-audit.json`, `narration.txt`, and `captions.srt`.
- `npm run check`: TypeScript and all five workflow tests passed after the final source changes. Browser console reported no errors during capture.

The hand asset is intentionally low-poly and the joint/MRI views are stylized anatomical illustrations. They are not a clinical simulation or original MRI footage. The local rendering workaround and the first-frame correction are documented above rather than hidden.
