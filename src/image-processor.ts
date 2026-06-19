import sharp from 'sharp';
import type { ImageQuery } from './types/image-query.ts';

export const imageProcessor = {
  processImage: async (query: ImageQuery): Promise<Buffer> => {
    // TODO implement actual processing logic with sharp
    throw new Error('Not implemented');
  },
};
