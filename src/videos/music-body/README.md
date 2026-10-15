# HOW MUSIC TAKES CONTROL OF YOUR BODY — LOUDNESS

62 s · 1080×1920 · 60 fps · "INSIDE YOU · EP 05". Showreel grammar (one motion discipline per shot). **The soundtrack demonstrates the claims**: 100 BPM groove → a measured ramp to ~137 BPM → a tape-stop into four seconds where the music is fully silent (23.03–27.00 s) and only a slowing heartbeat plays → a 124 BPM drop with a chorus at the "chills" line.

**Everything visual is driven by the real audio.** `scripts/create-music-body-audio.mjs` writes `analysis.json`: per-frame energy in 12 log-spaced bands (Goertzel) of the mix as AudioTracks plays it, plus the exact kick and heartbeat times. The EQ bars, woofer excursion, beat flashes, BPM readout, ECG trace, footprints and the kick "breathing" of the whole frame all read from it. During the silence everything goes still.

| Seconds | Shot | Discipline |
|---|---|---|
| 0–3 | THIS SONG IS CHANGING YOUR BODY over live EQ bars (frame-0 cover) | Kinetic type + audio-reactive |
| 3–8 | Woofer (lathe cone, dust cap, chrome surround) pushed by the low band | 3D lookdev |
| 8–15 | CC0 brain; SMA and basal ganglia glow on each beat (schematic) | 3D |
| 15–23 | Monitor: music tempo vs illustrative heart rate, ECG trace, breath ring | UI |
| 23–28 | True silence, inverted frame, heart slows below its starting line; riser | Negative space |
| 28–37 | Drop: 5,000 points burst into CHILLS → real dopamine molecule | Particles + 3D data |
| 37–44 | Beat grid, footprints land on beat lines, perceived-effort bars | Systems |
| 44–50 | Jagged pain line melts into a smooth wave | Vector morph |
| 50–56 | Note chain loops a figure-eight inside a head; 9 IN 10 counter | Path animation |
| 56–62 | WHICH SONG GIVES YOU CHILLS? over EQ, loop to cover | Kinetic type |

## Reproduce

```sh
node scripts/create-music-body-audio.mjs   # score, effects, analysis.json (deterministic)
npm run render -- music-body --preset preview
npm run render -- music-body
```

If the score changes, rerun the script before rendering so `analysis.json` matches the audio.

## Voice-over

`audio.narration` is null; captions carry the script (10 lines, ~150 words). Record, then align lines to cues as for the other episodes. Note: with narration, AudioTracks ducks music to .38, so `analysis.json` (computed at .85) will look slightly more energetic than the ducked mix; that is acceptable for visuals, or regenerate with the ducked gain.

## Sources

- Tempo raises breathing and heart rate; pauses drop them, sometimes below baseline: Bernardi, Porta & Sleight, 2006, *Heart*.
- Beat activates motor areas (basal ganglia, SMA) during passive listening: Grahn & Brett, 2007, *J Cogn Neurosci*.
- Dopamine release at peak emotional moments and in anticipation: Salimpoor et al., 2011, *Nature Neuroscience*.
- Runners adapt cadence to music tempo: Van Dyck et al., 2015; music lowers perceived exertion: Karageorghis & Priest reviews. Effort bars are illustrative.
- Postoperative pain and anxiety reduced: Hole et al., 2015, *The Lancet*, 73 RCTs.
- ~9 in 10 people report an earworm at least weekly: Liikkanen, 2012 (large online survey).
- Brain mesh: Innerscene, CC0-1.0 (see `public/all-nighter/brain-provenance.json`). Dopamine conformer: PubChem CID 681. Score, effects and all other artwork are original.

Heart-rate numbers on screen are illustrative of the direction of the effect, not measurements.

## Verified delivery

`out/music-body/vertical-final.mp4`: 1080×1920, 60 fps, 3,720 frames, 62 s, H.264 BT.709 + stereo AAC. Validation and full decode passed. −19.0 LUFS, −1.9 dBFS peak (no narration yet). Particle-region brightness was measured across 28–32 s: CHILLS is present on every sampled frame. Encoded frames: `out/music-body/encoded-sheet.png`.
