import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { environment } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { commonRoutes } from './routes/common.routes';
import { apiKeyMiddleware } from './middleware/api-key.middleware';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/user.routes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger as RequestHandler);

app.use('/api/auth', apiKeyMiddleware, authRoutes);
app.use('/api/users', apiKeyMiddleware, usersRoutes);
app.use(commonRoutes);

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

    app.listen(environment.port, () => {
      logger.info(`Server running on port ${environment.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export { app };
