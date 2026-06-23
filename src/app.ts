import express from 'express';
import routes from './routes/index.ts';
import cors from 'cors';

const app = express();

const allowed = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl/postman
      if (allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('CORS blocked by server'), false);
    },
  }),
);

app.use('/api', routes);

export default app;
