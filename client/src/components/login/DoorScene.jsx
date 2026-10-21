import React from 'react';
import Embers from '../splash/Embers';
import { useLanguage } from '../../context/LanguageContext';
import './DoorScene.css';

export default function DoorScene({
  doorProgress = 0,
  isFocused = false,
  isSubmitting = false,
  isError = false,
  isOpen = false,
}) {
  const { t } = useLanguage();

  // Effective seam brightness calculation
  let seamOpacity = Math.max(doorProgress * 0.95, isFocused ? 0.35 : 0);
  if (isSubmitting) seamOpacity = 1.0;

  return (
    <div className={`door-scene-viewport ${isOpen ? 'is-door-open' : ''} ${isError ? 'is-door-stuck' : ''}`}>
      {/* Background Embers */}
      <Embers count={16} />

      {/* Warm Room Interior Glow behind Door */}
      <div className="room-interior-light" style={{ opacity: Math.max(0.15, seamOpacity * 0.9) }} />

      {/* 3D Door Perspective Wrapper */}
      <div className="door-3d-stage">
        {/* Carved Wooden Door Frame & Panels */}
        <div className="carved-door-container">
          {/* Left Door Panel (Hinged Left for 3D Swing) */}
          <div className="door-panel door-panel-left">
            <svg
              className="door-svg-artwork"
              viewBox="0 0 340 540"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="doorWoodGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2e170c" />
                  <stop offset="50%" stopColor="#241209" />
                  <stop offset="100%" stopColor="#1a0d05" />
                </linearGradient>

                <linearGradient id="doorPanelInner" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1c0e06" />
                  <stop offset="100%" stopColor="#120803" />
                </linearGradient>

                <filter id="seamGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="handleHotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {/* Main Left Wood Panel Surface */}
              <rect x="10" y="10" width="320" height="520" rx="12" fill="url(#doorWoodGradLeft)" stroke="#3d2112" strokeWidth="3" />

              {/* Top Carved Petal Panel Recess */}
              <rect x="30" y="30" width="280" height="220" rx="10" fill="url(#doorPanelInner)" stroke="#3a1e0f" strokeWidth="2" />
              
              {/* Petal Motif Carvings (Virasat Emblem Petal Shapes) */}
              <path
                d="M 170 60 C 120 100 100 150 170 210 C 240 150 220 100 170 60 Z"
                fill="#2a1409"
                stroke="#4a2815"
                strokeWidth="1.5"
              />
              <path
                d="M 170 85 C 138 115 125 150 170 190 C 215 150 202 115 170 85 Z"
                fill="#1f0d05"
              />

              {/* Bottom Carved Panel Recess */}
              <rect x="30" y="270" width="280" height="240" rx="10" fill="url(#doorPanelInner)" stroke="#3a1e0f" strokeWidth="2" />
              
              {/* Lower Traditional Arch Carvings */}
              <path
                d="M 60 480 L 60 350 C 60 300 280 300 280 350 L 280 480 Z"
                fill="none"
                stroke="#3d1f0e"
                strokeWidth="2"
              />

              {/* Dynamic Amber Seam Lines (Glows along carved panel lines as user types) */}
              <g
                className={`door-amber-seams ${isSubmitting ? 'is-flaring' : ''}`}
                style={{ opacity: seamOpacity }}
                filter="url(#seamGlowFilter)"
              >
                {/* Panel Frame Glowing Seams */}
                <rect x="10" y="10" width="320" height="520" rx="12" fill="none" stroke="#FFBB5C" strokeWidth="2.5" />
                <rect x="30" y="30" width="280" height="220" rx="10" fill="none" stroke="#FFA726" strokeWidth="2" strokeDasharray="14 6" />
                <rect x="30" y="270" width="280" height="240" rx="10" fill="none" stroke="#FFA726" strokeWidth="2" strokeDasharray="14 6" />

                {/* Carved Petal Glowing Lines */}
                <path
                  d="M 170 60 C 120 100 100 150 170 210 C 240 150 220 100 170 60 Z"
                  fill="none"
                  stroke="#FFC107"
                  strokeWidth="2"
                />
                <path
                  d="M 170 85 C 138 115 125 150 170 190 C 215 150 202 115 170 85 Z"
                  fill="none"
                  stroke="#FFE082"
                  strokeWidth="1.5"
                />
                <path
                  d="M 60 480 L 60 350 C 60 300 280 300 280 350 L 280 480 Z"
                  fill="none"
                  stroke="#FF9800"
                  strokeWidth="2"
                />
              </g>
            </svg>

            {/* Diya Shaped Brass Handle in Center */}
            <div className={`door-diya-handle ${isSubmitting ? 'is-hot-glow' : ''}`}>
              <svg className="diya-handle-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Brass Diya Base */}
                <path d="M 10 24 C 10 24 14 31 20 31 C 26 31 30 24 30 24 Z" fill="#b87333" stroke="#ffd08a" strokeWidth="1" />
                <path d="M 17 31 L 23 31 L 21 35 L 19 35 Z" fill="#8c4a1b" />
                {/* Diya Flame Handle Center */}
                <path
                  d="M 20 7 C 20 7 26 13 26 19 C 26 22 23.3 24 20 24 C 16.7 24 14 22 14 19 C 14 13 20 7 20 7 Z"
                  fill={isSubmitting ? '#FFFFFF' : '#FFB300'}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Door Caption */}
      <p className="door-caption-text">
        "{t('doorCaption')}"
      </p>
    </div>
  );
}
