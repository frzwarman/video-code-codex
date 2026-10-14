import React from 'react';
import {palette, fonts} from '../theme';
import {tween} from '../motion';

export const SendIcon: React.FC<{size?: number; color?: string}> = ({size = 40, color = palette.ink}) => <svg width={size} height={size} viewBox="0 0 100 100" fill="none"><path d="M16 47 85 16 55 85 44 57 16 47Z" fill={color}/><path d="m44 57 26-26" stroke={palette.cyan} strokeWidth={4}/></svg>;

export const MessageBubble: React.FC<{text?: string; style?: React.CSSProperties; received?: boolean}> = ({text = 'On my way.', style, received = false}) => <div style={{background: received ? palette.paper : palette.cyan, color: palette.ink, borderRadius: received ? '28px 28px 28px 8px' : '28px 28px 8px 28px', fontFamily: fonts.body, fontSize: 36, fontWeight: 600, padding: '26px 34px', boxShadow: `0 8px 50px ${palette.cyan}16`, whiteSpace: 'nowrap', ...style}}>{text}</div>;

export const Phone: React.FC<{time: number; received?: boolean; showMessage?: boolean; style?: React.CSSProperties}> = ({time, received = false, showMessage = true, style}) => {
  const p = tween(time, 0.4, 1.2);
  return <div style={{position: 'relative', width: 414, height: 790, borderRadius: 65, padding: 12, background: 'linear-gradient(135deg,#aac1c5,#263f4c 20%,#12212e 52%,#7f9caa 83%,#223744)', boxShadow: '30px 35px 0 -22px #1c303f, 0 70px 100px #0008, 0 0 80px #8affec10', ...style}}>
    <div style={{position: 'absolute', right: -6, top: 210, width: 7, height: 92, background: '#627d8c', borderRadius: 6}} />
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 54, background: 'linear-gradient(155deg,#162d36,#0a131d 50%,#11222c)', border: '2px solid #03080d', color: palette.paper}}>
      <div style={{margin: '24px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 600}}><span>9:41</span><span>▂ ▄ ▆ &nbsp; ▰</span></div>
      <div style={{position: 'absolute', width: 114, height: 28, background: '#03070c', top: 20, left: '50%', transform: 'translateX(-50%)', borderRadius: 30}}/>
      <div style={{marginTop: 34, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 14}}>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: received ? '#aeb5ff' : palette.cyan, color: palette.ink, display: 'grid', placeItems: 'center', fontSize: 25, fontWeight: 700}}>{received ? 'Y' : 'A'}</div>
        <div style={{fontSize: 23, fontWeight: 600}}>{received ? 'You' : 'Alex'}</div>
        <div style={{fontSize: 12, color: palette.muted, letterSpacing: 3}}>MESSAGES</div>
      </div>
      <div style={{height: 1, marginTop: 27, background: '#ffffff10'}}/>
      <div style={{position: 'absolute', top: 320, left: 23, background: '#233744', borderRadius: '22px 22px 22px 5px', padding: '20px 24px', fontSize: 23, color: '#bcd0d5'}}>See you soon?</div>
      {showMessage && <div style={{position: 'absolute', top: 425, right: 22, transform: `translateY(${(1 - p) * 35}px) scale(${0.85 + p * 0.15})`, transformOrigin: 'right bottom', opacity: p}}><MessageBubble received={received} text="On my way." style={{fontSize: 26, padding: '21px 26px'}}/><div style={{fontSize: 13, textAlign: 'right', paddingTop: 13, color: received ? palette.cyan : palette.muted}}>{received ? 'Delivered  ✓✓' : 'Sending…'}</div></div>}
      <div style={{position: 'absolute', bottom: 54, left: 24, right: 24, height: 53, borderRadius: 30, border: '1px solid #3c515e', color: '#77929c', padding: '17px 21px', fontSize: 15}}>Message<div style={{position: 'absolute', width: 38, height: 38, right: 7, top: 7, borderRadius: '50%', background: palette.cyan, display: 'grid', placeItems: 'center'}}><SendIcon size={23}/></div></div>
      <div style={{position: 'absolute', bottom: 17, width: 130, height: 5, background: '#e0edf2', borderRadius: 5, left: '50%', transform: 'translateX(-50%)'}}/>
    </div>
  </div>;
};
