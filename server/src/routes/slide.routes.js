import { Router } from 'express';
import * as controller from '../controllers/slide.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  createSlideRules,
  reorderSlidesRules,
  slideIdRule,
  updateSlideRules,
} from '../validators/slide.validator.js';

const router = Router();

router.get('/', controller.listActive);
router.get('/all', authenticate, authorize('OWNER'), controller.listAll);
router.post(
  '/',
  authenticate,
  authorize('OWNER'),
  uploadSingleImage,
  validate(createSlideRules),
  controller.create,
);
router.patch(
  '/reorder',
  authenticate,
  authorize('OWNER'),
  validate(reorderSlidesRules),
  controller.reorder,
);
router.put(
  '/:id',
  authenticate,
  authorize('OWNER'),
  uploadSingleImage,
  validate(updateSlideRules),
  controller.update,
);
router.delete('/:id', authenticate, authorize('OWNER'), validate(slideIdRule), controller.remove);

export default router;
