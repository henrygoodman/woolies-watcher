import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from '@/routes';
import errorLogMiddleware from '@/middleware/errorLogMiddleware';
import { initMailer } from '@/services/email/index';
import { rateLimitMiddleware } from '@/middleware/rateLimiter';
import { initializeCronJobs } from './jobs';
import { initSeeding } from '@/utils/seedWatchlist';

dotenv.config();

const getCallerInfo = () => {
  const error = new Error();
  const stack = error.stack || '';
  const stackLines = stack.split('\n');

  const callerLine = stackLines[3];
  const match = callerLine?.match(/\((.*):(\d+):(\d+)\)/);

  if (match) {
    const filePath = match[1];
    const lineNumber = match[2];
    const columnNumber = match[3];
    return `${filePath}:${lineNumber}:${columnNumber}`;
  }

  return 'unknown location';
};

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const callerInfo = getCallerInfo();
  originalConsoleLog(`[INFO - ${timestamp}] [${callerInfo}]`, ...args);
};

console.error = (...args) => {
  const timestamp = new Date().toISOString();
  const callerInfo = getCallerInfo();
  originalConsoleError(`[ERROR - ${timestamp}] [${callerInfo}]`, ...args);
};

console.warn = (...args) => {
  const timestamp = new Date().toISOString();
  const callerInfo = getCallerInfo();
  originalConsoleWarn(`[WARN - ${timestamp}] [${callerInfo}]`, ...args);
};

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  })
);

app.use(rateLimitMiddleware);
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
