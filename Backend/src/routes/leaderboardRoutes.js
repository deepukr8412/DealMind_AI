// ===========================================
// Leaderboard Routes
// ===========================================
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Get top 10 leaderboard
router.get('/', auth, apiLimiter, leaderboardController.getLeaderboard);

// Get user's own rankings
router.get('/me', auth, leaderboardController.getUserRankings);

module.exports = router;
