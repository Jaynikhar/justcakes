import { Router } from 'express';
import * as controller from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createReviewRules,
  reviewIdRule,
  updateReviewRules,
} from '../validators/review.validator.js';

const router = Router();

router.get('/latest', controller.listLatest);
router.get('/product/:productId', controller.listForProduct);
router.get('/all', authenticate, authorize('OWNER'), controller.listAll);
router.get('/eligibility/:productId', authenticate, controller.eligibility);
router.post('/', authenticate, validate(createReviewRules), controller.create);
router.put('/:id', authenticate, validate(updateReviewRules), controller.update);
router.delete('/:id', authenticate, validate(reviewIdRule), controller.remove);

export default router;
