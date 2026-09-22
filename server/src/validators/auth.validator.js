import { body } from 'express-validator';

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter your full name'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username needs 3 to 30 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Use letters, numbers, dot, underscore or hyphen only'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 72 })
    .withMessage('Password needs at least 6 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('whatsappNumber')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid WhatsApp number'),
  body('address').trim().isLength({ min: 5, max: 400 }).withMessage('Enter your delivery address'),
];

export const loginRules = [
  body('identifier').trim().notEmpty().withMessage('Enter your username or email'),
  body('password').notEmpty().withMessage('Enter your password'),
];

export const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Enter your full name'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email address'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('whatsappNumber')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Enter a valid WhatsApp number'),
  body('address').optional().trim().isLength({ max: 400 }).withMessage('Address is too long'),
];
