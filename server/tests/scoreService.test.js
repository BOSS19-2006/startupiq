const { computeScore, labelForScore } = require('../services/scoreService');

describe('scoreService.computeScore', () => {
  test('clamps each dimension to its max even if AI over-reports', () => {
    const score = computeScore({
      innovation: 999, marketDemand: -5, scalability: 20, businessModel: 15,
      competition: 10, executionFeasibility: 10, investmentPotential: 5,
    });
    expect(score.innovation).toBe(20);
    expect(score.marketDemand).toBe(0);
    expect(score.total).toBe(20 + 0 + 20 + 15 + 10 + 10 + 5);
  });

  test('total never exceeds 100 even with malformed input', () => {
    const score = computeScore({
      innovation: 500, marketDemand: 500, scalability: 500, businessModel: 500,
      competition: 500, executionFeasibility: 500, investmentPotential: 500,
    });
    expect(score.total).toBe(100);
  });

  test('handles completely missing score object', () => {
    const score = computeScore({});
    expect(score.total).toBe(0);
    expect(score.label).toBe('Needs Significant Refinement');
  });
});

describe('scoreService.labelForScore', () => {
  test.each([
    [95, 'Exceptional Potential'],
    [80, 'Strong Potential'],
    [65, 'Promising'],
    [45, 'Early / High Risk'],
    [10, 'Needs Significant Refinement'],
  ])('%i -> %s', (val, expected) => {
    expect(labelForScore(val)).toBe(expected);
  });
});
