import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { version } from '../../package.json';
import { prisma } from '../config/database';
import { CommonResponseDTO, HealthCheckResponseBodyDTO } from '../dtos/common.dto';
import HttpStatusCode from 'http-status-codes';

const router = Router();

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

async function checkDatabaseConnection(): Promise<'connected' | 'disconnected'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

router.get(
  '/',
  rateLimiter,
  async (_req: Request, res: Response<CommonResponseDTO<HealthCheckResponseBodyDTO>>) => {
    const db = await checkDatabaseConnection();

    res.json({
      success: true,
      message: 'Health check successful',
      data: {
        db,
        service: 'auth-microservice',
        timestamp: new Date(),
        version,
      },
    });
  }
);

router.all('*', (_req, res: Response<CommonResponseDTO<never>>) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    message: 'Route not found',
    success: false,
  });
});
export const commonRoutes = router;
