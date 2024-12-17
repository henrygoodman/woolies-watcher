import express from 'express';
import {
  handleSearchProductByName,
  handleSearchProducts,
} from '@/handlers/searchHandlers';

const router = express.Router();

router.get('/', handleSearchProducts);
router.get('/name/:productName', handleSearchProductByName);

export default router;
