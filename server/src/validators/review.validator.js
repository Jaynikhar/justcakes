import { body, param } from 'express-validator';

export const createReviewRules = [
  body('productId').isMongoId().withMessage('That product id is not valid'),
  body('orderId').isMongoId().withMessage('That order id is not valid'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Choose a rating from 1 to 5'),
  body('description')
    .trim()
    .isLength({ min: 4, max: 600 })
    .withMessage('Write between 4 and 600 characters'),
];

export const updateReviewRules = [
  param('id').isMongoId().withMessage('That review id is not valid'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Choose a rating from 1 to 5'),
  body('description').optional().trim().isLength({ min: 4, max: 600 }),
  body('isApproved').optional().isBoolean(),
];

export const reviewIdRule = [param('id').isMongoId().withMessage('That review id is not valid')];
