import z from 'zod';
import { commonRequestQueryParamsSchema, idRequestPathParamsSchema } from '../schema/common.schema';

export type CommonResponseDTO<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export type HealthCheckResponseBodyDTO = {
  db: 'connected' | 'disconnected' | 'unknown';
  version: string;
  timestamp: Date;
  service: string;
};

// Type exports for use in controllers/services
export type IdRequestPathParamsDTO = z.infer<typeof idRequestPathParamsSchema>;
export type CommonRequestQueryParamsDTO = z.infer<typeof commonRequestQueryParamsSchema>;
