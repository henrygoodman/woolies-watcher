import express from 'express';
import {
  handleSearchProductByNameAndUrl,
  handleSearchProducts,
} from '@/handlers/searchHandlers';

const router = express.Router();

router.get('/', handleSearchProducts);
router.post('/name', handleSearchProductByNameAndUrl);

export default router;
