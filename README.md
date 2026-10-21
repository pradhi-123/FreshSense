# Virasat — One Lamp, One New Dawn
> **AI-Driven Market Linkage and Smart Cataloging Application for Marginalized Artisans**  
> *Team Lucid Approach | Smart India Hackathon 2026 (Problem Statement SIH26090 — Heritage & Culture)*

---

## 🌟 Build 1: Web Prototype (Splash + Landing)

Virasat turns a phone and a voice note into a digital listing that tells an artisan's story, prices their worth, and reaches every market—from ONDC to GeM—on their own production rhythm.

### Features in Build 1:
1. **`/` Splash / Loading Screen**:
   - Diya emblem & artisan silhouette sequence with traveling light sweep and pulsing amber dots.
   - Circular glowing arc comet loader (`GlowRing`) with bloom glow and flame animation.
   - Status message cycler with smooth crossfades.
   - Real app boot logic (`useAppBoot`): minimum 3.2s splash time, image decoding, API prefetching, hard 6.5s cap, radial warm bloom exit transition.
   - Session bypass logic (`virasat_boot_done`, override with `?splash=1`).

2. **`/welcome` Landing Page**:
   - Sticky glass navbar with interactive language selector pill (English, Tamil, Hindi, with 22-language BHASHINI notice).
   - Hero section with phone mockup listing preview card.
   - Problem Band featuring the core pitch quote.
   - 8 AI feature cards with custom inline amber SVGs (`FeatureGrid`).
   - 5-step horizontal/vertical connected journey timeline (`JourneyTimeline`, `#how-it-works`).
   - ONDC, GeM, and storefront market access strip (`MarketsStrip`).
   - 4 impact metric cards (`ImpactCards`).
   - Footer & Closing CTA.

3. **`/coming-soon`**:
   - Placeholder screen for unbuilt routes (Build 2 boundary).

4. **MERN Backend**:
   - Express server (`port 5000`) with Mongoose models (`Feature`, `JourneyStep`, `ImpactCard`).
   - `GET /api/health`: Status check returning DB connectivity without crashing.
   - `GET /api/content/landing`: Returns sorted landing page data.
   - Idempotent seed script (`npm run seed`).
   - Offline fallback (`fallbackContent.js`) ensuring complete page render even when database or server is offline.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), React Router v6, Plain CSS (CSS Variables + Keyframes)
- **Backend**: Express, Node.js (ES Modules), Mongoose, Helmet, CORS, Morgan
- **Database**: MongoDB (`virasat` database)
- **Orchestration**: Concurrently

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Make sure your local MongoDB service is running (e.g. `mongodb://127.0.0.1:27017/virasat`), then run:
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
This runs both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently.

### 4. Direct Links & Demo Routes
- Splash Screen: `http://localhost:5173/?splash=1`
- Landing Page: `http://localhost:5173/welcome`
- Health Endpoint: `http://localhost:5000/api/health`
- Landing Content API: `http://localhost:5000/api/content/landing`