import { Feature } from '../models/Feature.js';
import { JourneyStep } from '../models/JourneyStep.js';
import { ImpactCard } from '../models/ImpactCard.js';

export const getLandingContent = async (req, res, next) => {
  try {
    const [features, steps, impact] = await Promise.all([
      Feature.find().sort({ order: 1 }),
      JourneyStep.find().sort({ order: 1 }),
      ImpactCard.find().sort({ order: 1 }),
    ]);

    res.status(200).json({
      features: features || [],
      steps: steps || [],
      impact: impact || [],
    });
  } catch (error) {
    next(error);
  }
};
