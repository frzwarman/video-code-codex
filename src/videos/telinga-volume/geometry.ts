import {BufferGeometry,CatmullRomCurve3,Float32BufferAttribute,Vector3} from 'three';
// Original microscopic illustrations only. Product and macroscopic anatomy use local GLBs.
export const curve = (points:number[][]) => new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number])));
/** Tapered tube, including optional open longitudinal section. Cached by its caller. */
export function sweep(path:CatmullRomCurve3,segments:number,sides:number,radius:(u:number)=>number,arc=Math.PI*2){
 const pos:number[]=[],uv:number[]=[],indices:number[]=[],frames=path.computeFrenetFrames(segments,false);
 for(let i=0;i<=segments;i++){
  const u=i/segments,p=path.getPointAt(u),r=radius(u),n=frames.normals[i],b=frames.binormals[i];
  for(let j=0;j<=sides;j++){
   const theta=j/sides*arc,cs=Math.cos(theta),sn=Math.sin(theta);
   pos.push(p.x+r*(cs*n.x+sn*b.x),p.y+r*(cs*n.y+sn*b.y),p.z+r*(cs*n.z+sn*b.z));uv.push(u,j/sides);
   if(i<segments&&j<sides){const a=i*(sides+1)+j,c=a+sides+1;indices.push(a,a+1,c,c,a+1,c+1);}
  }
 }
 const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(pos,3));geo.setAttribute('uv',new Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();return geo;
}
export function membraneGeometry(){
 const positions:number[]=[],uv:number[]=[],idx:number[]=[],n=48;
 for(let z=0;z<=n;z++)for(let x=0;x<=n;x++){
  const a=(x/n-.5)*11,b=(z/n-.5)*8;
  positions.push(a,-.45+.06*Math.sin(a*1.2)+.1*Math.cos(b),b);uv.push(x/n,z/n);
  if(x<n&&z<n){const i=z*(n+1)+x;idx.push(i,i+n+1,i+1,i+1,i+n+1,i+n+2);}
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
