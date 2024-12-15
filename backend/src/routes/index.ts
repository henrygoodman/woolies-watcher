import express from 'express';
import productRoutes from './productRoutes';
import searchRoutes from './searchRoutes';
import watchlistRoutes from './watchlistRoutes';

const router = express.Router();

// Mount individual routes
router.use('/product', productRoutes);
router.use('/search', searchRoutes);
router.use('/watchlist', watchlistRoutes);

export default router;
