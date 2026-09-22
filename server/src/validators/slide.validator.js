import { body, param } from 'express-validator';

export const createSlideRules = [
  body('title').optional().trim().isLength({ max: 120 }),
  body('subtitle').optional().trim().isLength({ max: 200 }),
  body('ctaText').optional().trim().isLength({ max: 40 }),
  body('ctaLink').optional().trim().isLength({ max: 200 }),
  body('displayOrder').optional().isInt({ min: 0 }),
];

export const updateSlideRules = [
  param('id').isMongoId().withMessage('That slide id is not valid'),
  ...createSlideRules,
];

export const reorderSlidesRules = [
  body('order').isArray({ min: 1 }).withMessage('Send the new slide order'),
];

export const slideIdRule = [param('id').isMongoId().withMessage('That slide id is not valid')];
