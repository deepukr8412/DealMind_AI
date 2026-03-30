// ===========================================
// Redis Connection Configuration
// Uses ioredis for Redis client
// Handles: chat caching, game state, leaderboard,
//          rate limiting, AI context memory
// ===========================================
const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
    });

    redisClient.connect().catch((err) => {
      console.error('❌ Redis Connection Failed:', err.message);
    });
  } catch (error) {
    console.error('❌ Redis Init Error:', error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
