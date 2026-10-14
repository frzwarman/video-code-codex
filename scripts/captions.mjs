import fs from 'node:fs';
import path from 'node:path';
import {args, root, loadBrief, captionSrt} from './lib.mjs';
const o = args(); const b = loadBrief(o._[0]); const dir = path.join(root, 'out', b.id);
fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, 'captions.srt'), captionSrt(b.narration));
fs.writeFileSync(path.join(dir, 'narration.txt'), b.narration.map((c) => `[${c.start.toFixed(2)}–${c.end.toFixed(2)}] ${c.text}`).join('\n') + '\n');
console.log(`Exported captions and narration script to ${dir}`);
