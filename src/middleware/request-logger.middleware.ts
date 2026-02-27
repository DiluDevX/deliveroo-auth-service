import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuid } from 'uuid';

declare module 'express' {
  interface Request {
    requestId?: string;
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = uuid();
  req.requestId = requestId;

  const startTime = Date.now();

  // Log request
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
