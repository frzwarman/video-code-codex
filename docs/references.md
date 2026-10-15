# References and implementation sources

Reviewed during production on 2026-10-14. All scene art, choreography, diagrams, and sound synthesis in this project are original.

- [Prompt Motion](https://prompt-motion.com/) — reference for timing, restrained type, scale changes, and integrated UI/particle motion. The [Sahi trading terminal reveal](https://prompt-motion.com/dale-vaz-cc612a) was visually inspected at different positions. The [Distilbook showreel](https://prompt-motion.com/ajith-io-4c248f) was reviewed as a pacing/art-direction reference. No source assets or music were copied.
- [Remotion](https://www.remotion.dev/) and [renderMedia API](https://www.remotion.dev/docs/renderer/render-media) — composition-based production, H.264 rendering, audio, output scaling, and concurrency.
- [Remotion Three integration](https://www.remotion.dev/docs/three) and [ThreeCanvas](https://www.remotion.dev/docs/three-canvas) — declarative frame animation and ANGLE browser rendering.
- [Three.js](https://threejs.org/) and [documentation](https://threejs.org/docs/) — geometry, curves, materials, cameras, and scene construction.
- [React Three Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction) — React/R3F version compatibility. This repository pairs React 19 with R3F 9.
- [Drei RoundedBox](https://drei.docs.pmnd.rs/shapes/rounded-box) — low-complexity rounded geometry used in the object reveal and packet tunnel.

Dependencies are pinned and locked. The delivered set uses Remotion 4.0.535, React 19.3.0, R3F 9.8.1, Drei 10.7.9, and Three.js 0.186.1. Verify peer dependencies and keep Remotion package versions aligned before an upgrade.

Inter and Space Grotesk are bundled locally under the SIL Open Font License. License files are alongside the fonts in `public/fonts/`.

## Knuckle-crack / KINETIC LAB (2026-10-15)

This production uses the user's editorial style brief as inspiration. No reference artwork or audio was copied. Contrary to the general statement above about original scene art, this production **includes the following licensed third-party meshes**.

| Asset | Source / author | License and modifications |
|---|---|---|
| `public/knuckle-crack/right.glb` | [WebXR generic-hand](https://github.com/immersive-web/webxr-input-profiles/tree/main/packages/assets/profiles/generic-hand), immersive-web contributors; standard hand models contributed by Meta | [Assets MIT license](https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/assets/LICENSE.md), Copyright 2019 Amazon.com, Inc. or its affiliates. Notice preserved in `licenses/WebXR-MIT.txt`. Material replaced, hierarchy reparented preserving bind transforms, frame-driven finger poses, mirrored left instance. |
| `source/FMA*.stl`, `hand-bones.glb`, `index-mcp.glb` | [BodyParts3D STL mirror](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D), original © The Database Center for Life Science; STL conversion Kevin Mattheus Moerman | Mirror's [LICENSE_content](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D/blob/main/LICENSE_content): [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en), copied locally. Selected 27 right-hand bones, merged vertices, removed 55% of vertices, recalculated normals, normalized coordinate system, converted to GLB. 36,216 → 16,306 triangles. MCP pair extracted, separated and shaded. Per-source URLs/hashes/counts in `asset-manifest.json`. Derived assets and combined film carry the same share-alike license; preserve `CREDITS.txt` when publishing. |
| `public/fonts/LibreBaskerville-Italic.ttf` | [Google Fonts / Libre Baskerville](https://github.com/google/fonts/tree/main/ofl/librebaskerville), Copyright 2012 The Libre Baskerville Project Authors | SIL OFL 1.1, Reserved Font Name Libre Baskerville. Unmodified font, notice alongside it. |
| Score / effects WAV | `scripts/create-knuckle-audio.mjs`, original seeded synthesis | No sampled music or external sound recordings. No voice generated. |

The original BodyParts3D site now lists a newer CC BY 4.0 release. This production deliberately follows the **CC BY-SA 2.1 Japan terms attached to the actual STL mirror downloaded**, rather than assuming newer terms automatically cover that derivative. Original dataset citation: Mitsuhashi et al., *BodyParts3D: 3D structure database for anatomical concepts*, Nucleic Acids Research 37 (2009), [doi:10.1093/nar/gkn613](https://doi.org/10.1093/nar/gkn613).

Scientific sources and editorial limits:

- Kawchuk GN et al. (2015), [Real-Time Visualization of Joint Cavitation](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0119470). Real-time MRI associated cracking with rapid cavity formation and joint separation; the cavity persisted. Use **formation**, not a bubble bursting. Small study; the original MRI's temporal resolution does not establish every acoustic micro-event. Film imagery is explicitly labeled a reconstruction.
- The same paper describes the approximately 20-minute refractory period. The film says “about twenty minutes,” not a universal timer. Cavity shrinkage and reset progress are conceptual; the narration does not assert that complete gas dissolution alone has been demonstrated to explain the interval.
- [Official 2009 Ig Nobel winners](https://improbable.com/ig/winners/#ig2009): Donald Unger cracked only his left knuckles for more than sixty years. The arthritis outcome is an anecdotal self-experiment, explicitly labeled **one person, not proof**. Original report: Unger DL (1998), *Does knuckle cracking lead to arthritis of the fingers?*, Arthritis Rheum. 41:949–950 (the earlier paper covers a shorter elapsed interval than the 2009 award).
- [TikTok Creator Rewards announcement](https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program): duration is one condition among several; no monetization eligibility is promised by this export.

Scientific rendering limits: joint capsule/fluid/cavity are stylized procedural geometry, and spacing is exaggerated. Hand/bone anatomy comes from the licensed meshes above. No original MRI frames, patient data, or unlabeled scientific footage is included.

## All-nighter / INSIDE YOU · EP 03 (2026-10-15)

**Rendering and publishing are deferred to the user's decision.** The following verifies provenance and supports the prepared script; it does not claim an inspected or exported film.

### Brain provenance resolved

`public/coffee/brain.glb` is the [Innerscene Brain model](https://www.innerscene.com/tools/library/3d-parts/brain-10d8f88f), credited by its publisher to Innerscene, adapted from MakeHuman/MPFB CC0 assets. The publisher releases it as [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), explicitly including commercial use. A fresh download from `https://www.innerscene.com/api/library/brain-10d8f88f/download` and the existing local file have identical SHA-256: `03b3eb5393d88feaedd6113197b8d96aefced8e08893575a05a26590205f709b`. Embedded Brain node extras also identify CC0-1.0 and Innerscene original CC0 geometry. This establishes the source behind the older coffee storyboard's vague “licensed brain mesh” note.

The file remains unchanged. All-nighter changes its runtime material, opacity and normalized transform. Its approximate bilateral amygdala markers are original schematic overlays; the GLB is not a segmented amygdala dataset. The verification record is `public/all-nighter/brain-provenance.json`. No unknown-license replacement was substituted.

The existing coffee `AnimatedMolecule` and `caffeine.json` are imported directly. [PubChem caffeine CID 2519](https://pubchem.ncbi.nlm.nih.gov/compound/2519) supplies the molecular identity/topology used by the earlier composition. Receptor docking is a diagram, not molecular simulation. The existing showreel kit is imported, not copied or edited. Inter and Reel Serif (local Libre Baskerville Italic) retain their existing OFL notices. All new silhouettes, food icons, clock/gauge graphics and synthesized audio are original.

### Evidence and wording

- [Williamson & Feyer, 2000](https://pmc.ncbi.nlm.nih.gov/articles/PMC1739867/), *Moderate sleep deprivation produces impairments in cognitive and motor performance equivalent to legally prescribed levels of alcohol intoxication*, doi:10.1136/oem.57.10.649. In 39 participants, **some** task performance after 17–19 h awake was equivalent to or worse than 0.05% BAC. This is a laboratory performance analogy, not actual BAC or a universal equivalence across every brain function.
- [Dawson & Reid, 1997](https://doi.org/10.1038/40775), *Fatigue, alcohol and performance impairment*, Nature 388:235. [Accessible transcription of the original report](https://www.eurocockpit.eu/sites/default/files/Dawson-Reid-1997.pdf): after 24 h awake, tracking-task performance corresponded to approximately 0.10% BAC. The gauge is labeled **BAC performance equivalent**, not blood alcohol concentration caused by staying awake.
- [NHTSA](https://www.nhtsa.gov/risky-driving/drunk-driving): 0.08% is the general adult limit in most US states; Utah uses 0.05%. The on-screen label includes that exception. A legal threshold is not a safety threshold and these performance comparisons are not individualized driving guidance.
- [Yoo et al., 2007](https://pubmed.ncbi.nlm.nih.gov/17956744/), *The human emotional brain without sleep—a prefrontal amygdala disconnect*, doi:10.1016/j.cub.2007.08.007. [The investigators' university report](https://newsarchive.berkeley.edu/news/media/releases/2007/10/22_sleeploss.shtml) specifies roughly 35 h awake, 26 participants, and over 60% greater amygdala response to negative visual stimuli. The film places this in the **next day / 35 h** scene and labels stimulus and group context. It does not present +60% as a universal measure of everyday emotion.
- [Schmid et al., 2008](https://pubmed.ncbi.nlm.nih.gov/18564298/), doi:10.1111/j.1365-2869.2008.00662.x: nine healthy normal-weight men showed increased morning ghrelin and reported hunger after one night of total sleep loss. The script says **a small study found** these changes. It does not claim this proves ghrelin alone causes every junk-food craving.
- [NHLBI's microsleep explanation](https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects): brief involuntary sleep may go unnoticed. The hour label is approximate. Three eight-frame blackouts are an editorial metaphor, not a clinical duration or fixed onset schedule; the narration says **can happen**.
- [One night of 10-h sleep restores vigilance after total sleep deprivation](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899914/): 22 participants recovered measured vigilance following a 10-hour recovery opportunity after 36 hours awake. [Residual, differential neurobehavioral deficits](https://pmc.ncbi.nlm.nih.gov/articles/PMC8274462/) demonstrates that recovery differs by measure. Accordingly, the supplied broad claim that a full night reverses most effects is narrowed to recovery helping, with some effects taking longer. Counter 0 means the next waking period, not zero sleep pressure or a guaranteed complete physiological reset.

The series bug, closing question and “Educational, not medical advice” text are included. Source compilation and audio analysis are separate from visual inspection: preview, cover, contact sheet and final MP4 remain unrendered until the user asks. The requested 65-second duration alone does not establish monetization eligibility or revenue.
