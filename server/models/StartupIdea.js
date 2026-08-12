const mongoose = require('mongoose');

const startupIdeaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startupName: { type: String, required: true, trim: true, maxlength: 120 },
    industry: {
      type: String,
      required: true,
      enum: ['AI', 'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'AgriTech', 'FoodTech', 'TravelTech', 'CleanTech', 'Mobility', 'Gaming', 'Social', 'Other'],
    },
    problem: { type: String, required: true, minlength: 30, maxlength: 3000 },
    solution: { type: String, required: true, minlength: 30, maxlength: 3000 },
    targetAudience: { type: String, required: true, maxlength: 1000 },
    customerSegment: { type: String, enum: ['B2B', 'B2C', 'B2B2C'], required: true },
    geography: { type: String, required: true, maxlength: 200 },
    businessStage: {
      type: String,
      enum: ['Idea', 'Research', 'Prototype', 'MVP', 'Early Revenue', 'Growth', 'Scaling'],
      required: true,
    },
    businessModel: {
      type: String,
      enum: ['Subscription', 'Commission', 'Advertising', 'Freemium', 'One-time purchase', 'Licensing', 'Marketplace', 'Other', 'Not decided'],
      required: true,
    },
    competitors: [{ type: String, maxlength: 150 }],
    fundingStatus: {
      type: String,
      enum: ['Bootstrapped', 'Self-funded', 'Pre-seed', 'Seed', 'Series A+', 'No funding'],
      required: true,
    },
    pitchDeck: {
      originalName: String,
      storedPath: String,
      mimeType: String,
      sizeBytes: Number,
    },
    analysisType: {
      type: String,
      enum: ['Full Validation', 'Market Analysis', 'Business Analysis', 'Investor Analysis'],
      default: 'Full Validation',
    },
  },
  { timestamps: true }
);

startupIdeaSchema.index({ userId: 1, createdAt: -1 });
startupIdeaSchema.index({ industry: 1 });

module.exports = mongoose.model('StartupIdea', startupIdeaSchema);
