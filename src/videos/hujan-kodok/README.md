# HUJAN TURUN — Lagu Anak (original)

15 s · 1920×1080 · 30 fps. A test of the "Melodi Junior"-style kids' sing-along look (soft clay 3D character, chunky outlined titles, sing-along lyrics), with **an original song**. "Tik Tik Tik Bunyi Hujan" is by Ibu Sud (d. 1993) and stays under copyright until 2063, so its melody and lyrics are not used. No artwork from the reference channel is copied.

## Song (original lyrics and melody, 100 BPM, C major)

| Time | Lyric (one bar, eighth notes) | Melody |
|---|---|---|
| 0–2.4 | (intro: ukulele, rain, "plik plok" drops) | — |
| 2.4 | Plik plok plik plok, hujan turun | G E G E F E D C |
| 4.8 | Katak kecil pakai payung | D G G A B A G D |
| 7.2 | Lompat lompat di genangan | C' A C' A G F A F |
| 9.6 | Mari bernyanyi bersama | G G A B C' B D' C' |
| 12–15 | (outro: splash, final chord) | — |

`scripts/create-hujan-kodok-audio.mjs` writes `public/hujan-kodok/score.wav`, `public/hujan-kodok/effects.wav` and `song.json` (each syllable's time and note). The glockenspiel in the score plays the vocal melody, so **`score.wav` is the backing track to sing over**. The bouncing ball, the syllable highlights, the frog's mouth (it "sings" each syllable), the beat bounce, the hops on line 3 and the ripples all read `song.json`.

## Visuals

- Frog: procedural clay-toy model (spheres with sheen and soft clearcoat), blinking eyes, cheeks, a mouth that opens on each syllable, squash-and-stretch on every beat, hops, and a leap into the puddle at 12 s.
- Umbrella: eight-panel lathe canopy, tassels, J handle.
- Sky, clouds, rain, hills, grass, puddle ripples and splash: deterministic SVG/CSS.
- Title and lyrics: Inter Black SVG text with a thick rounded outline and drop shadow. Lyric positions are measured with the loaded font, so the ball lands on real syllables.

## Status

Stills reviewed (`out/hujan-kodok/stills-*.png`). **Not rendered**: by policy, videos are rendered only after their vocal exists. Record the four lines over `score.wav` (start singing at 2.4 s), drop the file in `public/audio/`, then align and render.
