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
