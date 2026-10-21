import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkHealth, fetchLandingContent } from '../api/client';
import logoImg from '../assets/virasat-logo.png';
import stripImg from '../assets/splash-ref.png';

// Global landing content cache for instant loading
export let landingContentCache = null;

export function useAppBoot() {
  const navigate = useNavigate();
  const location = useLocation();

  const [statusText, setStatusText] = useState('Lighting the lamp...');
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const isMountedRef = useRef(true);
  const timeoutsRef = useRef([]);

  const addTimeout = (fn, delay) => {
    const id = setTimeout(() => {
      if (isMountedRef.current) {
        fn();
      }
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    isMountedRef.current = true;
    const MIN_SPLASH_TIME = 8800;
    const HARD_CAP_TIME = 12000;

    const messages = [
      'Lighting the lamp...',
      'Gathering the artisans...',
      'Interpreting your story...',
      'Opening your marketplace...',
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      if (isMountedRef.current) {
        setStatusText(messages[msgIndex]);
      }
    }, 1500);

    const startTime = Date.now();
    let isDone = false;

    const finishBoot = () => {
      if (isDone || !isMountedRef.current) return;
      isDone = true;
      clearInterval(msgInterval);
      setStatusText('Ready');
      setIsComplete(true);
      sessionStorage.setItem('virasat_boot_done', 'true');

      // Hold full ring glow for ~600ms then start exit bloom
      addTimeout(() => {
        if (!isMountedRef.current) return;
        setIsExiting(true);

        // Allow exit bloom animation ~750ms then navigate into Login Door ONLY if still on Splash route ('/')
        addTimeout(() => {
          if (isMountedRef.current && window.location.pathname === '/') {
            navigate('/login', { replace: true });
          }
        }, 750);
      }, 600);
    };

    // Hard cap timer
    const hardCapId = setTimeout(() => {
      finishBoot();
    }, HARD_CAP_TIME);
    timeoutsRef.current.push(hardCapId);

    // Helper to decode images
    const decodeImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        if (img.decode) {
          img.decode().then(resolve).catch(resolve);
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    };

    // Fetch data and decode images while waiting for boot completion
    const bootWork = async () => {
      try {
        await Promise.allSettled([
          decodeImage(logoImg),
          decodeImage(stripImg),
          checkHealth(8000),
          fetchLandingContent(8000).then((data) => {
            if (data) landingContentCache = data;
          }),
        ]);
      } catch (err) {
        console.warn('Boot fetch error:', err);
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

      addTimeout(() => {
        clearTimeout(hardCapId);
        finishBoot();
      }, remaining);
    };

    bootWork();

    return () => {
      isMountedRef.current = false;
      clearInterval(msgInterval);
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [navigate]);

  const skipBoot = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (window.location.pathname === '/') {
      navigate('/login', { replace: true });
    }
  };

  return { statusText, isComplete, isExiting, skipBoot };
}
