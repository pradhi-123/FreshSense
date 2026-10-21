import React from 'react';
import './DiyaClipart.css';

export default function DiyaClipart({ className = '', size = 240 }) {
  return (
    <div className={`diya-clipart-container ${className}`}>
      <svg
        viewBox="0 0 300 280"
        width={size}
        height={size * (280 / 300)}
        className="diya-clipart-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flame outer gradient */}
          <radialGradient id="diyaFlameOuter" cx="50%" cy="75%" r="70%">
            <stop offset="0%" stopColor="#FFF176" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFB300" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#FF6D00" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#DD2C00" stopOpacity="0" />
          </radialGradient>

          {/* Flame inner bright core */}
          <radialGradient id="diyaFlameCore" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="60%" stopColor="#FFF59D" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFE082" stopOpacity="0" />
          </radialGradient>

          {/* Brass / Terracotta Diya Bowl Gradient */}
          <linearGradient id="diyaBowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="25%" stopColor="#FFB300" />
            <stop offset="55%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#8D4925" />
            <stop offset="100%" stopColor="#4A200E" />
          </linearGradient>

          {/* Golden Rim Accent Gradient */}
          <linearGradient id="diyaRimGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="50%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* Soft Aura Glow */}
          <filter id="diyaAuraSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="24" />
          </filter>

          {/* Flame Intense Glow Filter */}
          <filter id="flameGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Soft Glow Behind Diya */}
        <circle
          cx="150"
          cy="125"
          r="95"
          fill="#FFAB00"
          opacity="0.38"
          filter="url(#diyaAuraSoft)"
          className="diya-svg-aura"
        />

        {/* Outer Flame Glow Rays */}
        <path
          d="M 150 18 C 118 72 92 106 92 136 C 92 170 118 192 150 192 C 182 192 208 170 208 136 C 208 106 182 72 150 18 Z"
          fill="url(#diyaFlameOuter)"
          filter="url(#flameGlowFilter)"
          className="diya-svg-flame-outer"
        />

        {/* Inner Flame Core */}
        <path
          d="M 150 44 C 131 82 113 112 113 136 C 113 159 129 174 150 174 C 171 174 187 159 187 136 C 187 112 169 82 150 44 Z"
          fill="url(#diyaFlameCore)"
          className="diya-svg-flame-core"
        />

        {/* Wick */}
        <path
          d="M 150 145 C 149 160 151 172 150 183"
          stroke="#3E2723"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Diya Bowl (Traditional Metallic Terracotta Clipart Silhouette) */}
        <g className="diya-svg-bowl-group">
          {/* Main Diya Body */}
          <path
            d="M 38 176 
               C 28 176 22 186 30 196 
               C 48 226 88 256 150 256 
               C 212 256 252 226 270 196 
               C 278 186 272 176 262 176 
               C 222 181 186 184 150 184 
               C 114 184 78 181 38 176 Z"
            fill="url(#diyaBowlGrad)"
            stroke="#FFD54F"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Diya Top Lip / Rim Sheen */}
          <path
            d="M 33 176 
               C 83 187 217 187 267 176 
               C 257 171 217 168 150 168 
               C 83 168 43 171 33 176 Z"
            fill="url(#diyaRimGrad)"
            opacity="0.95"
          />

          {/* Traditional Indian Motif Engravings */}
          <path
            d="M 98 206 Q 150 226 202 206"
            fill="none"
            stroke="#FFE082"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.8"
          />
          <path
            d="M 118 221 Q 150 236 182 221"
            fill="none"
            stroke="#FFB300"
            strokeWidth="1.5"
            opacity="0.65"
          />

          {/* Traditional Lotus Base Motif Dots */}
          <circle cx="150" cy="237" r="3.5" fill="#FFE082" />
          <circle cx="130" cy="229" r="2.5" fill="#FFB300" />
          <circle cx="170" cy="229" r="2.5" fill="#FFB300" />
          <circle cx="112" cy="217" r="2" fill="#FF8F00" />
          <circle cx="188" cy="217" r="2" fill="#FF8F00" />
        </g>
      </svg>
    </div>
  );
}
