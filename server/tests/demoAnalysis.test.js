const { buildDemoAnalysis } = require('../services/demoAnalysis');
const { computeScore } = require('../services/scoreService');

const sampleStartup = {
  startupName: 'Test Startup', industry: 'SaaS',
  problem: 'Small businesses struggle to manage inventory across multiple sales channels efficiently.',
  solution: 'A unified dashboard that syncs inventory across all sales channels in real time.',
  targetAudience: 'Small e-commerce businesses', customerSegment: 'B2B', geography: 'United States',
  businessStage: 'MVP', businessModel: 'Subscription', competitors: ['Zoho Inventory'], fundingStatus: 'Bootstrapped',
};

describe('demoAnalysis.buildDemoAnalysis', () => {
  test('returns all required top-level sections', () => {
    const analysis = buildDemoAnalysis(sampleStartup);
    const required = ['executiveSummary', 'problemAnalysis', 'solutionAnalysis', 'swot', 'marketSizing',
      'businessModelCanvas', 'competitorAnalysis', 'revenueModels', 'investorFeedback', 'marketAnalysis',
      'riskAssessment', 'recommendations', 'score'];
    required.forEach((key) => expect(analysis).toHaveProperty(key));
  });

  test('SWOT has at least 3 points per category', () => {
    const { swot } = buildDemoAnalysis(sampleStartup);
    ['strengths', 'weaknesses', 'opportunities', 'threats'].forEach((k) => {
      expect(swot[k].length).toBeGreaterThanOrEqual(3);
    });
  });

  test('market sizing values are labeled as estimates, never claimed as verified', () => {
    const { marketSizing } = buildDemoAnalysis(sampleStartup);
    expect(marketSizing.confidence).toBe('Low');
    expect(marketSizing.tam.description.toLowerCase()).toMatch(/estimate/);
  });

  test('produced score passes through computeScore within valid bounds', () => {
    const analysis = buildDemoAnalysis(sampleStartup);
    const score = computeScore(analysis.score);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  test('is deterministic for the same input', () => {
    const a1 = buildDemoAnalysis(sampleStartup);
    const a2 = buildDemoAnalysis(sampleStartup);
    expect(a1.score).toEqual(a2.score);
  });
});
