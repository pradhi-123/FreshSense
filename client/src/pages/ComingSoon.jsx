import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/virasat-logo.png';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-0)',
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, #2a1709 0%, #0a0604 68%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '40px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <img
          src={logoImg}
          alt="Virasat logo"
          style={{ width: '180px', height: 'auto', marginBottom: '8px' }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 167, 66, 0.12)',
            border: '1px solid rgba(245, 167, 66, 0.25)',
            padding: '4px 12px',
            borderRadius: '16px',
            color: 'var(--amber-400)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          ✨ VIRASAT MODULE NAVIGATOR
        </div>

        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)' }}>
          Explore Live Virasat Modules
        </h1>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
          Select any of the live, functional prototype modules below to navigate instantly:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginTop: '8px' }}>
          <button onClick={() => navigate('/artisan')} className="btn-secondary" style={{ padding: '10px 8px', fontSize: '0.82rem' }}>
            🏪 Artisan Hub
          </button>
          <button onClick={() => navigate('/capture')} className="btn-primary" style={{ padding: '10px 8px', fontSize: '0.82rem' }}>
            📸 Photo & Voice Studio
          </button>
          <button onClick={() => navigate('/karigar-pass')} className="btn-secondary" style={{ padding: '10px 8px', fontSize: '0.82rem' }}>
            🪪 Karigar Pass
          </button>
          <button onClick={() => navigate('/welcome')} className="btn-secondary" style={{ padding: '10px 8px', fontSize: '0.82rem' }}>
            🌐 Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}
