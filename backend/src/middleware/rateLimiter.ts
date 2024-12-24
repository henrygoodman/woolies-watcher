import rateLimit from 'express-rate-limit';

/**
 * Basic API rate-limiting middleware.
 * Limits each IP to a specific number of requests per minute.
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: {
    error: 'Too many requests, please try again later.',
  },
  headers: true,
});
