import { body, param } from 'express-validator';

export const createCategoryRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Enter the category name'),
  body('description').optional().trim().isLength({ max: 400 }),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Order must be a whole number'),
];

export const updateCategoryRules = [
  param('id').isMongoId().withMessage('That category id is not valid'),
  body('name').optional().trim().isLength({ min: 2, max: 60 }),
  body('description').optional().trim().isLength({ max: 400 }),
  body('displayOrder').optional().isInt({ min: 0 }),
];

export const categoryIdRule = [param('id').isMongoId().withMessage('That category id is not valid')];
