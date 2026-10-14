# Video production instructions

This is a private code-driven video repository. Treat a request such as “Create a new video about TOPIC, lasting DURATION, using STYLE, for PLATFORM” as a production brief.

## Workflow

- Read `README.md`, the relevant existing video, and `docs/motion-library.md` before adding infrastructure.
- Make a new brief with a unique id, contiguous scene timing, narration cues, platform, category, style, and explicit audio paths or nulls. Use `briefs/example.json` as the format.
- Run `npm run new -- --brief <path>` to create/register the video. The generated `BriefVideo` is a storyboard foundation; develop original animation in that video's `Video.tsx`.
- Reuse the motion library while choosing metaphors and choreography for the actual subject. Keep long titles readable in all requested ratios. Do not create a custom app/editor interface.
- Preview with Remotion Studio. When rendering is requested, produce an actual MP4, validate its metadata, and inspect representative encoded frames. Report an exact limitation if the environment prevents a step.
- Run `npm run check` after code changes. Render a short draft or stills before the final. Do not overwrite another video's source to make a new topic.

## Rendering rules

- Every animated state derives from `useCurrentFrame()`, FPS, explicit scene time, or seeded randomness. No live physics, `Math.random()` during render, wall-clock animation, or application-owned requestAnimationFrame loops.
- Use `ThreeCanvas` from `@remotion/three` and declarative R3F transforms. `CameraRig` assigns absolute camera positions. Avoid `useFrame` and Drei components with autonomous motion.
- Default to 30 FPS. Use preview/final settings in `studio.config.mjs`. The target machine is an M1 MacBook Pro with 16 GB RAM: keep DPR 1, geometry/particles modest, and render concurrency at one or two.
- Keep assets local in `public/`. Wait for fonts/assets before capturing a frame.
- Use null for missing narration. Never claim spoken narration was generated or recorded unless an actual voice asset exists. Keep narration scripts and captions aligned to the brief.
- The normal render command uses Remotion. `scripts/prepare-browser.mjs` and `scripts/assemble-frames.mjs` are a fallback for restricted agent sessions; consult `docs/rendering.md` before using them.

## Completion

Deliver source, brief, scripts, documentation, requested MP4, captions/script, validation report, and representative inspection frames. Distinguish verified exports from variants that are only configured. Preserve user changes and avoid unnecessary dependencies.
