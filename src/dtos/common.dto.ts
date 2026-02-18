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
