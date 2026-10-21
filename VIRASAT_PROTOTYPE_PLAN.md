# Virasat: Web Prototype, Build 1 (Splash + Landing)

> Put this file in the project root and tell the agent: "Read VIRASAT_PROTOTYPE_PLAN.md fully. Follow the phases in order. After each phase, run the app and check it against that phase's acceptance list before moving on."

---

## 0. Ground rules (read first)

1. **Stack is MERN only.** MongoDB (Mongoose), Express, React, Node.js. No Next.js, no Firebase, no Python service, no TypeScript. Plain JavaScript (ES modules).
2. React is scaffolded with **Vite**. Routing with `react-router-dom`. Styling with **plain CSS** (CSS variables + keyframes). No UI kit, no Tailwind.
3. Allowed extra packages, nothing else without a reason:
   - client: `react-router-dom`
   - server: `express`, `mongoose`, `cors`, `dotenv`, `helmet`, `morgan`
   - root: `concurrently`
4. Prototype targets a **web app that feels like a phone app**: mobile-first (design at 390px wide), and it must still look good on a 1440px desktop.
5. The landing page content **comes from MongoDB through the Express API**, with a local fallback file so the page still renders if the API is down (this mirrors the "offline-first" idea in the pitch).
6. All animation must respect `prefers-reduced-motion`.

---

## 1. What Virasat is (source: the SIH PPT)

- **Name:** Virasat. **Tagline:** "One lamp, one new dawn."
- **Team:** Lucid Approach. **SIH 2026 Problem Statement:** SIH26090, "AI-Driven Market Linkage and Smart Cataloging Mobile Application for Marginalized Artisans". Theme: Heritage & Culture. Category: Software.
- **Problem:** Around 1,500 artisans get exposure through trade fairs, but those are temporary and sometimes costly. There's no continuous digital marketplace. Low digital literacy, language barriers, weak product photos and no idea how to price keep artisans out of e-commerce.
- **Pitch line:** "A hand's shape in the clay. A family's memory in the weave. Worth generations, priced for none of it."
- **One-line product:** Virasat turns a phone and a voice note into a listing that tells your story, prices your worth, and reaches every market, ONDC to GeM, on your own production rhythm, not a warehouse's.

This build only covers the first two screens. Nothing else in the app gets built yet.

---

## 2. Scope of Build 1

| # | Route | Page | Purpose |
|---|-------|------|---------|
| 1 | `/` | **Splash / Loading** | Logo, artisan-at-work sequence, circular glowing loader. Boots the app, then opens page 2. |
| 2 | `/welcome` | **Landing / Welcome** | Skeleton info about Virasat: hero, problem, 8 features, how it works, markets, impact, footer. |

Anything else the user clicks (Get started, Login) goes to a small placeholder screen at `/coming-soon` that says the next build is on its way. Don't build login or onboarding yet.

---

## 3. Folder structure

```
virasat/
├─ package.json                 # root: scripts to run client + server together
├─ VIRASAT_PROTOTYPE_PLAN.md    # this file
├─ server/
│  ├─ package.json
│  ├─ .env.example
│  └─ src/
│     ├─ server.js              # starts app, connects DB
│     ├─ app.js                 # express app, middleware, routes
│     ├─ config/db.js
│     ├─ models/
│     │  ├─ Feature.js
│     │  ├─ JourneyStep.js
│     │  └─ ImpactCard.js
│     ├─ controllers/
│     │  ├─ health.controller.js
│     │  └─ content.controller.js
│     ├─ routes/
│     │  ├─ health.routes.js
│     │  └─ content.routes.js
│     └─ seed/seed.js
└─ client/
   ├─ package.json
   ├─ vite.config.js            # proxy /api -> http://localhost:5000
   ├─ index.html
   └─ src/
      ├─ main.jsx
      ├─ App.jsx                # routes
      ├─ api/client.js
      ├─ assets/
      │  ├─ virasat-logo.png        # the Virasat logo image (lamp + petals + skyline)
      │  └─ artisan-strip.png       # the 4 potter silhouettes with glowing dots
      ├─ data/fallbackContent.js
      ├─ hooks/useAppBoot.js
      ├─ styles/
      │  ├─ tokens.css
      │  └─ global.css
      ├─ components/
      │  ├─ splash/
      │  │  ├─ GlowRing.jsx / GlowRing.css
      │  │  ├─ ArtisanStrip.jsx / ArtisanStrip.css
      │  │  └─ Embers.jsx           # tiny floating sparks in the background
      │  ├─ landing/
      │  │  ├─ Navbar.jsx
      │  │  ├─ Hero.jsx
      │  │  ├─ ProblemBand.jsx
      │  │  ├─ FeatureGrid.jsx
      │  │  ├─ JourneyTimeline.jsx
      │  │  ├─ MarketsStrip.jsx
      │  │  ├─ ImpactCards.jsx
      │  │  └─ Footer.jsx
      │  └─ common/Reveal.jsx       # fade-up on scroll (IntersectionObserver)
      └─ pages/
         ├─ Splash.jsx / Splash.css
         ├─ Landing.jsx / Landing.css
         └─ ComingSoon.jsx
```

---

## 4. Design system

Dark and warm, like a workshop lit by a single lamp. Taken from the logo sunset and the amber-on-dark artisan strip in the PPT.

**`tokens.css`**

```css
:root {
  /* surfaces */
  --bg-0: #0a0604;          /* deepest, splash background */
  --bg-1: #120b07;          /* page background */
  --bg-2: #1b110b;          /* raised sections */
  --glass: rgba(255, 214, 160, 0.06);
  --glass-border: rgba(255, 200, 130, 0.16);

  /* light */
  --amber-300: #ffd08a;
  --amber-400: #ffbb5c;
  --amber-500: #f5a742;     /* primary accent */
  --ember-500: #e0672b;     /* secondary accent, CTA gradient end */
  --glow: 0 0 24px rgba(245, 167, 66, 0.45);

  /* text */
  --text-hi: #f6ead8;
  --text-mid: #cdb99f;
  --text-lo: #8f7c66;

  /* type */
  --font-display: "Cormorant Garamond", "Noto Serif", serif;
  --font-body: "Poppins", "Noto Sans Tamil", "Noto Sans Devanagari", system-ui, sans-serif;

  --radius-lg: 22px;
  --radius-md: 14px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 5. Backend spec (Express + MongoDB)

**Env (`server/.env.example`)**

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/virasat
CLIENT_ORIGIN=http://localhost:5173
```

---

## 6. Page 1: Splash / Loading (`/`)

Splash layout, GlowRing, ArtisanStrip, Embers, Boot logic.

---

## 7. Page 2: Landing / Welcome (`/welcome`)

Mobile-first single page with smooth scroll, Navbar, Hero, ProblemBand, FeatureGrid, JourneyTimeline, MarketsStrip, ImpactCards, Footer.

---

## 8. Build phases

- Phase 0: Scaffold
- Phase 1: Backend
- Phase 2: Design system
- Phase 3: Splash page
- Phase 4: Landing page
- Phase 5: Polish
- Phase 6: Final run-through
