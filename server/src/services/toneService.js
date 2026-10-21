/**
 * C8 tone.py port to Node.js / ES module
 * Computes explainable voice tone metrics.
 */

export function extractToneFeatures(transcript, audioInfo = {}) {
  // If actual speech features were supplied from frontend web audio or wav parser:
  const words = transcript ? transcript.trim().split(/\s+/).length : 0;
  
  // Default values or derived from frontend payload
  let pitch_var = audioInfo.pitch_var !== undefined ? Number(audioInfo.pitch_var) : 2.0;
  let speech_rate = audioInfo.speech_rate !== undefined ? Number(audioInfo.speech_rate) : 2.6;
  let pause_ratio = audioInfo.pause_ratio !== undefined ? Number(audioInfo.pause_ratio) : 0.20;
  let energy = audioInfo.energy !== undefined ? Number(audioInfo.energy) : 0.60;
  let duration_s = audioInfo.duration_s !== undefined ? Number(audioInfo.duration_s) : 60.0;

  // If specific story tone flags are requested (e.g. flat tone during demo checkin)
  if (audioInfo.isFlatTone) {
    pitch_var = 1.3;     // Flatter, monotone voice
    speech_rate = 2.1;   // Slower speech
    pause_ratio = 0.33;  // More pauses
    energy = 0.47;       // Quieter
  } else if (words > 0 && !audioInfo.pitch_var) {
    // Standard calculation based on word count over duration
    speech_rate = Number((words / Math.max(duration_s * (1 - pause_ratio), 1)).toFixed(2));
  }

  return {
    pitch_var: Number(pitch_var.toFixed(3)),
    speech_rate: Number(speech_rate.toFixed(3)),
    pause_ratio: Number(pause_ratio.toFixed(3)),
    energy: Number(energy.toFixed(4)),
    duration_s: Number(duration_s.toFixed(1))
  };
}
