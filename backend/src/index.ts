if (process.env.NODE_ENV === 'production') {
  require('module-alias/register');
}

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from '@/routes';
import errorLogMiddleware from '@/middleware/errorLogMiddleware';
import { initMailer } from '@/services/email/index';
import { initializeCronJobs } from './jobs';
import { initSeeding } from '@/utils/seedWatchlist';
import setupLogging from './utils/loggingConfig';

// Setup environment variables
dotenv.config();

// Setup logging
setupLogging();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(errorLogMiddleware);
app.use('/api', routes);

initMailer();
initializeCronJobs();

(async () => {
  try {
    await initSeeding();
  } catch (error) {
    console.error('Error during seeding initialization:', error);
  }
})();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
