import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { StringValue } from 'ms';
import crypto from 'crypto';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenVersion?: number;
}

export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function verifyToken<T extends JwtPayload>(token: string): T {
  return jwt.verify(token, config.jwt.secret) as T;
}

export function decodeToken<T extends JwtPayload>(token: string): T | null {
  return jwt.decode(token) as T | null;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
