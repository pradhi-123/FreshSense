import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  personnel_id: { type: String, required: true, ref: 'Personnel' },
  created_at: { type: Date, default: Date.now },
  date: { type: String, required: true }, // YYYY-MM-DD
  language: { type: String, required: true },
  duration_s: { type: Number, required: true },
  topics_json: { type: Array, default: [] }, // [{ topic, polarity, clause }]
  neg_json: { type: Object, default: {} }, // { sleep: 2, family: 1 }
  pitch_var: { type: Number, default: 0 },
  speech_rate: { type: Number, default: 0 },
  pause_ratio: { type: Number, default: 0 },
  energy: { type: Number, default: 0 },
  audio_deleted_at: { type: String, required: true },
  transcript: { type: String, default: '' },
  urgent: { type: Boolean, default: false },
  sleep_hours: { type: Number, default: null },   // 3.5, 5, 7, 9
  sleep_quality: { type: String, default: null }, // 'poor' | 'fair' | 'good' | 'great'
});

checkinSchema.index({ personnel_id: 1, created_at: -1 });

export default mongoose.model('Checkin', checkinSchema);
