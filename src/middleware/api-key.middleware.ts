import { Request, Response } from 'express';
import { config } from '../config';

export function apiKeyMiddleware(req: Request, res: Response) {
  const apiKey = req.header('auth-api-key');
  if (!apiKey || apiKey !== config.authApiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
