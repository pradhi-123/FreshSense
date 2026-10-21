import React from 'react';
import { useNavigate } from 'react-router-dom';

const icons = {
  camera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  mic: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  feather: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13v5h5l9.76-9.76z"/>
      <line x1="16" y1="8" x2="2" y2="22"/>
      <line x1="17.5" y1="15" x2="9" y2="15"/>
    </svg>
  ),
  rupee: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12"/>
      <path d="M6 8h12"/>
      <path d="M6 13h7"/>
      <path d="M6 8c4 0 7 2 7 5 0 4-4 7-7 8"/>
      <line x1="13" y1="13" x2="19" y2="21"/>
    </svg>
  ),
  qr: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <path d="M14 14h3v3h-3z"/>
      <path d="M18 18h3v3h-3z"/>
      <path d="M14 18h3v3h-3z"/>
      <path d="M18 14h3v3h-3z"/>
    </svg>
  ),
  store: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  box: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

export default function FeatureGrid({ features = [] }) {
  const navigate = useNavigate();

  const getRouteForIcon = (iconKey) => {
    switch (iconKey) {
      case 'qr':
        return '/karigar-pass';
      case 'store':
        return '/welcome';
      case 'box':
      case 'chart':
        return '/artisan';
      default:
        return '/capture';
    }
  };

  return (
    <section style={{ maxWidth: '1240px', margin: '0 auto 90px', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
          Virasat, start to sale
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto' }}>
          Everything an artisan needs to go from a voice note to a nationwide storefront.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {features.map((feature) => (
          <div
            key={feature.key || feature.order}
            className="glass-card"
            onClick={() => navigate(getRouteForIcon(feature.iconKey))}
            style={{
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(245, 167, 66, 0.12)',
                border: '1px solid rgba(245, 167, 66, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icons[feature.iconKey] || icons.camera}
            </div>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)' }}>
              {feature.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.55 }}>
              {feature.tagline}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
