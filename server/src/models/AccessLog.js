import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  personnel_id: { type: String },
  endpoint: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('AccessLog', accessLogSchema);
