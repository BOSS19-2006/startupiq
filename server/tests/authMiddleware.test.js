process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');
const app = require('../app');

describe('protected routes reject missing/invalid tokens without touching the DB', () => {
  test('GET /api/auth/me with no token -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  test('GET /api/startups with garbage token -> 401', async () => {
    const res = await request(app).get('/api/startups').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  test('GET /api/admin/users without a token -> 401 before role check', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/health is public', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  test('unknown route -> 404 with consistent error shape', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: 'NOT_FOUND' });
  });
});
