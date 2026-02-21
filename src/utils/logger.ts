import pino from 'pino';
import { environment } from '../config/environment';

export const logger = pino({
  level: environment.logging.level,
  transport:
    environment.env === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
  base: {
    service: environment.serviceName,
  },
});

export type Logger = typeof logger;
