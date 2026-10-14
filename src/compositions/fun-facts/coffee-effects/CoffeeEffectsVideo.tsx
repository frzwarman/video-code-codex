import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import {useStoryTime} from '../../../motion';
import {AudioTracks} from '../../../components/AudioTracks';
import {Captions} from '../../../components/Motion';
import type {Brief,VideoProps} from '../../../types';
import briefData from '../../../videos/coffee-effects/brief.json';
import {C,beats,ramp,mix} from './timeline';
import {CinematicStage} from './CinematicStage';
import {CoffeeCupScene} from './CoffeeCupScene';
import {CaffeineMoleculeScene} from './CaffeineMoleculeScene';
import {BloodstreamScene} from './BloodstreamScene';
import {BrainScene} from './BrainScene';
import {ReceptorScene} from './ReceptorScene';
import {AlertnessScene} from './AlertnessScene';
import {CaffeineMetabolismScene} from './CaffeineMetabolismScene';
import {CameraTransition,DeclineCurve,GlyphMorph,KineticTypography,ScientificLabel} from './MotionDesign';
const brief:Brief=briefData;
export const CoffeeEffectsVideo:React.FC<VideoProps>=props=>{
 const t=useStoryTime(beats.end);const {width,height}=useVideoConfig();const cool=t>=10&&t<39;const b=beats;
 return <AbsoluteFill style={{background:cool?'#0b1318':C.espresso,color:C.cream,fontFamily:'Inter, sans-serif',overflow:'hidden'}}>
 <CinematicStage quality={props.quality} cool={cool}>
 {t<b.absorption&&<CoffeeCupScene time={t}/>}
 {t>=b.absorption&&t<b.blood&&<CaffeineMoleculeScene time={t-b.absorption}/>}
 {t>=b.blood&&t<b.brain&&<BloodstreamScene time={t-b.blood} preview={props.quality==='preview'}/>}
 {t>=b.brain&&t<b.receptor&&<BrainScene time={t-b.brain}/>}
 {t>=b.receptor&&t<b.alert&&<ReceptorScene time={t-b.receptor}/>}
 {t>=b.alert&&t<b.metabolism&&<AlertnessScene time={t-b.alert}/>}
 {t>=b.metabolism&&t<b.return&&<CaffeineMetabolismScene time={t-b.metabolism}/>}
 {t>=b.return&&<CoffeeCupScene time={t-b.return} ending/>}
 </CinematicStage>
 <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 46%,transparent 36%,#08090b66 100%)',pointerEvents:'none'}}/>
 <div style={{position:'absolute',inset:0,width:1080,height:1920,transform:`scale(${width/1080},${height/1920})`,transformOrigin:'top left'}}>
 <ScientificLabel top={112} style={{fontSize:21,opacity:.7}}>AFTER THE SIP <span style={{opacity:.45}}> / SCIENCE 001</span></ScientificLabel>
 {t<4&&<><KineticTypography lines={t<1.8?['YOUR','BRAIN']:['ON','COFFEE']} key={t<1.8?'brain':'coffee'} time={t<1.8?t:t-1.8} at={.15} size={150} top={215} exit={t<1.8?1.5:1.2}/><ScientificLabel top={1430} color={C.bronze} style={{opacity:ramp(t,.5,1)*(1-ramp(t,3,3.4))}}>One sip. A molecular journey.</ScientificLabel></>}
 {t>=4&&t<10&&<><KineticTypography lines={['CAFFEINE']} time={t-4} at={.6} size={116} top={260} exit={5.2}/><div style={{position:'absolute',top:400,left:88,fontSize:58,fontWeight:350,letterSpacing:6,opacity:ramp(t,5.1,5.6)*(1-ramp(t,9.3,9.7))}}>C₈H₁₀N₄O₂</div><ScientificLabel top={1400} color={C.cyan} style={{opacity:ramp(t,5.8,6.3)}}>ABSORBED → BLOODSTREAM</ScientificLabel><ScientificLabel top={1460} style={{fontSize:18,opacity:.5}}>PubChem structure · stylized scale</ScientificLabel></>}
 {t>=10&&t<16&&<><KineticTypography lines={['IN THE','BLOODSTREAM']} time={t-10} at={.3} size={96} top={260} exit={2.8}/>{t>13&&<KineticTypography lines={['NEXT STOP:','YOUR BRAIN']} time={t-13} size={104} top={1120} exit={2.4}/>}</>}
 {t>=16&&t<19.3&&<><KineticTypography lines={['A SMALL','MOLECULE.']} time={t-16} size={100} top={220} exit={2.3}/><ScientificLabel top={1410} color={C.cyan}>A BIG CHANGE IN SIGNALING</ScientificLabel></>}
 {t>=19.3&&t<23&&<><KineticTypography lines={['BLOCKS']} time={t-19.3} at={.3} size={151} top={230}/><KineticTypography lines={['ADENOSINE','SIGNALING']} time={t-19.3} at={1} size={75} top={410}/><ScientificLabel top={720} left={95} color={C.bronze}>ADENOSINE</ScientificLabel><ScientificLabel top={720} left={690} color={C.cyan}>CAFFEINE</ScientificLabel><ScientificLabel top={1430} color={C.cyan} style={{fontSize:25}}>ONE BINDING SITE. OCCUPIED.</ScientificLabel><ScientificLabel top={1480} style={{fontSize:18,opacity:.55}}>Simplified receptor interaction · not to scale</ScientificLabel></>}
 {t>=23&&t<31&&<><GlyphMorph progress={ramp(t,25.2,27.5)} top={mix(620,280,ramp(t,24.7,28))}/><ScientificLabel top={1360} color={C.cyan} style={{opacity:ramp(t,27.6,28.3)}}>LESS OF THE SLEEPINESS SIGNAL</ScientificLabel><ScientificLabel top={1420} style={{fontSize:19,opacity:.6}}>Illustrative neural activity · not added energy</ScientificLabel></>}
 {t>=31&&t<39&&<><KineticTypography lines={t<35?['CAFFEINE','FADES.']:['SLEEP PRESSURE','REMAINS.']} key={t<35?'fade':'remains'} time={t<35?t-31:t-35} size={t<35?109:87} top={230}/><DeclineCurve time={t-31}/><ScientificLabel top={1510} style={{fontSize:23,opacity:.7}}>CLEARANCE VARIES FROM PERSON TO PERSON</ScientificLabel></>}
 {t>=39&&<>{t<41.6?<KineticTypography lines={['COFFEE DOESN’T','ERASE TIREDNESS.']} time={t-39} at={.7} size={82} top={245} exit={2.2}/>:<KineticTypography lines={['IT MASKS','THE SIGNAL.']} time={t-41.6} size={115} top={245} exit={2.65}/>}</>}
 {props.captions&&<div style={{opacity:(1-ramp(t,44.4,44.8))}}><Captions cues={brief.narration} time={t} width={850} bottom={230} fontSize={34}/></div>}
 </div>
 <CameraTransition time={t} at={4} kind="liquid"/><CameraTransition time={t} at={10} kind="depth"/><CameraTransition time={t} at={16} kind="aperture"/><CameraTransition time={t} at={19.3} kind="depth"/><CameraTransition time={t} at={23} kind="depth"/><CameraTransition time={t} at={31} kind="aperture"/><CameraTransition time={t} at={39} kind="match"/>
 <AudioTracks brief={brief} enabled={props.audio}/>
 </AbsoluteFill>;
};
