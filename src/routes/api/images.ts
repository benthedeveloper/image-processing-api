import { type Request, type Response, Router } from 'express';
// TODO import processing module

interface ImageQuery {
  filename: string;
  width?: number;
  height?: number;
}

const images = Router();

images.get(
  '/',
  (req: Request<unknown, unknown, unknown, ImageQuery>, res: Response) => {
    // res.send('TODO implement images route');
    const { filename, width, height } = req.query;

    // Validate required filename
    if (typeof filename !== 'string' || filename.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Filename is required and must be a string' });
    }

    const validatedQuery: ImageQuery = { filename };

    // Validate width only if it was provided
    if (width !== undefined) {
      if (typeof width !== 'string') {
        return res
          .status(400)
          .json({ error: 'Width must be a single string value' });
      }
      const parsedWidth = parseInt(width, 10);
      if (isNaN(parsedWidth) || parsedWidth <= 0) {
        return res
          .status(400)
          .json({ error: 'Width must be a valid positive integer' });
      }
      validatedQuery.width = parsedWidth;
    }

    // Validate height only if it was provided
    if (height !== undefined) {
      if (typeof height !== 'string') {
        return res
          .status(400)
          .json({ error: 'Height must be a single string value' });
      }
      const parsedHeight = parseInt(height, 10);
      if (isNaN(parsedHeight) || parsedHeight <= 0) {
        return res
          .status(400)
          .json({ error: 'Height must be a valid positive integer' });
      }
      validatedQuery.height = parsedHeight;
    }

    // TODO update this
    res.json(validatedQuery);
  },
);

export default images;
