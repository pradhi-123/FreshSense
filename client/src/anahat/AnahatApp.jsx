import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnahatProvider, useAnahat } from './AnahatContext.jsx';
import './anahat.css';

// Pages
import RoleSelect   from './pages/RoleSelect.jsx';
import P0Consent    from './pages/P0Consent.jsx';
import P1Home       from './pages/P1Home.jsx';
import P2Checkin    from './pages/P2Checkin.jsx';
import P3Processing from './pages/P3Processing.jsx';
import P4MyData     from './pages/P4MyData.jsx';
import P5Notifs     from './pages/P5Notifs.jsx';
import W1Alerts     from './pages/W1Alerts.jsx';
import W2PersonView from './pages/W2PersonView.jsx';
import C1Commander  from './pages/C1Commander.jsx';
import DemoControl  from './pages/DemoControl.jsx';

function ToastBar() {
  const { toasts } = useAnahat();
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:16, right:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8, maxWidth:320 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type==='amber' ? 'var(--amber)' : 'var(--panel)',
          color: t.type==='amber' ? 'var(--night)' : 'var(--frost)',
          padding:'12px 16px', borderRadius:12, fontSize:14, fontWeight:600,
          fontFamily:'var(--font)', boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
          animation:'an-fade 0.2s ease', border: t.type!=='amber' ? '1px solid var(--steel)' : 'none'
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function AppRoutes() {
  const { role } = useAnahat();

  return (
    <>
      <ToastBar />
      <Routes>
        <Route path="/"            element={<RoleSelect />} />
        <Route path="/consent"     element={role==='personnel' ? <P0Consent /> : <Navigate to="/" />} />
        <Route path="/home"        element={role==='personnel' ? <P1Home /> : <Navigate to="/" />} />
        <Route path="/checkin"     element={role==='personnel' ? <P2Checkin /> : <Navigate to="/" />} />
        <Route path="/processing"  element={role==='personnel' ? <P3Processing /> : <Navigate to="/" />} />
        <Route path="/my-data"     element={role==='personnel' ? <P4MyData /> : <Navigate to="/" />} />
        <Route path="/notifications" element={role==='personnel' ? <P5Notifs /> : <Navigate to="/" />} />
        <Route path="/alerts"      element={role==='welfare_officer' ? <W1Alerts /> : <Navigate to="/" />} />
        <Route path="/alerts/:id"  element={role==='welfare_officer' ? <W2PersonView /> : <Navigate to="/" />} />
        <Route path="/unit"        element={role==='commander' ? <C1Commander /> : <Navigate to="/" />} />
        <Route path="/demo"        element={<DemoControl />} />
        <Route path="*"            element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function AnahatApp() {
  return (
    <AnahatProvider>
      <AppRoutes />
    </AnahatProvider>
  );
}
