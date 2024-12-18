import express from 'express';
import productRoutes from './productRoutes';
import searchRoutes from './searchRoutes';
import watchlistRoutes from './watchlistRoutes';
import priceRoutes from './priceRoutes';
import userRoutes from './userRoutes';

const router = express.Router();

router.use('/price', priceRoutes);
router.use('/product', productRoutes);
router.use('/search', searchRoutes);
router.use('/user', userRoutes);
router.use('/watchlist', watchlistRoutes);

export default router;
