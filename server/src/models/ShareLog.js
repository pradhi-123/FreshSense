import mongoose from 'mongoose';

const shareLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  personnel_id: { type: String, required: true, ref: 'Personnel' },
  created_at: { type: Date, default: Date.now },
  shared_with: { type: String, default: 'welfare_officer' },
  what_json: { type: Object, required: true }
});

export default mongoose.model('ShareLog', shareLogSchema);
