import express from 'express';
import {
  handleGetUserConfig,
  handleUpdateUserConfig,
} from '@/handlers/userHandlers';
import { handleAuth } from '@/middleware/authMiddleware';

const router = express.Router();

router.get('/config', handleAuth, handleGetUserConfig);
router.patch('/config', handleAuth, handleUpdateUserConfig);

export default router;
