/**
 * C11 triangulate.py port to Node.js / ES module
 * Triangulation rule across 3 signal groups (SAID, HOW, HR).
 * Alert requires AT LEAST 2 OF 3 GROUPS to agree over 5 days.
 */

import { buildBaseline, getStrainFlags } from './baselineService.js';

const WINDOW_DAYS = 5;
const SAID_MIN_NEGATIVE = 3;
const HOW_MIN_CHECKINS = 2;
const LEAVE_GAP_DAYS = 180;
const NIGHT_STREAK = 5;
const PENDING_LEAVE_DAYS = 14;

const SAID_TOPICS = new Set(["sleep", "family", "fatigue", "mood"]);

const TOPIC_LABEL = {
  sleep: "poor sleep",
  family: "worry about home",
  fatigue: "tiredness",
  mood: "low mood"
};

export function evaluateTriangulation(windowCheckins, historyCheckins, hrToday) {
  const reasons = [];
  const groups = [];

  // 1. SAID Group Evaluation
  const totals = {};
  for (const c of windowCheckins) {
    const neg = c.neg_json || {};
    for (const [topic, count] of Object.entries(neg)) {
      if (SAID_TOPICS.has(topic)) {
        totals[topic] = (totals[topic] || 0) + Number(count);
      }
    }
  }

  const totalNegMentions = Object.values(totals).reduce((a, b) => a + b, 0);
  if (totalNegMentions >= SAID_MIN_NEGATIVE) {
    groups.push("SAID");
    const parts = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `${TOPIC_LABEL[t] || t} ×${n}`);
    reasons.push(`Said: ${parts.join(', ')} in ${WINDOW_DAYS} days`);
  }

  // 2. HOW Group Evaluation
  const base = buildBaseline(historyCheckins);
  const strainedCheckins = windowCheckins.filter(c => getStrainFlags(c, base).length >= 2);

  if (base !== null && strainedCheckins.length >= HOW_MIN_CHECKINS) {
    groups.push("HOW");
    reasons.push(`Tone: flatter and slower than own normal on ${strainedCheckins.length} check-ins`);
  }

  // 3. HR Group Evaluation
  const hrParts = [];
  if (hrToday) {
    if (hrToday.days_since_leave > LEAVE_GAP_DAYS) {
      hrParts.push(`${hrToday.days_since_leave} days since leave`);
    }
    if (hrToday.night_streak >= NIGHT_STREAK) {
      hrParts.push(`${hrToday.night_streak} night duties in a row`);
    }
    if ((hrToday.leave_pending_days || 0) > PENDING_LEAVE_DAYS) {
      hrParts.push(`leave application pending ${hrToday.leave_pending_days} days`);
    }
  }

  if (hrParts.length > 0) {
    groups.push("HR");
    reasons.push(`Records: ${hrParts.join(', ')}`);
  }

  // Final Alert Rule: At least 2 of 3 groups must agree
  const alert = groups.length >= 2;
  let suggested = null;

  if (alert) {
    suggested = [];
    if (groups.includes("HR") && hrToday && hrToday.days_since_leave > LEAVE_GAP_DAYS) {
      suggested.push("prioritise leave");
    }
    suggested.push("welfare call");
    if (groups.includes("SAID") || groups.includes("HOW")) {
      suggested.push("offer counsellor");
    }
  }

  return { alert, groups, reasons, suggested };
}
