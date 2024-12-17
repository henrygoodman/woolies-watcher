import express from 'express';
import {
  handleProductGet,
  handleProductUpdates,
} from '@/handlers/productHandlers';

const router = express.Router();

router.get('/:id', handleProductGet);
router.post('/update', handleProductUpdates);

export default router;
