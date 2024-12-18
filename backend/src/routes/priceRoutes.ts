import express from 'express';
import { handleGetPriceUpdates } from '@/handlers/priceHandlers';

const router = express.Router();

router.get('/:productId', handleGetPriceUpdates);

export default router;
