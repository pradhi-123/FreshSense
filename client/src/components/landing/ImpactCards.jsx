import React from 'react';

export default function ImpactCards({ impact = [] }) {
  return (
    <section style={{ maxWidth: '1240px', margin: '0 auto 100px', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
          Why it matters
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto' }}>
          Restoring economic dignity and market visibility to millions of marginalized artisans.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {impact.map((card, idx) => (
          <div
            key={card.order || idx}
            className="glass-card"
            style={{
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--amber-400)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              0{card.order || idx + 1} IMPACT
            </div>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)' }}>
              {card.heading}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
