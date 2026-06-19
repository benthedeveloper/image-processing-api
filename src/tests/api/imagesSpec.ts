import express from 'express';
import request from 'supertest';
import images from '../../routes/api/images.ts';
import * as imageProcessor from '../../image-processor.ts';

type ImageQuery = { filename: string; width?: number; height?: number };
type ProcessImageFn = (q: ImageQuery) => Promise<Buffer>;

let processImageSpy: jasmine.Spy | undefined;

function stubProcessImageResolve(buffer: Buffer): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.returnValue(
    Promise.resolve(buffer) as ReturnType<ProcessImageFn>,
  );
  return processImageSpy;
}

function stubProcessImageReject(err: Error): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.returnValue(
    Promise.reject(err) as ReturnType<ProcessImageFn>,
  );
  return processImageSpy;
}

describe('GET /api/images (unit)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/api/images', images);
  });

  afterEach(() => {
    if (processImageSpy) {
      processImageSpy.calls.reset();
      processImageSpy = undefined;
    }
  });

  it('returns 400 if filename is missing', async () => {
    console.log('START: returns 400 if filename is missing');
    const res = await request(app).get('/api/images');
    expect(res.status).toBe(400);
    expect(res.body?.error).toBe('Filename is required and must be a string');
    console.log('DONE: returns 400 if filename is missing');
  });

  it('returns 400 for non-numeric width', async () => {
    console.log('START: returns 400 for non-numeric width');
    const res = await request(app).get('/api/images').query({ filename: 'encenadaport', width: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body?.error).toContain('Width must be a valid positive integer');
    console.log('DONE: returns 400 for non-numeric width');
  });

  it('does not call processImage for invalid queries', async () => {
    console.log('START: does not call processImage for invalid queries');
    const spy = stubProcessImageResolve(Buffer.from('ok'));
    const res = await request(app).get('/api/images').query({ width: '100' }); // missing filename
    expect(spy).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    console.log('DONE: does not call processImage for invalid queries');
  });

  it('calls processImage with parsed width/height and returns buffer + content-type', async () => {
    const fakeBuffer = Buffer.from([1, 2, 3]);
    console.log('START: calls processImage with parsed width/height');
    const spy = stubProcessImageResolve(fakeBuffer);

    const res = await request(app)
      .get('/api/images')
      .query({ filename: 'encenadaport', width: '100', height: '200' })
      .buffer(true);

    expect(spy).toHaveBeenCalledWith({
      filename: 'encenadaport',
      width: 100,
      height: 200,
    });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBeDefined();
    const body = res.body as Buffer;
    expect(body.length).toBeGreaterThan(0);
    console.log('DONE: calls processImage with parsed width/height');
  });

  it('returns 500 when processImage rejects', async () => {
    console.log('START: returns 500 when processImage rejects');
    const spy = stubProcessImageReject(new Error('processing failed'));
    const res = await request(app).get('/api/images').query({ filename: 'encenadaport' });

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body?.error).toBeDefined();
    console.log('DONE: returns 500 when processImage rejects');
  });
});
