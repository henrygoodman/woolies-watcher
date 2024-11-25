import express from 'express';
import { handleSearchProducts } from '@/handlers/searchHandlers';

const router = express.Router();

router.get('/', handleSearchProducts);

export default router;
