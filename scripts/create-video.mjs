import fs from 'node:fs';
import path from 'node:path';
import {args, root, validateBrief} from './lib.mjs';
import {registerVideos} from './register.mjs';

const options = args();
if (!options.brief) throw Error('Usage: npm run new -- --brief briefs/my-video.json');
const brief = validateBrief(JSON.parse(fs.readFileSync(path.resolve(options.brief), 'utf8')));
const dir = path.join(root, 'src/videos', brief.id);
if (fs.existsSync(dir)) throw Error(`Video ${brief.id} already exists; edit its source directly.`);
fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, 'brief.json'), JSON.stringify(brief, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'Video.tsx'), `import React from 'react';\nimport {BriefVideo} from '../../templates/BriefVideo';\nimport type {VideoProps} from '../../types';\nimport brief from './brief.json';\n\n// Replace this foundation with original scenes guided by the creative brief.\nexport const Video: React.FC<VideoProps> = (props) => <BriefVideo {...props} brief={brief}/>;\n`);
registerVideos();
console.log(`Created src/videos/${brief.id}. Run npm run studio, then direct Codex to develop the scenes.`);
