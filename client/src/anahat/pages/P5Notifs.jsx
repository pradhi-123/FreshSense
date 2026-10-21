import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { getNotifications } from '../api.js';
import TalkToSomeone from '../components/TalkToSomeone.jsx';
import { ChevronLeft, Bell } from 'lucide-react';
import '../anahat.css';

// Friendly notification message map
const ACTION_MSG = {
  welfare_call:       { msg: 'Your officer has been in touch to check on you.', dot: 'amber' },
  prioritise_leave:   { msg: 'Your leave is being prioritised.', dot: 'amber' },
  offer_counsellor:   { msg: 'A counselling session has been arranged for you.', dot: 'lifeline' },
  adjust_duty:        { msg: 'Your duty schedule is being reviewed.', dot: 'lifeline' },
  note:               { msg: 'Your officer has noted your situation.', dot: '' },
};

export default function P5Notifs() {
  const navigate = useNavigate();
  const { personnelId } = useAnahat();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const d = await getNotifications(personnelId); setNotifs(d); } catch {}
      setLoading(false);
    })();
  }, [personnelId]);

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        <div className="an-topbar">
          <button className="an-btn-icon" style={{background:'transparent',border:'none'}} onClick={() => navigate('/anahat/home')}>
            <ChevronLeft size={18} style={{color:'var(--mist)'}}/>
          </button>
          <div className="an-topbar-brand">NOTIFICATIONS</div>
          <span/>
        </div>

        <div className="an-h1 mb4">Messages</div>
        <div className="an-sub mb20">Messages from your welfare officer. Names are never used — only actions taken on your behalf.</div>

        {loading ? (
          <div style={{textAlign:'center',padding:40}}>
            <div className="an-spin" style={{width:28,height:28,margin:'0 auto 8px'}}/>
          </div>
        ) : notifs.length === 0 ? (
          <div className="an-card" style={{textAlign:'center',padding:40}}>
            <Bell size={24} style={{color:'var(--steel)',marginBottom:8}}/>
            <div className="an-sub">No messages yet.</div>
          </div>
        ) : notifs.map((n, i) => {
          const info = ACTION_MSG[n.type] || { msg: n.note || 'An update from your officer.', dot: '' };
          return (
            <div key={i} className="an-notif">
              <div className={`an-notif-dot${info.dot?' '+info.dot:''}`}/>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:'var(--frost)',marginBottom:4}}>{info.msg}</div>
                {n.note && info.msg !== n.note && <div className="an-sub" style={{fontSize:12,marginBottom:4}}>{n.note}</div>}
                <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--mist)'}}>
                  {new Date(n.at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <TalkToSomeone />
    </div>
  );
}
