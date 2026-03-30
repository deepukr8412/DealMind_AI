// ===========================================
// Redis-based Rate Limiting Middleware
// Prevents API spam using sliding window counters
// ===========================================
const { getRedisClient } = require('../config/redis');

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.prefix - Redis key prefix
 */
const rateLimiter = ({ windowMs = 60000, max = 30, prefix = 'rl' } = {}) => {
  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      // Use IP + user ID (if authenticated) as key
      const identifier = req.userId ? req.userId.toString() : req.ip;
      const key = `${prefix}:${identifier}`;
      const windowSec = Math.ceil(windowMs / 1000);

      // Increment counter
      const current = await redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      // Set rate limit headers
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        const ttl = await redis.ttl(key);
        res.set('Retry-After', ttl);
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
        });
      }

      next();
    } catch (error) {
      // If Redis fails, don't block the request
      console.error('Rate limiter error:', error.message);
      next();
    }
  };
};

// Pre-configured limiters
const apiLimiter = rateLimiter({ windowMs: 60000, max: 60, prefix: 'rl:api' });
const authLimiter = rateLimiter({ windowMs: 900000, max: 10, prefix: 'rl:auth' }); // 15 min
const gameLimiter = rateLimiter({ windowMs: 60000, max: 20, prefix: 'rl:game' });
const chatLimiter = rateLimiter({ windowMs: 10000, max: 5, prefix: 'rl:chat' }); // 5 messages per 10s

module.exports = { rateLimiter, apiLimiter, authLimiter, gameLimiter, chatLimiter };
