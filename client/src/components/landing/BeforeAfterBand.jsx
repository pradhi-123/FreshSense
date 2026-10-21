import React from 'react';

export default function BeforeAfterBand() {
  const traditional = [
    'Dependent on temporary 3-day trade fairs',
    'Language barriers prevent online selling',
    'Middlemen set prices without labor transparency',
    'No proof of authenticity against mass replicas',
    'Orders delayed due to strict warehouse caps',
  ];

  const virasat = [
    'Continuous 24/7 digital storefront nationwide',
    'Speak naturally in 22 regional Indian languages',
    'Dynamic fair price based on craft lineage & labor hours',
    'QR-linked Karigar Pass certifying handmade provenance',
    'Made-to-order mode aligned to artisan rhythm',
  ];

  return (
    <section
      style={{
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '70px 20px',
        margin: '0 0 100px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
            The Virasat Difference
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto' }}>
            Removing the technical barrier while honoring the artisan's craft skill.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Traditional Card */}
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              borderColor: 'rgba(224, 103, 43, 0.25)',
              background: 'rgba(20, 10, 6, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.4rem' }}>❌</span>
              <h3 style={{ fontSize: '1.35rem', color: '#f3a484', fontFamily: 'var(--font-display)' }}>
                Traditional Barrier
              </h3>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {traditional.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-mid)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#e0672b', fontWeight: 700 }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Virasat Solution Card */}
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              borderColor: 'rgba(255, 200, 130, 0.4)',
              background: 'rgba(255, 214, 160, 0.08)',
              boxShadow: '0 0 30px rgba(245, 167, 66, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.4rem' }}>🪔</span>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--amber-300)', fontFamily: 'var(--font-display)' }}>
                The Virasat Dawn
              </h3>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {virasat.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-hi)', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: 'var(--amber-400)', fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
