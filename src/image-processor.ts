import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type { ImageQuery } from './types/image-query.ts';

const ASSETS_ROOT = path.join(process.cwd(), 'assets');
export const FULL_DIR = path.join(ASSETS_ROOT, 'full');
export const THUMB_DIR = path.join(ASSETS_ROOT, 'thumbs');
export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.heif', '.tiff'];

export const imageProcessor = {
  getFullImageAssetPath: async (filename: string): Promise<string | null> => {
    for (const ext of SUPPORTED_EXTENSIONS) {
      const fullPath = path.join(FULL_DIR, `${filename}${ext}`);
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        continue;
      }
    }
    return null;
  },

  processImage: async (query: ImageQuery): Promise<string> => {
    const { filename, width, height } = query;

    // Locate source file
    const fullImageInputPath = await imageProcessor.getFullImageAssetPath(filename);
    if (!fullImageInputPath) {
      throw new Error(`Image not found: ${filename}`);
    }

    // Generate target thumb path (e.g., fileName_50x40.jpg)
    // If no width/height requested, we could default to 'original' or serve full path
    const ext = path.extname(fullImageInputPath);
    const thumbName = `${filename}_${width || 'orig'}x${height || 'orig'}${ext}`;
    const thumbPath = path.join(THUMB_DIR, thumbName);

    // Check cache (does the thumbnail already exist?)
    try {
      await fs.access(thumbPath);
      // CACHE HIT: Return just the string path so express can handle sendFile
      return thumbPath;
    } catch {
      // CACHE MISS: Proceed with creating the thumbnail
    }

    // Ensure directory exists
    await fs.mkdir(THUMB_DIR, { recursive: true });

    // Process and write file
    let image = sharp(fullImageInputPath);
    if (width || height) {
      image = image.resize(width, height);
    }

    // toFile saves directly to disk and returns metadata.
    await image.toFile(thumbPath);

    // Return the final file path to the controller
    return thumbPath;
  },
};
