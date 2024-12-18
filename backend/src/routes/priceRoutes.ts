import express from 'express';
import { handleGetPriceUpdates } from '@/handlers/priceHandler';

const router = express.Router();

router.get('/:productId', handleGetPriceUpdates);

export default router;
