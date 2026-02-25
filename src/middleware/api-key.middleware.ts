import { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';
import { environment } from '../config/environment';
import HttpStatusCodes from 'http-status-codes';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.header('api-key');
    if (apiKey?.length !== environment.authApiKey.length) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    if (!apiKey || !timingSafeEqual(Buffer.from(apiKey), Buffer.from(environment.authApiKey))) {
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
