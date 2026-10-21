import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../common/BhashiniLanguageSwitcher';
import logoImg from '../../assets/virasat-logo.png';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 6, 4, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand logo */}
        <Link to="/welcome" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={logoImg}
            alt="Virasat logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Right: Language Pill & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Bhashini 22-Language Switcher */}
          <BhashiniLanguageSwitcher />

          {/* Get Started Button */}
          <button
            onClick={() => navigate('/artisan')}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
