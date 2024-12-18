import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from '@/routes';
import errorLogMiddleware from './middleware/errorLogMiddleware';
import { scheduleDailyWatchlistEmails } from './jobs/cron';
import { initMailer } from './services/email/index';

dotenv.config();

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

try {
  initMailer();
} catch (error) {
  console.error('Failed to initialize mailer:', error);
  process.exit(1);
}

scheduleDailyWatchlistEmails();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
