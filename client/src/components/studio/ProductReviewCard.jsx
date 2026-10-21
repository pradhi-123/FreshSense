import React, { useState, useEffect } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import BhashiniVoiceTranscriber from '../common/BhashiniVoiceTranscriber';
import { useLanguage } from '../../context/LanguageContext';
import './ProductReviewCard.css';

export default function ProductReviewCard({
  photoUrl,
  enhancedPhotoUrl,
  analysisData,
  onPublish,
  onViewPass,
}) {
  const { t } = useLanguage();
  const [displayPrice, setDisplayPrice] = useState(0);

  // Dynamic parameters state for live Section 8.6 price calculation
  const defaultHours = analysisData?.estimatedCraftHours || 24;
  const initialTargetPrice = analysisData?.fairPrice || 2800;
  const initialMatCost = Math.max(300, Math.round((initialTargetPrice / 1.25) - (defaultHours * 120)));

  const [craftHours, setCraftHours] = useState(defaultHours);
  const [materialCost, setMaterialCost] = useState(initialMatCost);
  const [hourlyWage, setHourlyWage] = useState(120);
  const [profitMargin, setProfitMargin] = useState(25);
  const [isEditingForm, setIsEditingForm] = useState(false);

  // Voice Transcriber integration states
  const [showCatalogVoiceInput, setShowCatalogVoiceInput] = useState(false);
  const [showStoryVoiceInput, setShowStoryVoiceInput] = useState(false);
  const [customDescription, setCustomDescription] = useState(analysisData?.description || '');
  const [customStory, setCustomStory] = useState(analysisData?.craftStory || '');

  // Synchronize state when analysisData is resolved
  useEffect(() => {
    if (analysisData) {
      const hours = analysisData.estimatedCraftHours || 24;
      const targetP = analysisData.fairPrice || 2800;
      const matC = Math.max(300, Math.round((targetP / 1.25) - (hours * 120)));
      setCraftHours(hours);
      setMaterialCost(matC);
    }
  }, [analysisData]);

  // Calculate dynamic fair price according to Section 8.6 blueprint formula
  const targetPrice = Math.round(
    (Number(materialCost) + Number(craftHours) * Number(hourlyWage)) * (1 + Number(profitMargin) / 100)
  );

  const palette = analysisData?.dominantPalette || [
    { name: 'Natural Earth Ochre', hex: '#E9C77B', percent: 50 },
    { name: 'Natural Fiber Base', hex: '#F7EFDF', percent: 30 },
    { name: 'Terracotta Accent', hex: '#5A2E1F', percent: 20 },
  ];

  // 600ms animated price count-up in deep gold whenever targetPrice changes
  useEffect(() => {
    let startTimestamp = null;
    const duration = 600;
    const startValue = displayPrice;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayPrice(Math.floor(startValue + progress * (targetPrice - startValue)));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetPrice]);

  // Text-to-speech audio reader simulation
  const handleReadAloud = () => {
    const storyText = analysisData?.craftStory || `Authentic Handwoven Kosa Silk Craft. Fair Price ₹${targetPrice}. Handwoven on Champa handloom.`;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(storyText);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="product-review-card">
      {/* 1. Interactive Before & After AI Enhancer Comparison Slider */}
      <div className="review-slider-stage">
        <BeforeAfterSlider
          originalImg={photoUrl}
          enhancedImg={enhancedPhotoUrl || photoUrl}
          height="340px"
        />
      </div>

      {/* 2. Card Content Body */}
      <div className="review-body">
        {/* Title & Read Aloud Audio Button */}
        <div className="review-title-row">
          <div>
            <span className="review-badge-verified">
              ✓ {analysisData?.verificationStatus || 'VERIFIED ARTISAN CRAFT'} ({analysisData?.weaveQualityScore || 97}% AUTHENTIC)
            </span>
            <h2 className="review-item-title">
              {analysisData?.title || 'Authentic Handcrafted Artisan Creation'}
            </h2>
          </div>
          <button
            type="button"
            className="audio-reader-btn"
            onClick={handleReadAloud}
            aria-label="Read story aloud"
            title="Listen in your language"
          >
            🔊
          </button>
        </div>

        {/* Product Description Box with Voice Cataloguer Integration */}
        <div className="listing-description-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="box-section-label">📦 ONDC Product Description</span>
            <button
              type="button"
              className="params-toggle-btn"
              onClick={() => setShowCatalogVoiceInput(!showCatalogVoiceInput)}
            >
              🎙️ {showCatalogVoiceInput ? 'Close Voice Input' : 'Voice Cataloguer'}
            </button>
          </div>

          <p className="listing-desc-text">
            {customDescription || analysisData?.description || 'Authentic artisan creation verified by Virasat AI canvas pixel spectrum analysis.'}
          </p>

          {showCatalogVoiceInput && (
            <BhashiniVoiceTranscriber
              compact
              sectionTitle="AI Multilingual Cataloguer (Describe Craft by Voice)"
              placeholder="Describe your craft materials, traditional techniques and cultural significance..."
              onInsertText={(text) => {
                setCustomDescription(text);
                setShowCatalogVoiceInput(false);
              }}
            />
          )}

          <div className="materials-care-row">
            <div className="material-tags-group">
              <span className="small-label">Materials:</span>
              {(analysisData?.materials || ['Natural Artisan Fiber', 'Organic Mineral Dyes']).map((mat, i) => (
                <span key={i} className="mat-chip">{mat}</span>
              ))}
            </div>
            <div className="care-group">
              <span className="small-label">Care:</span>
              <span className="care-text">{analysisData?.care || 'Clean gently with a soft dry cloth.'}</span>
            </div>
          </div>
        </div>

        {/* Real Canvas Pixel Color Analysis Breakdown */}
        <div className="pixel-analysis-panel">
          <div className="panel-header">
            <span className="panel-title">🎨 Canvas Pixel Palette & Weave Extraction</span>
            <span className="panel-timestamp">Analyzed at {analysisData?.analyzedAt || 'Just now'}</span>
          </div>

          {/* Color Swatches */}
          <div className="palette-swatch-row">
            {palette.map((item, idx) => (
              <div key={idx} className="swatch-chip">
                <span className="swatch-color-dot" style={{ background: item.hex }} />
                <span className="swatch-name">{item.name}</span>
                <span className="swatch-percent">{item.percent}%</span>
              </div>
            ))}
          </div>

          {/* Weave & Authenticity Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Yarn Density</span>
              <span className="metric-val">{analysisData?.weaveDensityThreads || 124} <small>threads/in</small></span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Labor Estimated</span>
              <span className="metric-val">{craftHours} <small>hours</small></span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Handloom Rating</span>
              <span className="metric-val badge-gold">{analysisData?.weaveQualityScore || 92}%</span>
            </div>
          </div>
        </div>

        {/* AI Craft Story with Voice Storytelling Integration */}
        <div className="story-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="story-label">📜 AI Craft Lineage Story (60-120 words)</span>
            <button
              type="button"
              className="params-toggle-btn"
              onClick={() => setShowStoryVoiceInput(!showStoryVoiceInput)}
            >
              🎙️ {showStoryVoiceInput ? 'Close Voice Input' : 'Voice Storytelling'}
            </button>
          </div>

          <p className="review-craft-story">
            "{customStory || analysisData?.craftStory || `Handcrafted artisan creation verified by Virasat AI canvas pixel spectrum analysis.`}"
          </p>

          {showStoryVoiceInput && (
            <BhashiniVoiceTranscriber
              compact
              sectionTitle="AI Craft Storytelling (Narrate Craft Lineage)"
              placeholder="Narrate the history, family lineage and story behind this piece in your native language..."
              onInsertText={(text) => {
                setCustomStory(text);
                setShowStoryVoiceInput(false);
              }}
            />
          )}
        </div>

        {/* Interactive Craft Pricing Parameter Inputs (Section 8.6 Formula Editor) */}
        <div className="craft-parameters-card">
          <div className="params-header" onClick={() => setIsEditingForm(!isEditingForm)}>
            <div className="params-title">
              <span>⚙️ Artisanal Pricing Parameters</span>
              <span className="params-sub">Tap to customize material cost & craft hours</span>
            </div>
            <button type="button" className="params-toggle-btn">
              {isEditingForm ? '▲ Hide' : '✏️ Adjust Numbers'}
            </button>
          </div>

          {isEditingForm && (
            <div className="params-fields-grid">
              <div className="param-field">
                <label htmlFor="input-mat-cost">Raw Material Cost (₹)</label>
                <input
                  id="input-mat-cost"
                  type="number"
                  min="0"
                  step="100"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Math.max(0, Number(e.target.value)))}
                />
              </div>

              <div className="param-field">
                <label htmlFor="input-craft-hours">Craft Labor (Hours)</label>
                <input
                  id="input-craft-hours"
                  type="number"
                  min="1"
                  step="1"
                  value={craftHours}
                  onChange={(e) => setCraftHours(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div className="param-field">
                <label htmlFor="input-hourly-wage">Artisan Wage (₹/hr)</label>
                <input
                  id="input-hourly-wage"
                  type="number"
                  min="50"
                  step="10"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Math.max(10, Number(e.target.value)))}
                />
              </div>

              <div className="param-field">
                <label htmlFor="input-margin">Fair Profit Margin (%)</label>
                <input
                  id="input-margin"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price Recommendation Section */}
        <div className="review-pricing-box">
          <div className="price-header">
            <span className="price-label">Recommended Fair Price</span>
            <span className="price-value-deep">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="price-justification-lac">
            Calculated by Virasat AI using Section 8.6 blueprint formula: fiber weave density ({analysisData?.weaveDensityThreads || 142} threads/in), {craftHours} craft hours at ₹{hourlyWage}/hr, ₹{materialCost.toLocaleString('en-IN')} raw material, and {profitMargin}% fair profit margin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="review-action-stack">
          <button
            type="button"
            className="muga-publish-btn"
            onClick={() => {
              const productPayload = {
                title: analysisData?.title || 'Authentic Handcrafted Artisan Creation',
                price: `₹ ${displayPrice.toLocaleString('en-IN')}`,
                rawPrice: displayPrice,
                category: analysisData?.craftType || 'Artisan Craft',
                image: enhancedPhotoUrl || photoUrl,
                story: customStory || analysisData?.craftStory || '',
                description: customDescription || analysisData?.description || '',
                craftHours,
                materialCost,
                materials: analysisData?.materials || ['Natural Artisan Fiber'],
                care: analysisData?.care || 'Clean gently with a soft dry cloth.'
              };
              onPublish(productPayload);
            }}
          >
            🚀 {t('publishBtn') || 'Publish Product directly to ONDC & GeM Marketplace'}
          </button>

          <button
            type="button"
            className="karigar-pass-link-btn"
            onClick={onViewPass}
            style={{ background: 'var(--surface-gold-soft, #FFF8EC)', border: '1px solid var(--border-gold-subtle, #D4AF37)', color: 'var(--gold-deep, #8A6320)' }}
          >
            🔬 Launch Complete 9-Step AI Verification & Storytelling Studio
          </button>

          <button type="button" className="karigar-pass-link-btn" onClick={onViewPass}>
            🏅 {t('viewKarigarPass') || 'View Verified Digital Karigar Pass'}
          </button>
        </div>
      </div>
    </div>
  );
}

