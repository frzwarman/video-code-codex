import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, captionSrt, loadBrief, renderSettings, root, validateBrief} from '../scripts/lib.mjs';
import {validateOutput} from '../scripts/validate.mjs';

test('platforms map to delivery dimensions and retiming keeps frame count', () => {
  const b = loadBrief();
  assert.deepEqual(renderSettings(b), {format:'vertical',width:1080,height:1920,fps:30,duration:30,durationInFrames:900});
  assert.equal(renderSettings({...b, platform:'youtube'}).width, 1920);
  assert.equal(renderSettings({...b, platform:'reels'}).height, 1920);
  assert.equal(renderSettings({...b, platform:'tiktok'}).height, 1920);
  assert.equal(renderSettings(b, {format:'square',duration:'12.5',fps:'24'}).durationInFrames, 300);
  for (const invalid of [{format:'unknown'}, {duration:'NaN'}, {fps:0}, {duration:0.001,fps:30}]) assert.throws(() => renderSettings(b, invalid));
});
test('brief validation rejects traversal, missing content, timeline gaps and overlap', () => {
  const b = loadBrief();
  for (const invalid of [
    {...b,id:'../../escape'}, {...b,category:'unknown'}, {...b,title:''}, {...b,scenes:[]},
    {...b,scenes:[{...b.scenes[0],start:1}, ...b.scenes.slice(1)]},
    {...b,narration:[{start:2,end:4,text:'A'}, {start:3,end:5,text:'B'}]},
    {...b,audio:{...b.audio,music:'../private.wav'}},
  ]) assert.throws(() => validateBrief(invalid));
});
test('CLI boolean switches do not consume video id, captions retime cleanly', () => {
  const o = args(['--stills','message-journey','--preset','preview','--audio=false']);
  assert.deepEqual(o._, ['message-journey']); assert.equal(o.stills, true);assert.equal(o.audio,'false');
  assert.equal(captionSrt([{start:0.5,end:1.25,text:'Hello'}],2), '1\n00:00:01,000 --> 00:00:02,500\nHello\n');
});
test('new video registers three aspect ratios without overwriting existing work', () => {
  const id = 'workflow-fixture'; const dir = path.join(root,'src/videos',id); const cache = path.join(root,'.cache');fs.mkdirSync(cache,{recursive:true});
  const file = path.join(cache, 'test-brief.json'); const registry = fs.readFileSync(path.join(root,'src/registry.ts'));
  assert.equal(fs.existsSync(dir), false);
  try {
    fs.writeFileSync(file,JSON.stringify({...loadBrief(),id,audio:{narration:null,music:null,effects:null}}));
    execFileSync(process.execPath,['scripts/create-video.mjs','--brief',file],{cwd:root,stdio:'pipe'});
    assert.ok(fs.readFileSync(path.join(root,'src/registry.ts'),'utf8').includes(id));
    assert.ok(fs.readFileSync(path.join(dir,'Video.tsx'),'utf8').includes('BriefVideo'));
    assert.throws(() => execFileSync(process.execPath,['scripts/create-video.mjs','--brief',file],{cwd:root,stdio:'pipe'}));
  } finally {fs.rmSync(dir,{recursive:true,force:true});fs.rmSync(file,{force:true});fs.writeFileSync(path.join(root,'src/registry.ts'),registry);}
});
test('output validator catches wrong dimensions against a real encoded fixture', () => {
  const dir = fs.mkdtempSync(path.join(root,'.cache/validation-')); const file=path.join(dir,'fixture.mp4');
  try {
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=black:s=160x90:r=24:d=1','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','1','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-y',file],{stdio:'pipe'});
    const expected={width:160,height:90,fps:24,durationInFrames:24};
    assert.equal(validateOutput(file,expected).passed,true);
    assert.throws(()=>validateOutput(file,{...expected,width:1920}),/Dimensions/);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
