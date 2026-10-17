import {mix3,ramp,type V3} from './timeline';
import {headphoneFocus} from './assets';

export function cameraAt(time:number,scene:number):{position:V3;target:V3}{
 const t=time;
 if(scene===0){const p=ramp(t,2.7,4);return {position:mix3([2.8,1.5,10.8],[3.4,-.6,2.5],p),target:mix3([0,.1,0],headphoneFocus(t),p)};}
 // Approach the real +X-facing source canal; remain outside its opening.
 if(scene===1){const p=ramp(t,4.7,9);return{position:mix3([.8,.55,9.8],[0,.025,.65],p),target:mix3([0,.35,0],[.015,.035,-1.2],p)};}
 // Leave clear space above the CT meshes for titles and below for anchored labels.
 if(scene===2){const p=ramp(t,9,14);return{position:mix3([-1.2,.8,15],[.6,.65,14.8],p),target:[0,-.2,0]};}
 if(scene===3){const p=ramp(t,14,19);return{position:mix3([.8,.65,13.8],[-.25,.2,13.1],p),target:[-.05,.05,0]};}
 // Oblique microscope view reveals the stepped chevrons and their insertion points.
 if(scene===4){const p=ramp(t,19,27);return{position:mix3([2.8,3.6,6.4],[1.35,2.55,4.7],p),target:[.05,.22,.55]};}
 if(scene===5)return{position:[2.5-ramp(t,27,35)*.8,3.4,6.4],target:[.05,.15,.55]};
 if(scene===6)return{position:[1.4-ramp(t,35,43)*.8,2.3,4.4],target:[.05,.15,.65]};
 if(scene===7)return{position:[.6,2.3,4.4],target:[.05,.15,.65]};
 if(scene===8)return{position:[2.8-ramp(t,49,57)*1.1,1.5,10.8],target:[0,.1,0]};
 if(scene===9)return{position:[2.8,1.5,11.3],target:[0,.1,0]};
 return{position:[2.8,1.5,10.8],target:[0,.1,0]};
}

