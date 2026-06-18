import express from 'express';

const images = express.Router();

images.get('/', (req, res) => {
  res.send('TODO implement images route');
});

export default images;
