import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { getUnitTrends } from '../api.js';
import { Users, AlertTriangle, BarChart2, Shield, LogOut, Wifi, WifiOff, Moon, Calendar, Activity } from 'lucide-react';
import '../anahat.css';

function DaySidebar({ alertCount, connected }) {
  const navigate = useNavigate();
  const { setRole } = useAnahat();
  const loc = useLocation();
  const nav = [
    { label:'Alerts',    path:'/anahat/alerts', icon:<AlertTriangle size={15}/>, badge:alertCount>0?alertCount:null },
    { label:'Unit View', path:'/anahat/unit',   icon:<BarChart2 size={15}/> },
    { label:'Demo',      path:'/anahat/demo',   icon:<Shield size={15}/> },
  ];
  return (
    <div className="an-day-sidebar">
      <div className="an-day-brand">
        <div className="an-day-brand-name">ANAHAT</div>
        <div className="an-day-brand-role">Commander</div>
        <div className="an-flex g6 mt8" style={{alignItems:'center'}}>
          {connected?<Wifi size={11} style={{color:'var(--lifelineDeep)'}}/>:<WifiOff size={11} style={{color:'var(--slate)'}}/>}
          <span style={{fontSize:10,fontFamily:'var(--mono)',color:connected?'var(--lifelineDeep)':'var(--slate)'}}>{connected?'LIVE':'OFFLINE'}</span>
        </div>
      </div>
      <nav className="an-day-nav">
        {nav.map(n=>(
          <button key={n.path} className={`an-day-nav-item${loc.pathname===n.path?' active':''}`} onClick={()=>navigate(n.path)}>
            {n.icon}{n.label}{n.badge&&<span className="an-day-nav-badge">{n.badge}</span>}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button className="an-day-nav-item" onClick={()=>{setRole(null);navigate('/anahat/');}}>
          <LogOut size={15}/>Sign out
        </button>
      </nav>
    </div>
  );
}

function PlatoonCard({ p }) {
  const tooSmall = (p.size||0) < 5;

  return (
    <div className="an-card" style={{border:'1px solid var(--line)'}}>
      <div className="an-flex-between mb12">
        <div>
          <div className="an-h3" style={{marginBottom:2}}>{p.platoon_name}</div>
          <div style={{fontSize:11,color:'var(--slate)',fontFamily:'var(--mono)'}}>{p.unit} · {p.size} personnel</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <Users size={14} style={{color:'var(--slate)'}}/>
          <span style={{fontSize:13,fontWeight:700,color:'var(--slate)',fontFamily:'var(--mono)'}}>{p.size}</span>
        </div>
      </div>

      {tooSmall ? (
        <div className="an-info an-info-neutral" style={{fontSize:12}}>
          Group too small to show — privacy protected.
        </div>
      ) : (
        <>
          <div className="an-grid3 g6 mb12">
            {[
              { icon:<Moon size={12}/>,     label:'Night streak (avg)', val:`${p.avg_night_streak||0}d`, warn:(p.avg_night_streak||0)>=5, color:'var(--amberDeep)' },
              { icon:<Calendar size={12}/>, label:'Days since leave (avg)', val:`${p.avg_days_leave||0}d`, warn:(p.avg_days_leave||0)>180, color:'var(--amberDeep)' },
              { icon:<Activity size={12}/>, label:'Check-in rate', val:`${Math.round(p.checkin_pct||0)}%`, warn:(p.checkin_pct||0)<50, color:'var(--slate)' },
            ].map(m => (
              <div key={m.label} style={{background:'var(--paper)',borderRadius:8,padding:'12px 10px'}}>
                <div style={{display:'flex',gap:5,alignItems:'center',marginBottom:4,color:'var(--slate)'}}>
                  {m.icon}<span style={{fontSize:9,color:'var(--slate)',letterSpacing:'0.06em',textTransform:'uppercase',fontWeight:600}}>{m.label}</span>
                </div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:'var(--mono)',color:m.warn?m.color:'var(--ink)'}}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {p.suggestions && p.suggestions.length > 0 && (
            <div style={{borderTop:'1px solid var(--line)',paddingTop:10}}>
              {p.suggestions.map((s,i) => (
                <div key={i} style={{fontSize:12,color:'var(--amberDeep)',marginBottom:4}}>
                  ▸ {s}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function C1Commander() {
  const { alertCount, connected } = useAnahat();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const d = await getUnitTrends('Unit A'); setData(d); } catch {}
      setLoading(false);
    })();
  }, []);

  const platoons = data?.platoons || [];
  const unit = data?.unit || {};

  return (
    <div className="an-day">
      <div className="an-day-layout">
        <DaySidebar alertCount={alertCount} connected={connected}/>

        <main className="an-day-main">
          <div className="an-day-page an-fade">
            <div className="an-h1 mb4">Unit View</div>
            <div className="an-sub mb20">Aggregated platoon signals. Groups under 5 are hidden. No names or individual rows.</div>

            <div className="an-info an-info-neutral mb20" style={{fontSize:12}}>
              <Shield size={12} style={{flexShrink:0,marginTop:1,color:'var(--slate)'}}/>
              <span>Individual signals are never shown here. Your welfare officers handle individual welfare cases.</span>
            </div>

            {/* Unit-level stats */}
            {data && (
              <div className="an-stat-grid mb24">
                {[
                  { label:'Personnel', val:unit.total||'—' },
                  { label:'Check-in rate today', val:`${Math.round(unit.checkin_rate_today||0)}%` },
                  { label:'Alerts (active)', val:unit.active_alerts||0 },
                  { label:'Platoons', val:platoons.length||'—' },
                ].map(s=>(
                  <div key={s.label} className="an-stat">
                    <div className="an-stat-label">{s.label}</div>
                    <div className="an-stat-val">{s.val}</div>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{textAlign:'center',padding:80}}>
                <div className="an-spin" style={{width:32,height:32,margin:'0 auto 10px',borderTopColor:'var(--amberDeep)'}}/>
              </div>
            ) : platoons.length === 0 ? (
              <div className="an-card" style={{textAlign:'center',padding:60}}>
                <Users size={28} style={{color:'var(--line)',marginBottom:10}}/>
                <div style={{color:'var(--slate)',fontSize:14}}>No platoon data yet</div>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
                {platoons.map((p,i) => <PlatoonCard key={i} p={p}/>)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
