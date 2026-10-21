import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChefHat, 
  Info, 
  TrendingDown, 
  ArrowRight, 
  ArrowLeft, 
  Thermometer, 
  Layers,
  Heart,
  Smile,
  CheckCircle2,
  Zap,
  FileDown,
  ExternalLink,
  Printer,
  Eye,
  Wind,
  Palette,
  Activity,
} from 'lucide-react';
import { analyzeFreshFoodImage, fetchCurrentSensors } from './api';
import { generateFreshFoodPdf } from './pdfGenerator';

const DISH_IMAGE_FALLBACKS = {
  smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=700&auto=format&fit=crop&q=80',
  matcha: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
  chai: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&auto=format&fit=crop&q=80',
  purée: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&auto=format&fit=crop&q=80',
  sauté: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
  skillet: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
  fruit: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=700&auto=format&fit=crop&q=80',
  bread: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=700&auto=format&fit=crop&q=80',
  pie: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=700&auto=format&fit=crop&q=80',
  tart: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=700&auto=format&fit=crop&q=80',
  chutney: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
  pickle: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817ff?w=700&auto=format&fit=crop&q=80',
  roast: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
  curry: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80',
  juice: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=700&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&auto=format&fit=crop&q=80'
};

function getRecipeDishImage(recipe, detectedItem = '') {
  if (recipe && recipe.dish_image_url) return recipe.dish_image_url;
  const str = `${recipe?.dish_image_keyword || ''} ${recipe?.recipe_name || ''} ${detectedItem}`.toLowerCase();
  for (const [key, url] of Object.entries(DISH_IMAGE_FALLBACKS)) {
    if (str.includes(key)) return url;
  }
  return DISH_IMAGE_FALLBACKS.default;
}

function getUniqueFoodMessage(item = 'produce', score = 85, category = 'Fruit', rawMsg = '') {
  // If rawMsg is present, clean out any generic clichés like "Careful, chef!"
  if (rawMsg && typeof rawMsg === 'string' && rawMsg.trim()) {
    const cleaned = rawMsg
      .replace(/^(?:💡\s*)?(?:Careful|Heads-up|Warning|Attention|Note)[\s,]+(?:chef|cook|friend)[!.:\s]*/i, '')
      .replace(/^(?:💡\s*)?(?:Careful|Heads-up|Warning)[!.:\s]*/i, '')
      .trim();
    if (cleaned.length > 20) {
      return cleaned;
    }
  }

  const name = (item || '').toLowerCase();
  const isFresh = score >= 80;

  if (name.includes('banana')) {
    return isFresh
      ? `🍌 Gorgeous sun-kissed yellow peels! These bananas are firm, naturally sweet, and loaded with smooth potassium energy. Enjoy them fresh or sliced over your morning oats!`
      : `🍌 Sweet sugar speckles have appeared! The natural fruit sugars are at their absolute peak aromatic sweetness. Perfect for a velvety smoothie, banana pancakes, or warm banana bread!`;
  }
  if (name.includes('avocado')) {
    return isFresh
      ? `🥑 Firm and emerald green! This avocado is holding prime density with silky healthy omega oils. Store at room temperature until it yields gently to a light thumb press.`
      : `🥑 Rich, buttery, and yielding like silk! This avocado has reached heavenly creamy perfection. Mash it right away for citrusy guacamole or spread across toasted sourdough!`;
  }
  if (name.includes('apple')) {
    return isFresh
      ? `🍎 Crisp, glossy, and tart-sweet! Every bite will deliver that signature snappy orchard crunch and refreshing hydration.`
      : `🍎 Tender and fragrant! Perfect for warm cinnamon-spiced apple stew, morning compote, or blending into a refreshing autumn cider.`;
  }
  if (name.includes('tomato')) {
    return isFresh
      ? `🍅 Vibrant ruby skin and fresh vine aroma! Plump, juicy, and brimming with rich lycopene. Slice fresh with basil and sea salt!`
      : `🍅 Deeply softened with concentrated umami juices! These ripe tomatoes will melt down into a rich, fragrant pasta marinara or spicy rasam.`;
  }
  if (name.includes('mango')) {
    return isFresh
      ? `🥭 Sun-drenched golden beauty with an intoxicating honeyed perfume! Velvety, juicy, and dripping with tropical sweetness.`
      : `🥭 Heavenly aromatic and ultra-juicy! The honey fragrance is irresistible — blitz into a cooling mango lassi or sweet fruit purée.`;
  }
  if (name.includes('berry') || name.includes('strawberr') || name.includes('blueberr')) {
    return isFresh
      ? `🍓 Gemstone jewel tones glistening with vibrant antioxidant vitality! Plump, tart-sweet, and bursting with fresh berry juice.`
      : `🍓 Soft and deeply sweet! Simmer lightly with a squeeze of lemon into a warm dessert coulis or blend into a chilled yogurt bowl.`;
  }
  if (name.includes('spinach') || name.includes('green') || name.includes('lettuce') || name.includes('kale')) {
    return isFresh
      ? `🥬 Dewy, emerald foliage bursting with crisp garden vitality and rich iron! Refreshingly tender and snappy.`
      : `🥬 Tender greens ready for a savory warm sauté! Toss with garlic, olive oil, and crushed chili flakes in minutes.`;
  }
  if (name.includes('mushroom')) {
    return isFresh
      ? `🍄 Velvety smooth caps with earthy woodland aroma! Firm, clean, and packed with savory umami depth.`
      : `🍄 Richly aromatic with intensified savory notes! Sauté in butter with fresh herbs or simmer into a rustic wild mushroom risotto.`;
  }
  if (name.includes('orange') || name.includes('lemon') || name.includes('citrus')) {
    return isFresh
      ? `🍊 Bright, fragrant peel glistening with aromatic citrus oils! Bursting with sunshine vitamin C and mouthwatering zest.`
      : `🍊 Soft and deeply juicy! Squeeze fresh for a vibrant vitamin morning elixir or candied citrus drizzle.`;
  }

  // General produce fallback
  return isFresh
    ? `🌱 Crisp, vibrant, and bursting with natural freshness (scored ${score}/100)! It's full of vitamins, crisp texture, and farm-fresh flavor. Enjoy it fresh!`
    : `✨ Nicely ripened and flavor-rich (scored ${score}/100)! The natural sugars and aromas are at their culinary prime — savor it today in the delicious dishes below!`;
}

export default function FreshFoodWorkspace({ onBack }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisDuration, setAnalysisDuration] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ambientSensors, setAmbientSensors] = useState({ temperature_c: 24.5, humidity_pct: 55 });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingStreamRef = useRef(null); // holds stream while video element mounts

  // Ambient sensor telemetry polling
  useEffect(() => {
    let isMounted = true;
    const pollSensors = async () => {
      try {
        const res = await fetchCurrentSensors();
        if (res && res.reading && isMounted) {
          setAmbientSensors({
            temperature_c: res.reading.temperature_c ?? 24.5,
            humidity_pct: res.reading.humidity_pct ?? 55,
          });
        }
      } catch (_) {}
    };
    pollSensors();
    const interval = setInterval(pollSensors, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  // Attach stream to <video> the moment isCameraActive=true AND videoRef is ready
  useEffect(() => {
    if (isCameraActive && videoRef.current && pendingStreamRef.current) {
      const stream = pendingStreamRef.current;
      pendingStreamRef.current = null;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Video play:', e));
      streamRef.current = stream;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setErrorMsg(null);

    // Check API availability first (requires HTTPS on mobile, always OK on localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('📷 Camera API not available. On mobile open the Cloudflare link (https://). On desktop make sure no other app is using the camera.');
      return;
    }

    let stream = null;

    // Tier 1: Rear/environment camera (ideal, not required — won't crash on laptops)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
    } catch (_) {}

    // Tier 2: Any camera, no constraints at all
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMsg('🚫 Camera permission denied. Click the camera/lock icon in the browser address bar → Allow camera → try again.');
        } else if (err.name === 'NotFoundError') {
          setErrorMsg('📷 No camera detected. Use "Take / Upload Photo" instead.');
        } else if (err.name === 'NotReadableError') {
          setErrorMsg('📷 Camera is in use by another app (e.g. Teams, Zoom). Close it and try again.');
        } else {
          setErrorMsg(`⚠️ Camera error: ${err.name} — ${err.message}`);
        }
        return;
      }
    }

    // Store stream in pending ref BEFORE triggering re-render
    // The useEffect above will attach it to <video> once it's in the DOM
    pendingStreamRef.current = stream;
    setIsCameraActive(true);

    // Safety fallback: if video element already exists (e.g. fast re-render), attach now
    if (videoRef.current) {
      pendingStreamRef.current = null;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Video play:', e));
      streamRef.current = stream;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    setImageFile(null);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    setAnalysisDuration(null);
  };

  const handleRunAnalysis = async () => {
    if (!imagePreview) {
      setErrorMsg('Please capture or upload an image first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      const res = await analyzeFreshFoodImage(imagePreview, imageFile);
      const endTime = performance.now();
      const durationSec = ((endTime - startTime) / 1000).toFixed(1);
      setAnalysisDuration(durationSec);

      if (res.success && res.assessment) {
        setAnalysisResult(res.assessment);
      } else {
        setErrorMsg(res.error || 'Failed to complete food assessment.');
      }
    } catch (err) {
      console.error('Analysis API error:', err);
      setErrorMsg('Network error communicating with Sense AI assessment engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    if (analysisResult) {
      setAnalysisResult(null);
      setImagePreview(null);
      setImageFile(null);
    } else {
      stopCamera();
      onBack();
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <button 
            onClick={handleBack}
            className="sense-btn-secondary"
            style={{ 
              padding: '7px 16px', 
              fontSize: '0.85rem', 
              marginBottom: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={15} />
            <span>{analysisResult ? 'Back to Camera / Upload' : 'Back to Dashboard'}</span>
          </button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
            Mode A: <span className="sense-title-gradient">Fresh Food Analysis</span>
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--sense-muted)', fontSize: '0.9rem' }}>
            Multimodal produce identification, biological freshness diagnostics, and zero-waste recipes.
          </p>
        </div>
      </div>

      {!analysisResult ? (
        /* =========================================================
           VIEW A: CAMERA & UPLOAD CONTROLS (FULL WIDTH CENTERED)
           ========================================================= */
        <div className="sense-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-soft-charcoal)' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--color-fresh-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-leaf-green)'
              }}>
                <Camera size={20} />
              </div>
              <span>Food Capture &amp; Vision</span>
            </h3>
            <span className="sense-badge sense-badge-hardware-on" style={{ fontSize: '0.74rem' }}>
              Mode A • Fresh Produce
            </span>
          </div>

          {/* Camera Viewport or Image Preview */}
          <div 
            style={{ 
              minHeight: '300px', 
              maxHeight: '440px', 
              position: 'relative',
              borderRadius: 'var(--sense-radius-lg)',
              overflow: 'hidden',
              background: '#0f172a',
              border: isCameraActive ? '2px solid var(--color-leaf-green)' : '2px dashed var(--color-light-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isCameraActive ? '0 12px 32px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {isCameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} 
                />
                <div className="sense-laser-line"></div>
                
                {/* Framing Guidelines Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  right: '16px',
                  bottom: '76px',
                  border: '2px dashed rgba(255, 255, 255, 0.65)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '10px'
                }}>
                  <span style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.25)'
                  }}>
                    Align food item, produce, or face inside frame
                  </span>
                </div>

                {/* Live Camera Controls */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 16px',
                  background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <button 
                    onClick={stopCamera} 
                    className="sense-btn-secondary" 
                    style={{ 
                      padding: '9px 16px', 
                      fontSize: '0.82rem',
                      background: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={capturePhoto} 
                    className="sense-shutter-btn" 
                    style={{ flex: 1, padding: '11px 20px', fontSize: '0.9rem' }}
                  >
                    <Camera size={18} />
                    <span>📸 Snap Photo</span>
                  </button>
                </div>
              </>
            ) : imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                <img 
                  src={imagePreview} 
                  alt="Captured to analyze" 
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} 
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  Active Photo
                </span>
                <button 
                  onClick={handleRetake}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 'var(--sense-radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <RotateCcw size={13} /> Retake
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '42px 20px', color: 'var(--color-muted-grey)', background: 'var(--color-vanilla-cream)', width: '100%' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'var(--color-fresh-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '2.2rem',
                  boxShadow: '0 8px 24px rgba(65, 155, 112, 0.18)'
                }}>
                  🥑
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                  Take or Upload Food Photo
                </h4>
                <p style={{ margin: '0 auto 24px auto', fontSize: '0.9rem', color: 'var(--color-muted-grey)', maxWidth: '380px', lineHeight: 1.5 }}>
                  Capture fresh fruit, vegetable, greens, or even snap a quick photo to evaluate freshness and shelf-life!
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={startCamera} 
                    className="sense-btn-primary"
                    style={{ padding: '12px 24px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Camera size={18} /> <span>Open Live Camera</span>
                  </button>

                  <label 
                    className="sense-btn-secondary" 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '12px 22px',
                      fontSize: '0.92rem',
                      background: '#ffffff'
                    }}
                  >
                    <Upload size={17} /> <span>Choose from Files</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action Button & Timer */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={handleRunAnalysis}
              disabled={!imagePreview || isAnalyzing}
              className="sense-btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: '1.02rem', fontWeight: 800 }}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  Analyzing image &amp; evaluating freshness...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Freshness &amp; View Report
                </>
              )}
            </button>

            {analysisDuration && (
              <div style={{ fontSize: '0.78rem', color: 'var(--sense-muted)', width: '100%', textAlign: 'center' }}>
                ⏱ Processing duration: <strong style={{ color: '#34d399' }}>{analysisDuration} seconds</strong>
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{
              marginTop: '14px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--sense-radius-sm)',
              color: '#dc2626',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}>
              {errorMsg}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================
           VIEW B: FULL-WIDTH SHOWCASE ASSESSMENT (NO VERTICAL SPLIT)
           ========================================================= */
        (() => {
          const isHuman = Boolean(
            analysisResult?.is_human ||
            /human|face|person|selfie|man|woman|boy|girl|kid/i.test(analysisResult?.detected_item || '') ||
            analysisResult?.category?.toLowerCase() === 'human'
          );

          const isNonFood = Boolean(
            analysisResult?.is_non_food ||
            analysisResult?.category === 'Non-Food Object' ||
            /phone|keys|laptop|dog|cat|pet|shoes|mug|book|gadget/i.test(analysisResult?.detected_item || '')
          );

          const isPeakFresh = !isHuman && !isNonFood && (analysisResult?.freshness_score >= 80);

          return (
            <div className="sense-card" style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 24px' }}>
              {/* Top Navigation Bar inside Assessment */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
                <button
                  onClick={handleBack}
                  className="sense-btn-secondary"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.86rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Scan Another Item / Retake</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {!isHuman && !isNonFood && (
                    <>
                      <button
                        onClick={() => {
                          const pdf = generateFreshFoodPdf(analysisResult, imagePreview, ambientSensors);
                          pdf.openPdf();
                        }}
                        className="sense-btn-secondary"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#F0FDF4',
                          borderColor: '#86EFAC',
                          color: '#15803D',
                          fontWeight: 700
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Open PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          const pdf = generateFreshFoodPdf(analysisResult, imagePreview, ambientSensors);
                          pdf.downloadPdf();
                        }}
                        className="sense-btn-secondary"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#EFF6FF',
                          borderColor: '#93C5FD',
                          color: '#1D4ED8',
                          fontWeight: 700
                        }}
                      >
                        <FileDown size={14} />
                        <span>Download PDF</span>
                      </button>
                    </>
                  )}

                  <span className="sense-badge sense-badge-ai">
                    {(analysisResult.ai_provider || 'Sense AI Multi-Spectral Engine').replace(/Gemini[^(]*\([^)]*\)/gi, 'Sense AI Multi-Spectral Engine').replace(/Gemini/gi, 'Sense AI')}
                  </span>
                  {analysisDuration && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-muted-grey)', fontWeight: 600 }}>
                      ⚡ {analysisDuration}s
                    </span>
                  )}
                </div>
              </div>

              {/* 1. SPECIAL CASE: CUTE CHAOTIC HUMAN FACE DETECTED */}
              {isHuman ? (
                <div style={{
                  background: 'linear-gradient(135deg, #FFF0F5 0%, #F5F3FF 50%, #ECFCCB 100%)',
                  border: '2px solid #F472B6',
                  borderRadius: 'var(--sense-radius-lg)',
                  padding: '24px 22px',
                  marginBottom: '24px',
                  boxShadow: '0 16px 40px rgba(244, 114, 182, 0.2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {imagePreview && (
                        <div style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid #EC4899',
                          boxShadow: '0 6px 18px rgba(236, 72, 153, 0.35)',
                          flexShrink: 0
                        }}>
                          <img src={imagePreview} alt="Sweet face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          background: '#EC4899',
                          color: '#ffffff',
                          padding: '3px 12px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Heart size={12} fill="#ffffff" />
                          <span>100% CERTIFIED SWEETIE</span>
                        </span>
                        <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, margin: '6px 0 2px 0', color: '#831843', letterSpacing: '-0.02em' }}>
                          Ohhhh Sweet Face Detected! 🥰✨
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#9d174d', fontWeight: 700 }}>
                          Radiance Score: 100/100 • Zero Biological Spoilage • Infinite Shelf-Life!
                        </p>
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '10px 20px',
                      borderRadius: 'var(--sense-radius-md)',
                      border: '2px solid #FBCFE8',
                      boxShadow: '0 4px 14px rgba(236, 72, 153, 0.15)'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#9d174d', textTransform: 'uppercase', fontWeight: 800 }}>
                        FRESHNESS &amp; RADIANCE
                      </div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#db2777', lineHeight: 1, margin: '2px 0' }}>
                        100<span style={{ fontSize: '1.1rem', color: '#be185d' }}>/100</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669' }}>
                        Peak Radiant &amp; Sweet ✨
                      </div>
                    </div>
                  </div>

                  {/* Sweet Chaotic Message */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1.5px solid #FBCFE8',
                    borderRadius: 'var(--sense-radius-md)',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    fontSize: '0.98rem',
                    lineHeight: 1.6,
                    color: '#831843',
                    fontWeight: 600,
                  }}>
                    {analysisResult.sweet_message || "Ohhhh what a sweet, glowing face! 🥰 You're radiating 100/100 peak freshness and positive energy today! Stay hydrated, keep that lovely smile going, and treat yourself to something nice! 💖"}
                  </div>

                  {/* Sweet Vibe Highlights Pills */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '10px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid #FCE7F3', fontSize: '0.84rem', color: '#831843' }}>
                      🌸 <strong>Vibe:</strong> Certified Sweetheart
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid #FCE7F3', fontSize: '0.84rem', color: '#831843' }}>
                      💧 <strong>Hydration:</strong> Glowing &amp; Radiant
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid #FCE7F3', fontSize: '0.84rem', color: '#831843' }}>
                      🕒 <strong>Shelf-Life:</strong> Forever Ageless
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid #FCE7F3', fontSize: '0.84rem', color: '#831843' }}>
                      🏡 <strong>Happy Spot:</strong> Comfy vibes &amp; beauty sleep
                    </div>
                  </div>

                  {/* Fun Self-Care & Treat Recipes for Humans */}
                  {analysisResult.zero_waste_recipes && analysisResult.zero_waste_recipes.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '0 0 12px 0', color: '#831843', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChefHat size={18} color="#db2777" /> Delicious Self-Care Treats for You! 🍓✨
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
                        {analysisResult.zero_waste_recipes.map((rec, i) => (
                          <div key={i} className="sense-card-recipe">
                            <div className="sense-recipe-image-wrap">
                              <img 
                                src={getRecipeDishImage(rec, 'sweet smoothie drink')} 
                                alt={rec.recipe_name} 
                                className="sense-recipe-image" 
                              />
                            </div>
                            <div className="sense-recipe-content">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--color-soft-charcoal)', fontSize: '0.98rem' }}>{rec.recipe_name}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#db2777', background: '#FCE7F3', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                                  ⏱ {rec.prep_time_minutes} mins
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-soft-charcoal)', opacity: 0.9, lineHeight: 1.5 }}>
                                {rec.instructions}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : isNonFood ? (
                /* 2. SPECIAL CASE: NON-FOOD / IRRELEVANT OBJECT */
                <div style={{
                  background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                  border: '2px solid #38BDF8',
                  borderRadius: 'var(--sense-radius-lg)',
                  padding: '24px 22px',
                  marginBottom: '24px',
                  boxShadow: '0 12px 30px rgba(56, 189, 248, 0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <div style={{ fontSize: '2.5rem' }}>🤖🔍</div>
                    <div>
                      <span className="sense-badge" style={{ background: '#BAE6FD', color: '#0369A1', fontWeight: 800 }}>
                        NON-FOOD ITEM DETECTED
                      </span>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '4px 0', color: '#0C4A6E' }}>
                        Wait a second! That's not fruit or food! 😂
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.92rem', color: '#0284C7', fontWeight: 600 }}>
                        Detected: {analysisResult.detected_item} • Freshness Score: 100/100 (Indestructible!)
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.94rem', lineHeight: 1.55, color: '#075985', margin: '0 0 16px 0' }}>
                    {analysisResult.sweet_message || `We inspected your ${analysisResult.detected_item}. It's in 100% mint physical condition, but it's not edible! Please scan a fresh fruit, vegetable, or packaged grocery item instead.`}
                  </p>
                  <button onClick={handleRetake} className="sense-btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                    📸 Scan Fresh Produce Instead
                  </button>
                </div>
              ) : (
                /* 3. STANDARD PRODUCE ANALYSIS (FULL-WIDTH MODERN SHOWCASE) */
                <div>
                  {/* Hero Summary Header Banner */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240, 253, 244, 0.9) 100%)',
                    border: '1.5px solid var(--color-light-border)',
                    borderRadius: 'var(--sense-radius-lg)',
                    padding: '20px 22px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 18px rgba(65, 155, 112, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {imagePreview && (
                        <div style={{
                          width: '84px',
                          height: '84px',
                          borderRadius: 'var(--sense-radius-md)',
                          overflow: 'hidden',
                          border: '2px solid var(--color-leaf-green)',
                          boxShadow: '0 6px 16px rgba(65, 155, 112, 0.2)',
                          flexShrink: 0
                        }}>
                          <img src={imagePreview} alt="Analyzed food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div>
                        <span className="sense-badge sense-badge-hardware-on" style={{ fontSize: '0.74rem', marginBottom: '4px' }}>
                          {analysisResult.category || 'Fresh Produce'}
                        </span>
                        <h3 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', fontWeight: 900, margin: '4px 0 2px 0', color: 'var(--color-soft-charcoal)', letterSpacing: '-0.025em' }}>
                          {analysisResult.detected_item}
                        </h3>
                        <span style={{ fontSize: '0.86rem', color: 'var(--color-muted-grey)', fontWeight: 600 }}>
                          Surface Condition: {analysisResult.visual_condition || 'Firm and intact'}
                        </span>
                      </div>
                    </div>

                    {/* Freshness Gauge */}
                    <div style={{
                      textAlign: 'center',
                      background: 'var(--color-vanilla-cream)',
                      padding: '12px 22px',
                      borderRadius: 'var(--sense-radius-md)',
                      border: '1.5px solid var(--color-light-border)',
                      minWidth: '140px',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', textTransform: 'uppercase', fontWeight: 800 }}>
                        FRESHNESS SCORE
                      </div>
                      <div style={{
                        fontSize: '2.4rem',
                        fontWeight: 900,
                        fontFamily: 'var(--sense-font-mono)',
                        color: analysisResult.freshness_score >= 70 ? 'var(--color-leaf-green)' : (analysisResult.freshness_score >= 45 ? '#d97706' : '#dc2626'),
                        lineHeight: 1,
                        margin: '3px 0'
                      }}>
                        {analysisResult.freshness_score}<span style={{ fontSize: '1.1rem', color: 'var(--color-muted-grey)' }}>/100</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: analysisResult.freshness_score >= 70 ? 'var(--color-leaf-green)' : '#d97706' }}>
                        {analysisResult.freshness_category}
                      </div>
                    </div>
                  </div>

                  {/* Sweet & Understandable Content Box */}
                  <div style={{
                    background: isPeakFresh 
                      ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.75) 100%)' 
                      : 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(254, 215, 170, 0.6) 100%)',
                    border: isPeakFresh ? '2px solid rgba(120, 201, 154, 0.6)' : '2px solid rgba(251, 146, 60, 0.5)',
                    borderRadius: 'var(--sense-radius-lg)',
                    padding: '18px 22px',
                    marginBottom: '20px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.6rem' }}>{isPeakFresh ? '🌱✨' : '⏳💡'}</span>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-soft-charcoal)' }}>
                        {isPeakFresh ? `Sweet News for your ${analysisResult.detected_item}!` : `Kitchen Update for your ${analysisResult.detected_item}`}
                      </h4>
                    </div>

                    <p style={{
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                      color: 'var(--color-soft-charcoal)',
                      margin: '0 0 14px 0',
                      fontWeight: 500,
                    }}>
                      {getUniqueFoodMessage(
                        analysisResult.detected_item,
                        analysisResult.freshness_score,
                        analysisResult.category,
                        analysisResult.sweet_message
                      )}
                    </p>

                    {/* Crisp Highlight Chips */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '12px 16px',
                      borderRadius: 'var(--sense-radius-md)',
                      border: '1px solid var(--color-light-border)',
                    }}>
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-soft-charcoal)' }}>
                        🍏 <strong>Freshness:</strong> {analysisResult.freshness_category || 'Super Fresh'}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-soft-charcoal)' }}>
                        🕒 <strong>Best By:</strong> {analysisResult.estimated_remaining_str || '~3-5 days'}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-soft-charcoal)' }}>
                        🏡 <strong>Best Storage:</strong> {analysisResult.recommended_storage || 'Cool crisper drawer'}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid: Remaining Shelf Life & Deterioration Rate */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: 'var(--color-vanilla-cream)', padding: '14px 16px', borderRadius: 'var(--sense-radius-md)', border: '1px solid var(--color-light-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-muted-grey)', textTransform: 'uppercase', fontWeight: 800 }}>
                        <Clock size={14} color="var(--color-leaf-green)" />
                        Estimated Shelf-Life Window
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-soft-charcoal)', marginTop: '4px' }}>
                        {analysisResult.estimated_remaining_str}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-grey)', marginTop: '2px' }}>
                        Optimal consumption within {analysisResult.estimated_shelf_life_days_min}–{analysisResult.estimated_shelf_life_days_max} days
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-vanilla-cream)', padding: '14px 16px', borderRadius: 'var(--sense-radius-md)', border: '1px solid var(--color-light-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-muted-grey)', textTransform: 'uppercase', fontWeight: 800 }}>
                        <TrendingDown size={14} color="#d97706" />
                        Deterioration Rate &amp; Respiration
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>
                        {analysisResult.deterioration_rate_assessment || 'Normal'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-grey)', marginTop: '2px' }}>
                        {analysisResult.deterioration_reasoning || 'Standard ambient respiration'}
                      </div>
                    </div>
                  </div>

                  {/* CONCURRENT MULTI-SENSOR CONTRIBUTION & FUSION BREAKDOWN */}
                  {analysisResult.sensor_contributions && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      border: '1.5px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 'var(--sense-radius-lg)',
                      padding: '20px 22px',
                      marginBottom: '22px',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.25rem' }}>⚡</span>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-soft-charcoal)' }}>
                              Concurrent Multi-Sensor Contribution &amp; Fusion Breakdown
                            </h4>
                          </div>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--color-muted-grey)' }}>
                            All 4 parameters were analyzed concurrently to formulate this produce's Freshness IQ.
                          </p>
                        </div>
                        <span style={{
                          background: '#EEF2FF',
                          color: '#4338CA',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span className="sense-dot-live"></span>
                          4-Node Concurrent Matrix
                        </span>
                      </div>

                      {/* 4 Sensor Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', marginBottom: '14px' }}>
                        {analysisResult.sensor_contributions.sensors?.map((sensor, idx) => (
                          <div key={idx} style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #F1F5F9',
                            borderRadius: 'var(--sense-radius-md)',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {sensor.sensor_type}
                                  </div>
                                  <strong style={{ fontSize: '0.92rem', color: 'var(--color-soft-charcoal)' }}>
                                    {sensor.sensor_name}
                                  </strong>
                                </div>
                                <span style={{
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  color: '#4338CA',
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  padding: '2px 8px',
                                  borderRadius: '999px'
                                }}>
                                  Weight: {sensor.weight_pct}%
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: sensor.status_color || '#10B981' }}>
                                  {sensor.status}
                                </span>
                                <span style={{ fontSize: '0.92rem', fontWeight: 900, fontFamily: 'var(--sense-font-mono)', color: 'var(--color-soft-charcoal)' }}>
                                  {sensor.score}/100
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                                <div style={{ width: `${sensor.score}%`, height: '100%', background: sensor.status_color || '#10B981', borderRadius: '999px' }} />
                              </div>

                              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', marginBottom: '8px', fontFamily: 'var(--sense-font-mono)' }}>
                                📟 {sensor.raw_reading}
                              </div>
                            </div>

                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                              {sensor.contribution_impact}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Summary Banner */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--sense-radius-sm)', padding: '10px 14px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                        <strong>Multi-Sensor Synthesis:</strong> {analysisResult.sensor_contributions.fusion_summary}
                      </div>
                    </div>
                  )}

                  {/* Storage Tips */}
                  <div style={{ background: 'var(--color-fresh-mint)', border: '1px solid rgba(120, 201, 154, 0.45)', borderRadius: 'var(--sense-radius-md)', padding: '16px 18px', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-leaf-green)', fontWeight: 800, fontSize: '0.92rem', marginBottom: '4px' }}>
                      <ShieldCheck size={18} /> Storage &amp; Freshness Care
                    </div>
                    <div style={{ fontSize: '0.94rem', color: 'var(--color-soft-charcoal)', fontWeight: 700 }}>
                      {analysisResult.recommended_storage}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-soft-charcoal)', opacity: 0.88, marginTop: '4px' }}>
                      💡 {analysisResult.storage_tips}
                    </div>
                  </div>

                  {/* Zero-Waste Recipes Section (With Appetizing Dish Images) */}
                  {analysisResult.zero_waste_recipes && analysisResult.zero_waste_recipes.length > 0 ? (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-soft-charcoal)' }}>
                          <ChefHat size={20} color="#ea580c" /> Zero-Waste Culinary Recipes
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted-grey)', fontWeight: 600 }}>
                          Cook before spoilage occurs
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '18px' }}>
                        {analysisResult.zero_waste_recipes.map((rec, i) => (
                          <div key={i} className="sense-card-recipe">
                            <div className="sense-recipe-image-wrap">
                              <img 
                                src={getRecipeDishImage(rec, analysisResult.detected_item)} 
                                alt={rec.recipe_name} 
                                className="sense-recipe-image" 
                              />
                            </div>
                            <div className="sense-recipe-content">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--color-soft-charcoal)', fontSize: '0.98rem' }}>{i + 1}. {rec.recipe_name}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#9a3412', background: '#FFEDD5', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                                  ⏱ {rec.prep_time_minutes} mins
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-soft-charcoal)', opacity: 0.9, lineHeight: 1.5 }}>
                                {rec.instructions}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isPeakFresh ? (
                    <div style={{
                      background: 'var(--color-fresh-mint)',
                      border: '1.5px solid rgba(120, 201, 154, 0.5)',
                      borderRadius: 'var(--sense-radius-md)',
                      padding: '16px 20px',
                      marginBottom: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>🍏</span>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-soft-charcoal)' }}>Peak Fresh Produce — No Salvage Recipes Needed!</strong>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: 'var(--color-soft-charcoal)', opacity: 0.85 }}>
                          This produce is in prime crisp condition! Enjoy it raw, chilled, or fresh-sliced to savor its natural taste.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Bar: Open PDF, Download PDF, Print Report, Retake */}
                  {!isHuman && !isNonFood && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
                      border: '1.5px solid var(--color-light-border)',
                      borderRadius: 'var(--sense-radius-md)',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            const pdf = generateFreshFoodPdf(analysisResult, imagePreview, ambientSensors);
                            pdf.openPdf();
                          }}
                          className="sense-btn-secondary"
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.86rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#F0FDF4',
                            borderColor: '#86EFAC',
                            color: '#15803D',
                            fontWeight: 700
                          }}
                        >
                          <ExternalLink size={16} />
                          <span>Open PDF</span>
                        </button>

                        <button
                          onClick={() => {
                            const pdf = generateFreshFoodPdf(analysisResult, imagePreview, ambientSensors);
                            pdf.downloadPdf();
                          }}
                          className="sense-btn-secondary"
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.86rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#EFF6FF',
                            borderColor: '#93C5FD',
                            color: '#1D4ED8',
                            fontWeight: 700
                          }}
                        >
                          <FileDown size={16} />
                          <span>Download PDF</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="sense-btn-secondary"
                          style={{ padding: '10px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Printer size={16} />
                          <span>Print</span>
                        </button>
                      </div>

                      <button
                        onClick={handleBack}
                        className="sense-btn-primary"
                        style={{
                          padding: '10px 20px',
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <RotateCcw size={16} />
                        <span>Inspect Another Item</span>
                      </button>
                    </div>
                  )}

                  {/* Scientific Uncertainty Notice */}
                  <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-muted-grey)',
                    borderTop: '1px solid var(--color-light-border)',
                    paddingTop: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Scientific Notice:</strong> {analysisResult.uncertainty_note || 'Visual inspection evaluates surface pigments and environmental respiration. Bacterial flora cannot be measured by photographs alone.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
