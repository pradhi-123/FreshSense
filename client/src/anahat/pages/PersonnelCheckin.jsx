import React, { useState, useRef } from 'react';
import { useAnahat } from '../AnahatContext.jsx';
import { submitCheckin, setConsent, getMyShared } from '../api.js';
import { Mic, MicOff, CheckCircle, AlertTriangle, Eye, Shield, Lock, Clock, ArrowLeft, RotateCcw, ArrowRight, Moon } from 'lucide-react';
import '../anahat.css';

const SLEEP_OPTIONS = [
  { id:'poor',  emoji:'😩', label:'POOR',  sub:'< 4 hrs', hours:3.5 },
  { id:'fair',  emoji:'😑', label:'FAIR',  sub:'4–6 hrs', hours:5 },
  { id:'good',  emoji:'😊', label:'GOOD',  sub:'6–8 hrs', hours:7 },
  { id:'great', emoji:'💤', label:'GREAT', sub:'8+ hrs',  hours:9 },
];

const SCENARIOS = [
  { id:'normal',     emoji:'🟢', label:'NORMAL',     flat:false },
  { id:'story_day1', emoji:'🟡', label:'SLEEP/FAM',  flat:false },
  { id:'story_day2', emoji:'🟠', label:'FLAT TONE',  flat:true  },
  { id:'urgent',     emoji:'🔴', label:'CRISIS',     flat:false },
];
const TX = {
  normal:    'தூங்கினேன், வேலை நன்றாக இருந்தது.',
  story_day1:'நேத்து ராத்திரி தூக்கம் வரல. வீட்டை பற்றி கவலையா இருக்கு.',
  story_day2:'ரொம்ப களைப்பா இருக்கு. தூக்கம் வரல. நைட் டியூட்டி ரொம்ப கஷ்டமா இருக்கு.',
  urgent:    'எல்லாம் தொலைஞ்சு போச்சு. வாழ பிடிக்கல.',
};
const WH = [10,18,26,20,14,24,16,20,12,24,18,14];
const STEPS = ['SLEEP LOG', 'VOICE', 'REPORT'];

function StepBar({ current }) {
  return (
    <div className="an-steps">
      {STEPS.map((s,i) => (
        <div key={s} className="an-step-item">
          <div className={`an-step-dot ${i<current?'done':i===current?'active':'pending'}`}>
            {i<current ? '✓' : i+1}
          </div>
          {i < STEPS.length-1 && <div className={`an-step-line${i<current?' done':''}`}/>}
        </div>
      ))}
      <span className="an-step-label">{STEPS[current]}</span>
    </div>
  );
}

function SectionHdr({ children }) {
  return (
    <div className="an-section-hdr">
      <span className="an-sec">{children}</span>
      <div className="an-section-hdr-line"/>
    </div>
  );
}

export default function PersonnelCheckin() {
  const { personnelId } = useAnahat();
  const [step, setStep]           = useState('sleep');
  const [sleepQuality, setSQ]     = useState(null);
  const [scenario, setScenario]   = useState('normal');
  const [elapsed, setElapsed]     = useState(0);
  const timerRef                  = useRef(null);
  const [result, setResult]       = useState(null);
  const [sharedLogs, setShared]   = useState([]);
  const [consent, setConsentVal]  = useState(true);
  const [error, setError]         = useState(null);
  const [screen, setScreen]       = useState(null);

  const startRecording = () => {
    setElapsed(0); setStep('recording');
    timerRef.current = setInterval(() => {
      setElapsed(p => { if (p>=60) { stopRecording(); return 60; } return p+1; });
    }, 1000);
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current); setStep('processing'); setError(null);
    const sc = SCENARIOS.find(s=>s.id===scenario);
    const sl = SLEEP_OPTIONS.find(o=>o.id===sleepQuality);
    try {
      const r = await submitCheckin({
        personnel_id:personnelId, language:'ta',
        transcript:TX[scenario], isFlatTone:sc?.flat||false,
        duration_s:Math.max(elapsed,15),
        sleep_quality:sleepQuality||undefined, sleep_hours:sl?.hours||undefined,
      });
      setResult(r); setStep('done');
    } catch { setError('Submission failed. Retry.'); setStep('sleep'); }
  };

  const loadShared = async () => {
    try { const d=await getMyShared(personnelId); setShared(d); setScreen('transparency'); } catch {}
  };
  const handleConsent = async v => { try { await setConsent(personnelId,v); setConsentVal(v); } catch {} };
  const reset = () => { setStep('sleep'); setSQ(null); setScenario('normal'); setResult(null); setError(null); };

  /* TRANSPARENCY */
  if (screen==='transparency') return (
    <div className="an-page an-fade" style={{maxWidth:640,margin:'0 auto'}}>
      <div className="an-flex-between mb24">
        <div><div className="an-h1">My Data</div><div className="an-sub mt4">Signals shared with Welfare Officer</div></div>
        <button className="an-btn an-btn-ghost an-btn-sm" onClick={()=>setScreen(null)}><ArrowLeft size={13}/> Back</button>
      </div>
      {sharedLogs.length===0
        ? <div className="an-card" style={{textAlign:'center',padding:72,color:'var(--tx3)'}}>NO RECORDS FOUND</div>
        : <div className="an-flex-col g10">
            {sharedLogs.map((log,i)=>(
              <div key={i} className="an-card">
                <div className="an-flex-between mb10">
                  <div className="an-flex g6 an-mono" style={{fontSize:11,color:'var(--tx2)'}}>
                    <Clock size={11} style={{color:'var(--tx3)'}}/>
                    {new Date(log.at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </div>
                  {log.what.deleted_at&&<div className="an-flex g4" style={{fontSize:10,color:'var(--green)',fontFamily:'var(--mono)'}}><Lock size={10}/> DELETED</div>}
                </div>
                {log.what.topics?.length>0
                  ?<div className="an-flex-wrap g6">{log.what.topics.map((t,j)=><span key={j} className={`an-badge ${t.polarity==='negative'?'bd-red':'bd-muted'}`}>{t.topic}</span>)}</div>
                  :<span style={{fontSize:12,color:'var(--green)',fontFamily:'var(--mono)'}}>NO SIGNALS</span>}
              </div>
            ))}
          </div>}
    </div>
  );

  /* CONSENT */
  if (screen==='consent') return (
    <div className="an-page an-fade" style={{maxWidth:480,margin:'0 auto'}}>
      <div className="an-flex-between mb24">
        <div className="an-h1">Consent</div>
        <button className="an-btn an-btn-ghost an-btn-sm" onClick={()=>setScreen(null)}><ArrowLeft size={13}/> Back</button>
      </div>
      <div className="an-card">
        <div className="an-consent-row">
          <div>
            <div style={{fontWeight:700,fontSize:13.5,textTransform:'uppercase',letterSpacing:'0.04em'}}>Daily Voice Check-ins</div>
            <div style={{fontSize:11,color:'var(--tx3)',marginTop:3,fontFamily:'var(--mono)'}}>Toggle to withdraw consent</div>
          </div>
          <label className="an-toggle">
            <input type="checkbox" checked={consent} onChange={e=>handleConsent(e.target.checked)}/>
            <span className="an-toggle-track"/>
          </label>
        </div>
      </div>
    </div>
  );

  /* PROCESSING */
  if (step==='processing') return (
    <div className="an-page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'55vh',flexDirection:'column',gap:16}}>
      <div className="an-spin" style={{width:44,height:44}}/>
      <div style={{fontSize:11,color:'var(--tx3)',fontFamily:'var(--mono)',letterSpacing:'0.15em'}}>PROCESSING SUBMISSION…</div>
    </div>
  );

  /* RECORDING */
  if (step==='recording') {
    const pct=(elapsed/60)*100, R=60, circ=2*Math.PI*R;
    return (
      <div className="an-page an-fade" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'66vh',gap:28}}>
        <div style={{position:'relative',width:152,height:152}}>
          <svg width="152" height="152" style={{position:'absolute',top:0,left:0,transform:'rotate(-90deg)'}}>
            <circle cx="76" cy="76" r={R} fill="none" stroke="var(--s4)" strokeWidth="5"/>
            <circle cx="76" cy="76" r={R} fill="none" stroke="var(--red)" strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ}
              strokeLinecap="butt" style={{transition:'stroke-dashoffset 0.5s ease'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:2}}>
            <span style={{fontSize:26,fontWeight:800,color:'var(--tx)',fontFamily:'var(--mono)'}}>
              {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
            </span>
            <span style={{fontSize:9,color:'var(--tx3)',letterSpacing:'0.12em',fontFamily:'var(--mono)'}}>RECORDING</span>
          </div>
        </div>
        <div className="an-mic rec" onClick={stopRecording}><MicOff size={36} style={{color:'var(--red)'}}/></div>
        <div className="an-wave">{WH.map((h,i)=><div key={i} className="an-wave-bar" style={{'--d':`${0.55+i*0.12}s`,'--h':`${h}px`,animationDelay:`${i*0.07}s`}}/>)}</div>
        <div style={{fontSize:10,color:'var(--tx3)',fontFamily:'var(--mono)',letterSpacing:'0.1em'}}>TAP TO STOP</div>
      </div>
    );
  }

  /* DONE */
  if (step==='done'&&result) return (
    <div className="an-page an-fade" style={{maxWidth:560,margin:'0 auto'}}>
      {result.urgent&&<div className="an-info an-info-red mb16"><AlertTriangle size={14} style={{flexShrink:0}}/><span style={{fontFamily:'var(--mono)',fontWeight:700}}>URGENT — ESCALATION INITIATED</span></div>}
      <div className="an-card-command">
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:'var(--r)',background:'var(--grn)',border:'1px solid var(--grn-b)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <CheckCircle size={28} style={{color:'var(--green)'}}/>
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:17,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--tx)'}}>Check-in Submitted</div>
            <div style={{fontSize:10,color:'var(--green)',fontFamily:'var(--mono)',marginTop:3,letterSpacing:'0.1em'}}>AUDIO DELETED · DATA ANONYMISED</div>
          </div>
        </div>

        {sleepQuality&&(
          <div style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:'var(--r)',padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
            <Moon size={13} style={{color:'var(--gold)'}}/>
            <span style={{fontSize:12,color:'var(--tx2)',fontFamily:'var(--mono)',letterSpacing:'0.04em'}}>
              SLEEP: <strong style={{color:'var(--tx)'}}>{SLEEP_OPTIONS.find(o=>o.id===sleepQuality)?.label}</strong> · {SLEEP_OPTIONS.find(o=>o.id===sleepQuality)?.sub}
            </span>
          </div>
        )}

        {result.shared?.topics?.length>0&&(
          <div style={{background:'var(--s2)',border:'1px solid var(--b1)',borderRadius:'var(--r)',padding:'12px 14px',marginBottom:12}}>
            <div className="an-sec mb8">Signals transmitted to welfare officer</div>
            <div className="an-flex-wrap g6">
              {result.shared.topics.map((t,i)=><span key={i} className={`an-badge ${t.polarity==='negative'?'bd-red':t.polarity==='positive'?'bd-green':'bd-muted'}`}>{t.topic}</span>)}
            </div>
          </div>
        )}

        {result.alert_created&&<div className="an-info an-info-amber mb16"><AlertTriangle size={13} style={{flexShrink:0}}/><span style={{fontFamily:'var(--mono)',fontSize:11}}>WELFARE ALERT RAISED — OFFICER NOTIFIED</span></div>}

        <div className="an-flex g8">
          <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={loadShared}><Eye size={13}/> My Data</button>
          <button className="an-btn an-btn-primary" style={{flex:1}} onClick={reset}><RotateCcw size={13}/> New</button>
        </div>
      </div>
    </div>
  );

  /* STEP 1 — SLEEP */
  if (step==='sleep') return (
    <div className="an-page an-fade" style={{maxWidth:580,margin:'0 auto'}}>
      <StepBar current={0}/>
      <div className="mb24">
        <div className="an-h1">Sleep Report</div>
        <div className="an-sub mt8">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'short'}).toUpperCase()}</div>
      </div>
      {error&&<div className="an-info an-info-red mb16"><AlertTriangle size={13} style={{flexShrink:0}}/><span style={{fontFamily:'var(--mono)'}}>{error}</span></div>}

      <SectionHdr>Last night's sleep quality</SectionHdr>

      <div className="an-flex g10 mb28" style={{flexWrap:'nowrap'}}>
        {SLEEP_OPTIONS.map(opt=>(
          <button key={opt.id} className={`sleep-tile${sleepQuality===opt.id?' selected':''}`} onClick={()=>setSQ(opt.id)}>
            <span className="sleep-emoji">{opt.emoji}</span>
            <span className="sleep-label">{opt.label}</span>
            <span className="sleep-sub">{opt.sub}</span>
          </button>
        ))}
      </div>

      <button className={`an-btn an-btn-lg an-btn-full ${sleepQuality?'an-btn-primary':'an-btn-ghost'}`} onClick={()=>sleepQuality&&setStep('voice')} disabled={!sleepQuality}>
        CONFIRM & PROCEED <ArrowRight size={15}/>
      </button>
      <div style={{textAlign:'center',marginTop:10}}>
        <button style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--tx3)',fontFamily:'var(--mono)',letterSpacing:'0.08em'}} onClick={()=>{setSQ(null);setStep('voice');}}>SKIP SLEEP LOG</button>
      </div>
      <div className="an-flex g8 mt24">
        <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={loadShared}><Eye size={13}/> My Data</button>
        <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={()=>setScreen('consent')}><Shield size={13}/> Consent</button>
      </div>
    </div>
  );

  /* STEP 2 — VOICE */
  return (
    <div className="an-page an-fade" style={{maxWidth:580,margin:'0 auto'}}>
      <StepBar current={1}/>
      <div className="mb24">
        <div className="an-h1">Voice Check-in</div>
        {sleepQuality&&(
          <div className="an-flex g8 mt8">
            <Moon size={12} style={{color:'var(--gold)'}}/>
            <span className="an-mono" style={{fontSize:11,color:'var(--tx3)',letterSpacing:'0.06em'}}>
              SLEEP: <strong style={{color:'var(--gold)'}}>{SLEEP_OPTIONS.find(o=>o.id===sleepQuality)?.label}</strong>
            </span>
            <button style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'var(--gold)',fontFamily:'var(--mono)',letterSpacing:'0.06em',fontWeight:700}} onClick={()=>setStep('sleep')}>CHANGE</button>
          </div>
        )}
      </div>

      <SectionHdr>Simulation Scenario</SectionHdr>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:24}}>
        {SCENARIOS.map(s=>(
          <button key={s.id} onClick={()=>setScenario(s.id)} style={{
            background:scenario===s.id?'var(--gold-dim)':'var(--s2)',
            border:`1px solid ${scenario===s.id?'rgba(201,162,39,0.35)':'var(--b2)'}`,
            borderRadius:'var(--r2)',padding:'14px 16px',
            cursor:'pointer',textAlign:'left',fontFamily:'var(--font)',transition:'all 0.13s',
          }}>
            <div style={{fontSize:18,marginBottom:6}}>{s.emoji}</div>
            <div style={{fontWeight:700,fontSize:12,color:scenario===s.id?'var(--gold)':'var(--tx)',letterSpacing:'0.08em'}}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,marginBottom:28}}>
        <div className="an-mic" onClick={startRecording}><Mic size={44} style={{color:'var(--gold)'}}/></div>
        <div style={{fontSize:10,color:'var(--tx3)',fontFamily:'var(--mono)',letterSpacing:'0.15em'}}>TAP TO BEGIN RECORDING · 60 SECONDS</div>
      </div>

      <button className="an-btn an-btn-ghost an-btn-full" onClick={()=>setStep('sleep')}><ArrowLeft size={13}/> Back to Sleep Log</button>
    </div>
  );
}
