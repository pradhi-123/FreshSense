import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RadialPlusMenu.css';

export const radialFeatures = [
  {
    key: 'image-studio',
    title: 'AI Image Studio',
    subtitle: 'Enhance photo automatically',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    badge: 'Photo AI',
  },
  {
    key: 'multilingual-cataloger',
    title: 'Voice Cataloger',
    subtitle: 'Speak in your own tongue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    badge: '22 Lang',
  },
  {
    key: 'craft-storytelling',
    title: 'AI Craft Story',
    subtitle: 'Generational lineage story',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13v5h5l9.76-9.76z"/>
        <line x1="16" y1="8" x2="2" y2="22"/>
      </svg>
    ),
    badge: 'Story AI',
  },
  {
    key: 'pricing-assistant',
    title: 'Fair Price AI',
    subtitle: 'Calculate labor & material cost',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12"/>
        <path d="M6 8h12"/>
        <path d="M6 13h7"/>
        <path d="M6 8c4 0 7 2 7 5 0 4-4 7-7 8"/>
        <line x1="13" y1="13" x2="19" y2="21"/>
      </svg>
    ),
    badge: 'Price Engine',
  },
  {
    key: 'karigar-pass',
    title: 'Karigar Pass',
    subtitle: 'QR verification badge',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <path d="M14 14h3v3h-3z"/>
        <path d="M18 18h3v3h-3z"/>
      </svg>
    ),
    badge: 'Verified',
  },
  {
    key: 'storefront',
    title: 'Storefront',
    subtitle: 'ONDC & GeM live sync',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    badge: 'ONDC/GeM',
  },
  {
    key: 'made-to-order',
    title: 'Made to Order',
    subtitle: 'Artisan pace production',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      </svg>
    ),
    badge: 'Zero Stock',
  },
  {
    key: 'inventory-orders',
    title: 'Orders & Sales',
    subtitle: 'Unified order dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    badge: 'Live',
  },
];

export default function RadialPlusMenu({ onSelectFeature }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getFeatureRoute = (key) => {
    switch (key) {
      case 'karigar-pass':
        return '/karigar-pass';
      case 'storefront':
        return '/storefront';
      case 'made-to-order':
      case 'inventory-orders':
        return '/orders';
      case 'image-studio':
      case 'multilingual-cataloger':
      case 'craft-storytelling':
      case 'pricing-assistant':
        return '/capture';
      default:
        return '/capture';
    }
  };

  const handleItemClick = (feature) => {
    setIsOpen(false);
    if (onSelectFeature) {
      onSelectFeature(feature);
    }
    const route = getFeatureRoute(feature.key);
    if (route) {
      navigate(route);
    }
  };

  // Calculate semicircular / radial coordinates for 8 items
  const radius = 135;
  const totalItems = radialFeatures.length;
  const startAngle = -165;
  const endAngle = -15;
  const angleStep = (endAngle - startAngle) / (totalItems - 1);

  return (
    <>
      {/* Dark Overlay when radial menu is open */}
      <div
        className={`radial-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Radial Menu Wrapper */}
      <div className="radial-menu-wrapper">
        {/* Radial Items Arc */}
        <div className={`radial-items-ring ${isOpen ? 'is-open' : ''}`}>
          {radialFeatures.map((feat, idx) => {
            const angleDeg = startAngle + idx * angleStep;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(angleRad));
            const y = Math.round(radius * Math.sin(angleRad));

            const style = {
              transform: isOpen
                ? `translate(${x}px, ${y}px) scale(1)`
                : 'translate(0px, 0px) scale(0)',
              transitionDelay: isOpen ? `${idx * 40}ms` : '0ms',
            };

            return (
              <button
                key={feat.key}
                className="radial-item-btn"
                style={style}
                onClick={() => handleItemClick(feat)}
                aria-label={feat.title}
                title={feat.title}
              >
                <div className="radial-item-icon">{feat.icon}</div>
                <span className="radial-item-tooltip">{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Floating Button with Fine Line Vector Plus */}
        <button
          className={`radial-plus-trigger ${isOpen ? 'is-active' : ''}`}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close feature menu' : 'Open artisan features menu'}
        >
          <svg
            className="fine-plus-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--amber-400)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
}
