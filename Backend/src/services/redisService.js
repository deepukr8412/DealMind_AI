// ===========================================
// Redis Service
// Handles all Redis operations:
// - Chat caching
// - AI context memory
// - Game state management
// - Leaderboard caching
// - Rate limiting helpers
// ===========================================
const { getRedisClient } = require('../config/redis');

// ===== Chat Caching =====
// Key: chat:{gameId}
const CHAT_EXPIRY = 3600; // 1 hour

async function cacheMessage(gameId, message) {
  try {
    const redis = getRedisClient();
    const key = `chat:${gameId}`;
    await redis.rpush(key, JSON.stringify(message));
    await redis.expire(key, CHAT_EXPIRY);
  } catch (err) {
    console.error('Redis cacheMessage error:', err.message);
  }
}

async function getCachedMessages(gameId) {
  try {
    const redis = getRedisClient();
    const key = `chat:${gameId}`;
    const messages = await redis.lrange(key, 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  } catch (err) {
    console.error('Redis getCachedMessages error:', err.message);
    return [];
  }
}

async function clearChatCache(gameId) {
  try {
    const redis = getRedisClient();
    await redis.del(`chat:${gameId}`);
  } catch (err) {
    console.error('Redis clearChatCache error:', err.message);
  }
}

// ===== AI Context Memory =====
// Key: ai_context:{gameId}
const CONTEXT_EXPIRY = 3600;

async function storeAIContext(gameId, context) {
  try {
    const redis = getRedisClient();
    const key = `ai_context:${gameId}`;
    await redis.set(key, JSON.stringify(context), 'EX', CONTEXT_EXPIRY);
  } catch (err) {
    console.error('Redis storeAIContext error:', err.message);
  }
}

async function getAIContext(gameId) {
  try {
    const redis = getRedisClient();
    const key = `ai_context:${gameId}`;
    const context = await redis.get(key);
    return context ? JSON.parse(context) : null;
  } catch (err) {
    console.error('Redis getAIContext error:', err.message);
    return null;
  }
}

// ===== Game State Management =====
// Key: game_state:{gameId}
const GAME_STATE_EXPIRY = 1800; // 30 minutes

async function setGameState(gameId, state) {
  try {
    const redis = getRedisClient();
    const key = `game_state:${gameId}`;
    await redis.set(key, JSON.stringify(state), 'EX', GAME_STATE_EXPIRY);
  } catch (err) {
    console.error('Redis setGameState error:', err.message);
  }
}

async function getGameState(gameId) {
  try {
    const redis = getRedisClient();
    const key = `game_state:${gameId}`;
    const state = await redis.get(key);
    return state ? JSON.parse(state) : null;
  } catch (err) {
    console.error('Redis getGameState error:', err.message);
    return null;
  }
}

async function updateGameState(gameId, updates) {
  try {
    const redis = getRedisClient();
    const key = `game_state:${gameId}`;
    const current = await getGameState(gameId);
    const updated = { ...current, ...updates };
    await redis.set(key, JSON.stringify(updated), 'EX', GAME_STATE_EXPIRY);
    return updated;
  } catch (err) {
    console.error('Redis updateGameState error:', err.message);
    return null;
  }
}

// ===== Leaderboard Caching =====
// Key: leaderboard:top10
const LEADERBOARD_EXPIRY = 300; // 5 minutes

async function cacheLeaderboard(data) {
  try {
    const redis = getRedisClient();
    await redis.set('leaderboard:top10', JSON.stringify(data), 'EX', LEADERBOARD_EXPIRY);
  } catch (err) {
    console.error('Redis cacheLeaderboard error:', err.message);
  }
}

async function getCachedLeaderboard() {
  try {
    const redis = getRedisClient();
    const data = await redis.get('leaderboard:top10');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis getCachedLeaderboard error:', err.message);
    return null;
  }
}

async function invalidateLeaderboard() {
  try {
    const redis = getRedisClient();
    await redis.del('leaderboard:top10');
  } catch (err) {
    console.error('Redis invalidateLeaderboard error:', err.message);
  }
}

// ===== Typing Indicator =====
async function setTyping(gameId, userId, isTyping) {
  try {
    const redis = getRedisClient();
    const key = `typing:${gameId}:${userId}`;
    if (isTyping) {
      await redis.set(key, '1', 'EX', 5); // auto-expire in 5s
    } else {
      await redis.del(key);
    }
  } catch (err) {
    console.error('Redis setTyping error:', err.message);
  }
}

module.exports = {
  cacheMessage,
  getCachedMessages,
  clearChatCache,
  storeAIContext,
  getAIContext,
  setGameState,
  getGameState,
  updateGameState,
  cacheLeaderboard,
  getCachedLeaderboard,
  invalidateLeaderboard,
  setTyping,
};
