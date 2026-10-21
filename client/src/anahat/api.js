// Use relative path — Vite proxy (/api → localhost:5000) works on ALL devices
const BASE = '/api';

const H = (role) => ({ 'Content-Type': 'application/json', 'X-Role': role || 'personnel' });

/* ─── Personnel ─── */
export async function submitCheckin({ personnel_id, language='ta', transcript, isFlatTone=false, duration_s=60, date, sleep_hours, sleep_quality }) {
  const form = new FormData();
  form.append('personnel_id', personnel_id);
  form.append('language', language);
  form.append('transcript', transcript || '');
  form.append('isFlatTone', String(isFlatTone));
  form.append('duration_s', String(duration_s));
  if (date) form.append('date', date);
  if (sleep_hours != null) form.append('sleep_hours', String(sleep_hours));
  if (sleep_quality) form.append('sleep_quality', sleep_quality);
  const r = await fetch(`${BASE}/checkins`, { method: 'POST', headers: { 'X-Role': 'personnel' }, body: form });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function getMyShared(personnel_id) {
  const r = await fetch(`${BASE}/me/shared?personnel_id=${personnel_id}`, { headers: H('personnel') });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function setConsent(personnel_id, consent) {
  const r = await fetch(`${BASE}/me/consent`, { method: 'POST', headers: H('personnel'), body: JSON.stringify({ personnel_id, consent }) });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function getConsentStatus(personnel_id) {
  const r = await fetch(`${BASE}/me/consent-status?personnel_id=${personnel_id}`, { headers: H('personnel') });
  if (!r.ok) return { consented: false };
  return r.json();
}

export async function getNotifications(personnel_id) {
  const r = await fetch(`${BASE}/me/notifications?personnel_id=${personnel_id}`, { headers: H('personnel') });
  if (!r.ok) return [];
  return r.json();
}

/* ─── Welfare ─── */
export async function getAlerts() {
  const r = await fetch(`${BASE}/alerts`, { headers: H('welfare_officer') });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function getAlertDetail(id) {
  const r = await fetch(`${BASE}/alerts/${id}`, { headers: H('welfare_officer') });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function postAlertAction(alertId, type, note='') {
  const r = await fetch(`${BASE}/alerts/${alertId}/actions`, { method: 'POST', headers: H('welfare_officer'), body: JSON.stringify({ type, note }) });
  if (!r.ok) throw await r.json();
  return r.json();
}

/* ─── Commander ─── */
export async function getUnitTrends(unit='Unit A') {
  const r = await fetch(`${BASE}/units/${encodeURIComponent(unit)}/trends`, { headers: H('commander') });
  if (!r.ok) throw await r.json();
  return r.json();
}

/* ─── Demo ─── */
export async function getDemoState() {
  const r = await fetch(`${BASE}/demo/state`);
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function advanceDemoDay() {
  const r = await fetch(`${BASE}/demo/advance-day`, { method: 'POST' });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function resetDemo() {
  const r = await fetch(`${BASE}/demo/reset`, { method: 'POST' });
  if (!r.ok) throw await r.json();
  return r.json();
}

export async function healthCheck() {
  const r = await fetch(`${BASE}/health`);
  return r.json();
}
