import {Box3,Euler,Matrix4,Mesh,Plane,Quaternion,Vector3,type BufferGeometry,type Material} from 'three';
import type {GLTF} from 'three/addons/loaders/GLTFLoader.js';

export type Assets={headphones:GLTF;outer:GLTF;inner:GLTF};
export type Part={name:string;id:string;geometry:BufferGeometry;material:Material|Material[];center:[number,number,number]};

// Keep the hero between the headline and lower-third copy in the portrait layout.
export const headphonePosition=(scene=0):[number,number,number]=>scene===9?[-.2,.15,0]:[0,.25,0];
export const headphonePose=(time:number)=>({
 scale:8.6,
 rotation:[.08+Math.sin(time*.35)*.035,-.48+Math.sin(time*.23)*.13,-.13] as [number,number,number],
});
// Right earcup mesh center (distinct from its source hinge pivot).
export const headphoneFocus=(time:number)=>{
 const {scale,rotation}=headphonePose(time);
 return new Vector3(.110364499,-.060843981,0).applyMatrix4(new Matrix4().compose(
  new Vector3(...headphonePosition()),new Quaternion().setFromEuler(new Euler(...rotation)),new Vector3(scale,scale,scale)
 )).toArray() as [number,number,number];
};

// Source RAS -> editorial Y-up: right=anterior, up=superior, camera=right.
// This is a rigid coordinate conversion, followed by uniform presentation scale.
const lateral=new Matrix4().set(0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1);
const normalized=(orientation:Matrix4,center:[number,number,number],scale:number)=>
 new Matrix4().makeScale(scale,scale,scale).multiply(orientation).multiply(new Matrix4().makeTranslation(-center[0],-center[1],-center[2]));

export const anatomyMatrices={
 outer:normalized(new Matrix4().makeRotationY(-Math.PI/2),[.019,.026,.0035],50),
 middle:normalized(lateral,[16,-11,-14],.072),
 cochlea:normalized(lateral,[.775112,-30.126437,-10.059416],.105),
};
// World-space cutaway planes retain the source vertices and hide vestibular loops.
export const cochleaCut=[
 new Plane(new Vector3(0,-1,0),1.4),
 new Plane(new Vector3(-1,0,0),1.45),
 new Plane(new Vector3(1,0,0),1.48),
];
export const anatomyPoint=(point:[number,number,number],shot:keyof typeof anatomyMatrices)=>
 new Vector3(...point).applyMatrix4(anatomyMatrices[shot]).toArray() as [number,number,number];

// These anchors come from the CT segmentation bounds, not hand-placed stand-ins.
export const middleAnchors={
 eardrum:anatomyPoint([13.053115,-11.134597,-23.878406],'middle'),
 ossicles:anatomyPoint([19.546763,-7.502892,-3.375882],'middle'),
};

/** Clone geometry once per loaded asset, retaining original topology and normals.
 * Shared loader resources/materials are never mutated or disposed here. */
export function prepareParts(gltf:GLTF,matrix=new Matrix4()):Part[]{
 gltf.scene.updateMatrixWorld(true);
 const parts:Part[]=[];
 gltf.scene.traverse(object=>{
  if(!(object instanceof Mesh))return;
  const geometry=object.geometry.clone();
  geometry.applyMatrix4(new Matrix4().multiplyMatrices(matrix,object.matrixWorld));
  const center=new Box3().setFromBufferAttribute(geometry.attributes.position).getCenter(new Vector3());
  geometry.translate(-center.x,-center.y,-center.z);
  parts.push({name:object.name,id:object.userData.anatomical_id??object.name,geometry,material:object.material,center:center.toArray() as Part['center']});
 });
 return parts;
}
