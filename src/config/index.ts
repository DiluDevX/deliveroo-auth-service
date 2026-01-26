import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  auth: {
    serviceUrl: string;
    validationMode: 'local' | 'remote';
  };
  logging: {
    level: string;
  };
  authApiKey: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config: Config = {
  port: Number.parseInt(optionalEnv('PORT', '3000'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  auth: {
    serviceUrl: optionalEnv('AUTH_SERVICE_URL', 'http://localhost:3001'),
    validationMode: optionalEnv('AUTH_VALIDATION_MODE', 'local') as 'local' | 'remote',
  },
  logging: {
    level: optionalEnv('LOG_LEVEL', 'info'),
  },
  authApiKey: requireEnv('AUTH_API_KEY'),
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
