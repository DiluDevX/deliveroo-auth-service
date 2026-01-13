import { Router, RequestHandler } from 'express';
import { connectDatabase } from '../config/database';
import { version } from '../../package.json';
const router = Router();

/**
 * @swagger
 * /api/:
 *   get:
 *     summary: Service health, DB status, and version
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Returns service health, DB status, and version
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: auth-microservice
 *                 db:
 *                   type: string
 *                   example: connected
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/', async (_req, res) => {
  let dbHealth = 'disconnected';
  try {
    await connectDatabase();
    dbHealth = 'connected';
  } catch {
    dbHealth = 'disconnected';
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'auth-microservice',
    db: dbHealth,
    version,
  });
}) as RequestHandler;

export const healthRoutes = router;
