import React, { useState, useEffect, useRef } from 'react';
import Embers from '../splash/Embers';
import { useLanguage } from '../../context/LanguageContext';
import './ThresholdScene.css';

export default function ThresholdScene({ dawn = 0, stage = 'idle', isError = false }) {
  const { t } = useLanguage();

  // Desktop Mouse Parallax state
  const [parallax, setParallax] = useState({ doorX: 0, doorY: 0, skyX: 0, skyY: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      if (animFrameRef.current) return;

      animFrameRef.current = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        // Door tilts up to 4 deg, sky drifts opposite
        setParallax({
          doorX: dx * 4,
          doorY: -dy * 4,
          skyX: -dx * 8,
          skyY: -dy * 6,
        });
        animFrameRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Calculate motif illumination threshold states based on dawn progress
  const isMotif1Lit = dawn >= 0.1 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isMotif2Lit = dawn >= 0.22 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isMotif3Lit = dawn >= 0.35 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isMotif4Lit = dawn >= 0.48 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isMotif5Lit = dawn >= 0.6 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isMotif6Lit = dawn >= 0.72 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';
  const isHandleLit = dawn >= 0.85 || stage === 'igniting' || stage === 'opening' || stage === 'stepping';

  // Sky warmth interpolation
  const skyWarmthOpacity = Math.min(1.0, 0.12 + dawn * 0.85);

  return (
    <div
      className={`threshold-diorama-viewport ${stage}`}
      style={{
        '--dawn': dawn,
      }}
    >
      {/* Film Grain & Edge Vignette Overlay */}
      <div className="diorama-film-grain" />
      <div className="diorama-vignette" />

      {/* Layer 1: Sky & Skyline Silhouette (Furthest) */}
      <div
        className="diorama-layer-sky"
        style={{
          transform: `translate3d(${parallax.skyX}px, ${parallax.skyY}px, 0)`,
        }}
      >
        {/* Dynamic Sunrise Horizon Background */}
        <div className="sky-dawn-glow" style={{ opacity: skyWarmthOpacity }} />

        {/* Skyline Silhouette (Temple Towers, Bridge, Craft Clusters) */}
        <svg
          className="virasat-skyline-svg"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Distant Temple Towers & Craft Cluster Silhouettes */}
          <path
            d="M0 300 L0 240 Q 60 210 120 240 L 160 180 L 180 240 Q 250 200 320 240 L 400 160 L 430 240 Q 500 190 580 240 L 660 170 L 690 240 Q 780 200 860 240 L 920 190 L 1000 240 L 1000 300 Z"
            fill="#0f0704"
            opacity="0.85"
          />
          <path
            d="M0 300 L0 260 Q 100 230 200 260 L 350 220 L 500 260 Q 650 220 800 260 L 1000 260 L 1000 300 Z"
            fill="#180c06"
            opacity="0.6"
          />
        </svg>

        {/* Bright Glowing Horizon Line */}
        <div
          className="sky-horizon-line"
          style={{
            opacity: Math.min(1.0, 0.2 + dawn * 0.8),
            transform: `scaleX(${0.4 + dawn * 0.6})`,
          }}
        />
      </div>

      {/* Layer 2: Ground Glow Pool */}
      <div
        className="diorama-layer-ground"
        style={{
          transform: `translate3d(${parallax.skyX * 0.5}px, ${parallax.skyY * 0.5}px, 0)`,
        }}
      >
        <div
          className="ground-light-pool"
          style={{
            opacity: 0.25 + dawn * 0.75,
            transform: `scale(${0.8 + dawn * 0.4})`,
          }}
        />
      </div>

      {/* Layer 3: Main Carved Wooden Door (Center Subject) */}
      <div
        className="diorama-layer-door-stage"
        style={{
          transform: `perspective(1200px) rotateX(${parallax.doorY}deg) rotateY(${parallax.doorX}deg)`,
        }}
      >
        {/* Warm Room Interior Light behind Door */}
        <div
          className="room-interior-light"
          style={{ opacity: stage === 'opening' || stage === 'stepping' ? 1.0 : Math.max(0.1, dawn * 0.85) }}
        />

        {/* Carved Wooden Door Frame & Panels */}
        <div className={`carved-door-wrapper ${stage === 'opening' || stage === 'stepping' ? 'is-swinging' : ''} ${isError ? 'is-stuck-shake' : ''}`}>
          <svg
            className="carved-door-svg"
            viewBox="0 0 360 560"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Wood Grain Turbulence Filter */}
              <filter id="woodGrainTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves="3" result="noise" />
                <feColorMatrix
                  type="matrix"
                  values="0.2 0 0 0 0  0.1 0 0 0 0  0.05 0 0 0 0  0 0 0 0.12 0"
                />
                <feComposite operator="in" in2="SourceGraphic" />
              </filter>

              {/* Seam & Motif Glow Filter */}
              <filter id="motifGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="doorWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e170c" />
                <stop offset="50%" stopColor="#241209" />
                <stop offset="100%" stopColor="#1a0d05" />
              </linearGradient>

              <linearGradient id="panelInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a0d06" />
                <stop offset="100%" stopColor="#100603" />
              </linearGradient>
            </defs>

            {/* Base Door Wood Structure */}
            <rect x="10" y="10" width="340" height="540" rx="14" fill="url(#doorWoodGrad)" stroke="#3e2213" strokeWidth="3" filter="url(#woodGrainTexture)" />

            {/* Door Panel Recesses */}
            <rect x="30" y="30" width="300" height="230" rx="10" fill="url(#panelInnerGrad)" stroke="#351a0d" strokeWidth="2" />
            <rect x="30" y="280" width="300" height="250" rx="10" fill="url(#panelInnerGrad)" stroke="#351a0d" strokeWidth="2" />

            {/* ---------------- 6 VIRASAT CRAFT EMBLEM MOTIFS ---------------- */}
            <g className="virasat-door-motifs" filter="url(#motifGlow)">
              {/* Motif 1: Terracotta Pot (Top Left) */}
              <g className={`motif-group motif-pot ${isMotif1Lit ? 'is-lit' : ''}`}>
                <path d="M 80 80 Q 100 65 120 80 Q 130 110 100 130 Q 70 110 80 80 Z" stroke="#FFC107" strokeWidth="2" fill="none" opacity={isMotif1Lit ? 0.95 : 0.15} />
                <ellipse cx="100" cy="72" rx="14" ry="4" stroke="#FFE082" strokeWidth="1.5" fill="none" opacity={isMotif1Lit ? 0.95 : 0.15} />
              </g>

              {/* Motif 2: Handloom & Thread (Top Right) */}
              <g className={`motif-group motif-loom ${isMotif2Lit ? 'is-lit' : ''}`}>
                <path d="M 240 70 L 280 70 L 280 130 L 240 130 Z" stroke="#FFB300" strokeWidth="2" fill="none" opacity={isMotif2Lit ? 0.95 : 0.15} />
                <path d="M 250 70 L 250 130 M 260 70 L 260 130 M 270 70 L 270 130" stroke="#FFE082" strokeWidth="1" opacity={isMotif2Lit ? 0.9 : 0.1} />
              </g>

              {/* Motif 3: Heritage Manuscript Book (Center Left) */}
              <g className={`motif-group motif-book ${isMotif3Lit ? 'is-lit' : ''}`}>
                <path d="M 70 180 Q 100 170 130 180 L 130 220 Q 100 210 70 220 Z" stroke="#FFA726" strokeWidth="2" fill="none" opacity={isMotif3Lit ? 0.95 : 0.15} />
                <path d="M 100 174 L 100 214" stroke="#FFD54F" strokeWidth="1.5" opacity={isMotif3Lit ? 0.9 : 0.1} />
              </g>

              {/* Motif 4: Musical Veena Instrument (Center Right) */}
              <g className={`motif-group motif-veena ${isMotif4Lit ? 'is-lit' : ''}`}>
                <circle cx="260" cy="200" r="18" stroke="#FF9800" strokeWidth="2" fill="none" opacity={isMotif4Lit ? 0.95 : 0.15} />
                <path d="M 260 182 L 260 150" stroke="#FFE082" strokeWidth="2" opacity={isMotif4Lit ? 0.9 : 0.15} />
              </g>

              {/* Motif 5: Textile Pattern (Bottom Left) */}
              <g className={`motif-group motif-textile ${isMotif5Lit ? 'is-lit' : ''}`}>
                <path d="M 80 340 L 120 340 L 100 380 Z M 100 340 L 80 380 L 120 380 Z" stroke="#FFB300" strokeWidth="1.8" fill="none" opacity={isMotif5Lit ? 0.95 : 0.15} />
              </g>

              {/* Motif 6: Sacred Heritage Leaf (Bottom Right) */}
              <g className={`motif-group motif-leaf ${isMotif6Lit ? 'is-lit' : ''}`}>
                <path d="M 240 340 C 220 370 260 410 280 400 C 290 380 270 340 240 340 Z" stroke="#FFA726" strokeWidth="2" fill="none" opacity={isMotif6Lit ? 0.95 : 0.15} />
                <path d="M 240 340 Q 255 370 275 395" stroke="#FFE082" strokeWidth="1.2" opacity={isMotif6Lit ? 0.9 : 0.1} />
              </g>
            </g>

            {/* Dynamic Seam Lines */}
            <rect
              x="10" y="10" width="340" height="540" rx="14"
              fill="none"
              stroke={isError ? '#FF5252' : '#FFB300'}
              strokeWidth="2.5"
              opacity={0.15 + dawn * 0.8}
              filter="url(#motifGlow)"
            />
          </svg>

          {/* Diya Handle with Starburst Flares during Ignite Stage */}
          <div className={`door-diya-handle ${isHandleLit ? 'is-lit' : ''} ${stage === 'igniting' ? 'is-igniting' : ''}`}>
            {stage === 'igniting' && (
              <div className="starburst-flare-rays">
                <div className="ray ray-1" />
                <div className="ray ray-2" />
                <div className="ray ray-3" />
                <div className="ray ray-4" />
              </div>
            )}
            <svg className="diya-handle-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 10 24 C 10 24 14 31 20 31 C 26 31 30 24 30 24 Z" fill="#b87333" stroke="#ffd08a" strokeWidth="1" />
              <path d="M 17 31 L 23 31 L 21 35 L 19 35 Z" fill="#8c4a1b" />
              <path
                d="M 20 7 C 20 7 26 13 26 19 C 26 22 23.3 24 20 24 C 16.7 24 14 22 14 19 C 14 13 20 7 20 7 Z"
                fill={isHandleLit ? '#FFFFFF' : '#FFB300'}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Layer 4: Foreground Atmosphere Embers & Out-of-Focus Light Motes */}
      <div className="diorama-layer-foreground">
        <Embers count={20} />
        <div className="mote mote-1" />
        <div className="mote mote-2" />
        <div className="mote mote-3" />
      </div>
    </div>
  );
}
