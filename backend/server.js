import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import chatRouter from './src/routes/chat.js';
import analyticsRouter from './src/routes/analytics.js';
import { initDb } from './src/db/init.js';

dotenv.config();
         
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/chat', chatRouter);
app.use('/api/analytics', analyticsRouter);

async function startServer() {
  await initDb();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

startServer();