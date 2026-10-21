import mongoose from 'mongoose';

const impactCardSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  heading: { type: String, required: true },
  body: { type: String, required: true },
});

export const ImpactCard = mongoose.model('ImpactCard', impactCardSchema);
