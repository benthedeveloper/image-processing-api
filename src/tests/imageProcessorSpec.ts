import { imageProcessor, FULL_DIR, THUMB_DIR } from '../image-processor.ts';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const writeFullFile = async (name: string, data: Buffer | string) => {
  await fs.mkdir(FULL_DIR, { recursive: true });
  const p = path.join(FULL_DIR, name);
  await fs.writeFile(p, data);
  return p;
};

const createPngInFull = async (name: string, width = 1, height = 1, color = { r: 255, g: 0, b: 0, alpha: 1 }) => {
  await fs.mkdir(FULL_DIR, { recursive: true });
  const p = path.join(FULL_DIR, name);
  await sharp({ create: { width, height, channels: 4, background: color } })
    .png()
    .toFile(p);
  return p;
};

const createPngInThumbs = async (name: string, width = 1, height = 1, color = { r: 0, g: 0, b: 0, alpha: 1 }) => {
  await fs.mkdir(THUMB_DIR, { recursive: true });
  const p = path.join(THUMB_DIR, name);
  await sharp({ create: { width, height, channels: 4, background: color } })
    .png()
    .toFile(p);
  return p;
};

const unlinkIfExists = async (p: string) => {
  try {
    await fs.unlink(p);
  } catch {
    // ignore
  }
};

describe('imageProcessor tests', () => {
  beforeAll(async () => {
    await fs.mkdir(FULL_DIR, { recursive: true });
    await fs.mkdir(THUMB_DIR, { recursive: true });
  });

  afterEach(async () => {
    // remove any test artifacts created in full/thumbs
    const toCleanup = [
      path.join(FULL_DIR, 'exists.png'),
      path.join(FULL_DIR, 'unsupported.bmp'),
      path.join(FULL_DIR, 'cache.png'),
      path.join(FULL_DIR, 'process.png'),
      path.join(THUMB_DIR, 'cache_100x100.png'),
      path.join(THUMB_DIR, 'process_50x50.png'),
    ];
    await Promise.all(toCleanup.map(unlinkIfExists));
  });

  describe('getFullImageAssetPath tests', () => {
    it('filename that is not found should return null', async () => {
      const result = await imageProcessor.getFullImageAssetPath('definitely-not-present');
      expect(result).toBeNull();
    });

    it('returns path when file exists', async () => {
      await createPngInFull('exists.png');
      const result = await imageProcessor.getFullImageAssetPath('exists');
      expect(result).toBe(path.join(FULL_DIR, 'exists.png'));
    });

    it('unsupported extension present should return null', async () => {
      // create a .bmp file (not in SUPPORTED_EXTENSIONS)
      await writeFullFile('unsupported.bmp', 'dummy');
      const result = await imageProcessor.getFullImageAssetPath('unsupported');
      expect(result).toBeNull();
    });
  });

  describe('processImage tests', () => {
    it('throws when image not found', async () => {
      await expectAsync(
        imageProcessor.processImage({ filename: 'no-such-file', width: 50, height: 50 }),
      ).toBeRejectedWithError(/Image not found/);
    });

    it('returns cached thumbnail path when thumbnail exists', async () => {
      // create source and cached thumbnail
      await createPngInFull('cache.png');
      const thumbName = `cache_100x100.png`;
      const thumbPath = await createPngInThumbs(thumbName);
      const result = await imageProcessor.processImage({ filename: 'cache', width: 100, height: 100 });
      expect(result).toBe(thumbPath);
    });

    it('creates thumbnail when not cached (real processing)', async () => {
      // Use a tiny PNG fixture so sharp can process it
      const processFullPath = path.join(FULL_DIR, 'process.png');
      await fs.mkdir(FULL_DIR, { recursive: true });
      await sharp({
        create: { width: 1, height: 1, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } },
      })
        .png()
        .toFile(processFullPath);
      const expectedThumbName = `process_50x50.png`;
      const expectedThumbPath = path.join(THUMB_DIR, expectedThumbName);

      // Ensure thumbnail does not already exist
      await unlinkIfExists(expectedThumbPath);

      const result = await imageProcessor.processImage({ filename: 'process', width: 50, height: 50 });
      expect(result).toBe(expectedThumbPath);

      // Verify the file was written
      const stat = await fs.stat(expectedThumbPath);
      expect(stat.isFile()).toBeTrue();
    });
  });
});
