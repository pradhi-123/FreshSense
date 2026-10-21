import mongoose from 'mongoose';

const hrDailySchema = new mongoose.Schema({
  personnel_id: { type: String, required: true, ref: 'Personnel' },
  date: { type: String, required: true }, // YYYY-MM-DD
  on_night_duty: { type: Number, required: true, enum: [0, 1] },
  night_streak: { type: Number, required: true },
  days_since_leave: { type: Number, required: true },
  leave_pending_days: { type: Number, default: 0 },
  transfers_12m: { type: Number, default: 0 }
});

hrDailySchema.index({ personnel_id: 1, date: 1 }, { unique: true });

export default mongoose.model('HRDaily', hrDailySchema);
