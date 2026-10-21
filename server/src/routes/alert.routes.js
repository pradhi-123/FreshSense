import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../socket.js';
import Alert from '../models/Alert.js';
import Personnel from '../models/Personnel.js';
import Checkin from '../models/Checkin.js';
import HRDaily from '../models/HRDaily.js';
import Action from '../models/Action.js';
import AccessLog from '../models/AccessLog.js';
import { buildBaseline, getStrainFlags } from '../services/baselineService.js';

const router = express.Router();

function requireRole(req, res, allowedRoles) {
  const role = req.headers['x-role'] || 'welfare_officer';
  if (!allowedRoles.includes(role)) {
    res.status(403).json({ detail: { code: 'forbidden', message: 'Not allowed for this role' } });
    return false;
  }
  return role;
}

async function logAccess(role, personnel_id, endpoint) {
  await AccessLog.create({
    id: uuidv4(),
    role,
    personnel_id,
    endpoint,
    created_at: new Date()
  });
}

/**
 * GET /api/alerts
 * List open alerts for Welfare Officer (W1 screen)
 */
router.get('/alerts', async (req, res, next) => {
  try {
    const role = requireRole(req, res, ['welfare_officer']);
    if (!role) return;

    await logAccess(role, null, '/alerts');

    const alerts = await Alert.find({ status: { $ne: 'closed' } }).sort({ created_at: -1 });
    const result = [];

    for (const a of alerts) {
      const person = await Personnel.findOne({ id: a.personnel_id });
      result.push({
        id: a.id,
        personnel_id: a.personnel_id,
        pseudonym: person ? person.pseudonym : a.personnel_id,
        unit: person ? person.unit : 'Unit A',
        platoon: person ? person.platoon : 'Platoon 1',
        groups: a.groups_json,
        reasons: a.reasons_json,
        suggested: a.suggested_json,
        status: a.status,
        created_at: a.created_at
      });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/alerts/:id
 * Detail view of alert with 14-day signal trends (W2 screen)
 */
router.get('/alerts/:id', async (req, res, next) => {
  try {
    const role = requireRole(req, res, ['welfare_officer']);
    if (!role) return;

    const alert = await Alert.findOne({ id: req.params.id });
    if (!alert) {
      return res.status(404).json({ detail: { code: 'not_found', message: 'No such alert' } });
    }

    await logAccess(role, alert.personnel_id, `/alerts/${req.params.id}`);

    const person = await Personnel.findOne({ id: alert.personnel_id });
    const checkins = await Checkin.find({ personnel_id: alert.personnel_id }).sort({ created_at: 1 });
    const hrRecords = await HRDaily.find({ personnel_id: alert.personnel_id }).sort({ date: 1 });
    const actions = await Action.find({ alert_id: alert.id }).sort({ created_at: -1 });

    const history = checkins.slice(0, Math.max(0, checkins.length - 5));
    const base = buildBaseline(history);

    const trendData = checkins.slice(-14).map(c => {
      const strainFlags = getStrainFlags(c, base);
      return {
        date: c.date,
        neg_counts: c.neg_json || {},
        pitch_var: c.pitch_var,
        speech_rate: c.speech_rate,
        pause_ratio: c.pause_ratio,
        energy: c.energy,
        is_strained: strainFlags.length >= 2,
        strain_flags: strainFlags
      };
    });

    return res.json({
      alert: {
        id: alert.id,
        personnel_id: alert.personnel_id,
        pseudonym: person ? person.pseudonym : alert.personnel_id,
        unit: person ? person.unit : 'Unit A',
        platoon: person ? person.platoon : 'Platoon 1',
        groups: alert.groups_json,
        reasons: alert.reasons_json,
        suggested: alert.suggested_json,
        status: alert.status,
        created_at: alert.created_at
      },
      baseline: base,
      checkins: trendData,
      hr: hrRecords.slice(-14),
      actions
    });

  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/alerts/:id/actions
 * Log action taken by Welfare Officer
 */
router.post('/alerts/:id/actions', async (req, res, next) => {
  try {
    const role = requireRole(req, res, ['welfare_officer']);
    if (!role) return;

    const alert = await Alert.findOne({ id: req.params.id });
    if (!alert) {
      return res.status(404).json({ detail: { code: 'not_found', message: 'No such alert' } });
    }

    const { type, note = '' } = req.body;
    await Action.create({
      id: uuidv4(),
      alert_id: alert.id,
      type,
      note,
      by_role: role,
      created_at: new Date()
    });

    alert.status = 'in_progress';
    await alert.save();

    // Real-time: notify all clients of status change
    io.emit('alert:updated', { id: alert.id, status: 'in_progress', type, note });

    return res.json({ ok: true, status: 'in_progress' });
  } catch (err) {
    next(err);
  }
});

export default router;
