import dotenv from 'dotenv';
dotenv.config();

interface MailConfig {
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
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

export const environment: Environment = {
  port: Number.parseInt(optionalEnv('PORT', '3000'), 10),
  env: optionalEnv('NODE_ENV', 'development') as EnvironmentEnum,
  databaseUrl: requireEnv('DATABASE_URL'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresInMinutes: Number(optionalEnv('JWT_EXPIRES_IN', '15')),
    refreshExpiresInDays: Number(optionalEnv('JWT_REFRESH_EXPIRES_IN', '7')),
  },
  auth: {
    serviceUrl: optionalEnv('AUTH_SERVICE_URL', 'http://localhost:3001'),
  },
  logging: {
    level: optionalEnv('LOG_LEVEL', 'info'),
  },
  authApiKey: requireEnv('AUTH_API_KEY'),
  mail: {
    smtp: {
      host: requireEnv('MAIL_HOST'),
      port: Number(requireEnv('SMTP_PORT')),
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
    companyName: requireEnv('COMPANY_NAME'),
    companyEmail: requireEnv('COMPANY_EMAIL'),
    logoUrl: requireEnv('LOGO_URL'),
    supportEmail: requireEnv('SUPPORT_EMAIL'),
    appUrl: requireEnv('APP_URL'),
    resendApiKey: requireEnv('RESEND_API_KEY'),
  },
  serviceName: requireEnv('SERVICE_NAME'),
};
