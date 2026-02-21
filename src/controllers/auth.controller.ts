import { NextFunction, Request, Response } from 'express';
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
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { comparePasswords, hashPassword } from '../utils/password';
import HttpStatusCodes from 'http-status-codes';

export const checkEmail = async (
  req: Request<unknown, CheckEmailResponseBodyDTO, CheckEmailRequestBodyDTO>,
  res: Response<CommonResponseDTO<CheckEmailResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'checking email',
      data: {
        email: req.body.email,
      },
    });

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    console.log({
      message: 'found user',
      data: {
        id: foundUser?.id,
      },
    });

    if (!foundUser || foundUser.deletedAt) {
      throw new NotFoundError('User not found');
    }

    res.status(HttpStatusCodes.OK).json({
      success: false,
      message: 'User exists',
      data: {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      },
    });
  } catch (error) {
    console.log({
      message: 'check email error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const signup = async (
  req: Request<unknown, SignUpResponseBodyDTO, SignUpRequestBodyDTO>,
  res: Response<CommonResponseDTO<SignUpResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'signup',
      data: {
        email: req.body.email,
      },
    });

    const createdUser = await usersDatabaseService.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      password: req.body.password,
      role: 'user',
    });

    console.log({
      message: 'created user',
      data: {
        id: createdUser.id,
      },
    });

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
        deletedAt: createdUser.deletedAt,
      },
    });
  } catch (error) {
    console.log({
      message: 'signup error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const login = async (
  req: Request<unknown, LoginResponseBodyDTO, LoginRequestBodyDTO>,
  res: Response<CommonResponseDTO<LoginResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'login',
      data: {
        email: req.body.email,
      },
    });

    const foundUser = await usersDatabaseService.findOneWithPassword({
      email: req.body.email,
    });

    console.log({
      message: 'foundUser',
      data: {
        id: foundUser?.id,
      },
    });

    if (!foundUser || foundUser.deletedAt) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await comparePasswords(req.body.password, foundUser.password);

    console.log({
      message: 'isPasswordValid',
      data: {
        isPasswordValid,
      },
    });

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid Password');
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
    console.log({
      message: 'login error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const logout = async (
  req: Request<unknown, CommonResponseDTO<never>, LogoutRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'logout',
    });

    await refreshTokenDatabaseService.invalidateRefreshTokens(req.body.refreshToken);

    res.status(HttpStatusCodes.OK).json({
      message: 'Logged out successfully',
      success: true,
    });
  } catch (error) {
    console.log({
      message: 'logout error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const refreshToken = async (
  req: Request<unknown, CommonResponseDTO<RefreshTokenResponseBodyDTO>, RefreshTokenRequestBodyDTO>,
  res: Response<CommonResponseDTO<RefreshTokenResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'refreshToken',
    });
    const [foundUser, foundRefreshToken] = await authService.verifyRefreshToken(
      req.body.refreshToken
    );

    console.log({
      message: 'foundUser',
      data: {
        id: foundUser.id,
        refreshTokenId: foundRefreshToken.id,
      },
    });

    await refreshTokenDatabaseService.invalidateRefreshTokens(req.body.refreshToken);

    console.log({
      message: 'token invalidated',
    });

    const { accessToken, refreshToken } = await authService.generateNewTokens({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    });

    console.log({
      message: 'new tokens generated',
    });

    res.status(HttpStatusCodes.OK).json({
      message: 'Token refreshed successfully',
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<unknown, CommonResponseDTO<never>, ForgotPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'forgotPassword',
      data: {
        email: req.body.email,
      },
    });

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    console.log({
      message: 'foundUser',
      data: {
        id: foundUser?.id,
      },
    });

    if (!foundUser || foundUser.deletedAt) {
      throw new NotFoundError('User not found');
    }

    const createdResetPasswordToken =
      await resetPasswordTokenDatabaseService.createResetPasswordToken({
        userId: foundUser.id,
      });

    console.log({
      message: 'createdResetPasswordToken',
      data: {
        id: createdResetPasswordToken.id,
        userId: createdResetPasswordToken.userId,
      },
    });

    await emailService.sendResetPasswordEmail(req.body.email, createdResetPasswordToken.token);

    res.status(HttpStatusCodes.OK).json({
      message: 'Successfully requested',
      success: true,
    });
  } catch (error) {
    console.log({
      message: 'forgotPassword error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const verifyResetPasswordToken = async (
  req: Request<unknown, CommonResponseDTO<never>, VerifyResetPasswordTokenRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'verifyResetPasswordToken',
    });

    await resetPasswordTokenDatabaseService.verifyResetPasswordToken(req.body.token);

    console.log({
      message: 'password reset token verified',
    });

    res.status(HttpStatusCodes.OK).json({
      message: 'Password reset token is valid.',
      success: true,
    });
  } catch (error) {
    console.log({
      message: 'verifyResetPasswordToken error',
      data: {
        error,
      },
    });
    next(error);
  }
};

export const resetPassword = async (
  req: Request<unknown, never, ResetPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<never>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'resetPassword',
    });

    const foundResetPasswordToken =
      await resetPasswordTokenDatabaseService.verifyResetPasswordToken(req.body.token);

    console.log({
      message: 'foundResetPasswordToken',
      data: {
        id: foundResetPasswordToken.id,
        userId: foundResetPasswordToken.userId,
      },
    });

    const hashedPassword = await hashPassword(req.body.password);

    await usersDatabaseService.updateUserPartially(foundResetPasswordToken.userId, {
      password: hashedPassword,
    });

    console.log({
      message: 'updated user',
      data: {
        id: foundResetPasswordToken.userId,
      },
    });

    await resetPasswordTokenDatabaseService.deleteResetPasswordToken(req.body.token);

    res.status(HttpStatusCodes.OK).json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (error) {
    console.log({
      message: 'resetPassword error',
      data: {
        error,
      },
    });
    next(error);
  }
};
