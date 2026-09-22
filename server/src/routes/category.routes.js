import { Router } from 'express';
import * as controller from '../controllers/category.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  categoryIdRule,
  createCategoryRules,
  updateCategoryRules,
} from '../validators/category.validator.js';

const router = Router();

router.get('/', optionalAuth, controller.list);
router.post(
  '/',
  authenticate,
  authorize('OWNER'),
  uploadSingleImage,
  validate(createCategoryRules),
  controller.create,
);
router.put(
  '/:id',
  authenticate,
  authorize('OWNER'),
  uploadSingleImage,
  validate(updateCategoryRules),
  controller.update,
);
router.delete('/:id', authenticate, authorize('OWNER'), validate(categoryIdRule), controller.remove);

export default router;
