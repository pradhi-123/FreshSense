import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadialPlusMenu from '../components/artisan/RadialPlusMenu';
import OrdersDrawer from '../components/artisan/OrdersDrawer';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import BhashiniVoiceTranscriber from '../components/common/BhashiniVoiceTranscriber';
import { useLanguage } from '../context/LanguageContext';
import logoImg from '../assets/virasat-logo.png';
import mugaSilkImg from '../assets/muga_silk_authentic_craft.jpg';
import terracottaHorseImg from '../assets/terracotta_horse.jpg';
import madhubaniPaintingImg from '../assets/madhubani_painting.jpg';
import bambooBasketImg from '../assets/bamboo_basket.jpg';
import './ArtisanHub.css';

export default function ArtisanHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);
  const [showVoiceTranscriber, setShowVoiceTranscriber] = useState(false);

  // Read dynamic artisan profile from voice onboarding or default profile Rameshwari Devangan
  const [profile] = useState(() => {
    try {
      const saved = localStorage.getItem('virasat_artisan_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Profile read error:', e);
    }
    return {
      name: 'Rameshwari Devangan',
      craft: 'Kosa Silk Weaving',
      village: 'Champa, Chhattisgarh',
    };
  });

  const [listings] = useState(() => {
    const defaultListings = [
      {
        id: 'L01',
        title: 'Authentic Handwoven Kosa Silk Saree',
        category: 'Kosa Silk Textiles',
        price: '₹ 14,500',
        status: 'Live on ONDC',
        image: mugaSilkImg,
        badge: 'ONDC Verified',
      },
      {
        id: 'L02',
        title: 'Terracotta Bankura Ritual Horse',
        category: 'Clay & Terracotta',
        price: '₹ 1,250',
        status: 'Live on GeM',
        image: terracottaHorseImg,
        badge: 'AI Studio Ready',
      },
      {
        id: 'L03',
        title: 'Madhubani Natural Pigment Canvas',
        category: 'Folk Painting',
        price: '₹ 2,400',
        status: 'Draft (Pending Voice Note)',
        image: madhubaniPaintingImg,
        badge: 'Lineage Verified',
      },
      {
        id: 'L04',
        title: 'Handcrafted Bamboo Storage Basket',
        category: 'Bamboo & Cane',
        price: '₹ 850',
        status: 'Live on ONDC',
        image: bambooBasketImg,
        badge: 'GI Tagged',
      },
    ];

    try {
      const custom = JSON.parse(localStorage.getItem('virasat_published_products') || '[]');
      if (custom.length > 0) {
        return [...custom, ...defaultListings];
      }
    } catch (e) {
      console.warn('Error reading custom products:', e);
    }
    return defaultListings;
  });

  const handleLogout = () => {
    localStorage.removeItem('virasat_artisan_profile');
    navigate('/login');
  };

  const handleVoiceTap = () => {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceText(t('listeningNative') || 'Listening in your native language...');
      setTimeout(() => {
        setVoiceText('“I woven 1 Kosa Silk Saree today with traditional Champa floral motif”');
        setTimeout(() => {
          setIsRecording(false);
        }, 1500);
      }, 2000);
    }
  };

  const handleFeatureSelect = (feature) => {
    if (feature.key === 'inventory-orders' || feature.key === 'made-to-order') {
      navigate('/orders');
    }
  };

  return (
    <div className="artisan-hub-page">
      {/* Top Navbar */}
      <header className="artisan-hub-header">
        {/* Left Side: Artisan Details filling space */}
        <div className="karigar-profile-badge fill-space">
          <span className="profile-name">{profile.name}</span>
          <span className="profile-loc">📍 {profile.village} • {profile.craft}</span>
        </div>

        {/* Right Side Stack: Virasat Logo & Globe Symbol on Top, Logout below */}
        <div className="hub-header-right-stack">
          <div className="header-top-row">
            <img src={logoImg} alt="Virasat logo" className="hub-logo" onClick={() => navigate('/welcome')} />
            <BhashiniLanguageSwitcher />
          </div>
          <button
            type="button"
            className="karigar-logout-btn"
            onClick={handleLogout}
            title="Logout / Exit Door"
            aria-label="Logout"
          >
            {t('logout') || '🚪 Logout'}
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <nav className="hub-subnav-bar">
        <button className="subnav-pill" onClick={() => navigate('/orders')}>
          {t('ordersAndPace') || '📦 Orders & Pace (S9)'}
        </button>
        <button className="subnav-pill" onClick={() => navigate('/storefront')}>
          {t('storefront') || '🛍️ Storefront (S7)'}
        </button>
        <button className="subnav-pill" onClick={() => navigate('/karigar-pass')}>
          {t('karigarPassNav') || '🪪 Karigar Pass (S8)'}
        </button>
      </nav>

      {/* Main Content */}
      <main className="artisan-hub-main">
        {/* Voice Note Assistant Prompt Bar */}
        <section className="voice-assistant-section glass-card">
          <div className="voice-prompt-content" onClick={() => setShowVoiceTranscriber(!showVoiceTranscriber)} style={{ cursor: 'pointer' }}>
            <div className="voice-mic-circle" onClick={(e) => { e.stopPropagation(); setShowVoiceTranscriber(!showVoiceTranscriber); }}>
              <span className={`mic-emoji ${isRecording ? 'is-recording' : ''}`}>🎙️</span>
            </div>
            <div className="voice-text-wrap" style={{ flex: 1 }}>
              <h2 className="voice-title">
                {showVoiceTranscriber ? 'BHASHINI Voice Recognition Module Active' : (t('tapMicUpdate') || 'Tap Mic & Say Your Craft Update')}
              </h2>
              <p className="voice-sub">
                {voiceText || 'e.g., “I made 3 Kosa silk sarees today, cost ₹1200 for thread and 8 hours of labor”'}
              </p>
            </div>
            <button
              type="button"
              className="karigar-logout-btn"
              onClick={(e) => { e.stopPropagation(); setShowVoiceTranscriber(!showVoiceTranscriber); }}
            >
              🎙️ {showVoiceTranscriber ? 'Hide Voice Module' : 'Open BHASHINI Voice AI'}
            </button>
          </div>

          {showVoiceTranscriber && (
            <div style={{ marginTop: '16px' }}>
              <BhashiniVoiceTranscriber
                sectionTitle="BHASHINI Multilingual AI Speech Recognition & Auto Language Detection"
                placeholder="Speak in any of the 22 Indian scheduled languages (Tamil, Hindi, Telugu, Assamese, Bengali, Malayalam, Kannada, etc.)..."
                onInsertText={(text) => {
                  setVoiceText(`"${text}"`);
                  setShowVoiceTranscriber(false);
                }}
              />
            </div>
          )}
        </section>

        {/* Hero Gold Action Button: Screen S2 Home Signature */}
        <section className="add-product-hero-section">
          <button
            type="button"
            className="hero-add-product-btn"
            onClick={() => navigate('/capture')}
          >
            <span className="plus-icon">➕</span>
            <span className="btn-text">{t('addProduct') || 'Add a New Product (AI Studio S3)'}</span>
          </button>
        </section>

        {/* Live Market Sync Band */}
        <section className="market-sync-grid">
          <div className="market-sync-card glass-card" onClick={() => setShowOrdersDrawer(true)} style={{ cursor: 'pointer' }}>
            <span className="sync-status live">{t('live') || '● LIVE'}</span>
            <h4>{t('ondcNetwork') || 'ONDC Network'}</h4>
            <p>{t('activeOrdersSyncing') || '4 Active Orders Syncing'}</p>
          </div>
          <div className="market-sync-card glass-card" onClick={() => setShowOrdersDrawer(true)} style={{ cursor: 'pointer' }}>
            <span className="sync-status live">{t('live') || '● LIVE'}</span>
            <h4>{t('gemSellerApi') || 'GeM Seller API'}</h4>
            <p>{t('wholesaleRequests') || '2 B2B Wholesale Requests'}</p>
          </div>
          <div className="market-sync-card glass-card" onClick={() => navigate('/karigar-pass')} style={{ cursor: 'pointer' }}>
            <span className="sync-status active">{t('active') || '● ACTIVE'}</span>
            <h4>{t('karigarMicroStore') || 'Karigar Micro-Store'}</h4>
            <p>{t('directQrReady') || 'Direct Link & QR Ready'}</p>
          </div>
        </section>

        {/* Active Craft Listings */}
        <section className="listings-section">
          <div className="section-header">
            <h3>{t('yourCraftListings') || 'Your Craft Listings'}</h3>
            <button className="view-all-btn" onClick={() => navigate('/capture')}>
              {t('viewAll') || 'View All'} ({listings.length}) →
            </button>
          </div>

          <div className="listings-grid">
            {listings.map((item) => (
              <div
                key={item.id}
                className="listing-card glass-card"
                onClick={() => navigate('/capture', { state: { selectedItem: item } })}
                style={{ cursor: 'pointer' }}
              >
                <div className="listing-img-wrap">
                  <img src={item.image} alt={item.title} className="listing-img" />
                  <span className="listing-badge">{item.badge}</span>
                </div>
                <div className="listing-details">
                  <h4>{item.title}</h4>
                  <p className="listing-cat">{item.category}</p>
                  <div className="listing-price-bar">
                    <span className="price-tag">{item.price}</span>
                    <span className="market-pill">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Circular Radial Plus Menu at Bottom Center */}
      <RadialPlusMenu onSelectFeature={handleFeatureSelect} />

      {/* Orders & Production Pace Drawer */}
      <OrdersDrawer
        isOpen={showOrdersDrawer}
        onClose={() => setShowOrdersDrawer(false)}
      />
    </div>
  );
}
