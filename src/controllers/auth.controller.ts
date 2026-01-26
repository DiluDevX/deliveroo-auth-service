import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.checkEmail(req.body.email);

    if (!response.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(response.user);
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.login(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.refresh(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.forgotPassword(req.body.email);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.resetPassword(
      req.body.email,
      req.body.token,
      req.body.password
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
