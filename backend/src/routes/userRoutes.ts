import express from 'express';
import { handleGetUser, handleUpdateUser } from '@/handlers/userHandlers';
import { handleAuth } from '@/middleware/authMiddleware';

const router = express.Router();

router.get('/', handleAuth, handleGetUser);
router.patch('/', handleAuth, handleUpdateUser);

export default router;
