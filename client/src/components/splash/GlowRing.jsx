import React from 'react';
import virasatClipartImg from '../../assets/virasat-official-clipart.png';
import './GlowRing.css';

export default function GlowRing({ isComplete = false }) {
  return (
    <div className={`glow-ring-container ${isComplete ? 'is-complete' : ''}`} aria-label="Loading indicator">
      {/* Concentric Aura Ripple Rings */}
      <div className="aura-ring ring-1" />
      <div className="aura-ring ring-2" />
      <div className="aura-ring ring-3" />
      <div className="aura-ring ring-4" />

      {/* Main Spinning Light Sweep Ring */}
      <div className="glow-ring">
        <span className="glow-ring__sweep glow-ring__sweep--bloom" />
        <span className="glow-ring__sweep" />

        {/* Central Glowing Badge with Virasat Clipart Logo Inside */}
        <div className="glow-ring__center-badge">
          <img
            src={virasatClipartImg}
            alt="Virasat Logo"
            className="glow-ring__logo-img"
          />
        </div>
      </div>
    </div>
  );
}
