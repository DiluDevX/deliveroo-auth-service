import dotenv from 'dotenv';
dotenv.config();

interface MailConfig {
  companyName: string;
  companyEmail: string;
  logoUrl: string;
  supportEmail: string;
  appUrl: string;
  resendApiKey: string;
}

export enum EnvironmentEnum {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

interface Environment {
  port: number;
  env: EnvironmentEnum;
  databaseUrl: string;
  jwt: {
    secret: string;
    expiresInMinutes: number;
    refreshExpiresInDays: number;
    resetPasswordExpiresInHours: number;
  };
  auth: {
    serviceUrl: string;
  };
  logging: {
    level: string;
  };
  authApiKey: string;
  serviceName: string;
  mail: MailConfig;
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

const parsePositiveInt = (raw: string, name: string): number => {
  const value = Number(raw);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid ${name} value: ${value}. Must be a positive integer.`);
  }
  return value;
};

const rawEnv = optionalEnv('NODE_ENV', 'development');
const validEnvs = Object.values(EnvironmentEnum);
if (!validEnvs.includes(rawEnv as EnvironmentEnum)) {
  throw new Error(`Invalid NODE_ENV value: ${rawEnv}. Must be one of ${validEnvs.join(', ')}`);
}

export const environment: Environment = {
  port: parsePositiveInt(optionalEnv('PORT', '3000'), 'PORT'),
  env: rawEnv as EnvironmentEnum,
  databaseUrl: requireEnv('DATABASE_URL'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresInMinutes: parsePositiveInt(optionalEnv('JWT_EXPIRES_IN', '15'), 'JWT_EXPIRES_IN'),
    refreshExpiresInDays: parsePositiveInt(
      optionalEnv('JWT_REFRESH_EXPIRES_IN', '7'),
      'JWT_REFRESH_EXPIRES_IN'
    ),
    resetPasswordExpiresInHours: Number(optionalEnv('JWT_RESET_PASSWORD_EXPIRES_IN', '1')),
  },
  auth: {
    serviceUrl: optionalEnv('AUTH_SERVICE_URL', 'http://localhost:3001'),
  },
  logging: {
    level: optionalEnv('LOG_LEVEL', 'info'),
  },
  authApiKey: requireEnv('AUTH_API_KEY'),
  mail: {
    companyName: requireEnv('COMPANY_NAME'),
    companyEmail: requireEnv('COMPANY_EMAIL'),
    logoUrl: requireEnv('LOGO_URL'),
    supportEmail: requireEnv('SUPPORT_EMAIL'),
    appUrl: requireEnv('APP_URL'),
    resendApiKey: requireEnv('RESEND_API_KEY'),
  },
  serviceName: requireEnv('SERVICE_NAME'),
};
