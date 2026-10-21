import React, { useState } from 'react';
import { Phone, Heart, MessageCircle, X } from 'lucide-react';

const HELPLINES = [
  { icon: <Phone size={18}/>, name: 'Force Helpline', sub: 'Your unit welfare officer', action: () => {} },
  { icon: <Heart size={18}/>, name: 'Tele-MANAS', sub: '14416 · Free · 24/7', action: () => {} },
  { icon: <MessageCircle size={18}/>, name: 'Talk to Counsellor', sub: 'Request a confidential session', action: () => {} },
];

export default function TalkToSomeone() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="an-talk-float">
        <button className="an-talk-btn" onClick={() => setOpen(true)}>
          <Heart size={16} /> Talk to someone
        </button>
      </div>

      {open && (
        <div className="an-overlay" onClick={() => setOpen(false)}>
          <div className="an-modal" onClick={e => e.stopPropagation()}>
            <div className="an-flex-between mb16">
              <div>
                <div className="an-h2" style={{color:'var(--lifeline)'}}>Help is here</div>
                <div className="an-sub mt4">You don't have to wait. Choose how to reach someone.</div>
              </div>
              <button className="an-btn-icon" style={{background:'var(--steel)'}} onClick={() => setOpen(false)}>
                <X size={16} style={{color:'var(--mist)'}}/>
              </button>
            </div>

            {HELPLINES.map((h, i) => (
              <button key={i} className="an-helpline" style={{width:'100%',textAlign:'left'}} onClick={h.action}>
                <div className="an-helpline-icon">{h.icon}</div>
                <div>
                  <div className="an-helpline-name">{h.name}</div>
                  <div className="an-helpline-sub">{h.sub}</div>
                </div>
              </button>
            ))}

            <div style={{textAlign:'center',marginTop:16}}>
              <div className="an-sub">Everything you share with a counsellor stays between you.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
