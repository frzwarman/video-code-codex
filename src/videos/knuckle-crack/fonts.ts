import {staticFile,delayRender,continueRender,cancelRender} from 'remotion';
if(typeof document!=='undefined'){const hold=delayRender('Loading Kinetic Lab serif');new FontFace('Lab Serif',`url(${staticFile('fonts/LibreBaskerville-Italic.ttf')})`,{weight:'400 700',style:'italic'}).load().then(f=>{document.fonts.add(f);continueRender(hold);}).catch(cancelRender);}
