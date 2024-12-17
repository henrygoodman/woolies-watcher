import express from 'express';
import {
  handleWatchlistAdd,
  handleWatchlistDelete,
  handleWatchlistGet,
} from '@/handlers/watchlistHandlers';
import { handleAuth } from '@/middleware/authMiddleware';

const router = express.Router();

router.post('/', handleAuth, handleWatchlistAdd);
router.delete('/', handleAuth, handleWatchlistDelete);
router.get('/', handleAuth, handleWatchlistGet);

export default router;
