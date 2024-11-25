import express from 'express';
import { handleProductUpdates } from '@/handlers/productHandlers';

const router = express.Router();

router.post('/update', handleProductUpdates);

export default router;
