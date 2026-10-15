# WHY SPICY FOOD FEELS LIKE IT'S BURNING YOU — HEAT MAP

62 s · 1080×1920 · 60 fps · "INSIDE YOU · EP 04". Built with the showreel grammar: every shot uses a different motion discipline, cut on a 120 BPM grid.

| Seconds | Shot | Discipline |
|---|---|---|
| 0–3 | Cover: ON FIRE? over procedural flames; setup line slams in; "^actually" insert | Kinetic type |
| 3–8 | Sculpted glossy chili (lathe + lobes + bend), studio reflections, orbit | 3D lookdev |
| 8–15 | Real capsaicin conformer assembles atom by atom; weight-wave CAPSAICIN | 3D data / variable type |
| 15–24 | TRPV1 channel grid opens at 43 °C, closes, then opens at 37 °C when capsaicin docks | Systems |
| 24–31 | 5,000 nerve-signal points stream up and form FIRE; SENSOR vs ACTUAL alert cards | Particles + UI |
| 31–38 | Flush gradient, gooey sweat drops, checklist | Fluid |
| 38–46 | Scoville bars on an honest log scale with counters | Data viz |
| 46–53 | Split screen: water disperses capsaicin, milk proteins capture it | Simulation-style 2D |
| 53–58 | Flock with flapping wings drops seeds | Character / flock |
| 58–62 | Closing question, comment arrow; last 0.4 s is the frame-0 cover for a loop | Kinetic type |

## Reproduce

```sh
node scripts/create-spicy-audio.mjs        # original 120 BPM score + picture-locked effects
npm run render -- spicy-burn --preset preview
npm run render -- spicy-burn               # out/spicy-burn/vertical-final.mp4
npm run check
```

Shared pieces come from `src/videos/showreel/` (`kit.tsx`: velocity blur, wipes, flash, shake, grain, labels; `Shots3D.tsx`: `useWordTargets`). `Wipe` and `Grain` take optional `w`/`h` so they work at 1080×1920; showreel defaults are unchanged.

## Voice-over

The supplied recording `public/audio/capcaisin.wav` (24 kHz mono, 56.5 s) is fitted into the 62 s track `public/spicy/narration.wav`, and `audio.narration` points to it in both brief copies. Each line starts at its cue, and pauses inside lines are capped at 0.35 s (a 1 s pause after "called TRPV1" was the largest). Lines 4, 5 and 10 run at 1.07× (pitch preserved). "Capsaicin switches them on…" starts at 21.57 s, as OPEN ANYWAY stamps on screen. Captions are retimed to the placed speech. Speech-to-text on the encoded MP4 confirms every line at its placed time.

## Sources and assets

- Capsaicin 3D conformer: PubChem CID 1548943 (public domain data), `public/spicy/capsaicin-pubchem.json` → `capsaicin.json` (centered coordinates).
- TRPV1 responds to capsaicin and to heat above ~43 °C: Caterina et al., 1997, *Nature* (the 2021 Nobel Prize in Physiology or Medicine, David Julius).
- Birds' TRPV1 is insensitive to capsaicin: Jordt & Julius, 2002, *Cell*.
- Scoville: jalapeño up to ~8,000 SHU; habanero up to ~350,000; current record peppers exceed 2,000,000; pure capsaicin ~16,000,000.
- Milk: casein and milk fat help remove capsaicin, which is fat-soluble. Water does little.
- The chili, channels, sweat, birds and flames are original procedural artwork. The score and effects are original synthesis. No samples or third-party art.

The TRPV1 grid, the docking and the milk/water panels are explanatory illustrations, not molecular simulations.

## Verified delivery

`out/spicy-burn/vertical-final.mp4`: 1080×1920, 60 fps, 3,720 frames, 62 s, H.264 BT.709 + stereo AAC. Validation and full decode passed. With voice: −17.4 LUFS, −5.1 dBFS peak (the music ducks under the voice). Encoded frames: `out/spicy-burn/encoded-sheet.png`.

The first final render lost the FIRE particle cloud for the whole 24–31 s shot. Three.js cached the cloud's bounding sphere on its first frame, while the points were still below the screen, so it frustum-culled the cloud from then on. Stills and mid-shot renders hid the bug. Both particle shots (here and in the showreel) now recompute bounds after each update, and per-frame brightness of the particle region was measured across the shot after the fix.
