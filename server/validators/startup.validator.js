const { z } = require('zod');

const INDUSTRIES = ['AI', 'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'AgriTech', 'FoodTech', 'TravelTech', 'CleanTech', 'Mobility', 'Gaming', 'Social', 'Other'];
const STAGES = ['Idea', 'Research', 'Prototype', 'MVP', 'Early Revenue', 'Growth', 'Scaling'];
const MODELS = ['Subscription', 'Commission', 'Advertising', 'Freemium', 'One-time purchase', 'Licensing', 'Marketplace', 'Other', 'Not decided'];
const FUNDING = ['Bootstrapped', 'Self-funded', 'Pre-seed', 'Seed', 'Series A+', 'No funding'];
const ANALYSIS_TYPES = ['Full Validation', 'Market Analysis', 'Business Analysis', 'Investor Analysis'];

const startupIdeaSchema = z.object({
  startupName: z.string().trim().min(2, 'Startup name is required.').max(120),
  industry: z.enum(INDUSTRIES),
  problem: z.string().trim().min(30, 'Please describe the problem in at least 30 characters.').max(3000),
  solution: z.string().trim().min(30, 'Please describe the solution in at least 30 characters.').max(3000),
  targetAudience: z.string().trim().min(5, 'Target audience is required.').max(1000),
  customerSegment: z.enum(['B2B', 'B2C', 'B2B2C']),
  geography: z.string().trim().min(2, 'Geographic market is required.').max(200),
  businessStage: z.enum(STAGES),
  businessModel: z.enum(MODELS),
  competitors: z.array(z.string().trim().max(150)).max(20).optional().default([]),
  fundingStatus: z.enum(FUNDING),
  analysisType: z.enum(ANALYSIS_TYPES).optional().default('Full Validation'),
});

module.exports = { startupIdeaSchema, INDUSTRIES, STAGES, MODELS, FUNDING, ANALYSIS_TYPES };
