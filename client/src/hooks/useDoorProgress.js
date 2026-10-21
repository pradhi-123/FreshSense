import { useState, useCallback } from 'react';

export function useDoorProgress() {
  const [doorProgress, setDoorProgress] = useState(0); // 0.0 to 1.0
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleFieldBlur = useCallback(() => {
    // Keep focus flicker off on blur, but preserve doorProgress
    setIsFocused(false);
  }, []);

  const handleTyping = useCallback((identifierLen, passwordLen) => {
    // Max expected characters combined ~ 15
    const totalChars = (identifierLen || 0) + (passwordLen || 0);
    const calculatedProgress = Math.min(1.0, totalChars / 14);
    
    setDoorProgress((prev) => Math.max(prev, calculatedProgress));
  }, []);

  const triggerSubmit = useCallback(() => {
    setIsSubmitting(true);
    setIsError(false);
  }, []);

  const triggerError = useCallback(() => {
    setIsSubmitting(false);
    setIsError(true);
    
    // Clear error shake state after 600ms
    setTimeout(() => {
      setIsError(false);
    }, 600);
  }, []);

  const triggerOpen = useCallback((onCompleteNav) => {
    setIsSubmitting(false);
    setIsOpen(true);
    
    // Allow 750ms for CSS 3D door swing + warm light bloom before navigation
    setTimeout(() => {
      if (onCompleteNav) onCompleteNav();
    }, 850);
  }, []);

  return {
    doorProgress,
    isFocused,
    isSubmitting,
    isError,
    isOpen,
    handleFieldFocus,
    handleFieldBlur,
    handleTyping,
    triggerSubmit,
    triggerError,
    triggerOpen,
  };
}
