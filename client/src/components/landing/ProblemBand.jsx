import React from 'react';

export default function ProblemBand() {
  const painPoints = [
    'Trade fairs bring sales for a few days, then it\'s quiet again.',
    'Language, digital skills and product photos get in the way of selling online.',
    'Nobody tells you what a fair price is.',
  ];

  return (
    <section
      style={{
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '70px 20px',
        margin: '40px 0 80px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        {/* Pitch Quote */}
        <blockquote
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            color: 'var(--amber-300)',
            fontStyle: 'italic',
            lineHeight: 1.35,
            marginBottom: '40px',
            position: 'relative',
          }}
        >
          “A hand's shape in the clay. A family's memory in the weave. Worth generations, priced for none of it.”
        </blockquote>

        {/* 3 Short Pain Points */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}
        >
          {painPoints.map((point, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <span
                style={{
                  color: 'var(--ember-500)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: '2px',
                }}
              >
                ✕
              </span>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-mid)', lineHeight: 1.5 }}>
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
