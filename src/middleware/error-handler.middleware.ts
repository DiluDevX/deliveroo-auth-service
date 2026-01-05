import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { isProduction } from '../config';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    if (!isProduction) {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as Prisma.PrismaClientKnownRequestError;

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        code: 'DUPLICATE_ENTRY',
        field: prismaError.meta?.target as string,
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message,
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
