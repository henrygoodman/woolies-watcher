import express from 'express';
import {
  handleGetUserDestinationEmail,
  handleUpdateUserDestinationEmail,
} from '@/handlers/userHandlers';
import { handleAuth } from '@/middleware/authMiddleware';

const router = express.Router();

router.get('/config', handleAuth, handleGetUserDestinationEmail);
router.patch('/config', handleAuth, handleUpdateUserDestinationEmail);

export default router;
