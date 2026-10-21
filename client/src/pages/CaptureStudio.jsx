import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import GoldenThreadLoom from '../components/studio/GoldenThreadLoom';
import ProductReviewCard from '../components/studio/ProductReviewCard';
import FairPriceModal from '../components/studio/FairPriceModal';
import MasterCraftVerificationStudio from '../components/studio/MasterCraftVerificationStudio';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCraftImage } from '../utils/imageAnalysis';
import stripImg from '../assets/splash-ref.png';
import mugaSilkImg from '../assets/muga_silk_authentic_craft.jpg';
import './CaptureStudio.css';

export default function CaptureStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLangObj } = useLanguage();

  const [mode, setMode] = useState('capture'); // 'capture' | 'weaving' | 'review' | 'verification_wizard'
  const [isEnhanced, setIsEnhanced] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceFallback, setShowVoiceFallback] = useState(false);
  const [lightingOptimal, setLightingOptimal] = useState(true);
  const [showFairPriceModal, setShowFairPriceModal] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-process clicked item if navigated from ArtisanHub or Storefront
  useEffect(() => {
    if (location.state?.selectedItem) {
      const item = location.state.selectedItem;
      processCapturedImage(item.image, item);
    }
  }, [location.state]);

  // Live HTML5 Device Camera Request
  useEffect(() => {
    if (mode !== 'capture') return;

    let mediaStream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .then((stream) => {
          mediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCamera(true);
          }
        })
        .catch((err) => {
          console.warn('Camera stream fallback to native mobile capture:', err);
          setHasCamera(false);
        });
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  // Toggle Voice Recording
  const handleMicTap = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setShowVoiceFallback(false);
    setVoiceText('Listening in ' + currentLangObj.lang + '...');

    // Web Speech Recognition if available or simulation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLangObj.code === 'hi' ? 'hi-IN' : currentLangObj.code === 'ta' ? 'ta-IN' : 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(`"${transcript}"`);
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
        setShowVoiceFallback(true);
      };
      recognition.start();
    } else {
      // High fidelity simulation for hackathon demo
      setTimeout(() => {
        setVoiceText('"Pure Kosa silk saree, hand-spun in Champa with traditional flower motifs"');
        setIsRecording(false);
      }, 2500);
    }
  };

  // Helper to trigger pixel analysis and transition to review
  const processCapturedImage = async (imgUrl, itemOverride = null) => {
    setCapturedPhoto(imgUrl);
    setMode('weaving');

    let savedProfile = {};
    try {
      const saved = localStorage.getItem('virasat_artisan_profile');
      if (saved) savedProfile = JSON.parse(saved);
    } catch (e) {
      console.warn('Profile read error:', e);
    }

    // Run real canvas pixel analysis with dynamic craft & voice context
    const result = await analyzeCraftImage(imgUrl, {
      title: itemOverride?.title || '',
      craft: itemOverride ? (itemOverride.category || savedProfile.craft) : '',
      artisanName: savedProfile.name || 'Rameshwari Devangan',
      village: savedProfile.village || 'Champa, Chhattisgarh',
      voiceText: voiceText,
    });
    setAnalysisData(result);

    setTimeout(() => setMode('review'), 2200);
  };

  // Shutter Press -> Snapshot Frame / Mobile Camera -> Night Loom Transition -> Review
  const handleShutter = () => {
    if (hasCamera && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        processCapturedImage(dataUrl);
        return;
      } catch (e) {
        console.warn('Snapshot capture error:', e);
      }
    }

    // Trigger mobile device native camera app if getUserMedia unavailable over HTTP
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    } else {
      const defaultCraftPhoto = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    processCapturedImage(capturedPhoto || defaultCraftPhoto);
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processCapturedImage(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className={`capture-studio-page mode-${mode}`}>
      {/* Top Header */}
      <header className="studio-top-bar">
        {/* Left side: Back button & Studio Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="studio-back-btn" onClick={() => navigate('/artisan')}>
            ← {t('back') || 'Back'}
          </button>
          <div className="studio-title-box">
            <span className="studio-eyebrow">VIRASAT AI STUDIO</span>
            <h1 className="studio-heading">Product Capture</h1>
          </div>
        </div>

        {/* Right side: Price AI, 9-Step Verification Studio & Bhashini Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="studio-back-btn"
            onClick={() => setMode(mode === 'verification_wizard' ? 'capture' : 'verification_wizard')}
            style={{ background: 'var(--surface-gold-soft, #FFF8EC)', color: 'var(--gold-deep, #8A6320)', border: '1px solid var(--border-gold-subtle, #D4AF37)', padding: '6px 12px', fontSize: '0.82rem', fontWeight: '700' }}
          >
            {mode === 'verification_wizard' ? '📸 Camera View' : '🔬 9-Step AI Verification Studio'}
          </button>
          <button
            type="button"
            className="studio-back-btn"
            onClick={() => setShowFairPriceModal(true)}
            style={{ background: 'var(--honey-tint)', color: 'var(--gold-deep)', padding: '4px 10px', fontSize: '0.78rem' }}
          >
            ⚖️ Price AI
          </button>
          <BhashiniLanguageSwitcher />
        </div>
      </header>

      {/* Mode 0: 9-Step AI Craft Recognition & Material Verification Wizard */}
      {mode === 'verification_wizard' && (
        <MasterCraftVerificationStudio
          initialImage={capturedPhoto || mugaSilkImg}
          onSaveDraft={(draftData) => {
            alert(`💾 Craft Profile Draft Saved! Title: "${draftData.title}". Saved to Virasat draft storage.`);
            navigate('/artisan');
          }}
          onComplete={(finalData) => {
            alert(`🎉 Verified Craft Profile Published! Title: "${finalData.title}". Live across Virasat, ONDC & GeM.`);
            navigate('/artisan');
          }}
        />
      )}

      {/* Mode 1: Viewfinder Camera Capture */}
      {mode === 'capture' && (
        <main className="studio-viewfinder-stage">
          {/* Main Camera Viewfinder Frame */}
          <div className="viewfinder-frame">
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`viewfinder-preview-img ${isEnhanced ? 'is-enhanced-filter' : 'is-raw-filter'}`}
                style={{ objectFit: 'cover' }}
              />
            ) : capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Live Viewfinder Preview"
                className={`viewfinder-preview-img ${isEnhanced ? 'is-enhanced-filter' : 'is-raw-filter'}`}
              />
            ) : (
              <div className="viewfinder-placeholder-screen">
                <div className="aperture-icon">📸</div>
                <span className="aperture-title">AI Camera Studio Ready</span>
                <span className="aperture-sub">
                  Tap the ⚪ Shutter button below to capture your craft photo or 🖼️ Gallery to select from your phone.
                </span>
              </div>
            )}

            {/* Viewfinder Lighting Hint Badge */}
            <div className="lighting-hint-badge" onClick={() => setLightingOptimal(!lightingOptimal)}>
              {lightingOptimal ? '✨ Lighting is optimal' : '💡 Move closer to natural window light'}
            </div>

            {/* RAW vs ENHANCED Instant Viewfinder Toggle */}
            <div className="viewfinder-toggle-bar">
              <button
                type="button"
                className={`toggle-tab ${!isEnhanced ? 'is-active' : ''}`}
                onClick={() => setIsEnhanced(false)}
              >
                RAW PHOTO
              </button>
              <button
                type="button"
                className={`toggle-tab ${isEnhanced ? 'is-active' : ''}`}
                onClick={() => setIsEnhanced(true)}
              >
                ✨ AI ENHANCED
              </button>
            </div>
          </div>

          {/* Voice Mic Assistant Bar */}
          <div className="voice-assistant-bar">
            <button
              type="button"
              className={`voice-mic-btn ${isRecording ? 'is-recording' : ''}`}
              onClick={handleMicTap}
              aria-label="Record craft voice description"
            >
              🎤
            </button>
            <div className="voice-prompt-box">
              <span className="voice-instructions">
                {voiceText || "Snap the product, then talk about your craft naturally..."}
              </span>
              {showVoiceFallback && (
                <span className="voice-fallback-warning" onClick={handleMicTap}>
                  Didn't catch that — tap microphone to try again
                </span>
              )}
            </div>
          </div>

          {/* 3 Primary Camera Controls */}
          <div className="camera-controls-bar">
            {/* 1. Gallery Button */}
            <button
              type="button"
              className="ctrl-btn ctrl-gallery"
              onClick={handleGalleryClick}
              aria-label="Upload existing photo from gallery"
            >
              🖼️
              <span className="ctrl-label">Gallery</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handleFileSelected}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden-file-input"
              onChange={handleFileSelected}
            />

            {/* 2. Shutter Button with Muga Gold Ring */}
            <button
              type="button"
              className="ctrl-shutter-btn"
              onClick={handleShutter}
              aria-label="Take product photo"
            >
              <span className="shutter-inner-ring" />
            </button>

            {/* 3. Lighting Hint Button */}
            <button
              type="button"
              className="ctrl-btn ctrl-light"
              onClick={() => setLightingOptimal(!lightingOptimal)}
              aria-label="Toggle lighting assistant"
            >
              💡
              <span className="ctrl-label">Light</span>
            </button>
          </div>
        </main>
      )}

      {/* Mode 2: Golden Thread Loom Processing (Night Scene - S4) */}
      {mode === 'weaving' && (
        <main className="studio-weaving-stage">
          <GoldenThreadLoom
            progressText="Weaving your craft story & ONDC listing in real-time..."
            onFinished={() => setMode('review')}
          />
        </main>
      )}

      {/* Mode 3: AI Product Review & Pricing (Daylight Canvas) */}
      {mode === 'review' && (
        <main className="studio-review-stage">
          <ProductReviewCard
            photoUrl={capturedPhoto || mugaSilkImg}
            enhancedPhotoUrl={capturedPhoto || mugaSilkImg}
            analysisData={analysisData}
            onPublish={(productPayload) => {
              try {
                const existing = JSON.parse(localStorage.getItem('virasat_published_products') || '[]');
                const newProduct = {
                  id: `L-${Date.now().toString().slice(-4)}`,
                  title: productPayload.title,
                  category: productPayload.category || 'Handcrafted Art',
                  price: productPayload.price,
                  rawPrice: productPayload.rawPrice,
                  status: 'Live on ONDC',
                  image: productPayload.image,
                  badge: 'AI Studio Verified',
                  story: productPayload.story,
                  leadTimeDays: Math.max(7, Math.round((productPayload.craftHours || 24) * 1.1)),
                  materials: productPayload.materials,
                  createdAt: new Date().toISOString(),
                };
                localStorage.setItem('virasat_published_products', JSON.stringify([newProduct, ...existing]));
                alert(`✨ Your piece "${newProduct.title}" is now visible across India! Live on ONDC & GeM.`);
              } catch (e) {
                console.warn('Publish save error:', e);
              }
              navigate('/artisan');
            }}
            onViewPass={() => navigate('/karigar-pass')}
          />
        </main>
      )}

      {/* Interactive Fair Price AI Calculator Modal */}
      <FairPriceModal
        isOpen={showFairPriceModal}
        onClose={() => setShowFairPriceModal(false)}
        onApplyPrice={(computedPrice) => {
          alert(`Applied AI Fair Price: ₹ ${computedPrice.toLocaleString('en-IN')}`);
        }}
      />
    </div>
  );
}
