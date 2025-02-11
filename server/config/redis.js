const { Redis } = require('@upstash/redis');
const { logger } = require('./logger');

// Upstash Redis client configuration
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache middleware factory
const cacheMiddleware = (keyPrefix, expirationInSeconds = 3600) => {
  return async (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    try {
      const key = `${keyPrefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original send function
      const originalSend = res.json;

      // Override res.json method to cache the response
      res.json = async function (data) {
        try {
          await redisClient.setex(key, expirationInSeconds, JSON.stringify(data));
        } catch (err) {
          logger.error('Redis cache error:', err);
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Function to invalidate cache by prefix
const invalidateCache = async (prefix) => {
  try {
    const keys = await redisClient.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cache invalidated for prefix: ${prefix}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

// Function to warmup cache with initial data
const warmupCache = async (key, data, expirationInSeconds = 3600) => {
  try {
    await redisClient.setex(key, expirationInSeconds, JSON.stringify(data));
    logger.info(`Cache warmed up for key: ${key}`);
  } catch (error) {
    logger.error('Cache warmup error:', error);
  }
};

module.exports = {
  redisClient,
  cacheMiddleware,
  invalidateCache,
  warmupCache,
};
