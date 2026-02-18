import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { version } from '../../package.json';
import { prisma } from '../config/database';
import { CommonResponseDTO, HealthCheckResponseBodyDTO } from '../dtos/common.dto';
import { HttpStatusCode } from 'axios';

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
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the service health status, database connection status, timestamp, and version information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                   description: Overall service status
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-27T10:30:00.000Z
 *                   description: Current server timestamp in ISO format
 *                 service:
 *                   type: string
 *                   example: auth-microservice
 *                   description: Service name
 *                 db:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                   example: connected
 *                   description: Database connection status
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                   description: Service version from package.json
 *       429:
 *         description: Too many requests - rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many requests from this IP, please try again later.
 */

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
  res.status(HttpStatusCode.NotFound).json({
    message: 'Route not found',
    success: false,
  });
});
export const commonRoutes = router;
