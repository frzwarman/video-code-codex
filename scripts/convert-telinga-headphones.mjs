// Convert nisu's CC0 OBJ/PBR headphone asset into a self-contained, movable GLB.
// Usage: node scripts/convert-telinga-headphones.mjs /path/to/unzipped/Headphones
// This converts geometry/textures only. It does not render a video or still.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';

const source = process.argv[2];
if (!source) throw new Error('Pass the folder containing Headphones.obj and Mat_*.png.');
const destination = 'public/telinga-volume/models/headphones.glb';
const resolution = 2048;
const ffmpeg = (args, input) => {
  const result = spawnSync('ffmpeg', ['-v', 'error', ...args], {input, maxBuffer: 64 * 1024 * 1024});
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
};
const pixels = (name) => ffmpeg(['-i', path.join(source, name), '-vf', `scale=${resolution}:${resolution}:flags=lanczos`, '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']);
const png = (raw) => ffmpeg(['-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${resolution}x${resolution}`, '-i', '-', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], raw);
const normal = pixels('Mat_Normal_DirectX.png');
for (let i = 1; i < normal.length; i += 3) normal[i] = 255 - normal[i];
const ao = pixels('Mat_Mixed_AO.png');
const roughness = pixels('Mat_Roughness.png');
const metallic = pixels('Mat_Metallic.png');
const orm = Buffer.alloc(normal.length);
for (let i = 0; i < orm.length; i += 3) {
  orm[i] = ao[i]; orm[i + 1] = roughness[i]; orm[i + 2] = metallic[i];
}

const object = new OBJLoader().parse(fs.readFileSync(path.join(source, 'Headphones.obj'), 'utf8'));
const geometry = object.children[0].geometry;
const position = geometry.attributes.position;
const normals = geometry.attributes.normal;
const uv = geometry.attributes.uv;
// Weld only for connected-component discovery. Preserve the authored UV seams
// and split normals in the exported non-indexed triangles.
const parents = new Map();
const find = (key) => {
  if (!parents.has(key)) parents.set(key, key);
  if (parents.get(key) !== key) parents.set(key, find(parents.get(key)));
  return parents.get(key);
};
const key = (i) => [position.getX(i), position.getY(i), position.getZ(i)].map((v) => v.toFixed(4)).join(',');
for (let i = 0; i < position.count; i += 3) {
  const root = find(key(i));
  parents.set(find(key(i + 1)), root); parents.set(find(key(i + 2)), root);
}
const components = new Map();
for (let i = 0; i < position.count; i += 3) {
  const root = find(key(i));
  if (!components.has(root)) components.set(root, []);
  components.get(root).push(i);
}
if (components.size !== 3) throw new Error(`Expected headband and two earcups; found ${components.size} components.`);
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < position.count; i++) for (let axis = 0; axis < 3; axis++) {
  const value = position.array[i * 3 + axis];
  min[axis] = Math.min(min[axis], value); max[axis] = Math.max(max[axis], value);
}
const center = min.map((value, i) => (value + max[i]) / 2);
const scale = 0.24 / (max[1] - min[1]); // presentation scale, not a measured product dimension
const chunks = [], bufferViews = [], accessors = [];
let byteLength = 0;
const append = (data, target) => {
  const buffer = Buffer.from(data.buffer ?? data, data.byteOffset ?? 0, data.byteLength ?? data.length);
  const index = bufferViews.length;
  bufferViews.push({buffer: 0, byteOffset: byteLength, byteLength: buffer.length, ...(target ? {target} : {})});
  chunks.push(buffer); byteLength += buffer.length;
  const padding = (4 - byteLength % 4) % 4;
  if (padding) {chunks.push(Buffer.alloc(padding)); byteLength += padding;}
  return index;
};
const attribute = (data, type, bounds) => {
  const index = accessors.length;
  accessors.push({bufferView: append(data, 34962), componentType: 5126, count: data.length / (type === 'VEC2' ? 2 : 3), type, ...bounds});
  return index;
};
const nodes = [], meshes = [];
for (const faces of components.values()) {
  const points = faces.flatMap((i) => [i, i + 1, i + 2]);
  const xs = points.map((i) => position.getX(i));
  const isHeadband = Math.min(...xs) < 0 && Math.max(...xs) > 0;
  const side = xs[0] < 0 ? -1 : 1;
  const name = isHeadband ? 'Headband' : side < 0 ? 'Left_Earcup' : 'Right_Earcup';
  const pivot = isHeadband ? [0, 0, 0] : [(side * 37.4 - center[0]) * scale, (85.86 - center[1]) * scale, 0];
  const positions = new Float32Array(points.length * 3);
  const normalValues = new Float32Array(points.length * 3);
  const uvValues = new Float32Array(points.length * 2);
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  points.forEach((p, i) => {
    for (let axis = 0; axis < 3; axis++) {
      const value = (position.array[p * 3 + axis] - center[axis]) * scale - pivot[axis];
      positions[i * 3 + axis] = value;
      normalValues[i * 3 + axis] = normals.array[p * 3 + axis];
      low[axis] = Math.min(low[axis], value); high[axis] = Math.max(high[axis], value);
    }
    uvValues[i * 2] = uv.getX(p); uvValues[i * 2 + 1] = 1 - uv.getY(p);
  });
  const index = meshes.length;
  meshes.push({name, primitives: [{attributes: {POSITION: attribute(positions, 'VEC3', {min: low, max: high}), NORMAL: attribute(normalValues, 'VEC3'), TEXCOORD_0: attribute(uvValues, 'VEC2')}, material: 0, mode: 4}]});
  nodes.push({name, mesh: index, translation: pivot, extras: {triangles: faces.length, originalAuthor: 'nisu', license: 'CC0-1.0'}});
}
const images = [{name: 'OpenGL_normal_2K', bufferView: append(png(normal)), mimeType: 'image/png'}, {name: 'AO_roughness_metallic_2K', bufferView: append(png(orm)), mimeType: 'image/png'}];
const json = {
  asset: {version: '2.0', generator: 'scripts/convert-telinga-headphones.mjs', copyright: 'Headphones by nisu, CC0-1.0; adapted for telinga-volume'},
  scene: 0, scenes: [{nodes: [0, 1, 2]}], nodes, meshes, accessors, bufferViews,
  images, samplers: [{magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497}],
  textures: images.map((_, source) => ({source, sampler: 0})),
  materials: [{name: 'Unbranded_charcoal_PBR', pbrMetallicRoughness: {baseColorFactor: [0.08, 0.095, 0.115, 1], metallicFactor: 1, roughnessFactor: 1, metallicRoughnessTexture: {index: 1}}, normalTexture: {index: 0, scale: 0.7}, occlusionTexture: {index: 1, strength: 0.65}}],
  buffers: [{byteLength}],
  extras: {license: 'CC0-1.0', source: 'https://opengameart.org/content/headphones', author: 'nisu', modifications: 'OBJ converted to GLB; physical islands split into movable headband and earcups; estimated presentation height 0.24m; 4K maps reduced to 2K; DirectX normals converted to OpenGL; ORM channels packed; source logo/albedo/emission maps omitted, neutral charcoal factor assigned.'},
};
let jsonBytes = Buffer.from(JSON.stringify(json));
jsonBytes = Buffer.concat([jsonBytes, Buffer.alloc((4 - jsonBytes.length % 4) % 4, 32)]);
const bin = Buffer.concat(chunks);
const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + jsonBytes.length + bin.length, 8); header.writeUInt32LE(jsonBytes.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length); binHeader.writeUInt32LE(0x004e4942, 4);
const glb = Buffer.concat([header, jsonBytes, binHeader, bin]);
fs.mkdirSync(path.dirname(destination), {recursive: true}); fs.writeFileSync(destination, glb);
console.log(JSON.stringify({destination, bytes: glb.length, sha256: createHash('sha256').update(glb).digest('hex'), triangles: position.count / 3, nodes: nodes.map(({name, translation, extras}) => ({name, translation, ...extras})), bounds: {min: min.map((value, i) => (value - center[i]) * scale), max: max.map((value, i) => (value - center[i]) * scale)}, textures: '2 × embedded 2048² PNG; normal + ORM'}, null, 2));
