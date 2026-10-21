import React, { useState, useEffect } from 'react';
import './BhashiniVirasatCycler.css';

export const bhashiniLanguages = [
  { script: 'VIRASAT', lang: 'English', code: 'en' },
  { script: 'विरासत', lang: 'Hindi', code: 'hi' },
  { script: 'বিরাসত', lang: 'Bengali', code: 'bn' },
  { script: 'विरासत', lang: 'Marathi', code: 'mr' },
  { script: 'విరాసత్', lang: 'Telugu', code: 'te' },
  { script: 'விராஸத்', lang: 'Tamil', code: 'ta' },
  { script: 'વિરાસત', lang: 'Gujarati', code: 'gu' },
  { script: 'وراثت', lang: 'Urdu', code: 'ur' },
  { script: 'ವಿರಾಸತ್', lang: 'Kannada', code: 'kn' },
  { script: 'ବିରାସତ', lang: 'Odia', code: 'or' },
  { script: 'വിരാസത്', lang: 'Malayalam', code: 'ml' },
  { script: 'ਵਿਰਾਸਤ', lang: 'Punjabi', code: 'pa' },
  { script: 'বিৰাসত', lang: 'Assamese', code: 'as' },
  { script: 'विरासत', lang: 'Maithili', code: 'mai' },
  { script: 'ৱিৰાસত', lang: 'Manipuri', code: 'mni' },
  { script: 'ᱵᱤᱨᱟᱥᱟᱛ', lang: 'Santhali', code: 'sat' },
  { script: 'وراثت', lang: 'Kashmiri', code: 'ks' },
  { script: 'विरासत', lang: 'Nepali', code: 'ne' },
  { script: 'विरासत', lang: 'Konkani', code: 'kok' },
  { script: 'وراثت', lang: 'Sindhi', code: 'sd' },
  { script: 'विरासत', lang: 'Dogri', code: 'doi' },
  { script: 'बिरासत', lang: 'Bodo', code: 'brx' },
  { script: 'विरासतम्', lang: 'Sanskrit', code: 'sa' },
];

export default function BhashiniVirasatCycler({ intervalMs = 380, variant = 'splash' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFluctuating, setIsFluctuating] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsFluctuating(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bhashiniLanguages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  const currentItem = bhashiniLanguages[currentIndex];

  return (
    <div className={`bhashini-cycler-container variant-${variant}`}>
      <div className="bhashini-word-box">
        <span className={`bhashini-script-text ${isFluctuating ? 'is-animating' : ''}`} key={currentItem.script}>
          {currentItem.script}
        </span>
      </div>
    </div>
  );
}
