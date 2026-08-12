/**
 * scoreService.js
 * Server-side authority on scoring. Never trusts an AI-reported total -
 * always clamps each dimension to its max and recomputes the sum here.
 */

const MAXES = {
  innovation: 20,
  marketDemand: 20,
  scalability: 20,
  businessModel: 15,
  competition: 10,
  executionFeasibility: 10,
  investmentPotential: 5,
};

function clamp(value, max) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function labelForScore(total) {
  if (total >= 90) return 'Exceptional Potential';
  if (total >= 75) return 'Strong Potential';
  if (total >= 60) return 'Promising';
  if (total >= 40) return 'Early / High Risk';
  return 'Needs Significant Refinement';
}

function computeScore(rawScore = {}) {
  const dims = {};
  let total = 0;
  for (const [key, max] of Object.entries(MAXES)) {
    const v = clamp(rawScore[key], max);
    dims[key] = v;
    total += v;
  }
  total = Math.round(total * 100) / 100;

  return {
    ...dims,
    total,
    label: labelForScore(total),
    explanation: typeof rawScore.explanation === 'string' ? rawScore.explanation.slice(0, 2000) : '',
    confidence: ['Low', 'Medium', 'High'].includes(rawScore.confidence) ? rawScore.confidence : 'Medium',
  };
}

module.exports = { computeScore, MAXES, labelForScore };
