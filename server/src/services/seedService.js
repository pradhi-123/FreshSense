/**
 * C6 seed_synthetic.py port to Node.js / ES module
 * Seeds 40 synthetic personnel and demo story for Constable Karthik (Personnel 017).
 */

import Personnel from '../models/Personnel.js';
import HRDaily from '../models/HRDaily.js';
import Checkin from '../models/Checkin.js';
import Alert from '../models/Alert.js';
import Action from '../models/Action.js';
import ShareLog from '../models/ShareLog.js';
import AccessLog from '../models/AccessLog.js';
import { v4 as uuidv4 } from 'uuid';

export const DEMO_ID = 'p017';
export const DEMO_DATE = '2026-10-14';

function randomGauss(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * std;
}

function formatDate(dateObj) {
  return dateObj.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export async function seedDatabase() {
  // Clear existing collections
  await Personnel.deleteMany({});
  await HRDaily.deleteMany({});
  await Checkin.deleteMany({});
  await Alert.deleteMany({});
  await Action.deleteMany({});
  await ShareLog.deleteMany({});
  await AccessLog.deleteMany({});

  const todayDate = new Date(DEMO_DATE);

  for (let i = 1; i <= 40; i++) {
    const pid = `p${String(i).padStart(3, '0')}`;
    const platoonNum = Math.floor((i - 1) / 10) + 1;
    const platoon = `Platoon ${platoonNum}`;

    await Personnel.create({
      id: pid,
      pseudonym: `Personnel ${String(i).padStart(3, '0')}`,
      unit: 'Unit A',
      platoon: platoon,
      language: 'ta',
      consent_at: todayDate,
      created_at: todayDate
    });

    const isDemoPerson = (pid === DEMO_ID);
    const baseDaysSinceLeave = isDemoPerson ? 210 : Math.floor(20 + Math.random() * 150);
    let streak = 0;

    // 14 days of HR data
    for (let d = 14; d >= 0; d--) {
      const dateStr = addDays(DEMO_DATE, -d);
      const isNight = isDemoPerson ? (d <= 5 ? 1 : 0) : (Math.random() < 0.3 ? 1 : 0);
      streak = isNight ? streak + 1 : 0;
      if (isDemoPerson) streak = Math.min(streak, 6);

      await HRDaily.create({
        personnel_id: pid,
        date: dateStr,
        on_night_duty: isNight,
        night_streak: streak,
        days_since_leave: baseDaysSinceLeave - d,
        leave_pending_days: isDemoPerson ? Math.max(0, 21 - d) : Math.floor(Math.random() * 3),
        transfers_12m: 0
      });
    }

    // 6 normal historical check-ins to build baseline
    for (let k = 0; k < 6; k++) {
      const checkinDate = addDays(DEMO_DATE, -12 + k);
      const pitch_var = Number(randomGauss(2.0, 0.1).toFixed(3));
      const speech_rate = Number(randomGauss(2.6, 0.08).toFixed(3));
      const pause_ratio = Number(randomGauss(0.20, 0.015).toFixed(3));
      const energy = Number(randomGauss(0.60, 0.02).toFixed(4));

      await Checkin.create({
        id: uuidv4(),
        personnel_id: pid,
        created_at: new Date(`${checkinDate}T04:12:00Z`),
        date: checkinDate,
        language: 'ta',
        duration_s: 55.0,
        topics_json: [],
        neg_json: {},
        pitch_var,
        speech_rate,
        pause_ratio,
        energy,
        audio_deleted_at: `${checkinDate}T04:12:09Z`,
        transcript: 'தூங்கினேன், வேலை நன்றாக இருந்தது.'
      });
    }

    // Demo Story Days 1-4 for Personnel 017
    if (isDemoPerson) {
      const story = [
        {},                            // Day -4: normal
        { sleep: 1, fatigue: 1 },     // Day -3: sleep + fatigue (2 SAID mentions)
        { sleep: 1 },                  // Day -2: sleep again, flat tone (HOW day 1)
        { family: 1 }                  // Day -1: family worry, flat tone (HOW day 2)
      ];


      for (let idx = 0; idx < story.length; idx++) {
        const checkinDate = addDays(DEMO_DATE, -4 + idx);
        const neg = story[idx];
        const isFlat = (idx >= 2); // Both day -2 and day -1 have flat tone


        const pitch_var = isFlat ? 1.3 : 2.0;
        const speech_rate = isFlat ? 2.1 : 2.6;
        const pause_ratio = isFlat ? 0.33 : 0.20;
        const energy = isFlat ? 0.47 : 0.60;

        const topics_json = Object.keys(neg).map(t => ({ topic: t, polarity: 'negative', clause: 'தூக்கம் வரல' }));

        await Checkin.create({
          id: uuidv4(),
          personnel_id: pid,
          created_at: new Date(`${checkinDate}T04:12:00Z`),
          date: checkinDate,
          language: 'ta',
          duration_s: 55.0,
          topics_json,
          neg_json: neg,
          pitch_var,
          speech_rate,
          pause_ratio,
          energy,
          audio_deleted_at: `${checkinDate}T04:12:09Z`,
          transcript: 'நேத்து தூக்கம் வரல, கொஞ்சம் கவலையா இருக்கு.'
        });

        // Add ShareLog entries
        await ShareLog.create({
          id: uuidv4(),
          personnel_id: pid,
          created_at: new Date(`${checkinDate}T04:12:09Z`),
          shared_with: 'welfare_officer',
          what_json: {
            date: checkinDate,
            sleep: neg.sleep ? 'negative' : 'neutral',
            tone_measures: { pitch_var, speech_rate, pause_ratio, energy }
          }
        });
      }
    }
  }

  console.log(`Successfully seeded 40 synthetic personnel & demo story for ${DEMO_ID}`);
}
