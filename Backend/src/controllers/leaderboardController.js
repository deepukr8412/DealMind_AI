// ===========================================
// Leaderboard Controller
// Handles leaderboard queries with Redis caching
// ===========================================
const Leaderboard = require('../models/Leaderboard');
const {
  getCachedLeaderboard,
  cacheLeaderboard,
} = require('../services/redisService');

// ===== Get Top 10 Leaderboard =====
exports.getLeaderboard = async (req, res) => {
  try {
    // Try Redis cache first
    const cached = await getCachedLeaderboard();
    if (cached) {
      return res.json({
        success: true,
        leaderboard: cached,
        source: 'cache',
      });
    }

    // Fetch from MongoDB
    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(10)
      .lean();

    // Cache in Redis
    await cacheLeaderboard(leaderboard);

    res.json({
      success: true,
      leaderboard,
      source: 'database',
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
    });
  }
};

// ===== Get User Rankings =====
exports.getUserRankings = async (req, res) => {
  try {
    const userId = req.userId;

    const entries = await Leaderboard.find({ userId })
      .sort({ score: -1 })
      .limit(20)
      .lean();

    // Get user's best rank
    const totalEntries = await Leaderboard.countDocuments();
    const betterScores = entries.length > 0
      ? await Leaderboard.countDocuments({ score: { $gt: entries[0].score } })
      : totalEntries;

    res.json({
      success: true,
      entries,
      bestRank: betterScores + 1,
      totalPlayers: totalEntries,
    });
  } catch (error) {
    console.error('Get User Rankings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rankings',
    });
  }
};
