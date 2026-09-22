import { body, param } from 'express-validator';
import { ORDER_STATUSES } from '../models/Order.js';

export const createOrderRules = [
  body('items').custom((value) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Your order is empty');
    }
    parsed.forEach((item) => {
      if (!item.productId) throw new Error('Every item needs a product');
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        throw new Error('Quantity must be between 1 and 50');
      }
    });
    return true;
  }),
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter the customer name'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('whatsappNumber')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid WhatsApp number'),
  body('deliveryAddress')
    .trim()
    .isLength({ min: 5, max: 400 })
    .withMessage('Enter the delivery address'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

export const updateStatusRules = [
  param('id').isMongoId().withMessage('That order id is not valid'),
  body('status').isIn(ORDER_STATUSES).withMessage('That status is not allowed'),
  body('note').optional().trim().isLength({ max: 200 }),
];

export const orderIdRule = [param('id').isMongoId().withMessage('That order id is not valid')];
