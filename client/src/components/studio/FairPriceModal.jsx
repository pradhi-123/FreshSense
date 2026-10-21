import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './FairPriceModal.css';

export default function FairPriceModal({ isOpen, onClose, onApplyPrice }) {
  const { t } = useLanguage();

  const [laborHours, setLaborHours] = useState(24);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [materialCost, setMaterialCost] = useState(1800);

  if (!isOpen) return null;

  const laborTotal = laborHours * hourlyRate;
  const totalPrice = laborTotal + materialCost;
  const laborPercent = Math.round((laborTotal / totalPrice) * 100);
  const materialPercent = 100 - laborPercent;

  const handleApply = () => {
    if (onApplyPrice) {
      onApplyPrice(totalPrice, { laborHours, hourlyRate, materialCost, laborTotal });
    }
    onClose();
  };

  return (
    <div className="fair-price-overlay" onClick={onClose}>
      <div className="fair-price-card" onClick={(e) => e.stopPropagation()}>
        <header className="fair-price-header">
          <div className="fair-price-badge">⚖️ VIRASAT FAIR PRICE AI</div>
          <button className="fair-price-close" onClick={onClose} aria-label="Close calculator">×</button>
        </header>

        <main className="fair-price-body">
          <h2 className="fair-price-title">Artisan Fair Price Calculator</h2>
          <p className="fair-price-sub">
            Calculate your true craft worth based on labor hours and material investment without middleman cuts.
          </p>

          {/* Interactive Controls */}
          <div className="fair-price-inputs">
            {/* 1. Labor Hours Slider */}
            <div className="fair-input-group">
              <div className="input-label-row">
                <label htmlFor="labor-hours-range">🧵 Labor Crafting Time</label>
                <span className="input-val-highlight">{laborHours} Hours</span>
              </div>
              <input
                id="labor-hours-range"
                type="range"
                min="4"
                max="60"
                step="2"
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value))}
                className="fair-slider"
              />
            </div>

            {/* 2. Hourly Skill Rate Toggle */}
            <div className="fair-input-group">
              <label>⭐ Artisan Skill Tier & Hourly Rate</label>
              <div className="tier-btn-grid">
                <button
                  type="button"
                  className={`tier-btn ${hourlyRate === 120 ? 'is-selected' : ''}`}
                  onClick={() => setHourlyRate(120)}
                >
                  ₹120/hr · Journeyman
                </button>
                <button
                  type="button"
                  className={`tier-btn ${hourlyRate === 150 ? 'is-selected' : ''}`}
                  onClick={() => setHourlyRate(150)}
                >
                  ₹150/hr · Master Karigar
                </button>
                <button
                  type="button"
                  className={`tier-btn ${hourlyRate === 200 ? 'is-selected' : ''}`}
                  onClick={() => setHourlyRate(200)}
                >
                  ₹200/hr · Lineage Master
                </button>
              </div>
            </div>

            {/* 3. Raw Material & Thread Investment */}
            <div className="fair-input-group">
              <div className="input-label-row">
                <label htmlFor="material-cost-range">🌿 Silk, Zari & Natural Dye Cost</label>
                <span className="input-val-highlight">₹ {materialCost.toLocaleString('en-IN')}</span>
              </div>
              <input
                id="material-cost-range"
                type="range"
                min="200"
                max="8000"
                step="100"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
                className="fair-slider"
              />
            </div>
          </div>

          {/* Visual Cost Distribution Bar */}
          <div className="distribution-bar-section">
            <div className="distribution-labels">
              <span className="dist-lbl labor">Labor Value ({laborPercent}%)</span>
              <span className="dist-lbl material">Material ({materialPercent}%)</span>
            </div>
            <div className="distribution-track">
              <div className="dist-fill labor-fill" style={{ width: `${laborPercent}%` }} />
              <div className="dist-fill material-fill" style={{ width: `${materialPercent}%` }} />
            </div>
          </div>

          {/* Computed Fair Price Result */}
          <div className="fair-price-result-box">
            <div className="result-label">Recommended Minimum Fair Price</div>
            <div className="result-amount">₹ {totalPrice.toLocaleString('en-IN')}</div>
            <div className="result-guarantee">
              ✓ 100% Direct Artisan Payout (Zero Middleman Margin)
            </div>
          </div>
        </main>

        <footer className="fair-price-footer">
          <button type="button" className="btn-primary apply-price-btn" onClick={handleApply}>
            Apply Fair Price to Listing →
          </button>
        </footer>
      </div>
    </div>
  );
}
