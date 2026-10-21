import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnahat } from '../AnahatContext.jsx';
import { setConsent } from '../api.js';
import { Shield, Mic, Eye, ToggleRight } from 'lucide-react';
import '../anahat.css';

const LANGS = [
  { code:'ta', script:'த', name:'Tamil', native:'தமிழ்' },
  { code:'hi', script:'हि', name:'Hindi', native:'हिन्दी' },
  { code:'en', script:'En', name:'English', native:'English' },
];

const PRIVACY_CARDS = [
  {
    icon: <Mic size={20}/>,
    title: 'Your voice stays on your phone',
    body: 'Audio is processed here. Only topics and tone signals — no recording — reach the server. The temporary file is deleted the moment processing ends.',
  },
  {
    icon: <Shield size={20}/>,
    title: 'You are a pseudonym, not a name',
    body: 'Your officer sees "Personnel 017" — never your real name. Signals are shared only with your welfare officer, for welfare purposes only, never discipline.',
  },
  {
    icon: <Eye size={20}/>,
    title: 'You control what is shared',
    body: 'You can see exactly what was shared, pause sharing at any time, or withdraw consent entirely. Withdrawing stops all future sharing.',
  },
];

export default function P0Consent() {
  const navigate = useNavigate();
  const { personnelId, setConsent: setCtxConsent, setLanguage } = useAnahat();
  const [lang, setLang] = useState('ta');
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0); // 0=language, 1=privacy cards, 2=confirm

  const handleConfirm = async () => {
    if (!agreed) return;
    setSaving(true);
    try {
      await setConsent(personnelId, true);
      setLanguage(lang);
      setCtxConsent(true);
      navigate('/anahat/home');
    } catch { setSaving(false); }
  };

  return (
    <div className="an-night an-fade">
      <div className="an-screen">
        {/* Topbar */}
        <div className="an-topbar">
          <div className="an-topbar-brand">ANAHAT</div>
          <div className="an-topbar-sub">STEP {step + 1} OF 3</div>
        </div>

        {step === 0 && (
          <>
            <div className="an-h1 mb4">Choose your language</div>
            <div className="an-sub mb24">Pick the language you want to speak in. You will hear a short prompt before each check-in.</div>
            <div className="an-flex-col g10 mb24">
              {LANGS.map(l => (
                <button key={l.code} className={`an-lang-card${lang===l.code?' selected':''}`} onClick={() => setLang(l.code)}>
                  <div className="an-lang-script">{l.script}</div>
                  <div>
                    <div className="an-lang-name">{l.name}</div>
                    <div className="an-lang-native">{l.native}</div>
                  </div>
                  {lang===l.code && <div style={{marginLeft:'auto',color:'var(--amber)',fontSize:18}}>✓</div>}
                </button>
              ))}
            </div>
            <button className="an-btn an-btn-primary an-btn-full" onClick={() => setStep(1)}>
              Continue →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="an-h1 mb4">Before you begin</div>
            <div className="an-sub mb20">Three things you should know. Please read each one.</div>
            {PRIVACY_CARDS.map((c, i) => (
              <div key={i} className="an-privacy-card mb12">
                <div className="an-privacy-card-icon">{c.icon}</div>
                <div className="an-h3 mb6">{c.title}</div>
                <div className="an-sub">{c.body}</div>
              </div>
            ))}
            <div className="an-flex g10 mt8 mb20" style={{alignItems:'flex-start'}}>
              <label className="an-toggle">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>
                <div className="an-toggle-slider"/>
              </label>
              <div className="an-sub" style={{lineHeight:1.5}}>I understand and I want to opt in. I know I can withdraw at any time.</div>
            </div>
            <div className="an-flex g10">
              <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={() => setStep(0)}>Back</button>
              <button className="an-btn an-btn-primary" style={{flex:2}} onClick={() => setStep(2)} disabled={!agreed}>Continue →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="an-h1 mb4">Ready</div>
            <div className="an-sub mb28">Your first check-in takes about 2 minutes. You will speak for 60 seconds — or less, if you want. There are no right or wrong answers.</div>
            <div className="an-card mb20">
              <div className="an-label mb8">Language selected</div>
              <div className="an-h2">{LANGS.find(l=>l.code===lang)?.name} · {LANGS.find(l=>l.code===lang)?.native}</div>
            </div>
            <div className="an-info an-info-lifeline mb20">
              <ToggleRight size={14} style={{flexShrink:0,marginTop:2}}/>
              <span>You can change this in My Data at any time.</span>
            </div>
            <div className="an-flex g10">
              <button className="an-btn an-btn-ghost" style={{flex:1}} onClick={() => setStep(1)}>Back</button>
              <button className="an-btn an-btn-primary" style={{flex:2}} onClick={handleConfirm} disabled={saving}>
                {saving ? 'Saving…' : 'Start my check-in →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
