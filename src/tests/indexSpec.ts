import request from 'supertest';
import app from '../app.ts';

describe('index app', () => {
  it('responds to /api with 404 or other (smoke)', async () => {
    await request(app)
      .get('/api')
      .expect((res) => {
        // Accept any 2xx/3xx/4xx/5xx as long as app responds — or assert specific status/body for your routes
        if (!res.status) throw new Error('No response');
      });
  });
});
