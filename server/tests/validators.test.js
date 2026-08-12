const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { startupIdeaSchema } = require('../validators/startup.validator');

describe('auth validators', () => {
  test('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ name: 'A B', email: 'a@b.com', password: 'password123', confirmPassword: 'different123' });
    expect(result.success).toBe(false);
  });

  test('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' });
    expect(result.success).toBe(false);
  });

  test('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
    expect(result.success).toBe(true);
  });
});

describe('startup idea validator', () => {
  test('rejects a problem statement that is too short (no generic empty submissions)', () => {
    const result = startupIdeaSchema.safeParse({
      startupName: 'X', industry: 'SaaS', problem: 'too short', solution: 'also too short here',
      targetAudience: 'people', customerSegment: 'B2B', geography: 'US', businessStage: 'Idea',
      businessModel: 'Subscription', fundingStatus: 'Bootstrapped',
    });
    expect(result.success).toBe(false);
  });

  test('accepts a complete, valid submission', () => {
    const result = startupIdeaSchema.safeParse({
      startupName: 'CampusCart', industry: 'E-commerce',
      problem: 'College students struggle to find affordable second-hand textbooks near campus quickly.',
      solution: 'A hyperlocal marketplace connecting students on the same campus with escrow payments.',
      targetAudience: 'Undergraduate students', customerSegment: 'B2C', geography: 'India',
      businessStage: 'MVP', businessModel: 'Commission', competitors: ['OLX'], fundingStatus: 'Bootstrapped',
    });
    expect(result.success).toBe(true);
  });
});
