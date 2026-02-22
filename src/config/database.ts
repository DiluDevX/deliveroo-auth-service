import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { environment, EnvironmentEnum } from './environment';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances during hot reload in development
export const prisma = global.prisma || new PrismaClient();

if (environment.env !== EnvironmentEnum.Production) {
  global.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
