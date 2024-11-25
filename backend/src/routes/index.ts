import express from 'express';
import productRoutes from './productRoutes';
import searchRoutes from './searchRoutes';

const router = express.Router();

// Mount individual routes
router.use('/product', productRoutes);
router.use('/search', searchRoutes);

export default router;
