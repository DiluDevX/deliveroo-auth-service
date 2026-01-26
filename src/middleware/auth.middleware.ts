import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { config } from '../config';
import { logger } from '../utils/logger';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

/**
 * Middleware to authenticate requests using JWT tokens.
 * Extracts and verifies the Bearer token from Authorization header.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    if (config.auth.validationMode === 'remote') {
      // For remote validation, you would call the auth service here
      // This is a placeholder - implement based on your auth service API
      logger.warn('Remote token validation not implemented, falling back to local');
    }

    const decoded = verifyToken<TokenPayload>(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * Middleware to require specific roles.
 * Must be used after authenticate middleware.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token provided.
 * Useful for endpoints that behave differently for authenticated users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken<TokenPayload>(token);
    req.user = decoded;

    next();
  } catch {
    // Token invalid, but that's okay - continue without user
    next();
  }
}
