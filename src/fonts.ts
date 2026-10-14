import {continueRender, delayRender, cancelRender, staticFile} from 'remotion';

// A single gate per browser: seeked frames never capture fallback typography.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading local typefaces');
  Promise.all([
    new FontFace('Inter', `url(${staticFile('fonts/Inter.woff2')})`, {weight: '100 900'}).load(),
    new FontFace('Space Grotesk', `url(${staticFile('fonts/SpaceGrotesk.woff2')})`, {weight: '300 700'}).load(),
  ]).then((faces) => {faces.forEach((face) => document.fonts.add(face)); continueRender(handle);}).catch(cancelRender);
}
