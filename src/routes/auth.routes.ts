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

const router = Router();

router.post('/check-email', validateBody(checkEmailRequestBodySchema), authController.checkEmail);

router.post('/signup', validateBody(signUpRequestBodySchema), authController.signup);

router.post('/login', validateBody(loginRequestBodySchema), authController.login);

router.post('/logout', validateBody(logoutRequestBodySchema), authController.logout);

router.post('/refresh', validateBody(refreshTokenRequestBodySchema), authController.refreshToken);

router.post(
  '/forgot-password',
  validateBody(forgotPasswordRequestBodySchema),
  authController.forgotPassword
);

router.post(
  '/reset-password/verify',
  validateBody(verifyResetPasswordTokenRequestBodySchema),
  authController.verifyResetPasswordToken
);

router.post(
  '/reset-password/update',
  validateBody(resetPasswordRequestBodySchema),
  authController.resetPassword
);

export default router;
