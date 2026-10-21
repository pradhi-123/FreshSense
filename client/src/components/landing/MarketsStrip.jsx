import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarketsStrip() {
  const navigate = useNavigate();

  const markets = [
    { title: 'ONDC', desc: 'Open Network for Digital Commerce', route: '/artisan' },
    { title: 'GeM', desc: 'Government e-Marketplace API', route: '/orders' },
    { title: 'Your Own Storefront', desc: 'Direct Artisan Link & Karigar Pass', route: '/storefront' },
  ];

  return (
    <section
      style={{
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '60px 20px',
        margin: '0 0 90px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            color: 'var(--text-hi)',
            marginBottom: '32px',
          }}
        >
          List once. Sold everywhere.
        </h2>

        {/* 3 Glass Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {markets.map((m, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => navigate(m.route)}
              style={{
                padding: '16px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '220px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber-400)' }}>
                {m.title}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-lo)' }}>
                {m.desc}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', fontStyle: 'italic' }}>
          “Made-to-order, so there's no warehouse and no dead stock.”
        </p>
      </div>
    </section>
  );
}
