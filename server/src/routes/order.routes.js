import { Router } from 'express';
import * as controller from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadPaymentScreenshot } from '../middleware/upload.middleware.js';
import {
  createOrderRules,
  orderIdRule,
  updateStatusRules,
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', uploadPaymentScreenshot, validate(createOrderRules), controller.place);
router.get('/me', controller.listMine);
router.get('/me/:id', validate(orderIdRule), controller.detailMine);
router.get('/:id/payment-screenshot', validate(orderIdRule), controller.paymentScreenshot);

router.get('/', authorize('OWNER'), controller.listAll);
router.get('/:id', authorize('OWNER'), validate(orderIdRule), controller.detailForOwner);
router.patch('/:id/status', authorize('OWNER'), validate(updateStatusRules), controller.updateStatus);
router.patch('/:id/payment', authorize('OWNER'), validate(orderIdRule), controller.updatePaymentStatus);

export default router;
