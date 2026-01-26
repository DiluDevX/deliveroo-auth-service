import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
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
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ user });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.refresh(req.cookies.refreshToken);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ message: 'Token refreshed successfully' });
});

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
