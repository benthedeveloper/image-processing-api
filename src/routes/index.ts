import express from 'express';
import images from './api/images.ts';

const routes = express.Router();

routes.get('/', (req, res) => {
  res.send('Main api route');
});

routes.use('/images', images);

export default routes;
