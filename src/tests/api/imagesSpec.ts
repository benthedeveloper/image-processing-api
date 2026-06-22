import express from 'express';
import type { Response } from 'express';
import request from 'supertest';
import images from '../../routes/api/images.ts';
import { imageProcessor } from '../../image-processor.ts';

let processImageSpy: jasmine.Spy | undefined;

// Stub the processImage function to return a Promise<string> that resolves to a file path
function stubProcessImageResolve(thumbPath: string): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.returnValue(
    Promise.resolve(thumbPath) as Promise<string>,
  );
  return processImageSpy;
}

// Stub the processImage function to return a rejected promise with an error
function stubProcessImageReject(err: Error): jasmine.Spy {
  processImageSpy = spyOn(imageProcessor, 'processImage' as keyof typeof imageProcessor).and.callFake(() => {
    return Promise.reject(err) as Promise<string>;
  });
  return processImageSpy;
}

describe('GET /api/images (unit)', () => {
  let app: express.Express;
  type SendFileFn = (this: Response, path: string, options?: unknown, callback?: (err?: Error) => void) => void;
  const originalSendFile: SendFileFn = (express.response as unknown as { sendFile: SendFileFn }).sendFile;

  beforeAll(() => {
    app = express();
    app.use('/api/images', images);
    spyOn(express.response as unknown as { sendFile: SendFileFn }, 'sendFile').and.callFake(function (
      this: Response,
      _path: string,
      _options?: unknown,
      callback?: (err?: Error) => void,
    ) {
      if (typeof callback === 'function') {
        callback(); // signal Express that sendFile completed
      } else {
        this.status(200).send(''); // end the response for SuperTest
      }
    });
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

  afterAll(() => {
    // Restore the original sendFile implementation after all tests
    (express.response as unknown as { sendFile: SendFileFn }).sendFile = originalSendFile;
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

  it('returns 400 for non-numeric height', async () => {
    const res = await request(app).get('/api/images').query({ filename: 'encenadaport', height: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body?.error).toContain('Height must be a valid positive integer');
  });

  it('does not call processImage for invalid queries', async () => {
    stubProcessImageResolve('/path/to/thumb.jpg');
    const res = await request(app).get('/api/images').query({ width: '100' }); // missing filename
    expect(processImageSpy).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  it('calls processImage with parsed width/height and returns status 200', async () => {
    const fakeThumbPath = '/path/to/thumb.jpg';
    stubProcessImageResolve(fakeThumbPath);

    const res = await request(app).get('/api/images').query({ filename: 'encenadaport', width: '100', height: '200' });

    expect(processImageSpy).toHaveBeenCalledWith({ filename: 'encenadaport', width: 100, height: 200 });
    expect(res.status).toBe(200);
    // Since we're not actually sending a file, we can check that the response is empty (sendFile would handle it)
    expect(res.text).toBe('');
  });

  it('returns 500 when processImage rejects', async () => {
    stubProcessImageReject(new Error('processing failed'));

    const res = await request(app).get('/api/images').query({ filename: 'non-existent-file' });

    expect(processImageSpy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body?.error).toBeDefined();
  });
});
