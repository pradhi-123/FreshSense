import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import TalkToSomeone from '../components/TalkToSomeone.jsx';
import { Mic, MicOff, ChevronLeft, Type } from 'lucide-react';
import '../anahat.css';

const SLEEP_OPTS = [
  { val:'poor',  emoji:'😩', label:'Poor',  sub:'Under 4 hrs' },
  { val:'fair',  emoji:'😑', label:'Fair',  sub:'4 – 6 hrs' },
  { val:'good',  emoji:'😊', label:'Good',  sub:'6 – 8 hrs' },
  { val:'great', emoji:'💤', label:'Great', sub:'8 hrs +' },
];

const MAX_SECS = 60;

// Crisis phrase detection (front-end, before sending)
const CRISIS_PHRASES = ['want to die','end my life','kill myself','no point living','cannot go on','life is pointless'];
function detectCrisis(text) {
  const t = text.toLowerCase();
  return CRISIS_PHRASES.some(p => t.includes(p));
}

export default function P2Checkin() {
  const navigate = useNavigate();
  const { personnelId, language } = useAnahat();

  // Step: 0=sleep, 1=voice
  const [step, setStep] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(null);
  const [sleepHours, setSleepHours] = useState(null);

  // Voice step
  const [recording, setRecording] = useState(false);
  const [secs, setSecs]           = useState(0);
  const [bars, setBars]           = useState(Array(28).fill(4));
  const [showType, setShowType]   = useState(false);
  const [typedText, setTypedText] = useState('');
  const [crisis, setCrisis]       = useState(false);

  const timerRef   = useRef(null);
  const analyserRef= useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const chunksRef  = useRef([]);
  const recorderRef= useRef(null);
  const audioCtxRef= useRef(null);

  const stopAll = useCallback(() => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(()=>{}); audioCtxRef.current = null; }
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);

      const drawBars = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const newBars = Array(28).fill(0).map((_, i) => {
          const v = data[i % data.length] || 0;
          return Math.max(4, Math.round((v / 255) * 52));
        });
        setBars(newBars);
        rafRef.current = requestAnimationFrame(drawBars);
      };
      drawBars();

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        // Audio stays on device — we discard the blob, only transcript goes to server
        chunksRef.current = [];
      };
      recorder.start();

      setSecs(0);
      timerRef.current = setInterval(() => {
        setSecs(s => {
          if (s + 1 >= MAX_SECS) { stopRecording(); return MAX_SECS; }
          return s + 1;
        });
      }, 1000);

      setRecording(true);
    } catch (e) {
      alert('Microphone access denied. Please use "Type instead".');
      setShowType(true);
    }
  };

  const stopRecording = () => {
    stopAll();
    setRecording(false);
    setBars(Array(28).fill(4));
    // Navigate to processing with collected state
    goToProcessing();
  };

  const goToProcessing = () => {
    // Check crisis
    const text = typedText;
    if (detectCrisis(text)) { setCrisis(true); return; }
    // Save state to sessionStorage for P3
    sessionStorage.setItem('an_checkin', JSON.stringify({
      personnelId, language, sleepQuality,
      sleepHours: sleepHours || (sleepQuality==='poor'?3:sleepQuality==='fair'?5:sleepQuality==='good'?7:9),
      duration_s: secs || 20,
      typedText,
    }));
    navigate('/anahat/processing');
  };

  if (crisis) return (
    <div className="an-night an-fade">
      <div className="an-screen-center">
        <div style={{textAlign:'center',padding:24}}>
          <div style={{fontSize:40,marginBottom:16}}>🫂</div>
          <div className="an-h1 mb8" style={{color:'var(--lifeline)'}}>We hear you</div>
          <div className="an-sub mb24">What you just shared tells us you might be going through something very difficult right now. That takes courage to say.</div>
          <button className="an-btn an-btn-help an-btn-full mb12">
            <span>Call Tele-MANAS — 14416</span>
          </button>
          <button className="an-btn an-btn-ghost an-btn-full" onClick={() => setCrisis(false)}>
            Continue with check-in
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        <div className="an-topbar">
          <button className="an-btn-icon" style={{background:'transparent',border:'none'}} onClick={() => step===0?navigate('/anahat/home'):setStep(0)}>
            <ChevronLeft size={18} style={{color:'var(--mist)'}}/>
          </button>
          <div className="an-topbar-brand">CHECK-IN</div>
          <div className="an-topbar-sub">STEP {step+1}/2</div>
        </div>

        {/* Step indicator */}
        <div className="an-steps mb24">
          <div className={`an-step-dot ${step===0?'active':'done'}`}>{step>0?'✓':'1'}</div>
          <div className={`an-step-line${step>0?' done':''}`}/>
          <div className={`an-step-dot ${step===1?'active':'pending'}`}>2</div>
        </div>

        {/* STEP 0: Sleep */}
        {step === 0 && (
          <>
            <div className="an-h1 mb4">How did you sleep?</div>
            <div className="an-sub mb24">This helps your officer understand how you are managing. It takes 5 seconds.</div>
            <div className="an-grid2 g10 mb24">
              {SLEEP_OPTS.map(o => (
                <button key={o.val}
                  style={{
                    background: sleepQuality===o.val ? 'rgba(255,181,71,0.12)' : 'var(--panel)',
                    border: `2px solid ${sleepQuality===o.val ? 'var(--amber)' : 'var(--steel)'}`,
                    borderRadius:'var(--r-lg)', padding:'20px 12px', cursor:'pointer',
                    textAlign:'center', transition:'all 200ms',
                  }}
                  onClick={() => { setSleepQuality(o.val); setSleepHours(o.val==='poor'?3:o.val==='fair'?5:o.val==='good'?7:9); }}>
                  <div style={{fontSize:28,marginBottom:8}}>{o.emoji}</div>
                  <div style={{fontWeight:700,fontSize:14,color:'var(--frost)',marginBottom:2}}>{o.label}</div>
                  <div style={{fontSize:12,color:'var(--mist)'}}>{o.sub}</div>
                </button>
              ))}
            </div>
            <button className="an-btn an-btn-primary an-btn-full" disabled={!sleepQuality} onClick={() => setStep(1)}>
              Continue →
            </button>
          </>
        )}

        {/* STEP 1: Voice */}
        {step === 1 && (
          <>
            <div className="an-h1 mb4">{recording ? 'Listening…' : 'Speak freely'}</div>
            <div className="an-sub mb20">
              {recording
                ? 'Speak about how you are feeling. When you are done, tap the button again.'
                : `Tell me how things are going — work, family, sleep, anything on your mind. Speak in ${language==='ta'?'Tamil':language==='hi'?'Hindi':'English'}.`}
            </div>

            {!showType ? (
              <>
                {/* Waveform */}
                <div className="an-card" style={{padding:'24px 20px',marginBottom:20}}>
                  <div className={`an-waveform${recording?'':' idle'}`} style={{height:64}}>
                    {bars.map((h,i) => (
                      <div key={i} className="an-wave-bar" style={{height:h+'px',opacity:recording?1:0.3}}/>
                    ))}
                  </div>

                  {recording && (
                    <div style={{marginTop:16}}>
                      <div className="an-timer">{String(Math.floor(secs/60)).padStart(2,'0')}:{String(secs%60).padStart(2,'0')}</div>
                      <div className="an-timer-track">
                        <div className="an-timer-fill" style={{width:`${(secs/MAX_SECS)*100}%`}}/>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
                  <button className={`an-mic-btn${recording?' recording':''}`}
                    onClick={recording ? stopRecording : startRecording}>
                    {recording ? <MicOff size={28}/> : <Mic size={28}/>}
                  </button>
                </div>

                <div style={{textAlign:'center',marginBottom:20}}>
                  <div className="an-sub mb8">{recording ? `Tap to stop · ${MAX_SECS - secs}s left` : 'Tap the amber button to start'}</div>
                  {!recording && (
                    <button style={{background:'none',border:'none',color:'var(--mist)',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,margin:'0 auto'}}
                      onClick={() => setShowType(true)}>
                      <Type size={14}/> Type instead
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Type instead fallback */}
                <div className="an-info an-info-mist mb12" style={{fontSize:12}}>
                  Type what you would like to say. This will be processed the same way as speech.
                </div>
                <span className="an-label">Your message</span>
                <textarea
                  className="an-input mb16"
                  rows={6}
                  value={typedText}
                  onChange={e => setTypedText(e.target.value)}
                  placeholder={language==='ta'
                    ? 'நேத்து ராத்திரி தூக்கம் வரல. வீட்டை பத்தி கவலையா இருக்கு…'
                    : 'I could not sleep last night. I am worried about my family…'}
                />
                <div className="an-flex g8 mb12">
                  <button className="an-btn an-btn-ghost an-btn-sm" onClick={() => setShowType(false)}>← Use mic</button>
                  <button className="an-btn an-btn-primary" style={{flex:1}} disabled={!typedText.trim()} onClick={goToProcessing}>
                    Submit →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <TalkToSomeone />
    </div>
  );
}
