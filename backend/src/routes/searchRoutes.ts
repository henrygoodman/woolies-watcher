import express from 'express';
import {
  handleSearchProductByNameAndUrl,
  handleSearchProducts,
} from '@/handlers/searchHandlers';
import { apiRateLimitMiddleware } from '@/middleware/rateLimiter';

const router = express.Router();

router.get('/', apiRateLimitMiddleware, handleSearchProducts);
router.post('/name', handleSearchProductByNameAndUrl);

export default router;
