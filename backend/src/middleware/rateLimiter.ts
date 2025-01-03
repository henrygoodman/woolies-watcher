import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';

const redis = new Redis({
  host: 'redis',
});

const BLOCKLIST_KEY = 'blocklist:permanent';
const COOLDOWN_PREFIX = 'cooldown:';
const STRIKES_PREFIX = 'strikes:';
const STRIKE_LIMIT = 3;
const MAX_API_CALLS_PER_MINUTE = 45;
const COOLDOWN_DURATION_SECONDS = 600;

/**
 * Middleware to check if an IP is permanently blocked or in cooldown.
 */
const blocklistMiddleware: RequestHandler = async (req, res, next) => {
  const ip = req.ip || 'unknown-ip';

  try {
    // Check if IP is permanently blocked
    const isBlocked = await redis.sismember(BLOCKLIST_KEY, ip);
    if (isBlocked) {
      res.status(403).json({
        error: 'Access denied. Your IP has been permanently blocked.',
      });
    }

    // Check if IP is in cooldown
    const cooldownTTL = await redis.ttl(`${COOLDOWN_PREFIX}${ip}`);
    if (cooldownTTL > 0) {
      res.status(429).json({
        error:
          'You are temporarily blocked due to excessive requests. Please try again later.',
      });
    }

    next();
  } catch (error) {
    console.error('Redis error during blocklist or cooldown check:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Rate limiter specifically for routes that call 3rd party API.
 */
const rateLimiterMiddleware = rateLimit({
  store: new RedisStore({
    sendCommand: (command, ...args) =>
      redis.call(command, ...args) as Promise<any>,
  }),
  windowMs: 60 * 1000,
  max: MAX_API_CALLS_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown-ip',
  handler: async (req, res) => {
    const ip = req.ip || 'unknown-ip';

    try {
      const currentStrikes = parseInt(
        (await redis.get(`${STRIKES_PREFIX}${ip}`)) || '0',
        10
      );
      const newStrikes = currentStrikes + 1;

      if (newStrikes >= STRIKE_LIMIT) {
        await redis.sadd(BLOCKLIST_KEY, ip);
        await redis.del(`${STRIKES_PREFIX}${ip}`);
        await redis.del(`${COOLDOWN_PREFIX}${ip}`);
        console.warn(
          `IP ${ip} permanently blocked after exceeding the strike limit.`
        );
        return res.status(403).json({
          error: 'Access denied. Your IP has been permanently blocked.',
        });
      }

      await redis.set(`${STRIKES_PREFIX}${ip}`, newStrikes);

      await redis.set(
        `${COOLDOWN_PREFIX}${ip}`,
        '1',
        'EX',
        COOLDOWN_DURATION_SECONDS
      );

      console.warn(
        `IP ${ip} has ${newStrikes} strikes out of ${STRIKE_LIMIT}.`
      );

      return res
        .status(429)
        .json({ error: 'Too many requests. Please slow down.' });
    } catch (error) {
      console.error('Redis error during strike handling:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
});

/**
 * Combined middleware that runs blocklist and rate limiter together.
 */
export const apiRateLimitMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  // Run blocklist middleware first to handle cooldown and permanent blocks
  await blocklistMiddleware(req, res, (err) => {
    if (res.headersSent) {
      return;
    }
    if (err) {
      return next(err);
    }
    // Run rate limiter if blocklist check passes
    rateLimiterMiddleware(req, res, next);
  });
};
