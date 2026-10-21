import { useState, useCallback, useRef } from 'react';

export function useDawn() {
  const [dawn, setDawn] = useState(0); // 0.0 to 1.0
  const [stage, setStage] = useState('idle'); // 'idle' | 'focus' | 'igniting' | 'opening' | 'stepping' | 'error'
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const animFrameRef = useRef(null);

  // Update dawn smoothly based on input progress
  const updateProgress = useCallback((identifierLen, passwordLen) => {
    const totalChars = (identifierLen || 0) + (passwordLen || 0);
    // 0 to ~14 chars maps to 0.0 -> 0.75 dawn progress
    const targetDawn = Math.min(0.75, (totalChars / 14) * 0.75);
    setDawn((prev) => Math.max(prev, targetDawn));
  }, []);

  const handleFieldFocus = useCallback(() => {
    if (stage === 'idle') setStage('focus');
  }, [stage]);

  const handleFieldBlur = useCallback(() => {
    if (stage === 'focus') setStage('idle');
  }, [stage]);

  const triggerError = useCallback((msg) => {
    setStage('error');
    setIsError(true);
    setErrorMessage(msg || "That key doesn't turn. Try again.");

    // Soft error shake & dusk flicker duration ~550ms
    setTimeout(() => {
      setIsError(false);
      setStage('idle');
    }, 550);
  }, []);

  // 5-Stage Submit & Arrival Sequence
  const triggerSubmitSequence = useCallback((onArriveNav) => {
    // 1. Gather (150ms): Dawn -> 1.0, ground glow flares, motifs snap lit
    setStage('igniting');
    setDawn(1.0);

    // 2. Ignite (300ms): Handle blazes, starburst rays flash
    setTimeout(() => {
      setStage('opening');

      // 3. Open (650ms): 3D rotateY door swing open + light bloom overexposure
      setTimeout(() => {
        setStage('stepping');

        // 4. Step Through (400ms): Viewport scales up 1.08 into light
        setTimeout(() => {
          // 5. Arrive
          if (onArriveNav) onArriveNav();
        }, 400);
      }, 650);
    }, 300);
  }, []);

  return {
    dawn,
    stage,
    isError,
    errorMessage,
    updateProgress,
    handleFieldFocus,
    handleFieldBlur,
    triggerError,
    triggerSubmitSequence,
  };
}
