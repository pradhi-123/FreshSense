import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        background: 'var(--bg-0)',
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '60px',
        paddingBottom: '40px',
      }}
    >
      {/* Closing CTA */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto 60px',
          padding: '0 20px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            color: 'var(--text-hi)',
            marginBottom: '20px',
          }}
        >
          Your craft has waited long enough.
        </h2>
        <button onClick={() => navigate('/artisan')} className="btn-primary">
          Get started
        </button>
      </div>

      {/* Footer Info */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '30px 20px 0',
          borderTop: '1px solid rgba(255, 200, 130, 0.08)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.82rem',
          color: 'var(--text-lo)',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--text-mid)' }}>Virasat · Team Lucid Approach</p>
        <p>Smart India Hackathon 2026 · Problem Statement SIH26090 · Heritage & Culture</p>
        <p style={{ opacity: 0.75 }}>Prototype build. Not a live marketplace.</p>
      </div>
    </footer>
  );
}
