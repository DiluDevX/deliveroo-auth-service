import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import {
  checkEmailRequestBodySchema,
  forgotPasswordRequestBodySchema,
  loginRequestBodySchema,
  logoutRequestBodySchema,
  refreshTokenRequestBodySchema,
  verifyResetPasswordTokenRequestBodySchema,
  signUpRequestBodySchema,
  resetPasswordRequestBodySchema,
} from '../schema/auth.schema';
import { rateLimiterMiddleware } from '../middleware/rate-limiter.middleware';

const router = Router();

router.post('/check-email', validateBody(checkEmailRequestBodySchema), authController.checkEmail);

router.post('/signup', validateBody(signUpRequestBodySchema), authController.signup);

router.post('/login', validateBody(loginRequestBodySchema), authController.login);

router.post('/logout', validateBody(logoutRequestBodySchema), authController.logout);

router.post(
  '/refresh',
  rateLimiterMiddleware,
  validateBody(refreshTokenRequestBodySchema),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  validateBody(forgotPasswordRequestBodySchema),
  authController.forgotPassword
);

router.post(
  '/reset-password/verify',
  rateLimiterMiddleware,
  validateBody(verifyResetPasswordTokenRequestBodySchema),
  authController.verifyResetPasswordToken
);

router.post(
  '/reset-password/update',
  rateLimiterMiddleware,
  validateBody(resetPasswordRequestBodySchema),
  authController.resetPassword
);

export default router;
