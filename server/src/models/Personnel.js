import mongoose from 'mongoose';

const personnelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., 'p017'
  pseudonym: { type: String, required: true }, // e.g., 'Personnel 017'
  unit: { type: String, required: true }, // e.g., 'Unit A'
  platoon: { type: String, required: true }, // e.g., 'Platoon 2'
  language: { type: String, default: 'ta' }, // BCP 47 code (ta, hi, bn, te, etc.)
  consent_at: { type: Date, default: Date.now }, // null if consent withdrawn
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Personnel', personnelSchema);
