// ===========================================
// Game Controller
// Handles: Game creation, chat, deal finalization,
// game history, product listing
// ===========================================
const Game = require('../models/Game');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { generateAIResponse, generateOpeningMessage, isAcceptingDeal } = require('../services/aiEngine');
const {
  cacheMessage,
  getCachedMessages,
  clearChatCache,
  setGameState,
  getGameState,
  updateGameState,
  invalidateLeaderboard,
  storeAIContext,
  getAIContext,
} = require('../services/redisService');
const { getRandomProduct, getProductByName, getAllProducts, getRandomStrategy } = require('../utils/products');
const { checkAchievements } = require('../utils/achievements');

// ===== Get Available Products =====
exports.getProducts = (req, res) => {
  const products = getAllProducts();
  res.json({ success: true, products });
};

// ===== Start New Game =====
exports.startGame = async (req, res) => {
  try {
    const { productName } = req.body;

    // Get product (random or specified)
    let product;
    if (productName) {
      product = getProductByName(productName);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found',
        });
      }
    } else {
      product = getRandomProduct();
    }

    // Random AI strategy
    const strategyType = getRandomStrategy();

    // Create game in MongoDB
    const game = await Game.create({
      userId: req.userId,
      product: {
        name: product.name,
        description: product.description,
        image: product.image,
        category: product.category,
      },
      pricing: {
        originalPrice: product.originalPrice,
        minPrice: product.minPrice,
        targetPrice: product.targetPrice,
      },
      aiConfig: {
        strategyType,
        firmness: Math.floor(Math.random() * 4) + 6, // 6-9
      },
    });

    // Generate AI opening message
    const openingMessage = await generateOpeningMessage(game);

    // Save opening message
    game.messages.push({
      role: 'ai',
      content: openingMessage,
    });
    await game.save();

    // Cache in Redis
    await setGameState(game._id.toString(), {
      currentRound: 1,
      lastOffer: { byUser: null, byAI: null },
      status: 'active',
    });

    await cacheMessage(game._id.toString(), {
      role: 'ai',
      content: openingMessage,
      timestamp: new Date(),
    });

    // Store AI context
    await storeAIContext(game._id.toString(), {
      strategyType,
      roundsSinceLastDiscount: 0,
      userTactics: [],
    });

    res.status(201).json({
      success: true,
      game: {
        id: game._id,
        product: game.product,
        originalPrice: game.pricing.originalPrice,
        status: game.status,
        currentRound: game.currentRound,
        maxRounds: game.maxRounds,
        timeLimit: game.timeLimit,
        aiStrategy: strategyType, // Show the seller personality type
        messages: [
          {
            role: 'ai',
            content: openingMessage,
            timestamp: new Date(),
          },
        ],
      },
    });
  } catch (error) {
    console.error('Start Game Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start game',
    });
  }
};

// ===== Send Chat Message =====
exports.sendMessage = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { message, offer } = req.body;

    // Find game
    const game = await Game.findOne({
      _id: gameId,
      userId: req.userId,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Game is no longer active',
      });
    }

    // Check max rounds
    if (game.currentRound >= game.maxRounds) {
      game.status = 'expired';
      game.endedAt = new Date();
      await game.save();

      return res.status(400).json({
        success: false,
        message: 'Maximum rounds reached. Game over!',
        gameStatus: 'expired',
      });
    }

    // Parse user offer
    const userOffer = offer ? parseFloat(offer) : null;

    // Save user message
    game.messages.push({
      role: 'user',
      content: message,
      offer: userOffer,
    });

    // Update game state
    if (userOffer) {
      game.lastOffer.byUser = userOffer;
    }
    game.currentRound += 1;

    // Cache user message in Redis
    await cacheMessage(gameId, {
      role: 'user',
      content: message,
      offer: userOffer,
      timestamp: new Date(),
    });

    // Update Redis game state
    await updateGameState(gameId, {
      currentRound: game.currentRound,
      lastOffer: game.lastOffer,
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(game, message, userOffer);

    // Save AI response
    game.messages.push({
      role: 'ai',
      content: aiResponse.text,
      offer: aiResponse.offer,
    });

    if (aiResponse.offer) {
      game.lastOffer.byAI = aiResponse.offer;
    }

    // Check if AI accepted the deal
    if (aiResponse.isAccepting && userOffer && userOffer >= game.pricing.minPrice) {
      game.status = 'won';
      game.pricing.finalPrice = userOffer;
      game.endedAt = new Date();
      game.calculateScore();

      // Update user stats
      await updateUserStats(req.userId, game);

      // Add to leaderboard
      await addToLeaderboard(req.userId, game);

      // Clear Redis cache
      await clearChatCache(gameId);
      await invalidateLeaderboard();
    }

    await game.save();

    // Cache AI message
    await cacheMessage(gameId, {
      role: 'ai',
      content: aiResponse.text,
      offer: aiResponse.offer,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      aiMessage: {
        role: 'ai',
        content: aiResponse.text,
        offer: aiResponse.offer,
        timestamp: new Date(),
      },
      gameState: {
        currentRound: game.currentRound,
        maxRounds: game.maxRounds,
        status: game.status,
        score: game.score,
        lastOffer: game.lastOffer,
      },
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
    });
  }
};

// ===== Accept Deal =====
exports.acceptDeal = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { price } = req.body;

    const game = await Game.findOne({
      _id: gameId,
      userId: req.userId,
      status: 'active',
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Active game not found',
      });
    }

    const finalPrice = parseFloat(price) || game.lastOffer.byAI;

    if (!finalPrice) {
      return res.status(400).json({
        success: false,
        message: 'No price specified for the deal',
      });
    }

    // Verify the price is at or above minimum
    if (finalPrice < game.pricing.minPrice) {
      return res.status(400).json({
        success: false,
        message: 'This price cannot be accepted',
      });
    }

    // Finalize game
    game.status = 'won';
    game.pricing.finalPrice = finalPrice;
    game.endedAt = new Date();
    game.calculateScore();

    game.messages.push({
      role: 'system',
      content: `Deal closed at $${finalPrice}! You saved ${game.score}%!`,
    });

    await game.save();

    // Update user stats
    await updateUserStats(req.userId, game);

    // Add to leaderboard
    await addToLeaderboard(req.userId, game);

    // Clear caches
    await clearChatCache(gameId);
    await invalidateLeaderboard();

    res.json({
      success: true,
      message: 'Deal accepted!',
      result: {
        productName: game.product.name,
        originalPrice: game.pricing.originalPrice,
        finalPrice,
        score: game.score,
        rounds: game.currentRound,
        savings: game.pricing.originalPrice - finalPrice,
      },
    });
  } catch (error) {
    console.error('Accept Deal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept deal',
    });
  }
};

// ===== Abandon Game =====
exports.abandonGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOneAndUpdate(
      { _id: gameId, userId: req.userId, status: 'active' },
      {
        status: 'abandoned',
        endedAt: new Date(),
      },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Active game not found',
      });
    }

    // Update stats
    const user = await User.findById(req.userId);
    user.stats.totalGames += 1;
    user.stats.gamesLost += 1;
    await user.save();

    // Clear cache
    await clearChatCache(gameId);

    res.json({
      success: true,
      message: 'Game abandoned',
    });
  } catch (error) {
    console.error('Abandon Game Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to abandon game',
    });
  }
};

// ===== Get Game History =====
exports.getGameHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const games = await Game.find({ userId: req.userId })
      .select('-messages -aiConfig')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Game.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game history',
    });
  }
};

// ===== Get Single Game =====
exports.getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ _id: gameId, userId: req.userId });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    // Try to get messages from Redis first
    let messages = await getCachedMessages(gameId);
    if (!messages || messages.length === 0) {
      messages = game.messages;
    }

    res.json({
      success: true,
      game: {
        id: game._id,
        product: game.product,
        originalPrice: game.pricing.originalPrice,
        finalPrice: game.pricing.finalPrice,
        status: game.status,
        currentRound: game.currentRound,
        maxRounds: game.maxRounds,
        score: game.score,
        aiStrategy: game.aiConfig.strategyType,
        lastOffer: game.lastOffer,
        messages,
        timeLimit: game.timeLimit,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
      },
    });
  } catch (error) {
    console.error('Get Game Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game',
    });
  }
};

// ===== Helper: Update User Stats =====
async function updateUserStats(userId, game) {
  try {
    const user = await User.findById(userId);
    user.stats.totalGames += 1;
    user.stats.gamesWon += 1;

    if (game.score > user.stats.bestScore) {
      user.stats.bestScore = game.score;
    }

    const totalScore =
      user.stats.avgScore * (user.stats.totalGames - 1) + game.score;
    user.stats.avgScore = Math.round(totalScore / user.stats.totalGames);
    user.stats.totalSaved += game.pricing.originalPrice - game.pricing.finalPrice;

    // Check achievements
    const newAchievements = checkAchievements(user, game);
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
    }

    await user.save();
    return newAchievements;
  } catch (error) {
    console.error('Update Stats Error:', error);
  }
}

// ===== Helper: Add to Leaderboard =====
async function addToLeaderboard(userId, game) {
  try {
    const user = await User.findById(userId);

    await Leaderboard.create({
      userId,
      gameId: game._id,
      username: user.username,
      avatar: user.avatar,
      productName: game.product.name,
      originalPrice: game.pricing.originalPrice,
      finalPrice: game.pricing.finalPrice,
      score: game.score,
      rounds: game.currentRound,
      strategyUsed: game.aiConfig.strategyType,
    });
  } catch (error) {
    console.error('Add to Leaderboard Error:', error);
  }
}
