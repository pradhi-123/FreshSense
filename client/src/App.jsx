import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Splash from './pages/Splash';
import Login from './pages/Login';
import VoiceOnboarding from './pages/VoiceOnboarding';
import ArtisanHub from './pages/ArtisanHub';
import CaptureStudio from './pages/CaptureStudio';
import ProductReviewCard from './components/studio/ProductReviewCard';
import PublicStorefront from './pages/PublicStorefront';
import OrdersCapacity from './pages/OrdersCapacity';
import KarigarPass from './pages/KarigarPass';
import Landing from './pages/Landing';
import ComingSoon from './pages/ComingSoon';
import AnahatApp from './anahat/AnahatApp';

import SenseAIApp from './sense/SenseAIApp';

export default function App() {
  const { pathname } = useLocation();

  // Render Sense AI platform as primary application at root '/' or '/sense'
  if (pathname === '/' || pathname.startsWith('/sense')) {
    return <SenseAIApp />;
  }

  // Render Anahat app for all /anahat/* routes
  if (pathname.startsWith('/anahat')) {
    return <AnahatApp />;
  }

  return (
    <LanguageProvider>
      <Routes>
        <Route path="/sense" element={<SenseAIApp />} />
        <Route path="/legacy" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<VoiceOnboarding />} />
        <Route path="/artisan" element={<ArtisanHub />} />
        <Route path="/capture" element={<CaptureStudio />} />
        <Route path="/store/:slug" element={<PublicStorefront />} />
        <Route path="/storefront" element={<PublicStorefront />} />
        <Route path="/orders" element={<OrdersCapacity />} />
        <Route path="/karigar-pass" element={<KarigarPass />} />
        <Route path="/welcome" element={<Landing />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
