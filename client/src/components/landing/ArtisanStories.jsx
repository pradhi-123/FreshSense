import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArtisanStories() {
  const navigate = useNavigate();

  const stories = [
    {
      name: 'Ramu Karigar',
      craft: 'Silk Weaving',
      location: 'Kanchipuram, Tamil Nadu',
      exp: '28 Years Experience',
      quote:
        '“I can describe my weave in Tamil, and Virasat turns it into a catalog that buyers in Delhi and Mumbai understand. I no longer rely only on seasonal trade fairs.”',
    },
    {
      name: 'Sunita Devi',
      craft: 'Folk Painting',
      location: 'Madhubani, Bihar',
      exp: '14 Years Experience',
      quote:
        '“Pricing used to be a guess. Now Virasat gives me a fair price based on my labor hours and natural pigments. Customers respect the price because they see the story.”',
    },
    {
      name: 'Mangal Singh',
      craft: 'Dhokra Metal Craft',
      location: 'Bastar, Chhattisgarh',
      exp: '22 Years Experience',
      quote:
        '“My Dhokra art is live on ONDC and GeM without me ever leaving my village or filling complex online forms. One voice note is all it took.”',
    },
  ];

  return (
    <section style={{ maxWidth: '1240px', margin: '0 auto 100px', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 167, 66, 0.12)',
            border: '1px solid rgba(245, 167, 66, 0.25)',
            padding: '5px 14px',
            borderRadius: '16px',
            color: 'var(--amber-400)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          🗣️ ARTISAN VOICES
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
          Voices from the Workshop
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '580px', margin: '0 auto' }}>
          Real stories of artisans transforming voice notes into digital livelihoods.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {stories.map((s, idx) => (
          <div
            key={idx}
            className="glass-card"
            onClick={() => navigate('/storefront')}
            style={{
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '20px',
              cursor: 'pointer',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                color: 'var(--amber-300)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {s.quote}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingTop: '16px',
                borderTop: '1px solid var(--glass-border)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--amber-500), var(--ember-500))',
                  color: '#0e0804',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.name[0]}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)' }}>
                  {s.name}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                  {s.craft} · {s.location}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--amber-400)', fontWeight: 500 }}>
                  {s.exp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
