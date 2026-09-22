import { Router } from 'express';
import * as controller from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadProductImages } from '../middleware/upload.middleware.js';
import {
  createProductRules,
  productIdRule,
  updateProductRules,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', controller.list);
router.get('/:idOrSlug', controller.detail);

router.post(
  '/',
  authenticate,
  authorize('OWNER'),
  uploadProductImages,
  validate(createProductRules),
  controller.create,
);
router.put(
  '/:id',
  authenticate,
  authorize('OWNER'),
  uploadProductImages,
  validate(updateProductRules),
  controller.update,
);
router.delete('/:id', authenticate, authorize('OWNER'), validate(productIdRule), controller.remove);

export default router;
