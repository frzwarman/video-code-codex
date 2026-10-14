# Motion library

All components receive explicit time or use Remotion's frame context. Use `<Sequence layout="none">` for sequences inside a ThreeCanvas; HTML wrappers cannot be placed inside the 3D scene.

| Component/helper | Location | Purpose |
| --- | --- | --- |
| `KineticText`, `CinematicTitle` | `src/components/Motion.tsx` | Staggered word reveals, clipped type, intentional line breaks |
| `SceneLayer`, `SceneTransition` | same | Overlapping opacity envelopes and a directional light sweep |
| `ParticleField`, `Glow` | same | Seeded looping particles and inexpensive radial illumination |
| `AnimatedDiagram` | same | Sequential nodes and drawn connections |
| `AnimatedChart` | same | Animated bars, labels, and numeric values |
| `OrbitDiagram` | same | An SVG foundation for orbital or scientific explanation |
| `RevealPanel` | same | Frame-controlled UI panel reveal |
| `Captions` | same | Cue-timed, centered captions with progressive word emphasis |
| `Phone`, `MessageBubble`, `SendIcon` | `src/components/Phone.tsx` | Reusable stylized product/UI objects |
| `AudioTracks` | `src/components/AudioTracks.tsx` | Local sound tracks, fades, optional voice recording |
| `ThreeStage` | `src/three/Scenes.tsx` | Remotion ThreeCanvas, fixed DPR, camera, and lights |
| `CameraRig` | same | Absolute camera position and target on each frame |
| `ObjectReveal` | same | Rounded 3D object, orbit rings, reveal, and six-second loop |
| `GlowingNode`, `NetworkGlobe` | same | Glowing nodes and deterministic travel through a 3D graph |
| `PacketTunnel` | same | Camera tracking through a geometric network corridor |
| `progress`, `tween`, `envelope`, `ease`, `smooth` | `src/motion.ts` | Pure, clamped timing primitives |
| `seeded`, `loopPhase` | same | Stable randomness and seamless periodic animation |

## Content foundations

`BriefVideo` provides a renderable starting point for six categories. `library-showcase` cycles through them in Remotion Studio.

| Category | Foundation | Develop it into |
| --- | --- | --- |
| Education | Nodes and panel | A causal explanation with a concrete visual model |
| Technology / AI | 3D network | Architecture, token flow, model layers, transmission |
| Science / space | Orbital diagram | Scale, forces, trajectories, physical relationships |
| Data | Animated chart | A sourced data story with units and honest baselines |
| Satisfying | Looping 3D object | Rhythmic, seamless object choreography |
| Product | Stylized phone | UI demonstrations and product storytelling |

The example chart values are illustrative. Replace them with sourced data before publishing a data story.

## Deterministic animation

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const seconds = frame / fps;
const reveal = tween(seconds, 0.2, 1.2);
return <mesh rotation={[0.2, seconds * 0.4, 0]} scale={reveal}>...</mesh>;
```

Compute complete state from the requested frame. Do not increment mutable positions, use elapsed wall-clock time, call `Math.random()` during rendering, start independent animation loops, or use Drei `Float`/`OrbitControls` for final camera motion. For particles, derive every initial position from a stable seed. Remotion's own scheduling is responsible for flushing a requested frame.

For a loop, use `loopPhase(frame, periodInFrames)` and trigonometric functions of `phase * 2 * Math.PI`. Render frames `0..period-1`; do not add a duplicate end frame. Check both position and velocity at the wrap. `ObjectReveal` with `loop` enabled repeats after six seconds.

## M1 / 16 GB budget

Use one active canvas per scene except during short overlaps, DPR 1, low-segment spheres, simple standard/basic materials, and modest particle counts. The demo has 38 graph nodes; the tunnel uses 12 six-sided gates. Glow is approximated with translucent geometry and CSS gradients, without a postprocessing pipeline or shadow maps.

The final preset uses two render workers; preview uses one and half-resolution output. Decrease concurrency to one in `studio.config.mjs` if memory pressure appears. Expensive external models, HDR environments, real-time physics, large textures, and many lights should be introduced only when a shot requires them.
