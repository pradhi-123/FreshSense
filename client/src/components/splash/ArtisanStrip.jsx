import React from 'react';
import './ArtisanStrip.css';
import splashRefImg from '../../assets/splash-ref.png';

export default function ArtisanStrip() {
  return (
    <div className="artisan-sequence-container" aria-label="Artisans at work sequence">
      {/* High Quality Uncropped Render Wrapper */}
      <div className="artisan-strip-ref-wrap">
        {/* Container with exact aspect ratio showing ALL 4 figures without any side or vertical cropping */}
        <div className="artisan-strip-image-crop">
          <img
            src={splashRefImg}
            alt="Four artisans crafting: Weaver, Potter, Sculptor, Painter"
            className="artisan-strip-ref-img"
          />
          {/* Sweeping light beam overlay */}
          <div className="artisan-strip-light-beam" />
        </div>

        {/* Dynamic Light Travel Layer precisely aligned over all 4 figures & 3 dots */}
        <div className="light-travel-track">
          {/* Node 1: Weaver (14%) */}
          <div className="artisan-node node--1">
            <div className="node-glow-ring" />
            <div className="pedestal-line" />
          </div>

          {/* Connection 1 (26.4%) */}
          <div className="conn-line conn--1">
            <span className="glowing-pulse-dot dot--1" />
          </div>

          {/* Node 2: Potter (38.9%) */}
          <div className="artisan-node node--2">
            <div className="node-glow-ring" />
            <div className="pedestal-line" />
          </div>

          {/* Connection 2 (50%) */}
          <div className="conn-line conn--2">
            <span className="glowing-pulse-dot dot--2" />
          </div>

          {/* Node 3: Sculptor (61.1%) */}
          <div className="artisan-node node--3">
            <div className="node-glow-ring" />
            <div className="pedestal-line" />
          </div>

          {/* Connection 3 (73.6%) */}
          <div className="conn-line conn--3">
            <span className="glowing-pulse-dot dot--3" />
          </div>

          {/* Node 4: Painter (86%) */}
          <div className="artisan-node node--4">
            <div className="node-glow-ring" />
            <div className="pedestal-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
