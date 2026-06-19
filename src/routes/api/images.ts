import { type Request, type Response, Router } from 'express';
import type { ImageQuery } from '../../types/image-query.ts';
import { processImage } from '../../image-processor.ts';

const images = Router();

images.get('/', async (req: Request<unknown, unknown, unknown, ImageQuery>, res: Response) => {
  const { filename, width, height } = req.query;

  // Validate required filename
  if (typeof filename !== 'string' || filename.trim() === '') {
    return res.status(400).json({ error: 'Filename is required and must be a string' });
  }

  const validatedQuery: ImageQuery = { filename };

  // Validate width only if it was provided
  if (width !== undefined) {
    if (typeof width !== 'string') {
      return res.status(400).json({ error: 'Width must be a single string value' });
    }
    const parsedWidth = parseInt(width, 10);
    if (isNaN(parsedWidth) || parsedWidth <= 0) {
      return res.status(400).json({ error: 'Width must be a valid positive integer' });
    }
    validatedQuery.width = parsedWidth;
  }

  // Validate height only if it was provided
  if (height !== undefined) {
    if (typeof height !== 'string') {
      return res.status(400).json({ error: 'Height must be a single string value' });
    }
    const parsedHeight = parseInt(height, 10);
    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      return res.status(400).json({ error: 'Height must be a valid positive integer' });
    }
    validatedQuery.height = parsedHeight;
  }

  try {
    console.log('HANDLER: calling processImage with', validatedQuery);
    const result = await processImage(validatedQuery);
    // TODO choose a sensible content-type (use actual format detection later)
    res.type('image/jpeg');
    return res.status(200).send(result);
  } catch (err: unknown) {
    console.log('HANDLER: processImage threw', err);
    const e = err instanceof Error ? err : new Error(String(err));
    // If processor throws a not-found error, detect it here
    if (e.message.includes('not found') || e.message.includes('No such file')) {
      return res.status(404).json({ error: e.message });
    }
    return res.status(500).json({ error: e.message || 'Processing failed' });
  }
});

export default images;
