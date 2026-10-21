# Virasat — Architectural & Design System Blueprint Paper
**AI-Driven Market Linkage for Marginalized Artisans**  
*SIH 2026 Problem Statement SIH26090 — Team Lucid Approach Technical & Visual Specification Paper*

---

## Executive Summary & Vision

**Virasat** is built on a single core principle: **"One Lamp, One New Dawn."** The interface is designed specifically for rural, semi-literate, and marginalized craftspersons across India's 22 official language regions. Instead of forcing artisans to navigate complex e-commerce forms, choose technical categories, or type product descriptions, Virasat bridges photography and natural voice into an effortless, dignified market entry point.

This document serves as the **authoritative team specification paper** detailing the locked **Muga Gold Design System**, color roles, universal multi-script typography, motion curves, AI capture workflow, Karigar Pass digital credentials, and low-end Android performance guidelines.

---

## 1. Color Palette & Functional Roles

Every color in Virasat is sourced directly from authentic craft materials (Assam's Muga silk, lac-dye terracotta, unbleached cotton ivory, and the Gamosa heritage weave).

| Token Name | Hex Code | Functional Role | Allocation |
| :--- | :--- | :--- | :--- |
| **`--ivory`** | `#F7EFDF` | Main canvas for daylight working screens | 60% |
| **`--card`** | `#FFFBF3` | Input surfaces, product cards, review boxes | Canvas sub-layer |
| **`--ink`** | `#2B2420` | Body text, and night canvas for story moments | 30% |
| **`--lac`** | `#5A2E1F` | Captions, secondary labels, pricing justifications | Text sub-layer |
| **`--gold`** | `#C8963E` | Primary action buttons, golden thread loom | 10% |
| **`--gold-deep`** | `#8A6320` | High-contrast gold text on ivory canvas | Readable gold text |
| **`--honey`** | `#E9C77B` | Card borders, selected states, gold text on ink | Decorative borders |
| **`--honey-tint`** | `#F3E3BE` | Soft badges (e.g. `✨ AI Enhanced`) | Badges & tags |
| **`--gamosa`** | `#B3261E` | Pride & honor moments ONLY (Karigar Pass seal) | < 2% |
| **`--ink-track`** | `#3D332C` | Loom shuttle animation background track | Motion track |

### The Three Strict Color Contrast Rules
1. **Gold is Never Text on Ivory**: `--gold` (`#C8963E`) on `--ivory` lacks contrast for outdoor phone readability. Use **`--gold-deep`** (`#8A6320`) for gold-colored text on daylight surfaces.
2. **Gamosa Red is Reserved for Pride**: `--gamosa` (`#B3261E`) is reserved strictly for honor moments (Karigar Pass seal, first sale milestone). Soft errors use `--lac` text on a `--honey-tint` badge with a retry button.
3. **Gold Means Value**: Use `--gold` exclusively for value-generating actions (Publish, Accept Order, prices, golden thread).

---

## 2. Universal Noto Multi-Script Typography

Virasat uses Google's universal **Noto Type System** to ensure equal typographic dignity across all 22 Bhashini Indian languages (Devanagari, Tamil, Telugu, Bengali, Assamese, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, etc.) without broken square glyphs.

```css
:root {
  --font-story: 'Noto Serif', 'Noto Serif Devanagari', 'Noto Serif Tamil', 'Noto Serif Bengali', serif;
  --font-ui:    'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Bengali', sans-serif;

  --text-display: clamp(2rem, 5vw, 2.5rem); /* 32px-40px */
  --text-title: 1.5rem;                    /* 24px */
  --text-heading: 1.25rem;                 /* 20px */
  --text-body: 1.125rem;                   /* 18px outdoor readability */
  --text-price: 1.75rem;                   /* 28px */
  --text-caption: 0.875rem;                /* 14px absolute minimum */

  --leading-latin: 1.5;
  --leading-indic: 1.7;
}
```

### Typographic Rules for Team Members
- **18px Minimum Body Text**: Set at 18px (`1.125rem`) rather than standard 16px to ensure effortless outdoor readability on older ₹8,000 Android smartphones.
- **Line Height `1.7` for Indic Scripts**: Scripts like Devanagari, Bengali, and Tamil feature matras above and below letters. Using line height `1.7` prevents clipping.
- **No Italics / No All-Caps for Indic**: Indian scripts lack italic and capital forms. Emphasis is conveyed via font weight (`700`) or color (`--gold-deep`).

---

## 3. Motion & Micro-Animations

Motion in Virasat is restrained and thematic, serving as a subtle narrative bridge:

1. **The Golden Thread Loom (`GoldenThreadLoom.jsx`)**:
   - The primary signature looping animation across processing and AI story generation screens.
   - A golden thread shuttle moves across a loom track (`#3D332C`) as a golden line weaves row-by-row.
2. **600ms Price Count-Up**:
   - AI-recommended fair prices count up from ₹0 to their target number (`₹14,500`) in `--gold-deep` over 600ms using `requestAnimationFrame`, highlighting the pricing reveal beat.
3. **Daylight-to-Night Transitions**:
   - Shifts from daylight ivory canvas (`/artisan`, `/review`) to night ink canvas (`/capture`, `/karigar-pass`) execute over a smooth **400ms fade** (`cubic-bezier(.2, .7, .2, 1)`).

---

## 4. Accessibility & Low Digital Literacy Architecture

1. **Voice-First Interaction Everywhere**:
   - The AI Capture Studio (`/capture`) features an always-visible mic bar ("Snap the product, then talk naturally").
   - Integrated Web Speech API support for all 22 Bhashini languages + simulated fallback prompt (*"Didn't catch that — tap to try again"*).
2. **Audio Reader Button ("🔊 Read Aloud")**:
   - Every product review card and listing includes a dedicated speech synthesis audio reader button that speaks the story and pricing justification aloud in the artisan's native language.
3. **Forgiving 56px Touch Targets**:
   - All interactive camera controls, mic buttons, and navigation options strictly adhere to a **56px minimum touch target size** to accommodate working artisans with calloused hands.

---

## 5. AI Photo & Voice Studio Screen Flow (`/capture`)

1. **Live Raw / Enhanced Viewfinder Toggle**:
   - Located directly on the camera preview window. Artisans toggle between original camera feed and instant AI Studio Enhancement before tapping shutter.
2. **Smart Lighting Hint Indicator**:
   - Real-time lighting advice ("✨ Lighting is optimal" / "💡 Move closer to natural window light").
3. **Three Primary Controls Only**:
   - `Gallery` (existing photos)
   - `Shutter Button` (Muga Gold ring)
   - `Lighting Assistant`
4. **AI Fair Pricing Engine**:
   - Displays recommended fair price (e.g. ₹14,500) alongside transparent AI reasoning (*"Based on 45 hours of hand-weaving and 100% natural Muga silk threads"*).

---

## 6. Karigar Pass Digital Certificate (`/karigar-pass`)

The **Karigar Pass** serves as a verified digital identity certificate for master artisans:
- Staged as a night moment card on a deep `--ink` (`#2B2420`) canvas.
- Framed with a single golden thread border (`--gold`).
- Displays the **Gamosa Red Pride Seal** (`#B3261E`).
- Features the artisan's name in Noto Serif, craft cluster origin, craft experience metrics, and a scannable verification QR code for buyers.

---

## 7. Performance & Hardware Budget

- **Target Device**: Budget Android devices (₹8,000 market segment, 2GB-3GB RAM).
- **CSS Hardware Acceleration**: Uses `transform: translate3d()` and `opacity` transitions exclusively for 60fps rendering.
- **PWA Offline Tolerance**: Saves listing drafts locally in `sessionStorage` / `IndexedDB` for seamless operation on weak 2G/3G rural networks.

---

*Verified & Enforced across Virasat SIH 2026 Prototype codebase.*
