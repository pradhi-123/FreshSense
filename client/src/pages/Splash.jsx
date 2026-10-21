import React from 'react';
import { useAppBoot } from '../hooks/useAppBoot';
import GlowRing from '../components/splash/GlowRing';
import Embers from '../components/splash/Embers';
import BhashiniVirasatCycler from '../components/common/BhashiniVirasatCycler';
import './Splash.css';

export default function Splash() {
  const { statusText, isComplete, isExiting, skipBoot } = useAppBoot();

  return (
    <div
      className={`splash-page ${isExiting ? 'is-exiting' : ''}`}
      onClick={skipBoot}
      style={{ cursor: 'pointer' }}
    >
      {/* Background Embers */}
      <Embers count={22} />

      {/* Exit radial warm bloom layer */}
      <div className="splash-exit-bloom" />

      <main className="splash-content">
        {/* 1. Central Glowing Circle Ring with Official Logo Inside */}
        <div className="splash-loader-wrap">
          <GlowRing isComplete={isComplete} />
        </div>

        {/* 2. 22 Bhashini Language Fluctuations BELOW the Circle */}
        <div className="splash-bhashini-wrap">
          <BhashiniVirasatCycler intervalMs={380} variant="splash" />
        </div>

        {/* 3. Clean Status Line under text */}
        <div className="splash-status-wrap">
          <p className="splash-status-line" key={statusText}>
            {statusText}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--amber-400)', opacity: 0.8, marginTop: '8px', display: 'block' }}>
            Tap anywhere to enter →
          </span>
        </div>
      </main>
    </div>
  );
}
