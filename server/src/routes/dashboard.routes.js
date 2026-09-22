import { Router } from 'express';
import * as controller from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, authorize('OWNER'));
router.get('/summary', controller.summary);
router.get('/sales', controller.sales);
router.get('/orders', controller.orders);

export default router;
