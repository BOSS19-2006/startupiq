/**
 * aiService.js
 * ---------------------------------------------------------------------------
 * Provider-agnostic AI service for StartupIQ.
 *
 * Responsibilities:
 *  - Build a structured prompt (system instruction + startup context +
 *    analysis instructions + output schema) from validated startup data.
 *  - Call the configured AI provider (Gemini by default) and demand strict
 *    JSON back - never markdown, never HTML, never UI code.
 *  - Validate the JSON against our expected shape; attempt one structured
 *    repair pass if it's malformed; otherwise throw a typed error.
 *  - If no API key is configured, run in a clearly-labeled DEMO MODE that
 *    deterministically derives a structured, non-random analysis from the
 *    user's own input (never presented as real AI output; the UI/report is
 *    told this came from demo mode via aiMeta.demoMode).
 *
 * Swapping providers: implement `callGemini` -> `callOpenAI` (or add a new
 * function) with the same call signature and branch on process.env.AI_PROVIDER.
 * Nothing outside this file needs to change.
 * ---------------------------------------------------------------------------
 */

const ApiError = require('../utils/ApiError');

const SYSTEM_INSTRUCTION = `You are the analysis engine for StartupIQ, an AI-assisted startup idea
validation and business-analysis platform. You produce structured, preliminary decision-support
analysis - not a guarantee of success, not verified market research, and not financial/legal/
investment advice. Rules you must always follow:
1. Never invent facts and never present an estimate as a verified/confirmed fact.
2. For every market-size figure (TAM/SAM/SOM) and every competitor claim, include your
   methodology, assumptions, and a confidence level (Low/Medium/High).
3. Do not fabricate sources, URLs, or statistics attributed to a named external report.
4. Base SWOT points, risks, and recommendations on the specific idea provided - avoid generic
   filler such as "strong team" unless the input actually supports it.
5. Respond with STRICT JSON ONLY matching the given schema. No markdown, no code fences, no
   commentary before or after the JSON.`;

function buildAnalysisInstructions(analysisType) {
  const base = [
    'Understand the idea (problem, solution, target customer, industry, geography, stage, business model).',
    'Perform a SWOT analysis (at least 3 points per category, specific to this idea).',
    'Estimate TAM, SAM and SOM with methodology, assumptions, geography, customer segment and confidence.',
    'Generate a full 9-block Business Model Canvas.',
    'Identify likely competitors and mark each as "AI-identified / requires verification".',
    'Recommend suitable revenue models with pros, risks and implementation difficulty.',
    'Provide investor feedback: attractiveness score /100, strengths, concerns, funding readiness, 5-10 investor questions.',
    'Summarize market analysis: demand, drivers, barriers, growth opportunities, adoption challenges.',
    'Assess risk across Market/Product/Technical/Financial/Competition/Regulatory/Execution/Customer Acquisition categories.',
    'Give prioritized (High/Medium/Low) practical recommendations.',
    'Score the idea across 7 weighted dimensions (see schema maxes) - do not exceed any per-dimension maximum.',
  ];
  const focus = {
    'Full Validation': 'Run the complete analysis described above.',
    'Market Analysis': 'Focus primarily on market sizing, market analysis and competitor analysis; keep other sections brief but present.',
    'Business Analysis': 'Focus primarily on the business model canvas and revenue models; keep other sections brief but present.',
    'Investor Analysis': 'Focus primarily on investor feedback and risk assessment; keep other sections brief but present.',
  };
  return `${base.join('\n')}\nAnalysis type requested: ${analysisType}. ${focus[analysisType] || focus['Full Validation']}`;
}

const OUTPUT_SCHEMA_HINT = `{
 "executiveSummary": "string",
 "problemAnalysis": { "summary": "string", "severity": "string", "evidence": "string" },
 "solutionAnalysis": { "summary": "string", "differentiation": "string", "feasibility": "string" },
 "swot": { "strengths": ["string"], "weaknesses": ["string"], "opportunities": ["string"], "threats": ["string"] },
 "marketSizing": {
   "tam": { "value": number, "currency": "USD", "description": "string" },
   "sam": { "value": number, "currency": "USD", "description": "string" },
   "som": { "value": number, "currency": "USD", "description": "string" },
   "methodology": "string", "assumptions": ["string"], "confidence": "Low|Medium|High"
 },
 "businessModelCanvas": {
   "keyPartners": ["string"], "keyActivities": ["string"], "keyResources": ["string"],
   "valuePropositions": ["string"], "customerRelationships": ["string"], "channels": ["string"],
   "customerSegments": ["string"], "costStructure": ["string"], "revenueStreams": ["string"]
 },
 "competitorAnalysis": [{ "name": "string", "description": "string", "targetCustomer": "string",
   "strengths": ["string"], "weaknesses": ["string"], "businessModel": "string",
   "competitiveThreat": "Low|Medium|High", "differentiationOpportunity": "string" }],
 "revenueModels": [{ "model": "string", "whyItFits": "string", "advantages": ["string"], "risks": ["string"],
   "implementationDifficulty": "Low|Medium|High" }],
 "investorFeedback": { "investmentAttractiveness": number, "strengthsFromInvestorPerspective": ["string"],
   "investorConcerns": ["string"], "fundingReadiness": "Not Ready|Early|Developing|Investor Ready",
   "investorQuestions": ["string"], "fundingRecommendation": "string" },
 "marketAnalysis": { "targetMarket": "string", "customerDemand": "string", "marketDrivers": ["string"],
   "marketBarriers": ["string"], "growthOpportunities": ["string"], "adoptionChallenges": ["string"],
   "geographicConsiderations": "string", "keyAssumptions": ["string"] },
 "riskAssessment": [{ "category": "Market Risk|Product Risk|Technical Risk|Financial Risk|Competition Risk|Regulatory Risk|Execution Risk|Customer Acquisition Risk",
   "risk": "string", "severity": "Low|Medium|High", "probability": "Low|Medium|High", "impact": "string", "mitigation": "string" }],
 "recommendations": [{ "text": "string", "priority": "High|Medium|Low" }],
 "score": { "innovation": number(0-20), "marketDemand": number(0-20), "scalability": number(0-20),
   "businessModel": number(0-15), "competition": number(0-10), "executionFeasibility": number(0-10),
   "investmentPotential": number(0-5), "explanation": "string", "confidence": "Low|Medium|High" }
}`;

function buildPrompt(startup, promptTemplateContent) {
  const context = `Startup name: ${startup.startupName}
Industry: ${startup.industry}
Problem: ${startup.problem}
Solution: ${startup.solution}
Target audience: ${startup.targetAudience}
Customer segment: ${startup.customerSegment}
Geography: ${startup.geography}
Business stage: ${startup.businessStage}
Business model (stated): ${startup.businessModel}
Known competitors (user-provided, may be empty): ${(startup.competitors || []).join(', ') || 'None provided'}
Funding status: ${startup.fundingStatus}`;

  return [
    promptTemplateContent || SYSTEM_INSTRUCTION,
    '\n--- STARTUP CONTEXT ---\n' + context,
    '\n--- ANALYSIS INSTRUCTIONS ---\n' + buildAnalysisInstructions(startup.analysisType),
    '\n--- OUTPUT SCHEMA (respond with JSON matching this shape exactly, no extra text) ---\n' + OUTPUT_SCHEMA_HINT,
  ].join('\n');
}

function stripCodeFences(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
}

function extractJson(text) {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

const REQUIRED_TOP_LEVEL_KEYS = [
  'executiveSummary', 'problemAnalysis', 'solutionAnalysis', 'swot', 'marketSizing',
  'businessModelCanvas', 'competitorAnalysis', 'revenueModels', 'investorFeedback',
  'marketAnalysis', 'riskAssessment', 'recommendations', 'score',
];

function validateShape(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return REQUIRED_TOP_LEVEL_KEYS.every((k) => k in obj);
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError(504, 'AI analysis is temporarily unavailable (request timed out). Please try again.', 'AI_TIMEOUT');
    }
    throw new ApiError(502, 'AI analysis is temporarily unavailable. Please try again.', 'AI_NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(500, 'AI service is not configured correctly (invalid API key).', 'AI_INVALID_KEY');
  }
  if (response.status === 429) {
    throw new ApiError(429, 'AI analysis is temporarily unavailable (rate limit reached). Please try again shortly.', 'AI_RATE_LIMIT');
  }
  if (!response.ok) {
    throw new ApiError(502, 'AI analysis is temporarily unavailable. Please try again.', 'AI_PROVIDER_ERROR');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) {
    throw new ApiError(502, 'AI analysis is temporarily unavailable (empty response). Please try again.', 'AI_EMPTY_RESPONSE');
  }
  return text;
}

async function requestStructuredAnalysis(startup, promptTemplateContent) {
  const provider = process.env.AI_PROVIDER || 'gemini';
  const hasKey = provider === 'gemini' ? !!process.env.GEMINI_API_KEY : false;

  if (!hasKey) {
    // Explicit, clearly-labeled demo mode - see services/demoAnalysis.js
    const { buildDemoAnalysis } = require('./demoAnalysis');
    return {
      analysis: buildDemoAnalysis(startup),
      aiMeta: { provider: 'demo', model: 'demo-heuristic-v1', demoMode: true, generatedAt: new Date() },
    };
  }

  const prompt = buildPrompt(startup, promptTemplateContent);

  const rawText = await callGemini(prompt);
  let parsed = extractJson(rawText);

  if (!validateShape(parsed)) {
    // One structured repair attempt: ask the model to fix its own output.
    const repairPrompt = `The following text was supposed to be strict JSON matching this schema:\n${OUTPUT_SCHEMA_HINT}\n\nIt is invalid or incomplete. Return ONLY corrected, complete, strict JSON matching the schema - no commentary.\n\nOriginal output:\n${rawText}`;
    const repairedText = await callGemini(repairPrompt);
    parsed = extractJson(repairedText);
  }

  if (!validateShape(parsed)) {
    throw new ApiError(502, 'AI analysis failed validation and could not be repaired. Please try again.', 'AI_INVALID_JSON');
  }

  return {
    analysis: parsed,
    aiMeta: { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-1.5-pro', demoMode: false, generatedAt: new Date() },
  };
}

module.exports = { requestStructuredAnalysis, buildPrompt, SYSTEM_INSTRUCTION };
