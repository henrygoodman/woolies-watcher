import express from 'express';
import { handleProductGet } from '@/handlers/productHandlers';

const router = express.Router();

router.get('/:id', handleProductGet);

export default router;
