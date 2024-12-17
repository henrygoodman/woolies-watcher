import express from 'express';
import {
  handleProductGet,
  handleProductUpdates,
} from '@/handlers/productHandlers';

const router = express.Router();

router.get('/:id', handleProductGet);
router.get('/update', handleProductUpdates);

export default router;
