import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThreadEmblem from './ThreadEmblem';
import BhashiniVoiceTranscriber from '../common/BhashiniVoiceTranscriber';
import { useLanguage } from '../../context/LanguageContext';
import './LoginForm.css';

export default function LoginForm({
  progress = 0,
  stage = 'idle',
  isError = false,
  errorMessage = '',
  onTyping,
  onSubmitAuth,
  isSubmitting,
}) {
  const { t } = useLanguage();

  const role = 'artisan';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    setIdentifier(val);
    onTyping(val.length, password.length);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    onTyping(identifier.length, val.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmitAuth({ role: 'artisan', identifier, password });
  };

  return (
    <div className="lit-thread-login-form">
      {/* 1. Thread Emblem Seal (Above Form) */}
      <ThreadEmblem progress={progress} stage={stage} isError={isError} />

      {/* 2. Eyebrow */}
      <span className="form-eyebrow-quiet">{t('welcomeBack') || 'Karigar Access Portal'}</span>

      {/* 3. Headline */}
      <h1 className="form-headline-quiet">{t('stepInside') || 'Step Into Virasat'}</h1>

      {/* 4. Muted Sub-text */}
      <p className="form-subtext-quiet">{t('craftWaiting') || 'Publish your authentic handloom craft to national ONDC & GeM markets'}</p>

      {/* Form Element */}
      <form onSubmit={handleSubmit} className="form-fields-stack">
        {/* Identifier Field (Email/Phone) */}
        <div className="quiet-field-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="identifier-input" className="quiet-field-label">
              {t('identifierLabel')}
            </label>
            <button
              type="button"
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              style={{ background: 'none', border: 'none', color: '#8A6320', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              title="Dictate via voice in native language"
            >
              🎙️ {showVoiceInput ? 'Hide Voice' : 'Voice Input'}
            </button>
          </div>
          <div className={`quiet-input-box ${focusedField === 'identifier' ? 'is-focused' : ''}`}>
            <input
              id="identifier-input"
              type="text"
              className="quiet-field-input"
              value={identifier}
              onChange={handleIdentifierChange}
              onFocus={() => setFocusedField('identifier')}
              onBlur={() => setFocusedField(null)}
              placeholder={t('identifierPlaceholder')}
              required
              autoComplete="username"
            />
          </div>

          {showVoiceInput && (
            <div style={{ marginTop: '10px' }}>
              <BhashiniVoiceTranscriber
                sectionTitle="Voice Sign-In (BHASHINI AI)"
                placeholder="Speak your phone number or name in your native language (e.g. 9876543210 / Rameshwari)..."
                onInsertText={(recognizedText) => {
                  setIdentifier(recognizedText);
                  onTyping(recognizedText.length, password.length);
                  setShowVoiceInput(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="quiet-field-group">
          <label htmlFor="password-input" className="quiet-field-label">
            {t('passwordLabel')}
          </label>
          <div className={`quiet-input-box quiet-pass-box ${focusedField === 'password' ? 'is-focused' : ''}`}>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              className="quiet-field-input"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder={t('passwordPlaceholder')}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="quiet-eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="quiet-forgot-row">
          <Link to="/artisan" className="quiet-forgot-link">
            {t('forgotWayIn')}
          </Link>
        </div>

        {/* Primary Solid Flat Button */}
        <button
          type="submit"
          className="quiet-solid-primary-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-loading-dot-spinner" />
          ) : (
            <span>{t('openDoorBtn')}</span>
          )}
        </button>

        {/* Soft Inline Error Line */}
        {errorMessage && (
          <p className="quiet-error-line" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Thin Divider */}
        <div className="quiet-divider-row">
          <span className="divider-line" />
          <span className="divider-text">{t('orDivider')}</span>
          <span className="divider-line" />
        </div>

        {/* Secondary Plain Link linking directly to Voice Onboarding */}
        <div className="quiet-register-row">
          <Link to="/onboarding" className="quiet-register-link" style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--gold-deep, #8A6320)' }}>
            🎙️ {t('registerCraft') || 'New here? Register your craft (Voice Onboarding)'}
          </Link>
        </div>
      </form>

      {/* Footer */}
      <footer className="quiet-form-footer">
        <span className="quiet-footer-text">{t('trustLine')}</span>
      </footer>
    </div>
  );
}
