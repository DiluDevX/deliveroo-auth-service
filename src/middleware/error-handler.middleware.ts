import { NextFunction, Request, Response } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { environment, EnvironmentEnum } from '../config/environment';
import { Prisma } from '@prisma/client';
import HttpStatusCodes from 'http-status-codes';
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

function handleAppError(err: AppError, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    message: err.message,
    code: err.code,
  };

  if (err instanceof ValidationError) {
    response.errors = err.errors;
  }

  if (environment.env !== EnvironmentEnum.Production) {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
}

function handlePrismaError(err: Error, res: Response): boolean {
  if (err.name !== 'PrismaClientKnownRequestError') {
    return false;
  }

  const prismaError = err as Prisma.PrismaClientKnownRequestError;

  if (prismaError.code === 'P2002') {
    const target = prismaError.meta?.target;
    const field = Array.isArray(target) ? target[0] : target;
    res.status(HttpStatusCodes.CONFLICT).json({
      success: false,
      message: 'A record with this value already exists',
      field: field,
    });
    return true;
  }

  if (prismaError.code === 'P2025') {
    res.status(HttpStatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Record not found',
    });
    return true;
  }

  return false;
}

function handleJwtError(err: Error, res: Response): boolean {
  if (err.name === 'JsonWebTokenError') {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
    return true;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
    return true;
  }

  return false;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof AppError) {
    handleAppError(err, res);
    return;
  }

  if (handlePrismaError(err, res) || handleJwtError(err, res)) {
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: environment.env === EnvironmentEnum.Production ? 'Internal Server Error' : err.message,
  };

  if (environment.env !== EnvironmentEnum.Production) {
    response.stack = err.stack;
  }

  res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(response);
}
