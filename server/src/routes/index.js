import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import reviewRoutes from './review.routes.js';
import slideRoutes from './slide.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { publicStats } from '../controllers/dashboard.controller.js';
import { env } from '../config/env.js';
import { ok } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (req, res) => ok(res, { status: 'up', time: new Date().toISOString() }));

// Public payment display details. Secrets stay on the server.
router.get('/config/payment', (req, res) =>
  ok(res, {
    payment: {
      upiId: env.payment.upiId,
      payeeName: env.payment.payeeName,
    },
  }),
);

router.get('/stats/public', publicStats);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/slides', slideRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
