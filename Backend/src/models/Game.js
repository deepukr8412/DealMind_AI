// ===========================================
// Game Model
// Stores game sessions, negotiation history,
// AI constraints, and results
// ===========================================
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  offer: {
    type: Number,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Product details
    product: {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      category: { type: String, default: 'general' },
    },
    // Pricing (minPrice and targetPrice are hidden from user)
    pricing: {
      originalPrice: { type: Number, required: true },
      minPrice: { type: Number, required: true },
      targetPrice: { type: Number, required: true },
      finalPrice: { type: Number, default: null },
    },
    // AI Configuration (hidden)
    aiConfig: {
      strategyType: {
        type: String,
        enum: ['aggressive', 'friendly', 'emotional', 'logical'],
        default: 'friendly',
      },
      personality: { type: String, default: '' },
      firmness: { type: Number, default: 7, min: 1, max: 10 },
    },
    // Chat history
    messages: [messageSchema],
    // Game state
    status: {
      type: String,
      enum: ['active', 'won', 'lost', 'abandoned', 'expired'],
      default: 'active',
    },
    currentRound: {
      type: Number,
      default: 1,
    },
    maxRounds: {
      type: Number,
      default: 15,
    },
    lastOffer: {
      byUser: { type: Number, default: null },
      byAI: { type: Number, default: null },
    },
    // Scoring
    score: {
      type: Number,
      default: 0,
    },
    // Timer
    timeLimit: {
      type: Number,
      default: 300, // 5 minutes in seconds
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate score before saving
gameSchema.methods.calculateScore = function () {
  if (this.pricing.finalPrice && this.pricing.originalPrice) {
    this.score = Math.round(
      ((this.pricing.originalPrice - this.pricing.finalPrice) / this.pricing.originalPrice) * 100
    );
  }
  return this.score;
};

// Index for fast queries
gameSchema.index({ userId: 1, status: 1 });
gameSchema.index({ score: -1 });

module.exports = mongoose.model('Game', gameSchema);
