import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import { useLitThread } from '../hooks/useLitThread';
import { useLanguage } from '../context/LanguageContext';
import { loginUser } from '../api/auth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    progress,
    stage,
    isError,
    errorMessage,
    updateProgress,
    triggerError,
    triggerSuccessSequence,
  } = useLitThread();

  const handleSubmitAuth = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      if (res && res.ok) {
        // Trigger emblem single breath + 300ms calm route cross-fade
        triggerSuccessSequence(() => {
          navigate('/artisan', { replace: true });
        });
      } else {
        // Trigger quiet 200ms emblem dim & soft text
        triggerError(res?.message || 'Incorrect email or password.');
      }
    } catch (err) {
      triggerError('Incorrect email or password.');
    }
  };

  return (
    <div className={`lit-thread-page ${stage === 'success' ? 'is-route-crossfade' : ''}`}>
      {/* Quiet Top Bar */}
      <header className="quiet-top-bar">
        <div className="quiet-brand-logo">
          <span className="brand-dot-gold" />
          <span className="brand-text-quiet">VIRASAT</span>
        </div>
        <BhashiniLanguageSwitcher />
      </header>

      {/* Main Centered Single-Column Workspace */}
      <main className="quiet-centered-main">
        <LoginForm
          progress={progress}
          stage={stage}
          isError={isError}
          errorMessage={errorMessage}
          onTyping={updateProgress}
          onSubmitAuth={handleSubmitAuth}
          isSubmitting={stage === 'breath' || stage === 'success'}
        />
      </main>
    </div>
  );
}
