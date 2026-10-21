import express from 'express';
import Personnel from '../models/Personnel.js';
import HRDaily from '../models/HRDaily.js';
import Checkin from '../models/Checkin.js';

const router = express.Router();
const MIN_GROUP = 5;

/**
 * GET /api/units/:unit/trends
 * Platoon-level aggregated statistics for Commander view (C1 screen)
 * Groups under 5 personnel are hidden for privacy protection!
 */
router.get('/units/:unit/trends', async (req, res, next) => {
  try {
    const role = req.headers['x-role'] || 'commander';
    if (!['commander', 'welfare_officer'].includes(role)) {
      return res.status(403).json({ detail: { code: 'forbidden', message: 'Not allowed for this role' } });
    }

    const unitName = req.params.unit || 'Unit A';
    const personnelList = await Personnel.find({ unit: unitName });

    // Group personnel by platoon
    const platoonsMap = {};
    for (const p of personnelList) {
      if (!platoonsMap[p.platoon]) {
        platoonsMap[p.platoon] = [];
      }
      platoonsMap[p.platoon].push(p.id);
    }

    const out = [];
    for (const [platoonName, pids] of Object.entries(platoonsMap)) {
      if (pids.length < MIN_GROUP) {
        out.push({
          platoon: platoonName,
          hidden: "group too small to show",
          people: pids.length
        });
        continue;
      }

      // Calculate unit averages from recent HR data
      const hrRecords = await HRDaily.find({ personnel_id: { $in: pids } }).sort({ date: -1 }).limit(pids.length * 5);
      
      let sumNightStreak = 0;
      let sumDaysSinceLeave = 0;
      let count = 0;

      for (const hr of hrRecords) {
        sumNightStreak += hr.night_streak;
        sumDaysSinceLeave += hr.days_since_leave;
        count++;
      }

      const avgNightStreak = count > 0 ? Number((sumNightStreak / count).toFixed(1)) : 0;
      const avgDaysSinceLeave = count > 0 ? Math.round(sumDaysSinceLeave / count) : 0;

      // Participation rate
      const recentCheckins = await Checkin.countDocuments({ personnel_id: { $in: pids } });
      const participationRate = Math.min(100, Math.round((recentCheckins / (pids.length * 6)) * 100));

      out.push({
        platoon: platoonName,
        people: pids.length,
        avg_night_streak: avgNightStreak,
        avg_days_since_leave: avgDaysSinceLeave,
        checkin_participation: participationRate
      });
    }

    return res.json(out);
  } catch (err) {
    next(err);
  }
});

export default router;
