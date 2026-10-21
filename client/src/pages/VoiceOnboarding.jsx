import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import BhashiniVoiceTranscriber from '../components/common/BhashiniVoiceTranscriber';
import { useLanguage } from '../context/LanguageContext';
import './VoiceOnboarding.css';

export default function VoiceOnboarding() {
  const navigate = useNavigate();
  const { t, currentLangObj } = useLanguage();

  const [step, setStep] = useState(1);
  const [showVoiceTranscriber, setShowVoiceTranscriber] = useState(true);

  const [form, setForm] = useState({
    name: '',
    craft: '',
    village: '',
    daysPerPiece: '12',
    consentPublic: true,
  });

  const questions = [
    {
      id: 1,
      title: 'Question 1: What is your name?',
      key: 'name',
      placeholder: 'Speak or type your full name (e.g. Rameshwari Devangan / रामेश्वरी देवांगन)...',
      hint: 'Your name will be displayed in your native script on your Digital Karigar Pass.',
      sampleAnswer: 'Rameshwari Devangan',
    },
    {
      id: 2,
      title: 'Question 2: What is your craft tradition?',
      key: 'craft',
      placeholder: 'Speak or type your craft (e.g. Kosa Silk Weaving / कोसा सिल्क बुनाई)...',
      hint: 'Tell us the heritage craft passed down in your family.',
      sampleAnswer: 'Kosa Silk Weaving',
    },
    {
      id: 3,
      title: 'Question 3: What is your village or town?',
      key: 'village',
      placeholder: 'Speak or type your location (e.g. Champa, Chhattisgarh / चांपा, छत्तीसगढ़)...',
      hint: 'We only display your town/village and state, never your full home address.',
      sampleAnswer: 'Champa, Chhattisgarh',
    },
    {
      id: 4,
      title: 'Question 4: How many days does one piece take?',
      key: 'daysPerPiece',
      placeholder: 'Speak or type the number of days (e.g. 12 days / 12 दिन)...',
      hint: 'Used to calculate your monthly capacity and fair pricing formula.',
      sampleAnswer: '12',
    },
  ];

  const currentQ = questions[step - 1];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save onboarding profile and proceed
      localStorage.setItem('virasat_artisan_profile', JSON.stringify(form));
      navigate('/artisan');
    }
  };

  return (
    <div className="onboarding-page">
      {/* Header */}
      <header className="onboarding-top-bar">
        <div className="onboarding-title-group">
          <span className="onboarding-step-badge">STEP {step} OF 4</span>
          <h1 className="onboarding-header-title">Karigar Voice Onboarding</h1>
        </div>
        <BhashiniLanguageSwitcher />
      </header>

      {/* Step Selector Pills for Quick Navigation */}
      <div className="onboarding-step-pills">
        {questions.map((q) => (
          <button
            key={q.id}
            type="button"
            className={`step-pill ${step === q.id ? 'is-active' : ''}`}
            onClick={() => setStep(q.id)}
          >
            Q{q.id}: {q.key === 'name' ? 'Name' : q.key === 'craft' ? 'Craft' : q.key === 'village' ? 'Village' : 'Review'}
          </button>
        ))}
      </div>

      <main className="onboarding-card-stage">
        <div className="onboarding-card">
          <span className="q-eyebrow">SCREEN S1 — QUESTION {step} OF 4</span>
          <h2 className="q-title">{currentQ.title}</h2>
          <p className="q-hint">{currentQ.hint}</p>

          {/* Form Direct Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary, #6B5E52)', marginBottom: '6px' }}>
              Your Answer ({currentQ.key.toUpperCase()}):
            </label>
            <input
              type="text"
              className="transcription-input"
              value={form[currentQ.key]}
              onChange={(e) => setForm({ ...form, [currentQ.key]: e.target.value })}
              placeholder={currentQ.placeholder}
              style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', borderRadius: '10px', border: '1.5px solid var(--border-subtle, #E6DDD0)' }}
            />
          </div>

          {/* Multilingual BHASHINI AI Voice Transcriber Component */}
          <div className="voice-input-wrapper" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--gold-deep, #8A6320)' }}>
                🎙️ Speak in your native language (BHASHINI Auto-Detect)
              </span>
              <button
                type="button"
                onClick={() => setShowVoiceTranscriber(!showVoiceTranscriber)}
                style={{ background: 'none', border: 'none', color: '#8A6320', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                {showVoiceTranscriber ? 'Collapse Voice Module' : 'Expand Voice Module'}
              </button>
            </div>

            {showVoiceTranscriber && (
              <BhashiniVoiceTranscriber
                sectionTitle={`Voice Recognition for ${currentQ.title}`}
                placeholder={`Speak your ${currentQ.key} in Tamil, Hindi, Telugu, Assamese, Bengali, Malayalam, Kannada, etc...`}
                onInsertText={(recognizedText) => {
                  setForm((prev) => ({ ...prev, [currentQ.key]: recognizedText }));
                }}
              />
            )}
          </div>

          {/* Question Summary Review at Step 4 */}
          {step === 4 && (
            <div className="onboarding-summary-review" style={{ marginTop: '20px' }}>
              <span className="summary-title">📋 Summary of Your Spoken Onboarding Answers:</span>
              <ul className="summary-list">
                <li><strong>Name:</strong> {form.name || '(Empty - speak or type)'}</li>
                <li><strong>Craft:</strong> {form.craft || '(Empty - speak or type)'}</li>
                <li><strong>Village/Town:</strong> {form.village || '(Empty - speak or type)'}</li>
                <li><strong>Pace (Days per piece):</strong> {form.daysPerPiece || '12'} days</li>
              </ul>

              <div className="consent-box-row">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={form.consentPublic}
                    onChange={(e) => setForm({ ...form, consentPublic: e.target.checked })}
                  />
                  <span>
                    I consent to display my name, village, and craft on my public Digital Karigar Pass.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="onboarding-nav-stack" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="gold-next-btn"
              onClick={handleNext}
            >
              {step === 4 ? '✓ Complete Onboarding & Enter Dashboard' : 'Next Question →'}
            </button>

            {step > 1 && (
              <button
                type="button"
                className="back-step-btn"
                onClick={() => setStep(step - 1)}
              >
                ← Go Back to Question {step - 1}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

