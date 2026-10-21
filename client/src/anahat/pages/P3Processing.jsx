import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { submitCheckin } from '../api.js';
import TalkToSomeone from '../components/TalkToSomeone.jsx';
import { CheckCircle, Edit2, X } from 'lucide-react';
import '../anahat.css';

// Demo scenario text (used when no real speech)
const DEMO_TEXT = {
  ta: 'நேத்து ராத்திரி தூக்கம் வரல சார். ரொம்ப களைப்பா இருக்கு. வீட்டை பத்தி கவலையா இருக்கு. நைட் டியூட்டி ரொம்ப கஷ்டமா இருக்கு. மனசு ரொம்ப அமைதி இல்லாம இருக்கு.',
  hi: 'कल रात नींद नहीं आई साहब। बहुत थकान है। घर की चिंता है। नाइट ड्यूटी बहुत मुश्किल है।',
  en: 'Sir, I could not sleep last night. I am feeling very tired and exhausted. I am worried about my family. Night duties are very difficult.',
};

const STEPS = [
  { label: 'Transcribing', sub: 'Converting speech to text' },
  { label: 'Topics found', sub: 'Identifying what you mentioned' },
  { label: 'Tone compared', sub: 'Comparing against your own baseline' },
  { label: 'Recording deleted ✓', sub: 'Audio removed from this device' },
];

export default function P3Processing() {
  const navigate = useNavigate();
  const { refreshDemo, personnelId, addToast } = useAnahat();

  const [stepIdx, setStepIdx]  = useState(0);
  const [transcript, setTranscript] = useState('');
  const [editing, setEditing]  = useState(false);
  const [editText, setEditText]= useState('');
  const [reviewing, setReviewing] = useState(false); // show transcript for review
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]    = useState(null);
  const [checkinData, setCheckinData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('an_checkin');
    if (!raw) { navigate('/anahat/checkin'); return; }
    const data = JSON.parse(raw);
    setCheckinData(data);

    const text = data.typedText || DEMO_TEXT[data.language] || DEMO_TEXT.en;
    setTranscript(text);
    setEditText(text);

    // Run through steps
    const delays = [1200, 1000, 1200, 800];
    let cumulative = 0;
    delays.forEach((d, i) => {
      cumulative += d;
      setTimeout(() => {
        setStepIdx(i + 1);
        if (i === 3) setReviewing(true); // all done, show review
      }, cumulative);
    });
  }, [navigate]);

  const handleSubmit = async (finalText) => {
    if (!checkinData) return;
    setReviewing(false);
    setSubmitting(true);

    try {
      const res = await submitCheckin({
        personnel_id: checkinData.personnelId,
        language: checkinData.language,
        transcript: finalText,
        isFlatTone: false,
        duration_s: checkinData.duration_s || 30,
        sleep_hours: checkinData.sleepHours,
        sleep_quality: checkinData.sleepQuality,
      });

      sessionStorage.removeItem('an_checkin');
      // Mark today as checked in
      const key = `anahat_checkin_${checkinData.personnelId}_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(key, '1');

      await refreshDemo();
      setResult(res);
    } catch (e) {
      addToast('Submission failed. Please try again.', 'error');
      navigate('/anahat/checkin');
    }
    setSubmitting(false);
  };

  const handleDiscard = () => {
    sessionStorage.removeItem('an_checkin');
    navigate('/anahat/home');
  };

  if (result) return (
    <div className="an-night an-fade">
      <div className="an-screen-center">
        <div style={{textAlign:'center',padding:'0 24px'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(255,181,71,0.15)',border:'2px solid var(--amber)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',color:'var(--amber)'}}>
            <CheckCircle size={30}/>
          </div>
          <div className="an-h1 mb4">Check-in done</div>
          <div className="an-sub mb24">Audio deleted · Signals shared with your welfare officer</div>

          {/* What was shared */}
          <div className="an-card mb16" style={{textAlign:'left'}}>
            <div className="an-label mb10">What your officer sees</div>
            {result.triangulation?.groups?.length > 0 && (
              <div className="an-flex-wrap g6 mb10">
                {result.triangulation.groups.map(g => (
                  <span key={g} className={`an-chip an-chip-${g.toLowerCase()}`}>{g}</span>
                ))}
              </div>
            )}
            <div className="an-sub mb8" style={{fontSize:12}}>Sleep quality · Tone signals · Topic signals</div>
            {result.audio_deleted_at && (
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--mist)'}}>
                Audio deleted · {new Date(result.audio_deleted_at).toLocaleTimeString('en-IN')}
              </div>
            )}
          </div>

          {result.alert_created && (
            <div className="an-info an-info-amber mb16" style={{textAlign:'left'}}>
              <span>Your officer has been notified. If they need to reach you, they will be in touch soon.</span>
            </div>
          )}

          <div className="an-info an-info-lifeline mb24" style={{textAlign:'left'}}>
            <span>You can see and manage everything shared in <strong>My Data</strong>.</span>
          </div>

          <button className="an-btn an-btn-primary an-btn-full" onClick={() => navigate('/anahat/home')}>
            Back to home
          </button>
        </div>
      </div>
      <TalkToSomeone />
    </div>
  );

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        <div className="an-topbar">
          <div className="an-topbar-brand">PROCESSING</div>
        </div>

        {/* Processing steps */}
        <div className="an-card mb20">
          <div className="an-h3 mb16" style={{color:'var(--mist)'}}>What is happening right now</div>
          {STEPS.map((s, i) => {
            const done = stepIdx > i;
            const active = stepIdx === i;
            return (
              <div key={i} className="an-proc-step">
                <div className={`an-proc-icon ${done?'done':active?'active':'pending'}`}>
                  {done ? <CheckCircle size={16}/> : active ? <div className="an-spin" style={{width:16,height:16}}/> : <div style={{width:8,height:8,borderRadius:'50%',background:'var(--steel)'}}/>}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:done?'var(--frost)':active?'var(--amber)':'var(--mist)'}}>{s.label}</div>
                  <div className="an-sub" style={{fontSize:12}}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transcript review */}
        {reviewing && !submitting && (
          <div className="an-card an-fade">
            <div className="an-flex-between mb12">
              <div className="an-h3">Your transcript</div>
              <button className="an-btn-icon an-btn-sm" style={{width:32,height:32,background:'var(--steel)'}} onClick={() => setEditing(!editing)}>
                <Edit2 size={13} style={{color:'var(--mist)'}}/>
              </button>
            </div>
            <div className="an-sub mb12" style={{fontSize:12}}>Read what was transcribed. You can edit or discard before anything is shared.</div>

            {editing ? (
              <textarea className="an-input mb12" rows={5} value={editText} onChange={e => setEditText(e.target.value)}/>
            ) : (
              <div style={{background:'var(--night)',borderRadius:'var(--r)',padding:'12px 14px',fontSize:14,color:'var(--frost)',lineHeight:1.6,marginBottom:12,fontFamily:'var(--mono)'}}>
                {transcript}
              </div>
            )}

            <div className="an-flex g8">
              <button className="an-btn an-btn-ghost an-btn-sm" style={{gap:6}} onClick={handleDiscard}>
                <X size={12}/> Discard
              </button>
              <button className="an-btn an-btn-primary" style={{flex:1}} onClick={() => handleSubmit(editing ? editText : transcript)}>
                <CheckCircle size={14}/> Share this →
              </button>
            </div>
          </div>
        )}

        {submitting && (
          <div style={{textAlign:'center',padding:32}}>
            <div className="an-spin" style={{width:36,height:36,margin:'0 auto 12px'}}/>
            <div className="an-sub">Sending signals to your officer…</div>
          </div>
        )}
      </div>
      <TalkToSomeone />
    </div>
  );
}
