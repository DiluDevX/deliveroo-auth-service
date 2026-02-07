import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await authService.getAll();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.checkEmail(req.body.email);

    if (!response.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ exists: true, user: response.user });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.signup(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  if (accessToken && refreshToken) {
    setAuthCookies(res, accessToken, refreshToken);
  }
  res.status(200).json({ user });
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.adminLogin(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user });
});

export const updateUserPartially = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await authService.updateUserPartially(userId as string, req.body);
  res.status(200).json({ user });
});

export const logOut = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logOut(req.cookies.refreshToken);
  if (result) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }
});

export const refreshToken = async (req: Request, res: Response) => {
  if (req.cookies.refreshToken === undefined) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  const { accessToken, refreshToken } = await authService.refresh(req.cookies.refreshToken);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ message: 'Token refreshed successfully' });
};

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const response = await authService.forgotPassword(req.body.email);
  res.status(200).json(response);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const response = await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json(response);
});

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ valid: false, user: null });
    }

    const result = await authService.validateAccessToken(token);

    if (result.valid) {
      return res.status(200).json({ valid: true, user: result.user });
    } else {
      return res.status(401).json({ valid: false, user: result.user || null });
    }
  } catch (e) {
    next(e);
  }
};
