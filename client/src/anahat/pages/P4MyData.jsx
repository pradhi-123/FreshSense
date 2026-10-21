import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { getMyShared, setConsent } from '../api.js';
import TalkToSomeone from '../components/TalkToSomeone.jsx';
import { ChevronLeft, Eye, PauseCircle, LogOut } from 'lucide-react';
import '../anahat.css';

const SIGNAL_LABELS = {
  sleep: 'Sleep difficulty', family: 'Family concern', fatigue: 'Fatigue',
  leave: 'Leave or rest', workload: 'Workload', mood: 'Low mood',
};

export default function P4MyData() {
  const navigate = useNavigate();
  const { personnelId, setConsent: setCtxConsent } = useAnahat();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(true);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    (async () => {
      try { const d = await getMyShared(personnelId); setLogs(d); } catch {}
      setLoading(false);
    })();
  }, [personnelId]);

  const handleWithdraw = async () => {
    try {
      await setConsent(personnelId, false);
      setCtxConsent(false);
      navigate('/anahat/');
    } catch {}
  };

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        <div className="an-topbar">
          <button className="an-btn-icon" style={{background:'transparent',border:'none'}} onClick={() => navigate('/anahat/home')}>
            <ChevronLeft size={18} style={{color:'var(--mist)'}}/>
          </button>
          <div className="an-topbar-brand">MY DATA</div>
          <span/>
        </div>

        <div className="an-h1 mb4">What my officer sees</div>
        <div className="an-sub mb20">Every piece of information shared with your welfare officer is listed here. No audio is ever stored. Your officer sees your pseudonym — not your real name.</div>

        {/* Sharing toggle */}
        <div className="an-card mb16" style={{display:'flex',alignItems:'center',gap:14}}>
          <PauseCircle size={20} style={{color:'var(--mist)',flexShrink:0}}/>
          <div style={{flex:1}}>
            <div className="an-h3 mb2">Sharing signals</div>
            <div className="an-sub" style={{fontSize:12}}>When paused, your next check-ins will not send signals to your officer.</div>
          </div>
          <label className="an-toggle">
            <input type="checkbox" checked={sharing} onChange={e => setSharing(e.target.checked)}/>
            <div className="an-toggle-slider"/>
          </label>
        </div>

        {/* Share log */}
        <div className="an-h3 mb10">Share history</div>
        {loading ? (
          <div style={{textAlign:'center',padding:32}}>
            <div className="an-spin" style={{width:28,height:28,margin:'0 auto 8px'}}/>
            <div className="an-sub">Loading…</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="an-card" style={{textAlign:'center',padding:32}}>
            <Eye size={24} style={{color:'var(--steel)',marginBottom:8}}/>
            <div className="an-sub">Nothing has been shared yet.</div>
          </div>
        ) : logs.map((log, i) => {
          const topics = log.what?.topics || [];
          return (
            <div key={i} className="an-card an-card-sm mb8">
              <div className="an-flex-between mb8">
                <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--mist)'}}>
                  {new Date(log.at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
                <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--steel)'}}>→ {log.with?.replace(/_/g,' ')}</div>
              </div>
              {topics.length > 0 && (
                <div className="an-flex-wrap g6 mb6">
                  {topics.map((t, j) => (
                    <span key={j} className={`an-chip ${t.polarity==='negative'?'an-chip-dawn':'an-chip-how'}`}>
                      {SIGNAL_LABELS[t.topic] || t.topic}
                    </span>
                  ))}
                </div>
              )}
              <div style={{fontSize:11,color:'var(--mist)',fontFamily:'var(--mono)'}}>
                Audio deleted · {log.what?.deleted_at ? new Date(log.what.deleted_at).toLocaleTimeString('en-IN') : '—'}
              </div>
            </div>
          );
        })}

        {/* Withdraw consent */}
        <div className="an-divider"/>
        {!confirmWithdraw ? (
          <button className="an-btn an-btn-ghost an-btn-full" style={{gap:8,color:'var(--mist)'}} onClick={() => setConfirmWithdraw(true)}>
            <LogOut size={14}/> Withdraw consent and stop all sharing
          </button>
        ) : (
          <div className="an-card" style={{border:'1px solid var(--steel)'}}>
            <div className="an-h3 mb8">Are you sure?</div>
            <div className="an-sub mb16">Your officer will no longer receive any signals from your check-ins. You can opt back in at any time.</div>
            <div className="an-flex g8">
              <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={() => setConfirmWithdraw(false)}>Cancel</button>
              <button className="an-btn" style={{flex:1,background:'var(--steel)',color:'var(--frost)'}} onClick={handleWithdraw}>Yes, withdraw</button>
            </div>
          </div>
        )}
      </div>
      <TalkToSomeone />
    </div>
  );
}
