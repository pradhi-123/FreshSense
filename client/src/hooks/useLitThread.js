import { useState, useCallback } from 'react';

export function useLitThread() {
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [stage, setStage] = useState('idle'); // 'idle' | 'breath' | 'error' | 'success'
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateProgress = useCallback((idLen, passLen) => {
    // 0 to ~12 total characters maps to 0.0 -> 1.0 progress
    const totalChars = (idLen || 0) + (passLen || 0);
    const calculated = Math.min(1.0, totalChars / 12);
    setProgress(calculated);
  }, []);

  const triggerError = useCallback((msg) => {
    setIsError(true);
    setErrorMessage(msg || 'Incorrect email or password.');
    
    // Muted error shake & arc dim duration
    setTimeout(() => {
      setIsError(false);
    }, 300);
  }, []);

  const triggerSuccessSequence = useCallback((onCompleteNav) => {
    setStage('breath');
    setProgress(1.0);

    // 500ms single breath (1 -> 0.97 -> 1)
    setTimeout(() => {
      setStage('success');
      // 300ms calm route cross-fade
      setTimeout(() => {
        if (onCompleteNav) onCompleteNav();
      }, 300);
    }, 500);
  }, []);

  return {
    progress,
    stage,
    isError,
    errorMessage,
    updateProgress,
    triggerError,
    triggerSuccessSequence,
  };
}
