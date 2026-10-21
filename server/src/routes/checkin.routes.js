import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../socket.js';
import Personnel from '../models/Personnel.js';
import Checkin from '../models/Checkin.js';
import HRDaily from '../models/HRDaily.js';
import Alert from '../models/Alert.js';
import ShareLog from '../models/ShareLog.js';
import { extractTopics } from '../services/nlpService.js';
import { extractToneFeatures } from '../services/toneService.js';
import { evaluateTriangulation } from '../services/triangulateService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

/**
 * POST /api/checkins
 * Process 60-second voice checkin, extract derived signals, delete audio immediately.
 */
router.post('/checkins', upload.single('audio'), async (req, res, next) => {
  try {
    const personnel_id = req.body.personnel_id || 'p017';
    const language = req.body.language || 'ta';
    let text = req.body.transcript || req.body.text || '';
    const isFlatTone = req.body.isFlatTone === 'true' || req.body.isFlatTone === true;
    const sleep_hours = req.body.sleep_hours ? parseFloat(req.body.sleep_hours) : null;
    const sleep_quality = req.body.sleep_quality || null; // 'poor'|'fair'|'good'|'great'

    // Consent check — auto-grant for demo if not yet set
    let person = await Personnel.findOne({ id: personnel_id });
    if (!person) {
      // Auto-create personnel if not found (handles any p001-p040)
      person = await Personnel.create({
        id: personnel_id,
        pseudonym: `Personnel ${personnel_id.replace('p','').replace(/^0+/,'')}`,
        unit: 'Unit A', platoon: 'Platoon 1', language: 'ta',
        consent_at: new Date(), created_at: new Date()
      });
    }
    if (!person.consent_at) {
      await Personnel.findOneAndUpdate({ id: personnel_id }, { consent_at: new Date() });
    }

    const audio_deleted_at = new Date().toISOString();
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (!text) text = 'நேத்து ராத்திரி தூக்கம் வரல. வீட்டை பற்றி கவலையா இருக்கு. ரொம்ப களைப்பா இருக்கு.';

    // 1. NLP Topic & Negation extraction
    const { mentions, neg_counts, isUrgent } = extractTopics(text);

    // 1b. Boost SAID sleep signal if poor/fair sleep logged
    if (sleep_quality === 'poor')  neg_counts.sleep = (neg_counts.sleep || 0) + 2;
    if (sleep_quality === 'fair')  neg_counts.sleep = (neg_counts.sleep || 0) + 1;

    // 2. Tone features extraction
    const feats = extractToneFeatures(text, { isFlatTone, duration_s: req.body.duration_s || 60 });

    const todayDateStr = req.body.date || new Date().toISOString().split('T')[0];
    const cid = uuidv4();

    // 3. Save Checkin record
    const checkin = await Checkin.create({
      id: cid, personnel_id,
      created_at: new Date(), date: todayDateStr, language,
      duration_s: feats.duration_s,
      topics_json: mentions, neg_json: neg_counts,
      pitch_var: feats.pitch_var, speech_rate: feats.speech_rate,
      pause_ratio: feats.pause_ratio, energy: feats.energy,
      audio_deleted_at, transcript: text, urgent: isUrgent,
      sleep_hours, sleep_quality,
    });

    // 4. Save ShareLog (exact signals shared with welfare officer)
    const sharedData = {
      topics: mentions.map(m => ({ topic: m.topic, polarity: m.polarity })),
      tone_measures: feats,
      deleted_at: audio_deleted_at
    };

    await ShareLog.create({
      id: uuidv4(),
      personnel_id,
      created_at: new Date(),
      shared_with: 'welfare_officer',
      what_json: sharedData
    });

    // 5. Evaluate Triangulation Rule
    // Fetch last 5 days checkins
    const allCheckins = await Checkin.find({ personnel_id }).sort({ created_at: 1 });
    const windowCheckins = allCheckins.slice(-5);
    const historyCheckins = allCheckins.slice(0, -1);

    const hrToday = await HRDaily.findOne({ personnel_id, date: todayDateStr }) || 
                    await HRDaily.findOne({ personnel_id }).sort({ date: -1 });

    const triResult = evaluateTriangulation(windowCheckins, historyCheckins, hrToday);

    // Check if open alert exists
    const openAlert = await Alert.findOne({ personnel_id, status: { $ne: 'closed' } });

    let alertCreated = false;
    let alertId = null;

    if (triResult.alert && !openAlert) {
      const aid = uuidv4();
      // person is already in scope from the consent block above
      const newAlert = await Alert.create({
        id: aid,
        personnel_id,
        created_at: new Date(),
        groups_json: triResult.groups,
        reasons_json: triResult.reasons,
        suggested_json: triResult.suggested,
        status: 'new'
      });
      alertCreated = true;
      alertId = aid;

      // 🔴 Real-time: notify all welfare officers
      io.emit('alert:new', {
        id: aid,
        pseudonym: person?.pseudonym || personnel_id,
        unit: person?.unit || '—',
        platoon: person?.platoon || '—',
        groups: triResult.groups,
        reasons: triResult.reasons,
        suggested: triResult.suggested,
        status: 'new',
        created_at: new Date().toISOString()
      });
    }

    // 🟢 Real-time: notify all clients that a checkin happened
    io.emit('checkin:new', {
      personnel_id,
      date: todayDateStr,
      alert_created: alertCreated,
      urgent: isUrgent
    });

    return res.json({
      checkin_id: cid,
      transcript: text,
      shared: sharedData,
      audio_deleted_at,
      alert_created: alertCreated,
      alert_id: alertId,
      triangulation: triResult,
      urgent: isUrgent
    });


  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me/shared
 * Returns exact signals shared with welfare officer for transparency (P4 screen)
 */
router.get('/me/shared', async (req, res, next) => {
  try {
    const personnel_id = req.query.personnel_id || 'p017';
    const logs = await ShareLog.find({ personnel_id }).sort({ created_at: -1 }).limit(20);
    const formatted = logs.map(l => ({
      at: l.created_at,
      with: l.shared_with,
      what: l.what_json
    }));
    return res.json(formatted);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/me/consent
 * Update consent (P0 / P4 toggle)
 */
router.post('/me/consent', async (req, res, next) => {
  try {
    const { personnel_id = 'p017', consent } = req.body;
    const consent_at = consent ? new Date() : null;
    await Personnel.findOneAndUpdate({ id: personnel_id }, { consent_at });
    return res.json({ consent_at });
  } catch (err) {
    next(err);
  }
});

export default router;
