import React from 'react';
import { useNavigate } from 'react-router-dom';
import BhashiniVirasatCycler from '../common/BhashiniVirasatCycler';
import logoImg from '../../assets/virasat-logo.png';

export default function Hero() {
  const navigate = useNavigate();

  const handleScrollToJourney = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      style={{
        padding: '60px 20px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        alignItems: 'center',
      }}
    >
      {/* Left Column: Text, Bhashini Cycler & CTAs */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 167, 66, 0.1)',
            border: '1px solid rgba(245, 167, 66, 0.25)',
            padding: '6px 14px',
            borderRadius: '20px',
            color: 'var(--amber-400)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          <span>🪔</span> ONE LAMP, ONE NEW DAWN
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            color: 'var(--text-hi)',
            marginBottom: '14px',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          Take a photo. <br />
          <span style={{ color: 'var(--amber-400)' }}>Say a few words.</span> <br />
          Start selling.
        </h1>

        {/* Dynamic 22 Bhashini Language Cycler for VIRASAT */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '16px 0 24px' }}>
          <BhashiniVirasatCycler intervalMs={450} variant="hero" />
        </div>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'var(--text-mid)',
            maxWidth: '540px',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          Virasat turns a phone and a voice note into a listing that tells your story, prices your worth, and reaches every market, from ONDC to GeM, at your own pace.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <button onClick={() => navigate('/artisan')} className="btn-primary">
            Get started
            <span style={{ fontSize: '1.1rem' }}>→</span>
          </button>
          <button onClick={handleScrollToJourney} className="btn-secondary">
            See how it works
          </button>
        </div>
      </div>

      {/* Right Column: Phone Mockup listing card */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            borderRadius: '36px',
            padding: '12px',
            background: 'linear-gradient(145deg, #24160d, #120a06)',
            border: '1px solid rgba(255, 200, 130, 0.22)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(245, 167, 66, 0.15)',
          }}
        >
          {/* Phone Screen Frame */}
          <div
            style={{
              background: '#0e0805',
              borderRadius: '26px',
              padding: '16px',
              border: '1px solid rgba(255, 200, 130, 0.12)',
            }}
          >
            {/* Phone Notch & Status Bar */}
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '0 4px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-lo)', fontWeight: 600 }}>9:41</span>
              <div
                style={{
                  width: '60px',
                  height: '14px',
                  background: '#040201',
                  borderRadius: '10px',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--amber-400)' }}>⚡ 5G</span>
            </div>

            {/* Listing Preview Card */}
            <div
              className="glass-card"
              style={{
                padding: '12px',
                background: 'rgba(255, 214, 160, 0.04)',
                border: '1px solid rgba(255, 200, 130, 0.18)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '170px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                <img
                  src={logoImg}
                  alt="Craft preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.9)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(10, 6, 4, 0.85)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    color: 'var(--amber-300)',
                    fontWeight: 600,
                  }}
                >
                  ✨ AI Studio Ready
                </div>
              </div>

              <h4
                style={{
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-hi)',
                  marginBottom: '4px',
                }}
              >
                Handwoven Kanjivaram Silk Saree
              </h4>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', marginBottom: '10px', lineHeight: '1.4' }}>
                Natural Zari weave · Crafted by Karigar Ramu, Kanchipuram
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: 'rgba(245, 167, 66, 0.12)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }}>Fair Price</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--amber-400)' }}>₹ 4,800</span>
              </div>

              <button
                onClick={() => navigate('/capture')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, var(--amber-500), var(--ember-500))',
                  color: '#0e0804',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                1-Tap Approve & Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
