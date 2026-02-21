import { NextFunction, Request, Response } from 'express';
import { environment } from '../config/environment';
import HttpStatusCodes from 'http-status-codes';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.header('api-key');
    if (!apiKey || apiKey !== environment.authApiKey) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    return next();
  } catch (e) {
    return next(e);
  }
}
