import sharp from 'sharp';
import type { ImageQuery } from './types/image-query.ts';

export const processImage = async (query: ImageQuery): Promise<Buffer> => {
  // implement image processing here, e.g. using sharp
  // TEMP DEBUG
  console.log('Processing image with query:', query);
  throw new Error('Not implemented');
};
