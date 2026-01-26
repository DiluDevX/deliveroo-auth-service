import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.header('auth-api-key');
    if (!apiKey || apiKey !== config.authApiKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return next();
  } catch (e) {
    return next(e);
  }
}
