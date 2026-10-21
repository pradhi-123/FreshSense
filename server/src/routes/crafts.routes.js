import { Router } from 'express';

const router = Router();

// In-Memory Artisan Data for Blueprint Demonstration
const artisans = [
  {
    id: 'artisan-01',
    slug: 'junmoni-sualkuchi',
    display_name: 'Junmoni Das',
    name_script_lang: 'as',
    ui_lang: 'as',
    craft: 'Muga Silk Weaving',
    place: 'Sualkuchi, Assam',
    generation: 3,
    days_per_piece: 12,
    working_days_per_month: 24,
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    consent_public: true,
    verification_level: 2, // 2 = Govt Artisan ID Verified
  },
];

const mockOrders = [
  {
    id: 'ord-101',
    product_id: 'L01',
    artisan_id: 'artisan-01',
    buyer_name: 'Ananya Sharma',
    buyer_contact: '+91 98765 43210',
    status: 'in_progress',
    estimated_delivery: '2026-10-18',
    created_at: '2026-09-22',
  },
];

const mockListings = [
  {
    id: 'L01',
    title: 'Authentic Handwoven Muga Silk Mekhela Chador',
    category: 'Muga Silk Textiles',
    price: '₹ 14,500',
    numericPrice: 14500,
    status: 'Live on ONDC',
    badge: 'ONDC Verified',
    materialCost: 9000,
    laborHours: 72,
    daysTaken: 12,
    lineage: 'Sualkuchi Golden Silk Lineage',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
];

// GET /api/crafts - List all products
router.get('/', (req, res) => {
  res.json({
    ok: true,
    total: mockListings.length,
    crafts: mockListings,
  });
});

// GET /api/artisans/:id/capacity - Section 8.7 Made-to-order logic
router.get('/artisans/:id/capacity', (req, res) => {
  const artisan = artisans.find((a) => a.id === req.params.id) || artisans[0];
  const activeOrdersCount = mockOrders.filter((o) => o.artisan_id === artisan.id && o.status !== 'completed').length;

  const monthlyCapacity = Math.floor((artisan.working_days_per_month || 24) / (artisan.days_per_piece || 12));
  const openSlots = Math.max(0, monthlyCapacity - activeOrdersCount);
  const leadTimeDays = (activeOrdersCount + 1) * (artisan.days_per_piece || 12) + 3;

  const eta = new Date();
  eta.setDate(eta.getDate() + leadTimeDays);

  res.json({
    ok: true,
    artisan_id: artisan.id,
    monthlyCapacity,
    activeOrdersCount,
    openSlots,
    leadTimeDays,
    estimatedDeliveryDate: eta.toISOString().slice(0, 10),
  });
});

// GET /api/store/:slug - Section 8.4 Storefront Endpoint
router.get('/store/:slug', (req, res) => {
  const artisan = artisans.find((a) => a.slug === req.params.slug) || artisans[0];
  res.json({
    ok: true,
    artisan,
    products: mockListings,
  });
});

// GET /api/pass/:slug - Section 8.4 & 8.8 Karigar Pass Endpoint
router.get('/pass/:slug', (req, res) => {
  const artisan = artisans.find((a) => a.slug === req.params.slug) || artisans[0];
  res.json({
    ok: true,
    artisan,
    show_seal: artisan.verification_level > 0,
    verification_badge: 'Verified Karigar Seal (Government ID #2026-AS-491)',
    pass_url: `https://virasat.artisan/k/${artisan.slug}`,
  });
});

// GET & POST /api/orders - Section 8.4 Orders Endpoint
router.get('/orders', (req, res) => {
  res.json({
    ok: true,
    orders: mockOrders,
  });
});

router.post('/orders', (req, res) => {
  const { product_id, buyer_name, buyer_contact } = req.body;
  const newOrder = {
    id: `ord-${Date.now().toString().slice(-4)}`,
    product_id: product_id || 'L01',
    artisan_id: 'artisan-01',
    buyer_name: buyer_name || 'Valued Buyer',
    buyer_contact: buyer_contact || '+91 90000 00000',
    status: 'requested',
    estimated_delivery: '2026-10-20',
    created_at: new Date().toISOString().slice(0, 10),
  };
  mockOrders.push(newOrder);
  res.status(201).json({ ok: true, order: newOrder });
});

// In-memory profiles storage fallback
const verifiedProfiles = [];

// POST /api/crafts/verify-profile - Save Draft or Publish Final Verified Craft Profile
router.post('/verify-profile', async (req, res) => {
  try {
    const profileData = req.body;
    profileData.id = profileData.id || `CP-${Date.now().toString().slice(-6)}`;
    profileData.createdAt = new Date();

    let CraftProfile;
    try {
      const module = await import('../models/CraftProfile.js');
      CraftProfile = module.default;
    } catch (e) {
      console.warn('CraftProfile model import fallback:', e);
    }

    if (CraftProfile) {
      try {
        const saved = await CraftProfile.findOneAndUpdate(
          { id: profileData.id },
          profileData,
          { upsert: true, new: true }
        );
        return res.json({ ok: true, profile: saved, source: 'database' });
      } catch (dbErr) {
        console.warn('DB save warning, using memory storage:', dbErr.message);
      }
    }

    // In-memory fallback
    const existingIndex = verifiedProfiles.findIndex((p) => p.id === profileData.id);
    if (existingIndex >= 0) {
      verifiedProfiles[existingIndex] = profileData;
    } else {
      verifiedProfiles.push(profileData);
    }

    res.json({ ok: true, profile: profileData, source: 'memory' });
  } catch (err) {
    console.error('Error saving craft profile:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/crafts/profiles - List Saved Craft Profiles
router.get('/profiles', async (req, res) => {
  try {
    let CraftProfile;
    try {
      const module = await import('../models/CraftProfile.js');
      CraftProfile = module.default;
    } catch (e) {}

    if (CraftProfile) {
      try {
        const list = await CraftProfile.find().sort({ createdAt: -1 });
        if (list && list.length > 0) {
          return res.json({ ok: true, profiles: list });
        }
      } catch (dbErr) {}
    }

    res.json({ ok: true, profiles: verifiedProfiles });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

