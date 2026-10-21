import React, { useState, useEffect } from 'react';
import { getUnitTrends } from '../api.js';
import { Users, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import '../anahat.css';

function SectionHdr({children}){return(<div className="an-section-hdr"><span className="an-sec">{children}</span><div className="an-section-hdr-line"/></div>);}

function PlatoonCard({ platoon, people, hidden, avg_night_streak, avg_days_since_leave, checkin_participation }) {
  if (hidden) return (
    <div className="an-card" style={{opacity:0.45,textAlign:'center',padding:'28px 16px'}}>
      <Shield size={22} style={{color:'var(--tx4)',marginBottom:8}}/>
      <div className="an-mono" style={{fontSize:10,color:'var(--tx4)',letterSpacing:'0.1em'}}>{platoon}</div>
      <div className="an-mono" style={{fontSize:9,color:'var(--tx4)',marginTop:4,letterSpacing:'0.06em'}}>PRIVACY · {people} PERS</div>
    </div>
  );

  const nf=avg_night_streak>=5, lf=avg_days_since_leave>180, pf=checkin_participation<60;
  const flagged=nf||lf;

  return (
    <div className="an-card" style={{borderLeft:flagged?'2px solid var(--amber)':'2px solid transparent'}}>
      <div className="an-flex-between mb16">
        <div>
          <div style={{fontWeight:800,fontSize:13,textTransform:'uppercase',letterSpacing:'0.06em'}}>{platoon}</div>
          <div className="an-mono" style={{fontSize:9,color:'var(--tx3)',marginTop:2,letterSpacing:'0.08em'}}>{people} PERSONNEL</div>
        </div>
        <div>{flagged?<span className="an-badge bd-amber">FLAGGED</span>:<span className="an-badge bd-green">NORMAL</span>}</div>
      </div>

      {[
        {label:'DAYS SINCE LEAVE',val:avg_days_since_leave,max:365,unit:'D',warn:lf,color:lf?'var(--red)':'var(--green)'},
        {label:'NIGHT STREAK',val:avg_night_streak,max:14,unit:'N',warn:nf,color:nf?'var(--amber)':'var(--green)'},
        {label:'PARTICIPATION',val:checkin_participation,max:100,unit:'%',warn:pf,color:pf?'var(--red)':'var(--green)'},
      ].map(m=>(
        <div key={m.label} className="mb12">
          <div className="an-flex-between mb6">
            <span className="an-mono" style={{fontSize:9.5,color:'var(--tx3)',letterSpacing:'0.1em'}}>{m.label}</span>
            <span className="an-mono" style={{fontSize:12,fontWeight:700,color:m.color}}>{m.val}{m.unit}{m.warn?' ⚠':''}</span>
          </div>
          <div className="an-progress"><div className="an-progress-fill" style={{width:`${Math.min((m.val/m.max)*100,100)}%`,background:m.color}}/></div>
        </div>
      ))}
    </div>
  );
}

export default function UnitDashboard() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('Unit A');

  const load = async () => {
    setLoading(true);
    try { const d=await getUnitTrends(unit); setTrends(d); } catch {}
    setLoading(false);
  };
  useEffect(()=>{ load(); },[unit]);

  const visible=trends.filter(t=>!t.hidden);
  const total=trends.reduce((a,t)=>a+(t.people||0),0);
  const flagged=visible.filter(t=>t.avg_night_streak>=5||t.avg_days_since_leave>180).length;
  const avgP=visible.length?Math.round(visible.reduce((a,t)=>a+t.checkin_participation,0)/visible.length):0;

  return (
    <div className="an-page an-fade">
      <div className="an-flex-between mb24" style={{flexWrap:'wrap',gap:10}}>
        <div>
          <div className="an-h1">Unit Dashboard</div>
          <div className="an-sub mt8">AGGREGATED PLATOON DATA · NO INDIVIDUAL RECORDS</div>
        </div>
        <div className="an-flex g8">
          <select className="an-select" value={unit} onChange={e=>setUnit(e.target.value)} style={{minWidth:120,fontSize:11}}>
            <option value="Unit A">UNIT A</option>
            <option value="Unit B">UNIT B</option>
          </select>
          <button className="an-btn an-btn-ghost an-btn-sm" onClick={load}>
            <RefreshCw size={13} style={{animation:loading?'spin 0.65s linear infinite':'none'}}/>
          </button>
        </div>
      </div>

      <div className="an-info an-info-blue mb20">
        <Shield size={13} style={{flexShrink:0,marginTop:1}}/>
        <span className="an-mono" style={{fontSize:11,letterSpacing:'0.04em'}}>Groups &lt; 5 personnel hidden. All values are platoon averages.</span>
      </div>

      <div className="grid4 mb24">
        {[
          {label:'PERSONNEL',val:total},
          {label:'PLATOONS',val:trends.length},
          {label:'FLAGGED',val:flagged,color:flagged>0?'var(--amber)':'var(--green)'},
          {label:'AVG PART.',val:`${avgP}%`,color:avgP<60?'var(--red)':'var(--green)'},
        ].map(s=>(
          <div key={s.label} className="an-stat">
            <div className="an-stat-label">{s.label}</div>
            <div className="an-stat-val" style={{color:s.color||'var(--tx)',fontSize:s.val?.toString().length>4?18:28}}>{s.val}</div>
          </div>
        ))}
      </div>

      <SectionHdr>Platoon Status</SectionHdr>

      {loading ? (
        <div style={{textAlign:'center',padding:80}}>
          <div className="an-spin" style={{width:36,height:36,margin:'0 auto 12px'}}/>
          <div className="an-mono" style={{fontSize:10,color:'var(--tx3)',letterSpacing:'0.1em'}}>LOADING…</div>
        </div>
      ):(
        <div className="grid2 g14">{trends.map((t,i)=><PlatoonCard key={i} {...t}/>)}</div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
