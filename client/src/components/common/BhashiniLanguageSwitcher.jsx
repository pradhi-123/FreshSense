import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import './BhashiniLanguageSwitcher.css';

export default function BhashiniLanguageSwitcher({ className = '' }) {
  const { langCode, setLangCode, currentLangObj, bhashiniLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (code) => {
    setLangCode(code);
    setIsOpen(false);
  };

  const modalContent = isOpen ? (
    <div className="bhashini-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="bhashini-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="bhashini-modal-header">
          <div className="bhashini-header-title">
            <span className="bhashini-brand-glow">BHASHINI AI</span>
            <h3>{t('selectLanguage')}</h3>
          </div>
          <button
            type="button"
            className="bhashini-modal-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close language selector"
          >
            ✕
          </button>
        </header>

        <div className="bhashini-lang-grid">
          {bhashiniLanguages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`bhashini-lang-chip ${item.code === langCode ? 'is-active' : ''}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="lang-chip-script">{item.script}</span>
              <span className="lang-chip-name">{item.lang}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`bhashini-switcher-wrap ${className}`}>
      <button
        type="button"
        className="bhashini-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Language"
        aria-expanded={isOpen}
        title={`Select Language (${currentLangObj.lang})`}
      >
        <span className="switcher-icon">🌐</span>
      </button>

      {modalContent && ReactDOM.createPortal(modalContent, document.body)}
    </div>
  );
}
