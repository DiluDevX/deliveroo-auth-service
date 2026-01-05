import { Router, RequestHandler } from 'express';
import { prisma } from '../config/database';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', ((_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'microservice',
  });
}) as RequestHandler);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check including database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', (async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'failed',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}) as RequestHandler);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', ((_req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}) as RequestHandler);

export { router as healthRoutes };
