import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  iconKey: { type: String, required: true },
});

export const Feature = mongoose.model('Feature', featureSchema);
