import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const preset=process.argv[2]||'final',dir='out/knuckle-crack',input=`${dir}/vertical-${preset}.mp4`;
const frames=[60,300,720,1320,1590,2190,2670,3150];
function sheet(which,name,w,h,cols){execFileSync('ffmpeg',['-v','error','-i',input,'-vf',`select=${which.map(f=>`eq(n\\,${f})`).join('+')},scale=${w}:${h},tile=${cols}x${Math.ceil(which.length/cols)}:padding=8:margin=8:color=0x202020`,'-frames:v','1','-y',`${dir}/review/${preset}-${name}.png`],{stdio:'inherit'});}
sheet(frames,'contact-sheet',270,480,4);
sheet([172,176,180,184,188,194,200,210],'transition',180,320,8);
sheet([1527,1528,1529,1530,1531,1532,1533,1534],'pop',180,320,8);
sheet([3714,3719,0,6],'loop',270,480,4);
execFileSync('ffmpeg',['-v','error','-i',input,'-f','null','-'],{stdio:'inherit'});
const b=JSON.parse(fs.readFileSync('briefs/knuckle-crack.json'));
const cues=b.narration.map(c=>({...c,wordCount:c.text.split(/\s+/).length,wordsPerMinute:Math.round(c.text.split(/\s+/).length*60/(c.end-c.start)),withinScene:b.scenes.some(s=>c.start>=s.start&&c.end<=s.end)}));
fs.writeFileSync(`${dir}/review/${preset}-cue-audit.json`,JSON.stringify({narration:'not recorded; cue planning only, not measured voice alignment',allWithinScenes:cues.every(c=>c.withinScene),popFrames:[24,1530],scoreBPM:120,contactSheetFrames:frames,cues},null,2));
console.log('Full decode passed; contact, transition, pop and loop sheets exported; cue timing audited.');
