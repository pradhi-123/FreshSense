import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './GoldenThreadLoom.css';

export default function GoldenThreadLoom({ progressText, onFinished }) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, label: t('processPhoto') || '1. Enhancing photo & isolating craft background...' },
    { id: 2, label: t('processListing') || '2. Writing multilingual listing & tags...' },
    { id: 3, label: t('processPrice') || '3. Calculating transparent fair price formula...' },
    { id: 4, label: t('processStory') || '4. Weaving authentic craft story & Karigar lineage...' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 600);
    const timer2 = setTimeout(() => setActiveStep(3), 1200);
    const timer3 = setTimeout(() => setActiveStep(4), 1800);
    const timer4 = setTimeout(() => {
      if (onFinished) onFinished();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinished]);

  return (
    <div className="golden-loom-container screen-night">
      <div className="loom-shuttle-header">
        <span className="loom-eyebrow">VIRASAT NIGHT PROCESSING</span>
        <h2 className="loom-heading">{t('processTitle') || 'Weaving Your Craft Listing'}</h2>
      </div>

      <div className="weave-rows-stack">
        {steps.map((stepItem) => {
          const isDone = activeStep > stepItem.id;
          const isCurrent = activeStep === stepItem.id;

          return (
            <div
              key={stepItem.id}
              className={`weave-row-card ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-active' : ''}`}
            >
              <div className="row-label-line">
                <span className="step-icon">{isDone ? '✓' : isCurrent ? '🪡' : '⏳'}</span>
                <span className="step-text">{stepItem.label}</span>
              </div>
              <div className="thread-track-bg">
                <div className={`thread-fill-line ${isDone ? 'full' : isCurrent ? 'animating' : 'empty'}`} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="loom-footer-sub">
        {progressText || 'Every thread is woven in real-time by Virasat AI...'}
      </p>
    </div>
  );
}
