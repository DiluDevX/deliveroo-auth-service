import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import {
  adminLogInSchema,
  checkEmailSchema,
  forgotPasswordSchema,
  logInSchema,
  resetPasswordSchema,
  signUpSchema,
} from '../schema/auth.schema';

const router = Router();

router.get("/users", authController.getAllUsers);

/**
/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     summary: Check if email exists
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 */
router.post('/check-email', validateBody(checkEmailSchema), authController.checkEmail);

/**
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/signup', validateBody(signUpSchema), authController.signup);

/**
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', validateBody(logInSchema), authController.login);

router.post('/admin-login', validateBody(adminLogInSchema), authController.adminLogin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', authController.logOut);

/**
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token stored in HTTP-only cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example:
 *                 - accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict
 *                 - refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);

/**
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

/**
/**
 * @swagger
 * /auth/me:
 *   post:
 *     summary: Authenticated user info
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Access token cookie
 *     responses:
 *       200:
 *         description: Authenticated user
 *       400:
 *         description: User not Authorized
 */
router.post('/me', authController.me);

export default router;
