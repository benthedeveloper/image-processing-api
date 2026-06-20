import express from 'express';
import request from 'supertest';
import images from '../../routes/api/images.ts';
import { imageProcessor } from '../../image-processor.ts';

let processImageSpy: jasmine.Spy | undefined;

// Stub the processImage function to return a resolved promise with a buffer
function stubProcessImageResolve(buffer: Buffer): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.returnValue(
    Promise.resolve(buffer) as Promise<Buffer>,
  );
  return processImageSpy;
}

// Stub the processImage function to return a rejected promise with an error
function stubProcessImageReject(err: Error): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.callFake(() => {
    return Promise.reject(err) as Promise<Buffer>;
  });
  return processImageSpy;
}

describe('GET /api/images (unit)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/api/images', images);
  });

  afterEach(() => {
    // Reset the spy after each test to avoid interference between tests
    if (processImageSpy) {
      processImageSpy.calls.reset();
      if (processImageSpy.and?.callThrough) {
        processImageSpy.and.callThrough();
      }
      processImageSpy = undefined;
    }
  });

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
    stubProcessImageResolve(Buffer.from('ok'));
    const res = await request(app).get('/api/images').query({ width: '100' }); // missing filename
    expect(processImageSpy).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  it('calls processImage with parsed width/height and returns buffer + content-type', async () => {
    const fakeBuffer = Buffer.from([1, 2, 3]);
    stubProcessImageResolve(fakeBuffer);

    const res = await request(app)
      .get('/api/images')
      .query({ filename: 'encenadaport', width: '100', height: '200' })
      .buffer(true);

    expect(processImageSpy).toHaveBeenCalledWith({ filename: 'encenadaport', width: 100, height: 200 });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBeDefined();
    const body = res.body as Buffer;
    expect(body.length).toBeGreaterThan(0);
  });

  it('returns 500 when processImage rejects', async () => {
    stubProcessImageReject(new Error('processing failed'));

    const res = await request(app).get('/api/images').query({ filename: 'non-existent-file' });

    expect(processImageSpy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body?.error).toBeDefined();
  });
});
