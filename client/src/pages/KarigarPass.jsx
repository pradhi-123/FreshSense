import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import passCardImg from '../assets/karigar-pass-card.jpg';
import './KarigarPass.css';

export default function KarigarPass() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [profile] = useState(() => {
    try {
      const saved = localStorage.getItem('virasat_artisan_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Profile read error:', e);
    }
    return { name: 'Rameshwari Devangan', craft: 'Kosa Silk Weaving', village: 'Champa, Chhattisgarh' };
  });

  const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const passUrl = `https://virasat.artisan/k/${slug}`;

  return (
    <div className="karigar-pass-page screen-night is-night">
      {/* Top Header */}
      <header className="pass-top-bar">
        {/* Left side: Back button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="pass-back-btn" onClick={() => navigate('/artisan')}>
            ← {t('back') || 'Back'}
          </button>
          <span className="pass-brand-title">VERIFIED DIGITAL KARIGAR PASS (S8)</span>
        </div>

        {/* Right side: Bhashini Language Switcher Globe */}
        <BhashiniLanguageSwitcher />
      </header>

      {/* Main Digital Certificate Card (Rameshwari Devangan Pass) */}
      <main className="pass-certificate-stage">
        <div className="pass-card-container">
          <img
            src={passCardImg}
            alt="Rameshwari Devangan Digital Karigar Pass"
            className="official-pass-img"
          />

          {/* Footer Action Stack */}
          <div className="pass-card-actions">
            <button
              type="button"
              className="pass-share-btn"
              onClick={() => {
                navigator.clipboard?.writeText(passUrl);
                alert(`Karigar Pass URL copied to clipboard: ${passUrl}`);
              }}
            >
              📲 WhatsApp Share Link
            </button>
            <button
              type="button"
              className="pass-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print Pass Card
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

