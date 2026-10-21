import React from 'react';
import './ThreadEmblem.css';

export default function ThreadEmblem({ progress = 0, stage = 'idle', isError = false }) {
  // Hand-drawn organic circle SVG path (slightly imperfect bezier curve)
  // Path length approx 314px for radius 50
  const pathLength = 314;
  const strokeDashoffset = pathLength - pathLength * progress;

  // Active glow opacity based on progress and state
  let glowOpacity = 0.08 + progress * 0.85;
  if (stage === 'breath') glowOpacity = 1.0;
  if (isError) glowOpacity = 0.3;

  return (
    <div className={`thread-emblem-container ${stage} ${isError ? 'is-error-shake' : ''}`}>
      {/* Subtle Breathing Backdrop Vignette */}
      <div className="thread-vignette-backdrop" />

      <div className="thread-svg-wrap">
        <svg
          className="thread-svg"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="threadGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* At Rest Base Track (~8% Opacity) */}
          <path
            d="M 60 10 
               C 88 9, 111 31, 110 60 
               C 109 89, 87 111, 60 110 
               C 31 109, 9 88, 10 60 
               C 11 32, 32 11, 60 10 Z"
            stroke="var(--text-lo)"
            strokeWidth="1"
            strokeOpacity="0.12"
            fill="none"
          />

          {/* Glowing Blur Underlayer for Soft Illumination */}
          <path
            d="M 60 10 
               C 88 9, 111 31, 110 60 
               C 109 89, 87 111, 60 110 
               C 31 109, 9 88, 10 60 
               C 11 32, 32 11, 60 10 Z"
            stroke="var(--amber-400)"
            strokeWidth="2"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            filter="url(#threadGlowFilter)"
            opacity={glowOpacity}
            className="thread-path-animated"
          />

          {/* Primary Hairline Lit Thread Path */}
          <path
            d="M 60 10 
               C 88 9, 111 31, 110 60 
               C 109 89, 87 111, 60 110 
               C 31 109, 9 88, 10 60 
               C 11 32, 32 11, 60 10 Z"
            stroke="var(--amber-400)"
            strokeWidth="1.25"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            opacity={glowOpacity}
            className="thread-path-animated"
          />

          {/* Central Single-Stroke Minimal Diya Flame Glyph */}
          <g className="diya-glyph-center" opacity={0.25 + progress * 0.75}>
            {/* Diya Base Line */}
            <path
              d="M 48 68 Q 60 76 72 68"
              stroke="var(--amber-300)"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Minimal Flame Teardrop Glyph */}
            <path
              d="M 60 44 C 60 44 67 53 67 60 C 67 64 63.8 67 60 67 C 56.2 67 53 64 53 60 C 53 53 60 44 60 44 Z"
              stroke="var(--amber-300)"
              strokeWidth="1.2"
              fill={progress >= 0.9 ? 'var(--amber-400)' : 'none'}
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
