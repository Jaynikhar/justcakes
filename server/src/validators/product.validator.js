import { body, param } from 'express-validator';

const pricingCheck = body('pricing').custom((value) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Add at least one size and price');
  }
  parsed.forEach((entry) => {
    if (!entry.label || String(entry.label).trim() === '') {
      throw new Error('Every price option needs a size label');
    }
    if (Number.isNaN(Number(entry.price)) || Number(entry.price) < 0) {
      throw new Error('Prices must be numbers');
    }
  });
  return true;
});

export const createProductRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Enter the product name'),
  body('categoryId').isMongoId().withMessage('Choose a category'),
  body('description').optional().trim().isLength({ max: 2000 }),
  pricingCheck,
];

export const updateProductRules = [
  param('id').isMongoId().withMessage('That product id is not valid'),
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('categoryId').optional().isMongoId().withMessage('Choose a category'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('pricing').optional().custom((value) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Add at least one size and price');
    }
    return true;
  }),
];

export const productIdRule = [param('id').isMongoId().withMessage('That product id is not valid')];
