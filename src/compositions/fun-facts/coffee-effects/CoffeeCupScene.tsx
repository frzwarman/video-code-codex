import React,{useMemo} from 'react';
import {DoubleSide,ShaderMaterial} from 'three';
import {cupGeometry,handleGeometry,saucerGeometry} from './geometry';
import {C,ramp,mix3,mix} from './timeline';
import {CinematicCamera} from './CinematicStage';

const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const coffeeFragment=`varying vec2 vUv;uniform float t;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+7.;a*=.5;}return v;}
void main(){vec2 p=vUv-.5;float r=length(p);float a=atan(p.y,p.x);float n=fbm(vec2(a*2.5+r*12.+t*.08,r*24.-t*.12));float crema=smoothstep(.42,.72,n+.22*sin(r*70.+a*3.+t*.6));vec3 col=mix(vec3(.045,.018,.008),vec3(.53,.28,.10),crema);col=mix(col,vec3(.68,.4,.18),smoothstep(.445,.5,r)*.75);float streak=exp(-pow((p.y+.13+.025*sin(p.x*18.+t))/.025,2.))*exp(-pow((p.x+.13)/.22,2.));col+=vec3(1.,.84,.57)*streak*.8;float rip=sin(r*105.-t*3.)*.013;col+=rip;gl_FragColor=vec4(col,1.);}`;
const steamFragment=`varying vec2 vUv;uniform float t;uniform float seed;void main(){float y=vUv.y;float center=.5+.16*sin(y*8.-t*.75+seed)+.08*sin(y*17.+t*.45);float width=.025+y*.14;float a=exp(-pow((vUv.x-center)/width,2.))*sin(y*3.14159)*.1;gl_FragColor=vec4(.93,.86,.74,a);}`;
export const CoffeeCup:React.FC<{time:number}>=({time})=>{
 const coffee=useMemo(()=>new ShaderMaterial({uniforms:{t:{value:0}},vertexShader:vertex,fragmentShader:coffeeFragment,side:DoubleSide}),[]);coffee.uniforms.t.value=time;
 const steam=useMemo(()=>Array.from({length:3},(_,i)=>new ShaderMaterial({uniforms:{t:{value:0},seed:{value:i*1.9}},vertexShader:vertex,fragmentShader:steamFragment,transparent:true,depthWrite:false,side:DoubleSide})),[]);steam.forEach(m=>m.uniforms.t.value=time);
 return <group>
 <mesh geometry={cupGeometry}><meshPhysicalMaterial color={C.cream} roughness={.18} metalness={.05} clearcoat={.8} clearcoatRoughness={.16}/></mesh>
 <mesh geometry={handleGeometry}><meshPhysicalMaterial color={C.cream} roughness={.18} clearcoat={.8}/></mesh>
 <mesh geometry={saucerGeometry}><meshPhysicalMaterial color="#d9ccb9" roughness={.23} metalness={.12}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.385,0]} material={coffee}><circleGeometry args={[1.34,96]}/></mesh>
 <mesh rotation={[Math.PI/2,0,0]} position={[0,.39,0]}><torusGeometry args={[1.32,.012,8,96]}/><meshPhysicalMaterial color={C.bronze} roughness={.3}/></mesh>
 {steam.map((m,i)=><mesh key={i} material={m} position={[(i-1)*.45,2,.05-i*.14]} rotation={[0,(i-1)*.35,0]}><planeGeometry args={[1.8,3.2]}/></mesh>)}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.81,0]}><planeGeometry args={[12,12]}/><meshStandardMaterial color="#17100d" roughness={.28} metalness={.25}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.8,0]}><planeGeometry args={[6,6]}/><shaderMaterial transparent depthWrite={false} vertexShader={vertex} fragmentShader="varying vec2 vUv;void main(){float a=exp(-dot(vUv-.5,vUv-.5)*20.)*.78;gl_FragColor=vec4(0.,0.,0.,a);}"/></mesh>
 </group>;
};
export const CoffeeCupScene:React.FC<{time:number;ending?:boolean}>=({time,ending=false})=>{
 let position:[number,number,number];let target:[number,number,number];
 const macro:[number,number,number]=[.3,1.65,1.7],hero:[number,number,number]=[4,4.7,8.4];
 if(!ending){const pull=ramp(time,.08,1.35),dive=ramp(time,3.05,4);position=mix3(mix3(macro,hero,pull),[0,.53,.22],dive);target=mix3([0,.35,0],[0,.48,0],pull);}
 else{const pull=ramp(time,0,1.35),loop=ramp(time,4.55,5.95);position=mix3(mix3([0,.53,.22],hero,pull),macro,loop);target=[0,.35,0];}
 const drop=ramp(time,.7,1.4)*(1-ramp(time,2.5,3.2));
 return <><CinematicCamera position={position} target={target} fov={38}/><fog attach="fog" args={[C.espresso,16,38]}/><CoffeeCup time={ending?Math.max(0,6-time)*.2:time*.2}/>
 {!ending&&drop>.001&&<group position={[-.2,.5+drop*1.5,.05]}><mesh scale={[.19,.23+Math.sin(time*2)*.02,.19]}><sphereGeometry args={[1,32,24]}/><meshPhysicalMaterial color="#4a2511" roughness={.08} metalness={.5} clearcoat={1}/></mesh><pointLight color={C.bronze} intensity={1.4} distance={3}/></group>}
 </>;
};
