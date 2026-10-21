import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runPitchRecording() {
  console.log('🚀 Starting Virasat 5-Minute HD Mobile Pitch Video Recorder with Captions...');
  
  const outputDir = path.resolve(process.cwd(), 'scratch', 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err1) {
    try {
      console.log('Falling back to system Google Chrome...');
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (err2) {
      console.log('Falling back to system Microsoft Edge...');
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    }
  }

  // HD Mobile Viewport (Pixel 6 Pro / Modern Smartphone bounds)
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: outputDir,
      size: { width: 412, height: 915 },
    },
  });

  const page = await context.newPage();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper to inject stylish live presentation captions
  const setCaption = async (text) => {
    await page.evaluate((captionText) => {
      let el = document.getElementById('virasat-pitch-caption');
      if (!el) {
        el = document.createElement('div');
        el.id = 'virasat-pitch-caption';
        el.style.position = 'fixed';
        el.style.bottom = '16px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.width = '92%';
        el.style.maxWidth = '380px';
        el.style.background = 'rgba(43, 36, 32, 0.94)';
        el.style.border = '1.5px solid #C8963E';
        el.style.color = '#FFFBF3';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '14px';
        el.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        el.style.fontSize = '12px';
        el.style.fontWeight = '700';
        el.style.textAlign = 'center';
        el.style.zIndex = '99999';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6), 0 0 14px rgba(200,150,62,0.35)';
        el.style.transition = 'all 0.35s ease';
        document.body.appendChild(el);
      }
      el.innerHTML = captionText;
    }, text);
  };

  try {
    // -------------------------------------------------------------
    // SCENE 1: Splash Screen & Problem Pitch intro (25 seconds)
    // -------------------------------------------------------------
    console.log('1️⃣ [0:00 - 0:25] Splash Screen & Problem Pitch Intro...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await setCaption('📱 VIRASAT — AI Virtual Business Manager for 7M+ Indian Artisans');
    await delay(5000);

    // Continuous dynamic scrolling
    await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
    await delay(6000);
    await setCaption('🇮🇳 Eliminating Digital Exclusion & Arbitrary Pricing for Rural Karigars');
    await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
    await delay(7000);
    await page.evaluate(() => window.scrollBy({ top: -360, behavior: 'smooth' }));
    await delay(7000);

    // -------------------------------------------------------------
    // SCENE 2: Low-Literacy 1-Click Mobile Login (30 seconds)
    // -------------------------------------------------------------
    console.log('2️⃣ [0:25 - 0:55] Low-Friction Mobile Login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await setCaption('🔑 Low-Friction Login — Zero Literacy Barrier for Rural Artisans');
    await delay(5000);

    const phoneInput = await page.$('input[type="tel"], input[placeholder*="Phone"], input[type="text"]');
    if (phoneInput) {
      await phoneInput.focus();
      await delay(1000);
      await phoneInput.type('9876543210', { delay: 180 });
      await delay(4000);
    }

    const sendOtpBtn = await page.$('button:has-text("OTP"), button:has-text("Send")');
    if (sendOtpBtn) {
      await sendOtpBtn.click();
      await setCaption('📲 Instant Mobile OTP Authentication for Low-End Smartphones');
      await delay(5000);
    }

    const enterBtn = await page.$('button:has-text("Enter"), button:has-text("Login"), button:has-text("Start")');
    if (enterBtn) {
      await enterBtn.click();
      await delay(5000);
    }

    // -------------------------------------------------------------
    // SCENE 3: Spoken Voice Onboarding (50 seconds)
    // Profile: Rameshwari Devangan • Kosa Silk Weaving • Champa, Chhattisgarh
    // -------------------------------------------------------------
    console.log('3️⃣ [0:55 - 1:45] Spoken Voice Onboarding (Rameshwari Devangan)...');
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'networkidle' });
    await setCaption('🎙️ Spoken Voice Onboarding — 4 Natural Dialect Questions');
    await delay(6000);

    const micBtn = await page.$('.mic-circle, button:has-text("Mic"), .voice-mic-circle');
    if (micBtn) {
      await micBtn.click();
      await setCaption('🗣️ Listening in Native Regional Dialect (Champa, Chhattisgarh)');
      await delay(9000);
    }

    await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
    await delay(8000);
    await setCaption('✍️ Voice-to-Text Processing & Public Consensus Verification');
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await delay(9000);
    await page.evaluate(() => window.scrollBy({ top: -470, behavior: 'smooth' }));
    await delay(8000);

    // -------------------------------------------------------------
    // SCENE 4: Artisan Home Hub & Bhashini 22-Language Switcher (65 seconds)
    // -------------------------------------------------------------
    console.log('4️⃣ [1:45 - 2:50] Artisan Hub Home & Bhashini 22-Language Switcher...');
    await page.goto('http://localhost:5173/artisan', { waitUntil: 'networkidle' });
    await setCaption('👩‍🎨 Artisan Hub (S2) — Profile: Rameshwari Devangan (Master Weaver)');
    await delay(7000);

    // Demonstrate Bhashini 22-Language Switcher
    const langSelect = await page.$('select');
    if (langSelect) {
      await setCaption('🌐 BHASHINI Integration — Real-Time Translation in 22 Official Languages');
      await langSelect.selectOption({ index: 1 }); // Hindi
      await delay(5000);
      await langSelect.selectOption({ index: 2 }); // Assamese
      await delay(5000);
      await langSelect.selectOption({ index: 0 }); // English
      await delay(5000);
    }

    // Scroll Hub to showcase rich craft product photos
    await setCaption('📦 Your Active Craft Listings — Kosa Silk, Terracotta & Madhubani Art');
    await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
    await delay(8000);
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await delay(8000);
    await setCaption('📊 Live Market Sync — Real-Time ONDC & GeM Marketplace Integration');
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await delay(8000);
    await page.evaluate(() => window.scrollBy({ top: -1000, behavior: 'smooth' }));
    await delay(8000);

    // Click Hero Action Button
    const heroBtn = await page.$('.hero-add-product-btn');
    if (heroBtn) {
      await heroBtn.click();
      await delay(6000);
    } else {
      await page.goto('http://localhost:5173/capture', { waitUntil: 'networkidle' });
      await delay(6000);
    }

    // -------------------------------------------------------------
    // SCENE 5: AI Capture Studio & Section 8.6 Fair Pricing (75 seconds)
    // -------------------------------------------------------------
    console.log('5️⃣ [2:50 - 4:05] AI Capture Studio, Pixel Engine & Pricing Engine...');
    await setCaption('📸 AI Capture Studio (S3/S5) — Raw Smartphone Photo Enhancement');
    await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
    await delay(7000);

    // Drag Before/After split slider handle back and forth smoothly
    const sliderHandle = await page.$('.slider-handle, .before-after-handle, input[type="range"]');
    if (sliderHandle) {
      const box = await sliderHandle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x - 120, box.y);
        await delay(2500);
        await page.mouse.move(box.x + 120, box.y);
        await delay(2500);
        await page.mouse.up();
      }
    }

    await setCaption('🎨 Canvas Pixel Extraction — Color Palette %, Weave Density & 97% Rating');
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await delay(8000);

    // Audio TTS button tap
    const audioBtn = await page.$('.audio-reader-btn');
    if (audioBtn) {
      await setCaption('📜 AI Craft Lineage Story Generation & Audio Voice Reader 🔊');
      await audioBtn.click();
      await delay(6000);
    }

    // Interactive Craft Pricing Parameter Inputs ("Adjust Numbers")
    const adjustBtn = await page.$('button:has-text("Adjust Numbers"), .params-toggle-btn');
    if (adjustBtn) {
      await setCaption('💰 Section 8.6 Blueprint Fair Pricing Engine & Dynamic Formula Editor');
      await adjustBtn.click();
      await delay(5000);

      const matInput = await page.$('#input-mat-cost');
      if (matInput) {
        await matInput.focus();
        await matInput.fill('7500');
        await setCaption('📈 Real-Time Price Count-Up in Deep Gold as Artisan Adjusts Inputs');
        await delay(5000);
      }

      const hoursInput = await page.$('#input-craft-hours');
      if (hoursInput) {
        await hoursInput.focus();
        await hoursInput.fill('50');
        await delay(5000);
      }
    }

    await setCaption('🚀 1-Click Publishing Directly to ONDC & GeM Marketplace');
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await delay(8000);

    // -------------------------------------------------------------
    // SCENE 6: Verified Digital Karigar Pass (35 seconds)
    // Featuring Rameshwari Devangan Official Pass Card
    // -------------------------------------------------------------
    console.log('6️⃣ [4:05 - 4:40] Verified Digital Karigar Pass (Rameshwari Devangan)...');
    await page.goto('http://localhost:5173/karigar-pass', { waitUntil: 'networkidle' });
    await setCaption('🏅 Verified Digital Karigar Pass — Rameshwari Devangan (GI Certified)');
    await delay(8000);

    await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
    await delay(7000);

    const shareBtn = await page.$('.pass-share-btn');
    if (shareBtn) {
      await setCaption('📲 WhatsApp Shareable Link & QR Code Verification Tag');
      await shareBtn.click();
      await delay(5000);
    }
    await page.evaluate(() => window.scrollBy({ top: -220, behavior: 'smooth' }));
    await delay(7000);

    // -------------------------------------------------------------
    // SCENE 7: Public Storefront & Orders Capacity (35 seconds)
    // -------------------------------------------------------------
    console.log('7️⃣ [4:40 - 5:15] Storefront & Orders Capacity Drawer...');
    await page.goto('http://localhost:5173/storefront', { waitUntil: 'networkidle' });
    await setCaption('🛍️ Public Karigar Micro-Storefront for Direct Buyer Purchases');
    await delay(8000);
    await page.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
    await delay(8000);

    await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle' });
    await setCaption('📦 Orders & Production Pace Drawer — Capacity Management');
    await delay(10000);

    console.log('✅ 5-Minute HD Mobile Pitch Video with Captions Complete!');
  } catch (err) {
    console.error('Recording error:', err);
  } finally {
    await context.close();
    await browser.close();
    console.log('🎥 Pitch video recording saved in scratch/recordings/ !');
  }
}

runPitchRecording();
