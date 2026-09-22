import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRules, registerRules } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerRules), controller.register);
router.post('/login', validate(loginRules), controller.login);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

export default router;
