import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JourneyTimeline({ steps = [] }) {
  const navigate = useNavigate();

  return (
    <section
      id="how-it-works"
      style={{
        maxWidth: '1240px',
        margin: '0 auto 100px',
        padding: '0 20px',
        scrollMarginTop: '90px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
          From your hands to every market
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '560px', margin: '0 auto' }}>
          A 5-step journey built around the artisan's natural production rhythm.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          position: 'relative',
        }}
      >
        {steps.map((step, idx) => (
          <div
            key={step.order || idx}
            className="glass-card"
            onClick={() => navigate('/capture')}
            style={{
              padding: '24px 20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            {/* Step Number Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--amber-500), var(--ember-500))',
                  color: '#0e0804',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(245, 167, 66, 0.4)',
                }}
              >
                {step.order}
              </span>

              {/* Glowing Connection Dot */}
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--amber-300)',
                  boxShadow: '0 0 10px var(--amber-400)',
                }}
              />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)' }}>
              {step.title}
            </h3>

            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {step.points &&
                step.points.map((pt, pIdx) => (
                  <li
                    key={pIdx}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-mid)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: 'var(--amber-400)', fontSize: '0.75rem', marginTop: '3px' }}>•</span>
                    <span>{pt}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
