import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlertDetail, postAlertAction } from '../api.js';
import socket from '../socket.js';
import { ArrowLeft, Activity, Calendar, Moon, CheckSquare } from 'lucide-react';
import '../anahat.css';

function Sparkline({ data=[], color='#c9a227', height=38 }) {
  if (!data||data.length<2) return <div style={{height,background:'var(--s3)',borderRadius:2}}/>;
  const W=260, min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*W;
    const y=height-((v-min)/range)*(height-8)-4;
    return`${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const id=`sg${color.replace('#','')}`;
  return(
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${W},${height}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
      {/* end dot */}
      {pts.length>0&&(()=>{const last=pts.split(' ').pop().split(',');return<circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>;})()}
    </svg>
  );
}

const CHIP_MAP={'SAID':'chip-said','HOW':'chip-how','HR':'chip-hr'};
const STATUS_BD={'new':'bd-red','in_progress':'bd-amber','closed':'bd-green'};
const ACTIONS=[
  {id:'welfare_call',label:'WELFARE CALL'},
  {id:'prioritise_leave',label:'PRIORITISE LEAVE'},
  {id:'offer_counsellor',label:'COUNSELLOR'},
  {id:'adjust_duty',label:'ADJUST DUTY'},
  {id:'note',label:'NOTE ONLY'},
];

function SectionHdr({icon,children}){return(
  <div className="an-section-hdr">
    {icon&&<span style={{color:'var(--gold)',opacity:0.7}}>{icon}</span>}
    <span className="an-sec">{children}</span>
    <div className="an-section-hdr-line"/>
  </div>
);}

export default function AlertDetail() {
  const{id}=useParams(); const navigate=useNavigate();
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[aType,setAType]=useState('welfare_call');
  const[note,setNote]=useState('');
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);

  const load=async()=>{try{const d=await getAlertDetail(id);setData(d);}catch{} setLoading(false);};
  useEffect(()=>{load();},[id]);
  useEffect(()=>{socket.on('alert:updated',e=>{if(e.id===id)load();});return()=>socket.off('alert:updated');},[id]);

  const submit=async()=>{setSaving(true);try{await postAlertAction(id,aType,note);setSaved(true);setNote('');await load();}catch{} setSaving(false);};

  if(loading) return(
    <div className="an-page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'50vh',flexDirection:'column',gap:12}}>
      <div className="an-spin" style={{width:36,height:36}}/>
      <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--tx3)',letterSpacing:'0.15em'}}>LOADING INTEL…</div>
    </div>
  );
  if(!data) return(
    <div className="an-page">
      <button className="an-btn an-btn-ghost an-btn-sm" onClick={()=>navigate('/anahat/alerts')}><ArrowLeft size={13}/> Back</button>
    </div>
  );

  const{alert,checkins=[],hr=[],actions=[]}=data;
  const latHR=hr[hr.length-1];
  const TRENDS=[
    {label:'Pitch Variation',data:checkins.map(c=>c.pitch_var||0),color:'#c9a227'},
    {label:'Speech Rate',data:checkins.map(c=>c.speech_rate||0),color:'#3a7bd5'},
    {label:'Pause Ratio %',data:checkins.map(c=>(c.pause_ratio||0)*100),color:'#e03e3e'},
    {label:'Energy',data:checkins.map(c=>(c.energy||0)*100),color:'#2a9d5c'},
  ];

  return(
    <div className="an-page an-fade">
      {/* Header */}
      <div className="an-flex mb24 g12" style={{flexWrap:'wrap',alignItems:'flex-start'}}>
        <button className="an-btn an-btn-ghost an-btn-sm" style={{flexShrink:0}} onClick={()=>navigate('/anahat/alerts')}><ArrowLeft size={13}/> ALERTS</button>
        <div style={{flex:1}}>
          <div className="an-flex-wrap g8 mb4">
            <span style={{fontWeight:900,fontSize:18,letterSpacing:'0.06em',textTransform:'uppercase'}}>{alert.pseudonym}</span>
            {(alert.groups||[]).map(g=><span key={g} className={`chip ${CHIP_MAP[g]||''}`}>{g}</span>)}
            <span className={`an-badge ${STATUS_BD[alert.status]||'bd-muted'}`}>{alert.status.replace('_',' ')}</span>
          </div>
          <div className="an-mono" style={{fontSize:10,color:'var(--tx3)',letterSpacing:'0.1em'}}>{alert.unit} · {alert.platoon}</div>
        </div>
      </div>

      <div className="grid2" style={{alignItems:'start',gap:16}}>

        {/* LEFT COL */}
        <div className="an-flex-col g14">

          {/* Reasons */}
          <div className="an-card">
            <SectionHdr>Reasons for Alert</SectionHdr>
            {(alert.reasons||[]).map((r,i)=>(
              <div key={i} className="an-flex g10 mb10" style={{alignItems:'flex-start'}}>
                <div style={{width:22,height:22,borderRadius:'var(--r)',background:'var(--gold-dim)',border:'1px solid rgba(201,162,39,0.25)',color:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,flexShrink:0,fontFamily:'var(--mono)'}}>{i+1}</div>
                <div style={{fontSize:12.5,color:'var(--tx)',lineHeight:1.5}}>{r}</div>
              </div>
            ))}
          </div>

          {/* HR Records */}
          {latHR&&(
            <div className="an-card">
              <SectionHdr icon={<Calendar size={11}/>}>HR Records</SectionHdr>
              {[
                {label:'Days since leave',val:latHR.days_since_leave,max:365,warn:latHR.days_since_leave>180,color:latHR.days_since_leave>180?'var(--red)':'var(--green)'},
                {label:'Night duty streak',val:latHR.night_streak,max:14,warn:latHR.night_streak>=5,color:latHR.night_streak>=5?'var(--amber)':'var(--green)'},
                {label:'Leave pending',val:latHR.leave_pending_days||0,max:30,warn:(latHR.leave_pending_days||0)>14,color:(latHR.leave_pending_days||0)>14?'var(--amber)':'var(--tx2)'},
              ].map(m=>(
                <div key={m.label} className="mb14">
                  <div className="an-flex-between mb6">
                    <span className="an-mono" style={{fontSize:11,color:'var(--tx2)',letterSpacing:'0.06em'}}>{m.label.toUpperCase()}</span>
                    <span className="an-mono" style={{fontSize:13,fontWeight:700,color:m.color}}>{m.val}{m.warn?' ⚠':''}</span>
                  </div>
                  <div className="an-progress"><div className="an-progress-fill" style={{width:`${Math.min((m.val/m.max)*100,100)}%`,background:m.color}}/></div>
                </div>
              ))}
            </div>
          )}

          {/* Actions taken */}
          {actions.length>0&&(
            <div className="an-card">
              <SectionHdr icon={<CheckSquare size={11}/>}>Actions Taken</SectionHdr>
              {actions.map((a,i)=>(
                <div key={i} className="an-flex g10 mb10" style={{alignItems:'flex-start'}}>
                  <div style={{width:7,height:7,borderRadius:1,background:'var(--green)',marginTop:5,flexShrink:0}}/>
                  <div>
                    <div className="an-mono" style={{fontWeight:700,fontSize:11,letterSpacing:'0.08em',color:'var(--green)'}}>{a.type?.replace(/_/g,' ')}</div>
                    {a.note&&<div style={{fontSize:12,color:'var(--tx2)',marginTop:2}}>{a.note}</div>}
                    <div className="an-mono" style={{fontSize:9.5,color:'var(--tx3)',marginTop:3,letterSpacing:'0.06em'}}>{new Date(a.created_at).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COL */}
        <div className="an-flex-col g14">

          {/* Tone sparklines */}
          <div className="an-card">
            <SectionHdr icon={<Activity size={11}/>}>14-Day Tone Analysis</SectionHdr>
            {TRENDS.map(t=>(
              <div key={t.label} className="mb16">
                <div className="an-mono" style={{fontSize:10,color:'var(--tx3)',letterSpacing:'0.1em',marginBottom:5}}>{t.label.toUpperCase()}</div>
                <Sparkline data={t.data} color={t.color}/>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="an-card">
            <SectionHdr icon={<Moon size={11}/>}>Signal Heatmap</SectionHdr>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse',width:'100%'}}>
                <thead>
                  <tr style={{background:'var(--s2)'}}>
                    {['Date','Sleep','Family','Fatigue','Tone'].map(h=>(
                      <th key={h} style={{padding:'6px 10px',color:'var(--tx3)',fontFamily:'var(--mono)',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',textAlign:'center',borderBottom:'1px solid var(--b2)',whiteSpace:'nowrap',fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkins.slice(-14).map((c,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid var(--b1)'}}>
                      <td style={{padding:'6px 10px',color:'var(--tx2)',textAlign:'center',fontFamily:'var(--mono)',fontSize:10}}>{c.date?.slice(5)||'—'}</td>
                      {['sleep','family','fatigue'].map(t=>(
                        <td key={t} style={{textAlign:'center',padding:'6px 10px'}}>
                          {c.neg_counts?.[t]>0
                            ?<span style={{color:'var(--red)',fontWeight:700,fontFamily:'var(--mono)',fontSize:12}}>✕</span>
                            :<span style={{color:'var(--green)',fontFamily:'var(--mono)',fontSize:11}}>✓</span>}
                        </td>
                      ))}
                      <td style={{textAlign:'center',padding:'6px 10px'}}>
                        {c.is_strained
                          ?<span style={{color:'var(--amber)',fontFamily:'var(--mono)',fontSize:11,fontWeight:700}}>⚠</span>
                          :<span style={{color:'var(--tx4)',fontFamily:'var(--mono)'}}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action form */}
          {alert.status!=='closed'&&(
            <div className="an-card-command">
              <SectionHdr>Log Action</SectionHdr>
              {saved&&<div className="an-info an-info-green mb12" style={{fontSize:11}}><span style={{fontFamily:'var(--mono)'}}>✓ ACTION LOGGED</span></div>}
              <div className="an-flex-wrap g6 mb12">
                {ACTIONS.map(a=>(
                  <button key={a.id} className={`an-btn an-btn-sm ${aType===a.id?'an-btn-primary':'an-btn-ghost'}`} style={{fontSize:10,letterSpacing:'0.08em'}} onClick={()=>setAType(a.id)}>{a.label}</button>
                ))}
              </div>
              <label className="an-label">Note</label>
              <textarea className="an-input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note…" style={{resize:'vertical',marginBottom:10}}/>
              <button className="an-btn an-btn-primary an-btn-full" onClick={submit} disabled={saving} style={{letterSpacing:'0.1em'}}>
                {saving?'SUBMITTING…':'✓ CONFIRM ACTION'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
