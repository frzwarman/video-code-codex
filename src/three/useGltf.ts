import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {GLTFLoader, type GLTF} from 'three/addons/loaders/GLTFLoader.js';

// Load a GLB once per page and hold rendering until it is in React state.
// Unlike useLoader, nothing suspends at a shot boundary: call this in an always-mounted
// component (the video root) and pass the result down, so a shot never mounts mid-load.
const loads = new Map<string, Promise<GLTF>>(); const ready = new Map<string, GLTF>();
export const useGltf = (path: string) => {
  const url = staticFile(path);
  const [gltf, setGltf] = useState<GLTF | null>(() => ready.get(url) ?? null);
  const [handle] = useState(() => (ready.has(url) ? null : delayRender(`Loading ${path}`)));
  useEffect(() => {
    if (gltf) return;
    let p = loads.get(url); if (!p) {p = new GLTFLoader().loadAsync(url); loads.set(url, p);}
    p.then((g) => {ready.set(url, g); setGltf(g);}).catch(cancelRender);
  }, [gltf, url]);
  useEffect(() => {if (gltf && handle !== null) continueRender(handle);}, [gltf, handle]); // release only after the model is committed
  return gltf;
};
