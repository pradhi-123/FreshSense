import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDemoState, getAlerts } from './api.js';
import socket from './socket.js';

const Ctx = createContext(null);

export function AnahatProvider({ children }) {
  const [role, setRole]           = useState(null);       // 'personnel'|'welfare_officer'|'commander'
  const [personnelId, setPersonnelId] = useState('p017');
  const [language, setLanguage]   = useState('ta');
  const [consent, setConsent]     = useState(false);
  const [demoState, setDemoState] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts]       = useState([]);

  const addToast = useCallback((msg, type='info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const refreshDemo = useCallback(async () => {
    try {
      const d = await getDemoState();
      setDemoState(d);
      setAlertCount(d.alertCount || 0);
    } catch {}
  }, []);

  // Socket
  useEffect(() => {
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('alert:new', data => {
      setAlertCount(c => c + 1);
      refreshDemo();
      if (role === 'welfare_officer') {
        addToast(`⚠ Alert raised — ${data.pseudonym}`, 'amber');
      }
    });

    socket.on('alert:updated', () => { refreshDemo(); });
    socket.on('checkin:new',   () => { refreshDemo(); });

    return () => {
      socket.off('connect'); socket.off('disconnect');
      socket.off('alert:new'); socket.off('alert:updated'); socket.off('checkin:new');
    };
  }, [role, refreshDemo, addToast]);

  useEffect(() => { refreshDemo(); }, [refreshDemo]);

  return (
    <Ctx.Provider value={{
      role, setRole,
      personnelId, setPersonnelId,
      language, setLanguage,
      consent, setConsent,
      demoState, refreshDemo,
      alertCount, setAlertCount,
      connected,
      toasts, addToast,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAnahat = () => useContext(Ctx);
