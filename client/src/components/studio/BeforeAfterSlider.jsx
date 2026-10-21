import React, { useState, useRef, useCallback, useEffect } from 'react';
import './BeforeAfterSlider.css';

export default function BeforeAfterSlider({
  originalImg,
  enhancedImg,
  height = '340px',
  onPositionChange,
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let pos = (x / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;
      setSliderPos(pos);
      if (onPositionChange) onPositionChange(pos);
    },
    [onPositionChange]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="before-after-container"
      style={{ height }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        if (e.touches[0]) handleMove(e.touches[0].clientX);
      }}
    >
      {/* 1. Base Layer: Original RAW Photo */}
      <div className="slider-layer layer-raw">
        <img src={originalImg} alt="Original RAW Capture" className="slider-img raw-filter" />
        <span className="slider-badge badge-raw">RAW CAPTURE</span>
      </div>

      {/* 2. Top Layer: AI Studio Enhanced Photo (Clipped by sliderPos) */}
      <div
        className="slider-layer layer-enhanced"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={enhancedImg || originalImg} alt="AI Studio Enhanced" className="slider-img enhanced-filter" />
        <span className="slider-badge badge-enhanced">✨ AI STUDIO ENHANCED</span>
      </div>

      {/* 3. Sliding Handle Line */}
      <div
        className="slider-divider"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="slider-handle-button" aria-label="Drag to compare before and after">
          <span className="slider-arrow-icon">↔</span>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div className="slider-quick-toggles">
        <button
          type="button"
          className={`quick-tab ${sliderPos < 20 ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setSliderPos(0);
          }}
        >
          Raw Only
        </button>
        <button
          type="button"
          className={`quick-tab ${sliderPos >= 40 && sliderPos <= 60 ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setSliderPos(50);
          }}
        >
          50 / 50 Split
        </button>
        <button
          type="button"
          className={`quick-tab ${sliderPos > 80 ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setSliderPos(100);
          }}
        >
          Enhanced Only
        </button>
      </div>
    </div>
  );
}
