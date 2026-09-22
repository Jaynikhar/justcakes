import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileRules } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);
router.get('/me', controller.getProfile);
router.put('/me', validate(updateProfileRules), controller.updateMyProfile);
router.put('/me/password', controller.changeMyPassword);
router.get('/me/orders', controller.myOrders);
router.get('/me/orders/:id', controller.myOrder);

export default router;
