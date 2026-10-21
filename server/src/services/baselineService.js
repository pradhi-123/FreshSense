/**
 * C10 baseline.py port to Node.js / ES module
 * Compares each check-in with the SAME person's own normal baseline.
 */

const FEATURES = ["pitch_var", "speech_rate", "pause_ratio", "energy"];

// +1 means higher is worse, -1 means lower is worse
const STRAIN_DIRECTION = {
  pitch_var: -1,
  speech_rate: -1,
  pause_ratio: 1,
  energy: -1
};

const MIN_HISTORY = 5;
const Z_THRESHOLD = 1.5;

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  if (!arr || arr.length <= 1) return 1e-6;
  const avg = mean(arr);
  const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.max(Math.sqrt(avgSquareDiff), 1e-6);
}

export function buildBaseline(history) {
  if (!history || history.length < MIN_HISTORY) {
    return null; // Tone group stays off until 5 check-ins exist
  }

  const base = {};
  for (const f of FEATURES) {
    const values = history.map(h => Number(h[f] || 0));
    base[f] = {
      mean: mean(values),
      std: stddev(values)
    };
  }
  return base;
}

export function getStrainFlags(checkin, base) {
  if (!base) return [];

  const flags = [];
  for (const f of FEATURES) {
    const val = Number(checkin[f] || 0);
    const { mean: mu, std: sd } = base[f];
    const z = (val - mu) / sd;
    if (z * STRAIN_DIRECTION[f] >= Z_THRESHOLD) {
      flags.push(f);
    }
  }
  return flags;
}
