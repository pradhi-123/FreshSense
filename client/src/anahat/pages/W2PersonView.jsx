import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { getAlertDetail, postAlertAction } from '../api.js';
import socket from '../socket.js';
import { ArrowLeft, Activity, Calendar, CheckSquare, AlertTriangle, BarChart2, Shield, LogOut, Wifi, WifiOff } from 'lucide-react';
import '../anahat.css';

const CHIP_CLS = { SAID:'an-chip-said', HOW:'an-chip-how', HR:'an-chip-hr' };

function Sparkline({ data=[], color='var(--amberDeep)', height=40 }) {
  if (!data||data.length < 2) return <div style={{height,background:'var(--line)',borderRadius:4}}/>;
  const W=260, min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*W;
    const y = height - ((v-min)/range)*(height-8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = pts.split(' ').pop().split(',');
  const id = `sg${color.replace(/[^a-z0-9]/gi,'')}${Math.random()|0}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${W},${height}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="square"/>
      <circle cx={last[0]} cy={last[1]} r="3" fill={color}/>
    </svg>
  );
}

function DaySidebar({ alertCount, connected }) {
  const navigate = useNavigate();
  const { setRole, setAlertCount } = useAnahat();
  const loc = useLocation();
  const nav = [
    { label:'Alerts', path:'/anahat/alerts', icon:<AlertTriangle size={15}/>, badge:alertCount>0?alertCount:null },
    { label:'Unit View', path:'/anahat/unit', icon:<BarChart2 size={15}/> },
    { label:'Demo', path:'/anahat/demo', icon:<Shield size={15}/> },
  ];
  return (
    <div className="an-day-sidebar">
      <div className="an-day-brand">
        <div className="an-day-brand-name">ANAHAT</div>
        <div className="an-day-brand-role">Welfare Officer</div>
        <div className="an-flex g6 mt8" style={{alignItems:'center'}}>
          {connected?<Wifi size={11} style={{color:'var(--lifelineDeep)'}}/>:<WifiOff size={11} style={{color:'var(--slate)'}}/>}
          <span style={{fontSize:10,fontFamily:'var(--mono)',color:connected?'var(--lifelineDeep)':'var(--slate)'}}>{connected?'LIVE':'OFFLINE'}</span>
        </div>
      </div>
      <nav className="an-day-nav">
        {nav.map(n=>(
          <button key={n.path} className={`an-day-nav-item${loc.pathname.startsWith(n.path)?loc.pathname===n.path||n.path==='/anahat/alerts'?' active':'':''}`} onClick={()=>navigate(n.path)}>
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

const ACTIONS = [
  { id:'welfare_call',     label:'Welfare call' },
  { id:'prioritise_leave', label:'Prioritise leave' },
  { id:'offer_counsellor', label:'Refer to counsellor' },
  { id:'adjust_duty',      label:'Adjust duty' },
  { id:'note',             label:'Add note only' },
];

export default function W2PersonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, alertCount } = useAnahat();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [aType, setAType]     = useState('welfare_call');
  const [note, setNote]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const load = async () => { try{ const d=await getAlertDetail(id); setData(d); }catch{} setLoading(false); };
  useEffect(()=>{ load(); },[id]);
  useEffect(()=>{ socket.on('alert:updated',e=>{ if(e.id===id)load(); }); return()=>socket.off('alert:updated'); },[id]);

  const submit = async () => {
    setSaving(true);
    try { await postAlertAction(id, aType, note); setSaved(true); setNote(''); await load(); } catch {}
    setSaving(false);
  };

  if (loading) return (
    <div className="an-day" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh'}}>
      <div style={{textAlign:'center'}}><div className="an-spin" style={{width:32,height:32,margin:'0 auto 8px',borderTopColor:'var(--amberDeep)'}}/></div>
    </div>
  );

  if (!data) return <div className="an-day"><div className="an-day-layout"><DaySidebar alertCount={alertCount} connected={connected}/><div className="an-day-main"><div className="an-day-page">Not found</div></div></div></div>;

  const { alert, checkins=[], hr=[], actions=[] } = data;
  const latHR = hr[hr.length-1];
  const TRENDS = [
    { label:'Pitch variation', data:checkins.map(c=>c.pitch_var||0), color:'var(--amberDeep)' },
    { label:'Speech rate',     data:checkins.map(c=>c.speech_rate||0), color:'var(--lifelineDeep)' },
    { label:'Pause ratio %',   data:checkins.map(c=>(c.pause_ratio||0)*100), color:'var(--slate)' },
    { label:'Energy',          data:checkins.map(c=>(c.energy||0)*100), color:'var(--dawn)' },
  ];

  return (
    <div className="an-day">
      <div className="an-day-layout">
        <DaySidebar alertCount={alertCount} connected={connected}/>

        <main className="an-day-main">
          <div className="an-day-page an-fade">
            {/* Header */}
            <div className="an-flex mb24 g12" style={{flexWrap:'wrap',alignItems:'flex-start'}}>
              <button className="an-btn an-btn-ghost an-btn-sm" onClick={() => navigate('/anahat/alerts')}>
                <ArrowLeft size={13}/> Alerts
              </button>
              <div style={{flex:1}}>
                <div className="an-flex-wrap g8 mb4">
                  <span className="an-h1" style={{marginBottom:0}}>{alert.pseudonym}</span>
                  {(alert.groups||[]).map(g=><span key={g} className={`an-chip ${CHIP_CLS[g]||''}`}>{g}</span>)}
                  <span style={{fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:99,background:'rgba(255,181,71,0.1)',color:'var(--amberDeep)',border:'1px solid rgba(138,90,0,0.2)'}}>
                    {alert.status.replace('_',' ')}
                  </span>
                </div>
                <div style={{fontSize:12,color:'var(--slate)',fontFamily:'var(--mono)'}}>{alert.unit} · {alert.platoon}</div>
              </div>
            </div>

            <div className="an-grid2" style={{alignItems:'start',gap:16}}>
              {/* LEFT */}
              <div>
                {/* Reasons */}
                <div className="an-card mb12">
                  <div className="an-label mb12">Why flagged</div>
                  {(alert.reasons||[]).map((r,i) => (
                    <div key={i} className="an-flex g10 mb10" style={{alignItems:'flex-start'}}>
                      <div style={{width:22,height:22,borderRadius:6,background:'rgba(138,90,0,0.08)',border:'1px solid rgba(138,90,0,0.2)',color:'var(--amberDeep)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:13,color:'var(--ink)',lineHeight:1.5}}>{r}</div>
                    </div>
                  ))}
                </div>

                {/* HR records */}
                {latHR && (
                  <div className="an-card mb12">
                    <div className="an-label mb12"><Calendar size={10} style={{display:'inline',marginRight:4}}/>HR Records</div>
                    {[
                      { label:'Days since leave', val:latHR.days_since_leave, max:365, warn:latHR.days_since_leave>180, color:'var(--amberDeep)' },
                      { label:'Night duty streak', val:latHR.night_streak, max:14, warn:latHR.night_streak>=5, color:'var(--dawn)' },
                      { label:'Leave pending', val:latHR.leave_pending_days||0, max:30, warn:(latHR.leave_pending_days||0)>14, color:'var(--slate)' },
                    ].map(m => (
                      <div key={m.label} className="mb12">
                        <div className="an-flex-between mb4">
                          <span style={{fontSize:12,color:'var(--slate)'}}>{m.label}</span>
                          <span style={{fontSize:13,fontWeight:700,color:m.warn?m.color:'var(--slate)',fontFamily:'var(--mono)'}}>{m.val}{m.warn?' ⚠':''}</span>
                        </div>
                        <div className="an-progress">
                          <div className="an-progress-fill" style={{width:`${Math.min((m.val/m.max)*100,100)}%`,background:m.warn?m.color:'var(--line)'}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions taken */}
                {actions.length > 0 && (
                  <div className="an-card">
                    <div className="an-label mb10"><CheckSquare size={10} style={{display:'inline',marginRight:4}}/>Actions taken</div>
                    {actions.map((a,i) => (
                      <div key={i} className="an-flex g10 mb10">
                        <div style={{width:8,height:8,borderRadius:2,background:'var(--lifelineDeep)',marginTop:4,flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:'var(--lifelineDeep)'}}>{(a.type||'').replace(/_/g,' ')}</div>
                          {a.note && <div style={{fontSize:12,color:'var(--slate)',marginTop:2}}>{a.note}</div>}
                          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--line)',marginTop:3}}>{new Date(a.created_at).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div>
                {/* Tone sparklines */}
                <div className="an-card mb12">
                  <div className="an-label mb12"><Activity size={10} style={{display:'inline',marginRight:4}}/>14-Day Tone Analysis</div>
                  {TRENDS.map(t => (
                    <div key={t.label} className="mb14">
                      <div style={{fontSize:11,color:'var(--slate)',marginBottom:4}}>{t.label}</div>
                      <div className="an-chart-wrap">
                        <Sparkline data={t.data} color={t.color}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heatmap */}
                <div className="an-card mb12">
                  <div className="an-label mb10">Signal Heatmap</div>
                  <div style={{overflowX:'auto'}}>
                    <table className="an-heatmap">
                      <thead><tr><th>Date</th><th>Sleep</th><th>Family</th><th>Fatigue</th><th>Tone</th></tr></thead>
                      <tbody>
                        {checkins.slice(-10).map((c,i) => (
                          <tr key={i}>
                            <td className="hm-dim">{c.date?.slice(5)||'—'}</td>
                            {['sleep','family','fatigue'].map(t=>(
                              <td key={t}>{(c.neg_counts?.[t]||0)>0?<span className="hm-hit">✕</span>:<span className="hm-miss">✓</span>}</td>
                            ))}
                            <td>{c.is_strained?<span className="hm-hit">⚠</span>:<span className="hm-dim">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action form */}
                {alert.status !== 'closed' && (
                  <div className="an-card" style={{border:'2px solid rgba(138,90,0,0.2)'}}>
                    <div className="an-label mb10">Log action</div>
                    {saved && <div className="an-info an-info-lifeline mb12" style={{fontSize:12}}>✓ Action logged and saved</div>}
                    <div className="an-flex-wrap g6 mb12">
                      {ACTIONS.map(a => (
                        <button key={a.id} className={`an-action-btn${aType===a.id?' selected':''}`} onClick={()=>setAType(a.id)}>{a.label}</button>
                      ))}
                    </div>
                    <span className="an-label">Note (optional)</span>
                    <textarea className="an-input mb10" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Additional context…"/>
                    <button className="an-btn an-btn-primary an-btn-full" onClick={submit} disabled={saving}>
                      {saving ? 'Saving…' : '✓ Confirm action'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
