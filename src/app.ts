import express from 'express';
import routes from './routes/index.ts';

const app = express();
app.use('/api', routes);

export default app;
