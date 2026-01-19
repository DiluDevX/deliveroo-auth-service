import rateLimit from 'express-rate-limit';

export const healthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});
