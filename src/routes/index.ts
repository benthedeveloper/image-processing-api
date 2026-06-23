import express from 'express';
import images from './api/images.ts';

const routes = express.Router();

routes.get('/', (_req, res) => {
  res.send('Main api route');
});

routes.get('/health', (_req, res) => {
  res.sendStatus(200);
});

routes.use('/images', images);

export default routes;
