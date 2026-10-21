import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  personnel_id: { type: String, required: true, ref: 'Personnel' },
  created_at: { type: Date, default: Date.now },
  groups_json: { type: Array, default: [] }, // ["SAID", "HOW", "HR"]
  reasons_json: { type: Array, default: [] }, // Plain language facts
  suggested_json: { type: Array, default: [] }, // ["prioritise leave", "welfare call", "offer counsellor"]
  status: { type: String, enum: ['new', 'in_progress', 'closed'], default: 'new' }
});

export default mongoose.model('Alert', alertSchema);
