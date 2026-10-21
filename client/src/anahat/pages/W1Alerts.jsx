import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { getAlerts } from '../api.js';
import socket from '../socket.js';
import { AlertTriangle, RefreshCw, ChevronRight, Shield, BarChart2, LogOut, Wifi, WifiOff } from 'lucide-react';
import '../anahat.css';

const CHIP_CLS = { SAID:'an-chip-said', HOW:'an-chip-how', HR:'an-chip-hr' };

function DaySidebar({ alertCount, connected }) {
  const navigate = useNavigate();
  const { setRole } = useAnahat();
  const loc = useLocation();

  const nav = [
    { label:'Alerts',    path:'/anahat/alerts', icon:<AlertTriangle size={15}/>, badge: alertCount > 0 ? alertCount : null },
    { label:'Unit View', path:'/anahat/unit',   icon:<BarChart2 size={15}/> },
    { label:'Demo',      path:'/anahat/demo',   icon:<Shield size={15}/> },
  ];

  return (
    <div className="an-day-sidebar">
      <div className="an-day-brand">
        <div className="an-day-brand-name">ANAHAT</div>
        <div className="an-day-brand-role">Welfare Officer</div>
        <div className="an-flex g6 mt8" style={{alignItems:'center'}}>
          {connected ? <Wifi size={11} style={{color:'var(--lifelineDeep)'}}/> : <WifiOff size={11} style={{color:'var(--slate)'}}/>}
          <span style={{fontSize:10,fontFamily:'var(--mono)',color: connected?'var(--lifelineDeep)':'var(--slate)'}}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      <nav className="an-day-nav">
        {nav.map(n => (
          <button key={n.path} className={`an-day-nav-item${loc.pathname.startsWith(n.path)?' active':''}`} onClick={() => navigate(n.path)}>
            {n.icon} {n.label}
            {n.badge && <span className="an-day-nav-badge">{n.badge}</span>}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button className="an-day-nav-item" onClick={() => { setRole(null); navigate('/anahat/'); }}>
          <LogOut size={15}/> Sign out
        </button>
      </nav>
    </div>
  );
}

function ago(d) {
  const ms = Date.now() - new Date(d);
  const h = Math.floor(ms/3.6e6), m = Math.floor(ms/60000);
  if (h > 48) return `${Math.floor(h/24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function W1Alerts() {
  const navigate = useNavigate();
  const { alertCount, setAlertCount, refreshDemo, connected } = useAnahat();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await getAlerts(); setAlerts(d); setAlertCount(d.filter(a=>a.status==='new').length); refreshDemo(); } catch {}
    setLoading(false);
  }, [refreshDemo, setAlertCount]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    socket.on('alert:new',     data => { setAlerts(p => [data,...p]); setAlertCount(c=>c+1); });
    socket.on('alert:updated', data => { setAlerts(p => p.map(a => a.id===data.id ? {...a,status:data.status} : a)); load(); });
    return () => { socket.off('alert:new'); socket.off('alert:updated'); };
  }, [load, setAlertCount]);

  const filtered = filter==='all' ? alerts : alerts.filter(a=>a.status===filter);
  const counts   = { new:alerts.filter(a=>a.status==='new').length, in_progress:alerts.filter(a=>a.status==='in_progress').length, closed:alerts.filter(a=>a.status==='closed').length };

  return (
    <div className="an-day">
      <div className="an-day-layout">
        <DaySidebar alertCount={alertCount} connected={connected}/>

        <main className="an-day-main">
          <div className="an-day-page an-fade">
            {/* Header */}
            <div className="an-flex-between mb24" style={{flexWrap:'wrap',gap:12}}>
              <div>
                <div className="an-h1">Welfare Alerts</div>
                <div className="an-sub">Triangulation · 2 of 3 signal groups · 5-day window</div>
              </div>
              <button className="an-btn an-btn-ghost an-btn-sm" onClick={load}>
                <RefreshCw size={13} style={{animation:loading?'spin 0.7s linear infinite':'none'}}/>
                Refresh
              </button>
            </div>

            {/* Signal chips legend */}
            <div className="an-flex g8 mb20" style={{flexWrap:'wrap'}}>
              {[{c:'an-chip-said',l:'SAID — What they spoke about'},{c:'an-chip-how',l:'HOW — How they sounded'},{c:'an-chip-hr',l:'HR — Service records'}].map(s=>(
                <span key={s.c} className={`an-chip ${s.c}`}>{s.l}</span>
              ))}
            </div>

            {/* Stats */}
            <div className="an-stat-grid mb24">
              {[{label:'New',val:counts.new},{label:'In progress',val:counts.in_progress},{label:'Closed',val:counts.closed},{label:'Total',val:alerts.length}].map(s=>(
                <div key={s.label} className="an-stat">
                  <div className="an-stat-label">{s.label}</div>
                  <div className="an-stat-val">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="an-flex g6 mb16" style={{flexWrap:'wrap'}}>
              {['all','new','in_progress','closed'].map(f=>(
                <button key={f} className={`an-btn an-btn-sm ${filter===f?'an-btn-primary':'an-btn-ghost'}`} style={{minHeight:36,fontSize:12}} onClick={()=>setFilter(f)}>
                  {f.replace('_',' ')}
                </button>
              ))}
            </div>

            {/* Alert list */}
            {loading ? (
              <div style={{textAlign:'center',padding:80}}>
                <div className="an-spin" style={{width:32,height:32,margin:'0 auto 10px',borderTopColor:'var(--amberDeep)'}}/>
                <div style={{fontSize:12,color:'var(--slate)'}}>Loading alerts…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="an-card" style={{textAlign:'center',padding:60}}>
                <Shield size={28} style={{color:'var(--line)',marginBottom:10}}/>
                <div style={{color:'var(--slate)',fontSize:14}}>No alerts {filter!=='all'?`with status "${filter.replace('_',' ')}"`:''}</div>
              </div>
            ) : filtered.map(a => (
              <div key={a.id} className={`an-alert-row${a.status==='new'?' new-alert':''}`} onClick={() => navigate(`/anahat/alerts/${a.id}`)}>
                {/* Left indicator */}
                <div style={{width:40,height:40,borderRadius:8,background:a.status==='new'?'rgba(255,181,71,0.1)':'var(--paper)',border:`1px solid ${a.status==='new'?'var(--amber)':'var(--line)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <AlertTriangle size={16} style={{color:a.status==='new'?'var(--amberDeep)':'var(--slate)'}}/>
                </div>

                <div style={{flex:1,minWidth:0}}>
                  <div className="an-flex-wrap g6 mb6">
                    <span style={{fontWeight:700,fontSize:14,color:'var(--ink)'}}>{a.pseudonym}</span>
                    <span style={{fontSize:11,color:'var(--slate)',fontFamily:'var(--mono)'}}>{a.unit} · {a.platoon}</span>
                    {(a.groups||[]).map(g=><span key={g} className={`an-chip ${CHIP_CLS[g]||''}`}>{g}</span>)}
                    <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:99,background:a.status==='new'?'rgba(255,181,71,0.12)':'var(--paper)',color:a.status==='new'?'var(--amberDeep)':a.status==='closed'?'var(--lifelineDeep)':'var(--slate)',border:`1px solid ${a.status==='new'?'rgba(138,90,0,0.25)':'var(--line)'}`}}>
                      {a.status.replace('_',' ')}
                    </span>
                  </div>
                  {(a.reasons||[]).slice(0,2).map((r,i)=>(
                    <div key={i} style={{fontSize:12,color:'var(--slate)',marginBottom:2}}>▸ {r}</div>
                  ))}
                </div>

                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                  <div style={{fontSize:11,color:'var(--slate)',fontFamily:'var(--mono)'}}>{ago(a.created_at)}</div>
                  <ChevronRight size={14} style={{color:'var(--line)'}}/>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
