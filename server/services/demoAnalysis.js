/**
 * demoAnalysis.js
 * Deterministic, clearly-labeled DEMO MODE analysis generator.
 * Used only when no AI provider API key is configured. Every report built
 * from this module carries aiMeta.demoMode = true, and the frontend must
 * render a visible "DEMO MODE" badge - this is never mixed with real AI
 * output and is derived directly from the user's own submitted text rather
 * than invented facts.
 */

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(seed, arr) {
  return arr[seed % arr.length];
}

function buildDemoAnalysis(startup) {
  const seed = hashSeed(startup.startupName + startup.industry + startup.problem.length);

  const strengths = [
    `Directly targets a clearly stated problem: "${startup.problem.slice(0, 80)}${startup.problem.length > 80 ? '...' : ''}"`,
    `Focused on a specific customer segment (${startup.customerSegment}) rather than a broad, undifferentiated market.`,
    `Business stage (${startup.businessStage}) suggests a concrete next milestone rather than an unvalidated concept.`,
  ];
  const weaknesses = [
    'Revenue model is not yet fully validated with paying customers.',
    startup.competitors && startup.competitors.length ? 'Named competitors already have market presence, raising the bar for differentiation.' : 'No competitors were provided, which may indicate incomplete competitive research.',
    'Go-to-market and customer acquisition channel have not been detailed.',
  ];
  const opportunities = [
    `Growing interest in ${startup.industry} solutions creates room for a focused new entrant.`,
    `Geography (${startup.geography}) may offer underserved segments depending on local competition.`,
    'Ability to iterate quickly given the current early business stage.',
  ];
  const threats = [
    'Well-funded incumbents could move into the same niche.',
    'Customer acquisition costs in this category can be high without a differentiated channel.',
    'Regulatory or platform-dependency risk depending on execution details not yet provided.',
  ];

  const tamBase = pick(seed, [500_000_000, 1_200_000_000, 2_500_000_000, 800_000_000]);
  const sam = Math.round(tamBase * 0.12);
  const som = Math.round(sam * 0.08);

  const revenueOptions = [
    { model: 'Subscription', diff: 'Low' },
    { model: 'Freemium', diff: 'Medium' },
    { model: 'Marketplace fee', diff: 'High' },
    { model: 'Transaction fee', diff: 'Medium' },
  ];
  const rev1 = revenueOptions[seed % revenueOptions.length];
  const rev2 = revenueOptions[(seed + 1) % revenueOptions.length];

  const competitorNames = (startup.competitors && startup.competitors.length ? startup.competitors : ['Generic Incumbent A', 'Generic Incumbent B']).slice(0, 3);

  const innovation = 10 + (seed % 8); // up to 17/20
  const marketDemand = 8 + (seed % 10); // up to 17/20
  const scalability = 8 + (seed % 10);
  const businessModel = startup.businessModel === 'Not decided' ? 5 : 8 + (seed % 6);
  const competition = competitorNames.length > 2 ? 4 : 6;
  const executionFeasibility = ['MVP', 'Early Revenue', 'Growth', 'Scaling'].includes(startup.businessStage) ? 8 : 5;
  const investmentPotential = 2 + (seed % 3);

  return {
    executiveSummary: `${startup.startupName} is a ${startup.businessStage.toLowerCase()}-stage ${startup.industry} concept addressing "${startup.problem.slice(0, 140)}" for ${startup.targetAudience}. This is a DEMO MODE analysis derived heuristically from your submitted input, not a live AI assessment.`,
    problemAnalysis: {
      summary: startup.problem,
      severity: 'Not independently verified - based solely on the submitted description.',
      evidence: 'No external evidence was queried in demo mode.',
    },
    solutionAnalysis: {
      summary: startup.solution,
      differentiation: 'Differentiation strength cannot be assessed without live AI/market analysis.',
      feasibility: `Consistent with a ${startup.businessStage} stage startup.`,
    },
    swot: { strengths, weaknesses, opportunities, threats },
    marketSizing: {
      tam: { value: tamBase, currency: 'USD', description: `AI-generated estimate based on stated assumptions for the ${startup.industry} category.` },
      sam: { value: sam, currency: 'USD', description: `Estimated as a fraction of TAM reachable given geography (${startup.geography}) and segment (${startup.customerSegment}).` },
      som: { value: som, currency: 'USD', description: 'Estimated realistically obtainable share in the first 1-3 years, DEMO MODE heuristic only.' },
      methodology: 'Top-down heuristic (demo mode) — not derived from live market data.',
      assumptions: [
        'Category-level market size is approximated from industry averages, not a live data source.',
        'No externally verified market report was consulted (demo mode).',
      ],
      confidence: 'Low',
    },
    businessModelCanvas: {
      keyPartners: ['Technology/infrastructure vendors', 'Distribution or channel partners'],
      keyActivities: ['Product development', 'Customer acquisition', 'Support & retention'],
      keyResources: ['Core product/technology', 'Founding team', 'Early customer relationships'],
      valuePropositions: [startup.solution.slice(0, 160)],
      customerRelationships: ['Self-service onboarding', 'Direct support for early adopters'],
      channels: ['Direct/online', 'Partnerships'],
      customerSegments: [startup.targetAudience],
      costStructure: ['Product development', 'Customer acquisition', 'Operations'],
      revenueStreams: [startup.businessModel === 'Not decided' ? 'To be determined' : startup.businessModel],
    },
    competitorAnalysis: competitorNames.map((name) => ({
      name,
      description: 'Description not verified - demo mode does not query live sources.',
      targetCustomer: startup.targetAudience,
      strengths: ['Established presence (assumed)'],
      weaknesses: ['Potential gaps this startup could exploit (unverified)'],
      businessModel: 'Unknown (demo mode)',
      competitiveThreat: 'Medium',
      differentiationOpportunity: `Focus tightly on: ${startup.solution.slice(0, 100)}`,
    })),
    revenueModels: [
      { model: rev1.model, whyItFits: `Common fit for ${startup.customerSegment} products at ${startup.businessStage} stage.`, advantages: ['Predictable revenue potential'], risks: ['Requires sustained retention'], implementationDifficulty: rev1.diff },
      { model: rev2.model, whyItFits: 'Alternative worth testing against the primary model.', advantages: ['Lower initial adoption friction'], risks: ['May require volume to be profitable'], implementationDifficulty: rev2.diff },
    ],
    investorFeedback: {
      investmentAttractiveness: Math.min(100, (innovation + marketDemand + scalability + businessModel + competition + executionFeasibility + investmentPotential) * 1.1),
      strengthsFromInvestorPerspective: ['Clearly articulated problem/solution fit (as stated)'],
      investorConcerns: ['Unvalidated demand', 'Revenue model maturity', 'Competitive differentiation'],
      fundingReadiness: startup.fundingStatus === 'No funding' || startup.businessStage === 'Idea' ? 'Not Ready' : 'Early',
      investorQuestions: [
        'How have you validated demand with real customers so far?',
        'What is your customer acquisition strategy and estimated CAC?',
        'Who are your closest competitors and how do you differentiate?',
        'What are the biggest risks to this business and how will you mitigate them?',
        'What milestones will this funding round unlock?',
      ],
      fundingRecommendation: 'Demo mode cannot produce a reliable funding recommendation - connect a live AI provider for a full assessment.',
    },
    marketAnalysis: {
      targetMarket: startup.targetAudience,
      customerDemand: 'Not independently verified in demo mode.',
      marketDrivers: [`Rising adoption of ${startup.industry} solutions`],
      marketBarriers: ['Customer trust/switching costs', 'Incumbent competition'],
      growthOpportunities: ['Geographic expansion', 'Adjacent customer segments'],
      adoptionChallenges: ['Onboarding friction', 'Price sensitivity'],
      geographicConsiderations: startup.geography,
      keyAssumptions: ['Estimates are heuristic placeholders pending live AI analysis.'],
    },
    riskAssessment: [
      { category: 'Market Risk', risk: 'Demand may be smaller than assumed.', severity: 'Medium', probability: 'Medium', impact: 'Slower growth than projected.', mitigation: 'Run structured customer discovery interviews.' },
      { category: 'Competition Risk', risk: 'Incumbents could out-execute on distribution.', severity: 'Medium', probability: 'Medium', impact: 'Higher CAC, lower market share.', mitigation: 'Identify and defend a narrow wedge market first.' },
      { category: 'Execution Risk', risk: 'Team bandwidth vs. scope of the roadmap.', severity: 'Medium', probability: 'Low', impact: 'Delayed milestones.', mitigation: 'Sequence features around the riskiest assumption first.' },
    ],
    recommendations: [
      { text: 'Run 10-15 structured customer discovery interviews to validate the problem statement.', priority: 'High' },
      { text: 'Define and test a single primary acquisition channel before diversifying.', priority: 'High' },
      { text: 'Finalize a revenue model and validate willingness-to-pay with a pricing test.', priority: 'Medium' },
      { text: 'Document a clear differentiation statement against named competitors.', priority: 'Medium' },
    ],
    score: {
      innovation, marketDemand, scalability, businessModel, competition, executionFeasibility, investmentPotential,
      explanation: 'DEMO MODE score computed from a deterministic heuristic based on your submitted fields - not a live AI assessment. Configure GEMINI_API_KEY for real analysis.',
      confidence: 'Low',
    },
  };
}

module.exports = { buildDemoAnalysis };
