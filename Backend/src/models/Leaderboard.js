// ===========================================
// Leaderboard Model
// Stores top player scores and rankings
// Cached in Redis for performance
// ===========================================
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    productName: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    rounds: {
      type: Number,
      required: true,
    },
    strategyUsed: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by score
leaderboardSchema.index({ score: -1 });
leaderboardSchema.index({ userId: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
