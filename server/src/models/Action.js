import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  alert_id: { type: String, required: true, ref: 'Alert' },
  type: { type: String, required: true }, // call | prioritise_leave | counsellor | adjust_duty | note
  note: { type: String, default: '' },
  by_role: { type: String, default: 'welfare_officer' },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Action', actionSchema);
