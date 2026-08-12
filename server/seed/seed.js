/**
 * Development seed script.
 * Usage: npm run seed  (from server/), with ADMIN_PASSWORD set in your .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StartupIdea = require('../models/StartupIdea');
const Report = require('../models/Report');
const PromptTemplate = require('../models/PromptTemplate');
const { computeScore } = require('../services/scoreService');
const { buildDemoAnalysis } = require('../services/demoAnalysis');
const { SYSTEM_INSTRUCTION } = require('../services/aiService');

async function run() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] connected');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@startupiq.local';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('Set ADMIN_PASSWORD in your .env before seeding (never hardcode it).');
  }

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'StartupIQ Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
    });
    console.log(`[seed] created admin: ${adminEmail}`);
  } else {
    console.log('[seed] admin already exists, skipping');
  }

  await PromptTemplate.findOneAndUpdate(
    { name: 'default_analysis' },
    { name: 'default_analysis', content: SYSTEM_INSTRUCTION, defaultContent: SYSTEM_INSTRUCTION, version: 1, active: true },
    { upsert: true }
  );
  console.log('[seed] ensured default prompt template');

  const demoEmail = 'demo.user@startupiq.local';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo User',
      email: demoEmail,
      passwordHash: await bcrypt.hash('DemoPassword123!', 12),
      role: 'user',
    });
    console.log(`[seed] created demo user: ${demoEmail} / DemoPassword123!`);
  }

  const existingDemoStartups = await StartupIdea.countDocuments({ userId: demoUser._id });
  if (existingDemoStartups === 0) {
    const samples = [
      {
        startupName: 'CampusCart (DEMO)', industry: 'E-commerce', problem: 'College students struggle to find affordable, verified second-hand textbooks and dorm essentials near campus in time for the semester.',
        solution: 'A hyperlocal marketplace app connecting students on the same campus for verified peer-to-peer resale with pickup points and escrow payments.',
        targetAudience: 'Undergraduate college students', customerSegment: 'B2C', geography: 'India - Tier 1 & 2 cities',
        businessStage: 'MVP', businessModel: 'Commission', competitors: ['OLX', 'Facebook Marketplace'], fundingStatus: 'Bootstrapped',
      },
      {
        startupName: 'FarmLedger (DEMO)', industry: 'AgriTech', problem: 'Small farmers lack a simple way to track input costs, yields, and get fair market price alerts.',
        solution: 'A lightweight mobile app for farm bookkeeping with local-language voice input and mandi price alerts.',
        targetAudience: 'Smallholder farmers', customerSegment: 'B2C', geography: 'Rural India',
        businessStage: 'Prototype', businessModel: 'Freemium', competitors: ['DeHaat'], fundingStatus: 'Pre-seed',
      },
    ];
    for (const s of samples) {
      const startup = await StartupIdea.create({ ...s, userId: demoUser._id, analysisType: 'Full Validation' });
      const analysis = buildDemoAnalysis(startup);
      const score = computeScore(analysis.score);
      await Report.create({
        userId: demoUser._id, startupIdeaId: startup._id, analysisType: 'Full Validation',
        executiveSummary: analysis.executiveSummary, problemAnalysis: analysis.problemAnalysis, solutionAnalysis: analysis.solutionAnalysis,
        swot: analysis.swot, marketSizing: { ...analysis.marketSizing, disclaimer: 'Market-size values are preliminary AI-generated estimates and should be validated against reliable market research before making financial or investment decisions.' },
        businessModelCanvas: analysis.businessModelCanvas,
        competitorAnalysis: analysis.competitorAnalysis.map((c) => ({ ...c, verificationStatus: 'AI-identified / requires verification' })),
        revenueModels: analysis.revenueModels, investorFeedback: analysis.investorFeedback, marketAnalysis: analysis.marketAnalysis,
        riskAssessment: analysis.riskAssessment, recommendations: analysis.recommendations, score,
        status: 'completed', aiMeta: { provider: 'demo', model: 'demo-heuristic-v1', demoMode: true, generatedAt: new Date() },
        isDemoSeed: true,
      });
      console.log(`[seed] created demo report for ${s.startupName}`);
    }
  } else {
    console.log('[seed] demo reports already exist, skipping');
  }

  console.log('[seed] done');
  await mongoose.disconnect();
}

run().catch((err) => { console.error('[seed] failed:', err); process.exit(1); });
