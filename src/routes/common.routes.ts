import { Request, Response, Router } from 'express';
import { version } from '../../package.json';
import { prisma } from '../config/database';
import { CommonResponseDTO, HealthCheckResponseBodyDTO } from '../dtos/common.dto';
import HttpStatusCode from 'http-status-codes';
import { rateLimiterMiddleware } from '../middleware/rate-limiter.middleware';

const router = Router();

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
  rateLimiterMiddleware,
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
