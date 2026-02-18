import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import {
  AuthenticationRequestBodyDTO,
  AuthenticationResponseBodyDTO,
  CheckEmailRequestBodyDTO,
  CheckEmailResponseBodyDTO,
  ForgotPasswordRequestBodyDTO,
  ForgotPasswordResponseBodyDTO,
  LoginRequestBodyDTO,
  LoginResponseBodyDTO,
  LogOutRequestBodyDTO,
  LogOutResponseBodyDTO,
  RefreshTokenRequestBodyDTO,
  refreshTokenResponseBodyDTO,
  ResetPasswordRequestBodyDTO,
  ResetPasswordResponseBodyDTO,
  SignUpRequestBodyDTO,
  SignUpResponseBodyDTO,
} from '../dtos/auth.dto';
import { CommonResponseDTO } from '../dtos/common.dto';
import { NotFoundError } from '../utils/errors';

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

    const foundUser = await authService.checkEmail(req.body.email);

    console.log({
      message: 'found user',
      data: {
        id: foundUser?.user?.id,
      },
    });

    if (!foundUser) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: false,
      message: 'User exists',
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
    const response = await authService.signup(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<unknown, LoginResponseBodyDTO, LoginRequestBodyDTO>,
  res: Response<CommonResponseDTO<LoginResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const response = await authService.login(req.body);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logOut = async (
  req: Request<unknown, CommonResponseDTO<LogOutResponseBodyDTO>, LogOutRequestBodyDTO>,
  res: Response<CommonResponseDTO<LogOutResponseBodyDTO>>
) => {
  await authService.logOut(req.body.refreshToken);
  res.status(200).json({ message: 'Logged out successfully', success: true });
};

export const refreshToken = async (
  req: Request<unknown, CommonResponseDTO<refreshTokenResponseBodyDTO>, RefreshTokenRequestBodyDTO>,
  res: Response<CommonResponseDTO<refreshTokenResponseBodyDTO>>
) => {
  if (req.body.refreshToken === undefined) {
    return res.status(401).json({ message: 'No refresh token provided', success: false });
  }
  const response = await authService.refresh(req.body.refreshToken);
  if (!response.data?.accessToken || !response.data?.refreshToken) {
    return res.status(401).json({ message: 'Invalid refresh token', success: false });
  }
  res
    .status(200)
    .json({ message: 'Token refreshed successfully', success: true, data: response.data });
};

export const forgotPassword = async (
  req: Request<unknown, ForgotPasswordResponseBodyDTO, ForgotPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<ForgotPasswordResponseBodyDTO>>
) => {
  const response = await authService.forgotPassword(req.body.email);
  res.status(200).json(response);
};

export const resetPassword = async (
  req: Request<unknown, ResetPasswordResponseBodyDTO, ResetPasswordRequestBodyDTO>,
  res: Response<CommonResponseDTO<ResetPasswordResponseBodyDTO>>
) => {
  if (!req.body.token || !req.body.password) {
    return res.status(400).json({ message: 'Token and password are required', success: false });
  }
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: 'Password reset successfully', success: true });
};

export const me = async (
  req: Request<unknown, AuthenticationResponseBodyDTO, AuthenticationRequestBodyDTO>,
  res: Response<CommonResponseDTO<AuthenticationResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const accessToken: string = req.body.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }

    const result = await authService.validateAccessToken(accessToken);

    if (result.success) {
      return res.status(200).json({ message: 'Authorized', success: true, data: result.data });
    } else {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
  } catch (e) {
    next(e);
  }
};
