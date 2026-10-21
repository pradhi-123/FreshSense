import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import TalkToSomeone from '../components/TalkToSomeone.jsx';
import { Bell, ChevronRight, Eye } from 'lucide-react';
import '../anahat.css';

export default function P1Home() {
  const navigate = useNavigate();
  const { personnelId, consent, demoState, alertCount } = useAnahat();
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Simulate: check if already checked in today
  // In production this would come from the server
  useEffect(() => {
    const key = `anahat_checkin_${personnelId}_${new Date().toISOString().split('T')[0]}`;
    setCheckedInToday(!!localStorage.getItem(key));
  }, [personnelId]);

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        {/* Topbar */}
        <div className="an-topbar">
          <div>
            <div className="an-topbar-brand">ANAHAT</div>
            <div className="an-topbar-sub">{personnelId?.toUpperCase()} · {demoState?.today || 'TODAY'}</div>
          </div>
          <button className="an-btn-icon" style={{background:'transparent',border:'1px solid var(--steel)'}} onClick={() => navigate('/anahat/notifications')}>
            <Bell size={16} style={{color:'var(--mist)'}}/>
          </button>
        </div>

        {/* Greeting */}
        <div className="mb24">
          <div className="an-h1 mb6">Good morning</div>
          <div className="an-sub">Your daily check-in helps your welfare officer look out for you — before small things become big ones.</div>
        </div>

        {/* Main CTA */}
        {!checkedInToday ? (
          <button
            className="an-btn an-btn-primary an-btn-full mb16"
            style={{height:72, fontSize:18, borderRadius:'var(--r-xl)'}}
            onClick={() => navigate('/anahat/checkin')}
          >
            Today's check-in →
          </button>
        ) : (
          <div className="an-card mb16" style={{textAlign:'center',padding:28}}>
            <div style={{fontSize:32,marginBottom:8}}>✓</div>
            <div className="an-h2 mb4" style={{color:'var(--amber)'}}>Done for today</div>
            <div className="an-sub">Your check-in was submitted. Your officer has been notified if needed.</div>
          </div>
        )}

        {/* Quick links */}
        <div className="an-flex-col g8">
          {[
            { label:'What my officer sees', sub:'Review shared signals and manage consent', path:'/anahat/my-data', icon:<Eye size={16}/> },
            { label:'Notifications', sub:'Messages from your welfare officer', path:'/anahat/notifications', icon:<Bell size={16}/> },
          ].map(item => (
            <button key={item.path} className="an-card an-card-sm" style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer',border:'1px solid var(--steel)',borderRadius:'var(--r-lg)',background:'var(--panel)',padding:'14px 16px',textAlign:'left',width:'100%'}}
              onClick={() => navigate(item.path)}>
              <div style={{width:36,height:36,borderRadius:10,background:'var(--steel)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mist)',flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1}}>
                <div className="an-h3" style={{marginBottom:2}}>{item.label}</div>
                <div className="an-sub" style={{fontSize:12}}>{item.sub}</div>
              </div>
              <ChevronRight size={14} style={{color:'var(--steel)',flexShrink:0}}/>
            </button>
          ))}
        </div>

        {/* Demo info */}
        {demoState && (
          <div className="an-info an-info-mist mt16" style={{fontSize:12}}>
            <span style={{fontFamily:'var(--mono)'}}>DEMO · {demoState.today} · {demoState.checkinCount} check-ins total</span>
          </div>
        )}
      </div>
      <TalkToSomeone />
    </div>
  );
}
