import express from 'express';
import request from 'supertest';
import images from '../../routes/api/images.ts';
import { imageProcessor } from '../../image-processor.ts';

type ImageQuery = { filename: string; width?: number; height?: number };
type ProcessImageFn = (q: ImageQuery) => Promise<Buffer>;

describe('GET /api/images (unit)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/api/images', images);
  });

  // afterEach(() => {
  //   // reset any jasmine spies created in tests
  //   // each spy variable is local to the test, so nothing global to restore here
  // });

  it('returns 400 if filename is missing', async () => {
    const res = await request(app).get('/api/images');
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe('Filename is required and must be a string');
  });

  it('returns 400 for non-numeric width', async () => {
    const res = await request(app).get('/api/images').query({ filename: 'encenadaport', width: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body?.error).toContain('Width must be a valid positive integer');
  });

  it('does not call processImage for invalid queries', async () => {
    const spy = spyOn(imageProcessor, 'processImage').and.returnValue(
      Promise.resolve(Buffer.from('ok')) as ReturnType<ProcessImageFn>,
    );
    const res = await request(app).get('/api/images').query({ width: '100' }); // missing filename
    expect(spy).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    spy.calls.reset();
  });

  it('calls processImage with parsed width/height and returns buffer + content-type', async () => {
    const fakeBuffer = Buffer.from([1, 2, 3]);
    const spy = spyOn(imageProcessor, 'processImage').and.returnValue(
      Promise.resolve(fakeBuffer) as ReturnType<ProcessImageFn>,
    );

    const res = await request(app)
      .get('/api/images')
      .query({ filename: 'encenadaport', width: '100', height: '200' })
      .buffer(true);

    expect(spy).toHaveBeenCalledWith({ filename: 'encenadaport', width: 100, height: 200 });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBeDefined();
    const body = res.body as Buffer;
    expect(body.length).toBeGreaterThan(0);
    spy.calls.reset();
  });

  it('returns 500 when processImage rejects', async () => {
    const spy = spyOn(imageProcessor, 'processImage').and.returnValue(
      Promise.reject(new Error('processing failed')) as ReturnType<ProcessImageFn>,
    );

    const res = await request(app).get('/api/images').query({ filename: 'encenadaport' });

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body?.error).toBeDefined();
    spy.calls.reset();
  });
});
