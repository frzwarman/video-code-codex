# TRY NOT TO YAWN — LATE NIGHT

62 s · 1080×1920 · 60 fps · "INSIDE YOU · EP 06". Built for participation: the video dares viewers not to yawn, shows yawning type, faces and a baby, and ends by asking how many times they yawned, so the comments become the experiment. Showreel grammar with one motion discipline per shot, slowed to a 76 BPM lo-fi mood.

| Seconds | Shot | Discipline |
|---|---|---|
| 0–3.5 | Cover: TRY NOT TO over a giant YAWN whose letters inhale, hold and release | Kinetic type |
| 3.5–9 | Wall of the word "yawn" in mixed type; a yawn wave rolls through it | Typographic system |
| 9–16 | Lab cards: normal air vs pure oxygen, equal yawn bars, bubbles | UI / data |
| 16–24 | CC0 brain cools from warm to teal as an inhale stream rises into it | 3D + particles |
| 24–31 | Two real-time stopwatches: mouse stops under 1 s, human runs to 6.5 s | Instrument UI |
| 31–39 | 63 faces; a yawn spreads outward, about half catch it, live % counter | Generative grid |
| 39–46 | You at the center; yawn pulses reach family, then friends, then strangers | Network graph |
| 46–52 | Age ruler; the "catches yawns" switch flips at about 4.5 | Kinetic UI |
| 52–57 | Ultrasound-style sector scan with speckle noise; a stylized fetus yawns | Texture / shader look |
| 57–62 | HOW MANY TIMES DID YOU YAWN? with a yawning face; loop to cover | Kinetic type |

## Reproduce

```sh
node scripts/create-yawn-audio.mjs    # 76 BPM lo-fi + yawn swells, ticks, pops, fetal heartbeat
npm run render -- yawn --preset preview
npm run render -- yawn
```

## Voice-over

`audio.narration` is null; captions carry the script (10 lines, ~150 words). Record calmly; a real yawn in the first line is a bonus. Align it to the cues like the other episodes.

## Sources

- Reading about yawning triggers it: Provine, 1986, *Ethology*, and his later reviews.
- Breathing pure oxygen or extra CO₂ did not change yawn rate: Provine, Tate & Geldmacher, 1987, *Behavioral and Neural Biology*.
- Brain-cooling hypothesis: Gallup & Gallup, 2007, *Evolutionary Psychology*, with later work. It is presented as "one leading idea", not settled fact.
- Yawn duration scales with brain size across 19 mammal species; humans about 6.5 s, mice under 1 s: Gallup et al., 2016, *Biology Letters*.
- Contagion in roughly 40–60% of adults (stated as "roughly half"): Provine; Platek et al.
- Stronger contagion with kin and friends: Norscia & Palagi, 2011, *PLOS ONE*.
- Children rarely catch yawns before about 4–5 years: Anderson & Meno, 2003; Helt et al., 2010.
- Fetal yawning on 4D ultrasound: Reissland et al., 2012, *PLOS ONE*.
- Brain mesh: Innerscene, CC0-1.0. Everything else, including the score and effects, is original. The ultrasound, brain temperature and network are stylized or schematic illustrations.
