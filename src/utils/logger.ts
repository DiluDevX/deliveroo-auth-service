import pino from 'pino';
import { config, isDevelopment } from '../config';

export const logger = pino({
  level: config.logging.level,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: process.env.SERVICE_NAME || 'microservice',
  },
});

export type Logger = typeof logger;
