import { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { environment } from '../config/environment';
import HttpStatusCodes from 'http-status-codes';

function constantTimeCompare(providedValue: string, expectedValue: string): boolean {
  const expectedBuffer = Buffer.from(expectedValue);
  const providedBuffer = Buffer.alloc(expectedBuffer.length);

  providedBuffer.write(providedValue);

  try {
    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const providedApiKey = req.header('api-key') || '';
    const expectedApiKey = environment.authApiKey;

    const isValid = constantTimeCompare(providedApiKey, expectedApiKey);

    if (!isValid) {
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
