import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type { ImageQuery } from './types/image-query.ts';

const ASSETS_ROOT = path.join(process.cwd(), 'assets');
export const FULL_DIR = path.join(ASSETS_ROOT, 'full');
export const THUMB_DIR = path.join(ASSETS_ROOT, 'thumbs');
export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.heif', '.tiff'];

/**
 * Processes images by resizing them and caching the results.
 */
export const imageProcessor = {
  /**
   * Retrieves the full path of an image asset based on its filename.
   * @param filename The name of the image file (without extension).
   * @returns The full path of the image file or null if not found.
   */
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

  /**
   * Processes an image based on the provided query parameters.
   * @param query The image query parameters.
   * @returns A promise resolving to the path of the processed image.
   */
  processImage: async (query: ImageQuery): Promise<string> => {
    const { filename, width, height } = query;

    // Locate source file
    const fullImageInputPath = await imageProcessor.getFullImageAssetPath(filename);
    if (!fullImageInputPath) {
      throw new Error(`Image not found: ${filename}`);
    }

    // Generate target thumb path (e.g., fileName_50x40.jpg)
    // If no width/height requested, use 'orig' to indicate original dimensions in the filename
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
