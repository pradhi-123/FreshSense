import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Sparkles, 
  Apple, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Zap,
  Clock,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { fetchCurrentSensors } from './api';
import FreshFoodWorkspace from './FreshFoodWorkspace';
import PackagedFoodWorkspace from './PackagedFoodWorkspace';
import './SenseTheme.css';

export default function SenseAIApp() {
  // Current primary view: 'home' | 'modeA' | 'modeB'
  const [activeMode, setActiveMode] = useState('home');
  const [isRealHardwareConnected, setIsRealHardwareConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  // Navigate with browser history support so native back button works
  const navigateTo = (mode) => {
    setActiveMode(mode);
    try {
      window.history.pushState({ mode }, '', window.location.pathname);
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Listen for browser Back/Forward navigation
    const handlePopState = (event) => {
      if (event.state && event.state.mode) {
        setActiveMode(event.state.mode);
      } else {
        setActiveMode('home');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Initialize root history state if empty
    if (!window.history.state) {
      try {
        window.history.replaceState({ mode: 'home' }, '', window.location.pathname);
      } catch (_) {}
    }

    // Continuous real-time IoT hardware telemetry polling
    let isMounted = true;
    const pollSensors = async () => {
      try {
        const data = await fetchCurrentSensors();
        if (data && isMounted) {
          setTelemetry(data);
          setIsRealHardwareConnected(Boolean(data.is_hardware));
        }
      } catch (_) {}
    };
    pollSensors();
    const interval = setInterval(pollSensors, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="sense-root">
      {/* Top Navigation Bar */}
      <header className="sense-header">
        <div 
          className="sense-header-inner"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          {/* Left Side: Clickable FreshSense AI Branding (Standard Web Home Link) */}
          <div 
            onClick={() => navigateTo('home')}
            className="sense-header-brand"
            title="FreshSense AI Home"
          >
            <div className="sense-header-logo-icon" style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #0284C7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              overflow: 'hidden',
              padding: '2px',
              flexShrink: 0
            }}>
              <img src="/favicon.svg" alt="FreshSense AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--color-soft-charcoal)',
                lineHeight: 1.15,
              }}>
                FreshSense AI
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-leaf-green)', fontWeight: 800, letterSpacing: '0.04em' }}>
                Intelligent Food Freshness &amp; Shelf-Life Platform
              </div>
            </div>
          </div>

          {/* Right Side: Clean Nav Controls (No redundant mode buttons) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Show sleek Back button only when inside Mode A or Mode B */}
            {activeMode !== 'home' ? (
              <button
                onClick={() => navigateTo('home')}
                className="sense-nav-back-pill"
                title="Return to Home Dashboard"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>
            ) : (
              <div className="sense-header-ready-chip">
                <span className="sense-dot-live"></span>
                <span>AI Vision Engine Active</span>
              </div>
            )}

            {/* Hardware Status: Only displayed when physical ESP32 box is broadcasting */}
            {isRealHardwareConnected && (
              <span className="sense-badge sense-badge-hardware-on" style={{ fontSize: '0.74rem', padding: '5px 12px' }}>
                <span className="sense-dot-live"></span>
                <Wifi size={12} />
                <span>ESP32 Online</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="sense-container">
        {/* VIEW 1: LANDING & TWO PRIMARY MODES */}
        {activeMode === 'home' && (
          <div style={{ position: 'relative' }}>
            {/* Floating Glassmorphic Aurora Background Orbs */}
            <div className="sense-aurora-glow-container">
              <div className="sense-aurora-blob sense-blob-emerald"></div>
              <div className="sense-aurora-blob sense-blob-cyan"></div>
              <div className="sense-aurora-blob sense-blob-amber"></div>
              <div className="sense-aurora-blob sense-blob-violet"></div>
            </div>

            {/* Hero Section */}
            <div style={{
              textAlign: 'center',
              padding: '36px 16px 40px 16px',
              maxWidth: '920px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1,
            }}>
              <h1 
                className="sense-hero-title"
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.12,
                  margin: '0 0 16px 0',
                  color: 'var(--color-soft-charcoal)',
                }}
              >
                Know Before It Spoils. <br />
                <span className="sense-title-gradient">On-the-Spot Food Intelligence.</span>
              </h1>

              <p style={{
                fontSize: 'clamp(0.98rem, 2vw, 1.15rem)',
                color: 'var(--color-muted-grey)',
                lineHeight: 1.6,
                margin: '0 auto 36px auto',
                maxWidth: '720px',
              }}>
                Assess fresh unpackaged produce condition, remaining shelf-life, and storage recommendations, 
                or analyze packaged grocery dates, prices, and barcodes in a single unified system.
              </p>

              {/* GRAND FLOATING CIRCULAR MODE PORTALS */}
              <div className="sense-grand-circle-hub">
                {/* Grand Portal 1: Fresh Produce (Mode A) */}
                <div 
                  className="sense-portal-card sense-portal-green"
                  onClick={() => navigateTo('modeA')}
                  role="button"
                  tabIndex={0}
                  title="Click to launch Mode A: Fresh Produce Analysis"
                >
                  <div className="sense-portal-orb-ring"></div>
                  
                  <div className="sense-portal-icon-wrapper sense-portal-icon-green">
                    <Apple size={34} color="var(--color-leaf-green)" strokeWidth={2.4} />
                  </div>

                  <span className="sense-portal-tag sense-portal-tag-green">
                    MODE A • PRODUCE
                  </span>

                  <h3 className="sense-portal-title">
                    Fresh Produce
                  </h3>

                  <p className="sense-portal-desc">
                    Camera Spoilage AI &amp; Remaining Shelf-Life
                  </p>

                  <div className="sense-portal-btn sense-portal-btn-green">
                    <span>Inspect Food</span>
                    <ArrowRight size={15} className="sense-btn-arrow" />
                  </div>
                </div>

                {/* Grand Portal 2: Packaged Food (Mode B) */}
                <div 
                  className="sense-portal-card sense-portal-orange"
                  onClick={() => navigateTo('modeB')}
                  role="button"
                  tabIndex={0}
                  title="Click to launch Mode B: Packaged Food Analysis"
                >
                  <div className="sense-portal-ring-orange"></div>
                  
                  <div className="sense-portal-icon-wrapper sense-portal-icon-orange">
                    <Package size={34} color="#ea580c" strokeWidth={2.4} />
                  </div>

                  <span className="sense-portal-tag sense-portal-tag-orange">
                    MODE B • PACKAGED
                  </span>

                  <h3 className="sense-portal-title">
                    Packaged Food
                  </h3>

                  <p className="sense-portal-desc">
                    Barcode, Bill OCR &amp; Expiry Verification
                  </p>

                  <div className="sense-portal-btn sense-portal-btn-orange">
                    <span>Scan Package</span>
                    <ArrowRight size={15} className="sense-btn-arrow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Feature Overview Grid (🌿 Frosted Glass Feature Cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '20px',
              position: 'relative',
              zIndex: 1,
            }}>
              <div className="sense-card-feature">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.45rem', 
                  marginBottom: '14px',
                  boxShadow: '0 6px 14px rgba(34, 197, 94, 0.2)'
                }}>🧬</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>Biological Kinetics</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-soft-charcoal)', opacity: 0.85, lineHeight: 1.5 }}>
                  Transparent multi-factor spoilage modeling incorporating temperature thermal stress and gas VOC thresholds.
                </p>
              </div>

              <div className="sense-card-feature">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.45rem', 
                  marginBottom: '14px',
                  boxShadow: '0 6px 14px rgba(37, 99, 235, 0.2)'
                }}>⚡</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>Instant Vision &amp; AI</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-soft-charcoal)', opacity: 0.85, lineHeight: 1.5 }}>
                  State-of-the-art camera capture and multimodal vision models with real-time freshness telemetry.
                </p>
              </div>

              <div className="sense-card-feature">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.45rem', 
                  marginBottom: '14px',
                  boxShadow: '0 6px 14px rgba(245, 158, 11, 0.2)'
                }}>🔍</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>Zero Guessing Policy</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-soft-charcoal)', opacity: 0.85, lineHeight: 1.5 }}>
                  Prices, barcodes, and dates are only shown when verified. Never fabricates expiry or retail values.
                </p>
              </div>

              <div className="sense-card-feature">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #FDF4FF 0%, #F5D0FE 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.45rem', 
                  marginBottom: '14px',
                  boxShadow: '0 6px 14px rgba(217, 70, 239, 0.2)'
                }}>🍳</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>Zero-Waste Recipes</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-soft-charcoal)', opacity: 0.85, lineHeight: 1.5 }}>
                  Turn near-expiry or imperfect produce into delicious culinary dishes before spoilage occurs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MODE A WORKSPACE */}
        {activeMode === 'modeA' && (
          <FreshFoodWorkspace onBack={() => navigateTo('home')} />
        )}

        {/* VIEW 3: MODE B WORKSPACE */}
        {activeMode === 'modeB' && (
          <PackagedFoodWorkspace onBack={() => navigateTo('home')} />
        )}
      </main>
    </div>
  );
}
