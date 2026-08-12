const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    innovation: { type: Number, min: 0, max: 20, required: true },
    marketDemand: { type: Number, min: 0, max: 20, required: true },
    scalability: { type: Number, min: 0, max: 20, required: true },
    businessModel: { type: Number, min: 0, max: 15, required: true },
    competition: { type: Number, min: 0, max: 10, required: true },
    executionFeasibility: { type: Number, min: 0, max: 10, required: true },
    investmentPotential: { type: Number, min: 0, max: 5, required: true },
    total: { type: Number, min: 0, max: 100, required: true },
    label: { type: String, required: true },
    explanation: { type: String, default: '' },
    confidence: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startupIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'StartupIdea', required: true, index: true },
    analysisType: { type: String, required: true },

    executiveSummary: { type: String, default: '' },
    problemAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    solutionAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },

    swot: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
    },

    marketSizing: {
      tam: { type: mongoose.Schema.Types.Mixed, default: {} },
      sam: { type: mongoose.Schema.Types.Mixed, default: {} },
      som: { type: mongoose.Schema.Types.Mixed, default: {} },
      methodology: { type: String, default: '' },
      assumptions: [String],
      confidence: { type: String, default: 'Medium' },
      disclaimer: {
        type: String,
        default: 'Market-size values are preliminary AI-generated estimates and should be validated against reliable market research before making financial or investment decisions.',
      },
    },

    businessModelCanvas: {
      keyPartners: [String],
      keyActivities: [String],
      keyResources: [String],
      valuePropositions: [String],
      customerRelationships: [String],
      channels: [String],
      customerSegments: [String],
      costStructure: [String],
      revenueStreams: [String],
    },

    competitorAnalysis: [
      {
        name: String,
        description: String,
        targetCustomer: String,
        strengths: [String],
        weaknesses: [String],
        businessModel: String,
        competitiveThreat: String,
        differentiationOpportunity: String,
        verificationStatus: { type: String, default: 'AI-identified / requires verification' },
      },
    ],

    revenueModels: [
      {
        model: String,
        whyItFits: String,
        advantages: [String],
        risks: [String],
        implementationDifficulty: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
      },
    ],

    investorFeedback: {
      investmentAttractiveness: { type: Number, min: 0, max: 100 },
      strengthsFromInvestorPerspective: [String],
      investorConcerns: [String],
      fundingReadiness: { type: String, enum: ['Not Ready', 'Early', 'Developing', 'Investor Ready'], default: 'Early' },
      investorQuestions: [String],
      fundingRecommendation: { type: String, default: '' },
    },

    marketAnalysis: {
      targetMarket: String,
      customerDemand: String,
      marketDrivers: [String],
      marketBarriers: [String],
      growthOpportunities: [String],
      adoptionChallenges: [String],
      geographicConsiderations: String,
      keyAssumptions: [String],
    },

    riskAssessment: [
      {
        category: {
          type: String,
          enum: ['Market Risk', 'Product Risk', 'Technical Risk', 'Financial Risk', 'Competition Risk', 'Regulatory Risk', 'Execution Risk', 'Customer Acquisition Risk'],
        },
        risk: String,
        severity: { type: String, enum: ['Low', 'Medium', 'High'] },
        probability: { type: String, enum: ['Low', 'Medium', 'High'] },
        impact: String,
        mitigation: String,
      },
    ],

    recommendations: [
      {
        text: String,
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      },
    ],

    score: { type: scoreSchema, required: true },

    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending', index: true },
    failureReason: { type: String, default: '' },

    analysisVersion: { type: String, default: '1.0.0' },
    promptVersion: { type: String, default: '1.0.0' },
    aiMeta: {
      provider: { type: String, default: '' },
      model: { type: String, default: '' },
      demoMode: { type: Boolean, default: false },
      generatedAt: { type: Date },
    },

    isDemoSeed: { type: Boolean, default: false },

    share: {
      enabled: { type: Boolean, default: false },
      token: { type: String, default: null, index: true, sparse: true },
    },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ 'score.total': -1 });

module.exports = mongoose.model('Report', reportSchema);
