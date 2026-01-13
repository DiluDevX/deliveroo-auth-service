import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { healthRoutes } from './routes/health.routes';
import { setupSwagger } from './swagger';
import { apiKeyMiddleware } from './middleware/api-key.middleware';

import authRoutes from './routes/auth.routes';

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger as RequestHandler);

app.use('/api', healthRoutes);
app.use('/api/auth', apiKeyMiddleware, authRoutes);
// API Documentation
setupSwagger(app);

// Error handling (must be last)
app.use(errorHandler as ErrorRequestHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  await disconnectDatabase();

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API Docs available at http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export { app };
