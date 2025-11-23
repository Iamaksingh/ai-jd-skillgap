const request = require('supertest');
const app = require('../server');

describe('Basic server tests', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  // further tests will require mocking DB and Gemini service
});
