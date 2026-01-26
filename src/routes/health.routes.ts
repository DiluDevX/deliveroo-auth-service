import { Router} from 'express';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from '../config/database';
import { version } from '../../package.json';

const router = Router();

// Rate limiter: 10 requests per minute
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

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
router.get('/', rateLimiter, async (_req, res) => {
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
})
export const healthRoutes = router;
