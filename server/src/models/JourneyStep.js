import mongoose from 'mongoose';

const journeyStepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  points: [{ type: String }],
  iconKey: { type: String, default: 'step' },
});

export const JourneyStep = mongoose.model('JourneyStep', journeyStepSchema);
