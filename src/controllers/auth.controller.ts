import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as authService from '../services/auth.service';
import * as refreshTokenDatabaseService from '../services/refresh-token.database.service';
import * as resetPasswordTokenDatabaseService from '../services/reset-password-token.database.service';
import * as usersDatabaseService from '../services/users.database.service';
import * as emailService from '../services/email.service';
import {
  CheckEmailRequestBodyDTO,
  CheckEmailResponseBodyDTO,
  ForgotPasswordRequestBodyDTO,
  LoginRequestBodyDTO,
  LoginResponseBodyDTO,
  LogoutRequestBodyDTO,
  RefreshTokenRequestBodyDTO,
  RefreshTokenResponseBodyDTO,
  ResetPasswordRequestBodyDTO,
  SignUpRequestBodyDTO,
  SignUpResponseBodyDTO,
  VerifyResetPasswordTokenRequestBodyDTO,
} from '../dtos/auth.dto';
import { CommonResponseDTO } from '../dtos/common.dto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { comparePasswords } from '../utils/password';
import HttpStatusCodes from 'http-status-codes';

export const checkEmail = async (
  req: Request<unknown, CheckEmailResponseBodyDTO, CheckEmailRequestBodyDTO>,
  res: Response<CommonResponseDTO<CheckEmailResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    logger.info('Checking email');

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    logger.info({ userId: foundUser?.id }, 'User found');

    if (!foundUser || foundUser.deletedAt) {
      throw new NotFoundError('User not found');
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'User exists',
      data: {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to check email'
    );
    next(error);
  }
};

export const signup = async (
  req: Request<unknown, SignUpResponseBodyDTO, SignUpRequestBodyDTO>,
  res: Response<CommonResponseDTO<SignUpResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const existingUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictError('Email is already in use');
    }
    logger.info({ role: 'user' }, 'Creating new user account');

    const createdUser = await usersDatabaseService.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      password: req.body.password,
    });

    logger.info({ userId: createdUser.id }, 'User account created successfully');

    res.status(HttpStatusCodes.CREATED).json({
      message: 'User created',
      success: true,
      data: {
        id: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to create user account'
    );
    next(error);
  }
};

export const login = async (
  req: Request<unknown, LoginResponseBodyDTO, LoginRequestBodyDTO>,
  res: Response<CommonResponseDTO<LoginResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    logger.info('Login attempt');

    const foundUser = await usersDatabaseService.findOneWithPassword({
      email: req.body.email,
    });

    logger.info({ userId: foundUser?.id }, 'User found');

    if (!foundUser || foundUser.deletedAt) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(req.body.password, foundUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await authService.generateNewTokens({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    });

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Login failed'
    );
    next(error);
  }
};

export const logout = async (
  req: Request<unknown, CommonResponseDTO<never>, LogoutRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    logger.info('Logging out');

    await refreshTokenDatabaseService.invalidateRefreshTokens(req.body.refreshToken);

    res.status(HttpStatusCodes.OK).json({
      message: 'Logged out successfully',
      success: true,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Logout failed'
    );
    next(error);
  }
};

export const refreshToken = async (
  req: Request<unknown, CommonResponseDTO<RefreshTokenResponseBodyDTO>, RefreshTokenRequestBodyDTO>,
  res: Response<CommonResponseDTO<RefreshTokenResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    logger.info('Refreshing token');
    const [foundUser, foundRefreshToken] = await authService.verifyRefreshToken(
      req.body.refreshToken
    );

    logger.info(
      { userId: foundUser.id, refreshTokenId: foundRefreshToken.id },
      'User and refresh token verified'
    );

    await refreshTokenDatabaseService.invalidateRefreshTokens(req.body.refreshToken);

    logger.info('Token invalidated');

    const { accessToken, refreshToken } = await authService.generateNewTokens({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    });

    logger.info({ userId: foundUser.id }, 'New tokens generated');

    res.status(HttpStatusCodes.OK).json({
      message: 'Token refreshed successfully',
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Token refresh failed'
    );
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<unknown, CommonResponseDTO<never>, ForgotPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    logger.info('Forgot password request');

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    logger.info({ userId: foundUser?.id }, 'User found');

    if (!foundUser || foundUser.deletedAt) {
      res.status(HttpStatusCodes.OK).json({
        message: 'If you have an account with us, we will send you an email',
        success: true,
      });
      return;
    }

    const createdResetPasswordToken =
      await resetPasswordTokenDatabaseService.createResetPasswordToken({
        userId: foundUser.id,
      });

    logger.info('Password reset token created');

    await emailService.sendResetPasswordEmail(req.body.email, createdResetPasswordToken.token);

    res.status(HttpStatusCodes.OK).json({
      message: 'Successfully requested',
      success: true,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Forgot password request failed'
    );
    next(error);
  }
};

export const verifyResetPasswordToken = async (
  req: Request<unknown, CommonResponseDTO<never>, VerifyResetPasswordTokenRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    logger.info('Verifying password reset token');

    await resetPasswordTokenDatabaseService.verifyResetPasswordToken(req.body.token);

    logger.info('Password reset token verified');

    res.status(HttpStatusCodes.OK).json({
      message: 'Password reset token is valid.',
      success: true,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Password reset token verification failed'
    );
    next(error);
  }
};

export const resetPassword = async (
  req: Request<unknown, never, ResetPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    logger.info('Resetting password');

    const foundResetPasswordToken =
      await resetPasswordTokenDatabaseService.verifyResetPasswordToken(req.body.token);

    logger.info('Reset password token verified');

    await usersDatabaseService.updateUserPartially(foundResetPasswordToken.userId, {
      password: req.body.password,
    });

    logger.info('User password updated');

    await resetPasswordTokenDatabaseService.deleteResetPasswordToken(req.body.token);

    res.status(HttpStatusCodes.OK).json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Password reset failed'
    );
    next(error);
  }
};
