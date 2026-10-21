import React, { useEffect, useState } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemBand from '../components/landing/ProblemBand';
import BeforeAfterBand from '../components/landing/BeforeAfterBand';
import FeatureGrid from '../components/landing/FeatureGrid';
import CraftShowcase from '../components/landing/CraftShowcase';
import JourneyTimeline from '../components/landing/JourneyTimeline';
import ArtisanStories from '../components/landing/ArtisanStories';
import MarketsStrip from '../components/landing/MarketsStrip';
import ImpactCards from '../components/landing/ImpactCards';
import Footer from '../components/landing/Footer';
import Reveal from '../components/common/Reveal';
import { fetchLandingContent } from '../api/client';
import { fallbackContent } from '../data/fallbackContent';
import { landingContentCache } from '../hooks/useAppBoot';
import './Landing.css';

export default function Landing() {
  const [content, setContent] = useState(() => {
    return landingContentCache || fallbackContent;
  });

  useEffect(() => {
    if (landingContentCache) return;

    let isMounted = true;
    fetchLandingContent(5000).then((data) => {
      if (isMounted && data) {
        setContent(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <Reveal>
          <Hero />
        </Reveal>

        <Reveal delay={100}>
          <ProblemBand />
        </Reveal>

        <Reveal delay={100}>
          <BeforeAfterBand />
        </Reveal>

        <Reveal delay={100}>
          <FeatureGrid features={content.features} />
        </Reveal>

        <Reveal delay={100}>
          <CraftShowcase />
        </Reveal>

        <Reveal delay={100}>
          <JourneyTimeline steps={content.steps} />
        </Reveal>

        <Reveal delay={100}>
          <ArtisanStories />
        </Reveal>

        <Reveal delay={100}>
          <MarketsStrip />
        </Reveal>

        <Reveal delay={100}>
          <ImpactCards impact={content.impact} />
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
