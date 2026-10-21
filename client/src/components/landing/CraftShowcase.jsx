import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CraftShowcase() {
  const navigate = useNavigate();

  const crafts = [
    {
      title: 'Handloom & Silk Weaving',
      region: 'Kanchipuram, Banaras & Chanderi',
      desc: 'Generational zari weaves and pure silk sarees brought directly to buyers.',
      tag: '🧵 Textiles',
    },
    {
      title: 'Pottery & Clay Art',
      region: 'Bankura, Khurja & Molela',
      desc: 'Terracotta sculptures and glazed blue pottery crafted on traditional wheels.',
      tag: '🏺 Terracotta',
    },
    {
      title: 'Folk & Tribal Painting',
      region: 'Madhubani, Warli & Gond',
      desc: 'Intricate storytelling painted with natural pigments on handmade canvas.',
      tag: '🎨 Fine Art',
    },
    {
      title: 'Dhokra & Bell Metal Craft',
      region: 'Bastar & Bikna',
      desc: '4,000-year-old lost-wax metal casting technique preserved by tribal karigars.',
      tag: '🗡️ Metalwork',
    },
    {
      title: 'Woodcarving & Toys',
      region: 'Saharanpur & Channapatna',
      desc: 'Hand-carved seasoned teak and lac-turned wooden heritage toys.',
      tag: '🪵 Woodcraft',
    },
    {
      title: 'Embossed Leather & Jute',
      region: 'Kolhapur & Shantiniketan',
      desc: 'Vegetable-tanned hand-stitched leatherware and woven jute crafts.',
      tag: '👝 Heritage Goods',
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
          🇮🇳 HERITAGE CLUSTERS
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-hi)', marginBottom: '12px' }}>
          Preserving India's Craft Lineages
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: '620px', margin: '0 auto' }}>
          From clay and silk to metal and wood — every craft holds a story waiting to reach global markets.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {crafts.map((craft, idx) => (
          <div
            key={idx}
            className="glass-card"
            onClick={() => navigate('/artisan')}
            style={{
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '16px',
              cursor: 'pointer',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 200, 130, 0.1)',
                  color: 'var(--amber-300)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                {craft.tag}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-hi)', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                {craft.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--amber-400)', fontWeight: 500, marginBottom: '10px' }}>
                📍 {craft.region}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.55 }}>
                {craft.desc}
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-lo)', fontStyle: 'italic', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
              Integrated with AI Cataloger & Karigar Pass
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
