import express from 'express';
import { seedDatabase, DEMO_DATE, DEMO_ID } from '../services/seedService.js';
import Personnel from '../models/Personnel.js';
import Alert from '../models/Alert.js';
import Checkin from '../models/Checkin.js';

const router = express.Router();
let currentDemoDate = DEMO_DATE;

/**
 * POST /api/demo/advance-day
 */
router.post('/demo/advance-day', async (req, res, next) => {
  try {
    const d = new Date(currentDemoDate);
    d.setDate(d.getDate() + 1);
    currentDemoDate = d.toISOString().split('T')[0];
    return res.json({ today: currentDemoDate });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/demo/reset
 */
router.post('/demo/reset', async (req, res, next) => {
  try {
    currentDemoDate = DEMO_DATE;
    await seedDatabase();
    return res.json({ ok: true, today: currentDemoDate });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/demo/state
 */
router.get('/demo/state', async (req, res, next) => {
  try {
    const personnelCount = await Personnel.countDocuments({});
    const checkinCount = await Checkin.countDocuments({});
    const alertCount = await Alert.countDocuments({});

    return res.json({
      today: currentDemoDate,
      demo_id: DEMO_ID,
      personnelCount,
      checkinCount,
      alertCount
    });
  } catch (err) {
    next(err);
  }
});

export default router;
