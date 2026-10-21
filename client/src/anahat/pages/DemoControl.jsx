import React, { useState } from 'react';
import { useAnahat } from '../AnahatContext.jsx';
import { advanceDemoDay, resetDemo } from '../api.js';
import { RefreshCw, ChevronRight, Calendar, Database, Zap, Bell, Mic, BarChart2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../anahat.css';

const STORY = [
  { day:'D−4', label:'Normal check-in',          done:true },
  { day:'D−3', label:'Sleep + fatigue signals',   done:true },
  { day:'D−2', label:'Sleep again + flat tone',   done:true },
  { day:'D−1', label:'Family worry + flat tone',  done:true },
  { day:'D·0', label:'Submit check-in → alert fires', done:false, cta:'/anahat/checkin' },
  { day:'D+1', label:'View & act on alert',        done:false, cta:'/anahat/alerts' },
];

function SectionHdr({children}){return(<div className="an-section-hdr"><span className="an-sec">{children}</span><div className="an-section-hdr-line"/></div>);}

export default function DemoControl() {
  const { demoState, refreshDemo } = useAnahat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const doReset = async () => {
    setLoading(true);
    try { await resetDemo(); await refreshDemo(); setMsg('DB RESET · 40 PERSONNEL SEEDED'); }
    catch { setMsg('RESET FAILED'); }
    setLoading(false);
  };

  const doAdvance = async () => {
    setLoading(true);
    try { const s=await advanceDemoDay(); await refreshDemo(); setMsg(`DATE ADVANCED → ${s.today}`); }
    catch { setMsg('ADVANCE FAILED'); }
    setLoading(false);
  };

  return (
    <div className="an-page an-fade">
      <div className="mb24">
        <div className="an-h1">Demo Control</div>
        <div className="an-sub mt8">ANAHAT · P017 KARTHIK SIMULATION</div>
      </div>

      {/* Stats grid */}
      {demoState && (
        <div className="grid4 mb24">
          {[
            {label:'DATE',val:demoState.today,icon:<Calendar size={13}/>,color:'var(--gold)'},
            {label:'PERSONNEL',val:demoState.personnelCount,icon:<Database size={13}/>,color:'var(--tx)'},
            {label:'CHECK-INS',val:demoState.checkinCount,icon:<Zap size={13}/>,color:'var(--tx)'},
            {label:'OPEN ALERTS',val:demoState.alertCount,icon:<Bell size={13}/>,color:demoState.alertCount>0?'var(--red)':'var(--green)'},
          ].map(s=>(
            <div key={s.label} className="an-stat">
              <div className="an-stat-label" style={{display:'flex',alignItems:'center',gap:5}}>{s.icon}{s.label}</div>
              <div className="an-stat-val" style={{color:s.color,fontSize:s.val?.toString().length>8?14:22}}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {msg&&<div className="an-info an-info-green mb16"><span className="an-mono" style={{fontSize:11,letterSpacing:'0.08em'}}>✓ {msg}</span></div>}

      <div className="grid2 mb24" style={{gap:10}}>
        <button className="an-btn an-btn-danger an-btn-lg" onClick={doReset} disabled={loading} style={{letterSpacing:'0.1em'}}>
          <RefreshCw size={14}/> RESET DATABASE
        </button>
        <button className="an-btn an-btn-ghost an-btn-lg" onClick={doAdvance} disabled={loading} style={{letterSpacing:'0.1em'}}>
          <ChevronRight size={14}/> ADVANCE DAY
        </button>
      </div>

      {/* Story timeline */}
      <SectionHdr>Simulation Story · P017 Karthik</SectionHdr>
      <div className="an-card mb24">
        <div style={{position:'relative',paddingLeft:0}}>
          <div style={{position:'absolute',left:12,top:12,bottom:12,width:1,background:'var(--b2)'}}/>
          {STORY.map((s,i)=>(
            <div key={i} className="an-flex g14" style={{alignItems:'flex-start',marginBottom:i<STORY.length-1?18:0,position:'relative',zIndex:1}}>
              <div style={{
                width:24,height:24,borderRadius:'var(--r)',flexShrink:0,
                background:s.done?'var(--s4)':'var(--gold-dim)',
                border:`1px solid ${s.done?'var(--b2)':'rgba(201,162,39,0.4)'}`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,fontWeight:800,fontFamily:'var(--mono)',
                color:s.done?'var(--tx3)':'var(--gold)',
              }}>{s.done?'✓':'→'}</div>
              <div style={{paddingTop:3}}>
                <div className="an-mono" style={{fontSize:9,color:'var(--tx4)',letterSpacing:'0.12em',marginBottom:3}}>{s.day}</div>
                <div style={{fontSize:13,fontWeight:s.done?400:600,color:s.done?'var(--tx2)':'var(--tx)'}}>{s.label}</div>
                {s.cta&&(
                  <button className="an-btn an-btn-sm an-btn-primary mt8" style={{fontSize:10,letterSpacing:'0.1em'}} onClick={()=>navigate(s.cta)}>
                    OPEN <ArrowRight size={11}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <SectionHdr>Quick Navigation</SectionHdr>
      <div className="grid3" style={{gap:10}}>
        {[
          {label:'CHECK-IN',icon:<Mic size={20}/>,path:'/anahat/checkin',color:'#3a7bd5',dim:'rgba(58,123,213,0.1)',border:'rgba(58,123,213,0.3)'},
          {label:'ALERTS',icon:<Bell size={20}/>,path:'/anahat/alerts',color:'var(--red)',dim:'var(--rd)',border:'var(--rd-b)'},
          {label:'UNIT',icon:<BarChart2 size={20}/>,path:'/anahat/unit',color:'#2a9d5c',dim:'rgba(42,157,92,0.1)',border:'rgba(42,157,92,0.3)'},
        ].map(n=>(
          <button key={n.path} onClick={()=>navigate(n.path)} style={{
            background:'var(--s1)',border:`1px solid var(--b2)`,borderRadius:'var(--r2)',
            padding:'20px 16px',cursor:'pointer',textAlign:'left',fontFamily:'var(--font)',
            transition:'all 0.14s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--s2)';e.currentTarget.style.borderColor='var(--b3)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--s1)';e.currentTarget.style.borderColor='var(--b2)';}}
          >
            <div style={{width:40,height:40,borderRadius:'var(--r)',background:n.dim,border:`1px solid ${n.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:n.color,marginBottom:10}}>{n.icon}</div>
            <div className="an-mono" style={{fontWeight:700,fontSize:11,color:'var(--tx)',letterSpacing:'0.1em'}}>{n.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
