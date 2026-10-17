/**
 * Convert actual CT-segmented SPL anatomy into a texture-free local GLB.
 * No rendering, geometric approximation, remeshing or extra dependency.
 *
 * node scripts/prepare-telinga-anatomy.mjs
 * node scripts/prepare-telinga-anatomy.mjs --source-dir /path/to/extracted/models
 *
 * Download sources are individually accessible; the 181 MB atlas is not needed.
 * Original atlas coordinates and topology are preserved; exported normals
 * are normalized by Three's exporter. See provenance JSON.
 */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Box3, Group, Mesh, MeshStandardMaterial, DoubleSide, Vector3} from 'three';
import {VTKLoader} from 'three/examples/jsm/loaders/VTKLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'public/telinga-volume/models');
const sourceArg = process.argv.indexOf('--source-dir');
const sourceDirectory = sourceArg >= 0 ? process.argv[sourceArg + 1] : null;
if (sourceArg >= 0 && !sourceDirectory) throw new Error('--source-dir needs a directory');
const sourcePage = 'https://www.openanatomy.org/atlas-pages/atlas-spl-inner-ear.html';
const base = 'https://www.openanatomy.org/atlases/nac/inner-ear-2018-02/';
const licenseUrl = 'https://www.openanatomy.org/atlas-pages/slicer-license.html';
const licensePath = path.join(output, 'licenses/spl-slicer-license.html');
const hash = (b) => createHash('sha256').update(b).digest('hex');
const bounds = (box) => ({min:box.min.toArray(),max:box.max.toArray(),center:box.getCenter(new Vector3()).toArray(),size:box.getSize(new Vector3()).toArray()});
const parts = [
  ['Labyrinth', 'Model_10_Labyrinth.vtk', '#37E8CC', .32, 'CT-segmented bony labyrinth, including cochlea and semicircular canals'],
  ['Malleus', 'Model_140_Malleus_Bone.vtk', '#F4F0E8', .42, 'Malleus (hammer)'],
  ['Incus', 'Model_14_Incus_Bone.vtk', '#E9DCC5', .42, 'Incus (anvil)'],
  ['Stapes', 'Model_17_Stapes_Bone.vtk', '#DDFB6A', .42, 'Stapes (stirrup)'],
  ['TympanicMembrane', 'Model_4_Tympanic_Membrane.vtk', '#E3B8A1', .45, 'Tympanic membrane (eardrum)'],
  ['OsseousSpiralLamina', 'Model_23_Osseous_Spiral_Lamina.vtk', '#F4F0E8', .42, 'Osseous spiral lamina, internal bony support within the cochlea'],
  ['CochlearNerve', 'Model_9_Cochlear_Nerve.vtk', '#DDFB6A', .5, 'Cochlear nerve'],
];
await mkdir(path.join(output, 'licenses'), {recursive:true});
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
let license;
try { license = await readFile(licensePath); }
catch { license = await download(licenseUrl); await writeFile(licensePath, license); }
const licenseArticle = license.toString().match(/<h1[^>]*>3D Slicer[\s\S]*?(?=<footer|<hr|<\/main)/)?.[0];
if (!licenseArticle || !licenseArticle.includes('PART C.')) throw new Error('Full source license text was not found');
const licenseText = licenseArticle.replace(/<\/(?:p|li|h[1-6]|div)>/g,'\n\n')
  .replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
  .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\n\s*\n/g,'\n\n').trim();
await writeFile(path.join(output,'licenses/spl-slicer-license.txt'),
  'All or portions of this licensed product (such portions are the “Software”) have been obtained under license from The Brigham and Women’s Hospital, Inc. and are subject to the following terms and conditions:\n\n' + licenseText + '\n\nSource: ' + licenseUrl + '\n');

// Three's GLB exporter needs only this Blob-backed FileReader method in Node.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(result => {
      this.result = result;
      this.onloadend?.({target:this});
    }).catch(error => this.onerror?.(error));
  }
};
const atlas = new Group();
atlas.name = 'SPLInnerEar';
atlas.userData = {
  source: sourcePage,
  authors: ['Sonke Bartling (DKFZ)', 'Marianna Jakab (SPL)', 'Ron Kikinis (SPL)'],
  license: '3D Slicer License, Part B',
  licenseUrl,
  modified: true,
  modifications: 'Selected source meshes converted from VTK to GLB; semantic node names and editorial PBR materials. Original vertex coordinates and topology preserved. Source normal directions retained and lengths normalized by the exporter.',
  coordinateSystem: 'RAS (+X right, +Y anterior, +Z superior). Wrap with rotation X=-PI/2 for Y-up.',
  coordinateUnits: 'Unscaled source atlas units. Slicer convention is millimetres; no clinical dimension calibration is claimed.',
};
const manifest = [];
for (const [name,file,color,roughness,description] of parts) {
  const sourceUrl = `${base}models/${file}`;
  const bytes = sourceDirectory ? await readFile(path.join(sourceDirectory,file)) : await download(sourceUrl);
  const data = bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  const geometry = new VTKLoader().parse(data);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  if (!position || !normal || !geometry.index) throw new Error(`Missing geometry data in ${name}`);
  for (const attribute of [position, normal]) {
    if (![...attribute.array].every(Number.isFinite)) throw new Error(`Non-finite geometry in ${name}`);
  }
  if (![...geometry.index.array].every(i => i >= 0 && i < position.count)) throw new Error(`Invalid triangle index in ${name}`);
  geometry.computeBoundingBox();
  const material = new MeshStandardMaterial({color,roughness,metalness:0.06,side:DoubleSide});
  material.name = `${name}_EditorialMaterial`;
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.userData = {description,sourceUrl,sourceSha256:hash(bytes),sourceCoordinatesUnmodified:true};
  atlas.add(mesh);
  manifest.push({name,description,sourceUrl,sourceBytes:bytes.length,sourceSha256:hash(bytes),vertices:position.count,triangles:geometry.index.count/3,bounds:bounds(geometry.boundingBox)});
}
atlas.updateMatrixWorld(true);
const array = await new GLTFExporter().parseAsync(atlas, {
  binary:true,
  copyright:'SPL Inner Ear Atlas — Sonke Bartling, Marianna Jakab, Ron Kikinis. Licensed by The Brigham and Women’s Hospital, Inc. under 3D Slicer License Part B. Modified format and editorial materials.',
});
const binary = Buffer.from(array);
const glbPath = path.join(output, 'inner-ear.glb');
await writeFile(glbPath,binary);
const provenance = {
  title:'SPL Inner Ear Atlas — selected anatomy for Telinga Volume',
  sourcePage,
  sourceArchive:`${base.slice(0,-1)}.zip`,
  sourceRelease:'February 2018',
  verifiedOn:'2026-10-16',
  authors:atlas.userData.authors,
  institutions:['German Cancer Research Center (DKFZ), Heidelberg','Surgical Planning Laboratory, Brigham and Women’s Hospital / Harvard Medical School, Boston'],
  method:'Human ear segmented from high-resolution flat-panel CT (source reports approximately 140 micrometre high-contrast resolution).',
  license:{name:'3D Slicer License Part B',url:licenseUrl,localHtml:'licenses/spl-slicer-license.html',localText:'licenses/spl-slicer-license.txt',sourceSha256:hash(license),commercialUse:'Permitted under the stated license conditions, including license preservation, attribution, modification disclosure and no endorsement implication.'},
  modifications:atlas.userData.modifications,
  coordinateSystem:atlas.userData.coordinateSystem,
  coordinateUnits:atlas.userData.coordinateUnits,
  geometryInMetres:false,
  anatomicalLimit:'Educational visualization of one segmented specimen. Editorial colors are not literal tissue colors. Not a diagnostic or dimensionally calibrated model.',
  reproduction:'node scripts/prepare-telinga-anatomy.mjs',
  output:{file:'inner-ear.glb',bytes:binary.length,sha256:hash(binary),meshes:manifest.length,vertices:manifest.reduce((n,m)=>n+m.vertices,0),triangles:manifest.reduce((n,m)=>n+m.triangles,0),bounds:bounds(new Box3().setFromObject(atlas))},
  parts:manifest,
  sourceCameraExamples:{
    coordinateSystem:'Source RAS. Apply the same X=-PI/2 transform to positions, targets and up vectors when normalizing to Y-up.',
    lateral:{position:[258.492,-33.2149,-1.42439],target:[-10.3149,-33.2149,-1.42439],up:[0,0,1]},
    oblique:{position:[79.0662,66.6027,-98.8453],target:[-10.3149,-33.2149,-1.42439],up:[.612689,.198095,.765095]},
    source:'HighRes-EarAtlas-2018-02-16-Scene.mrml camera nodes from the downloadable atlas',
  },
  checks:{finitePositionAndNormalComponents:true,validTriangleIndices:true,topologyUnmodified:true,rendererExecuted:false},
};
await writeFile(path.join(output,'inner-ear-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify(provenance.output,null,2));
