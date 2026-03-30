// ===========================================
// Socket.IO Real-time Handler
// Manages: Live chat, typing indicators,
// real-time game updates
// ===========================================
const jwt = require('jsonwebtoken');
const Game = require('../models/Game');
const { generateAIResponse } = require('../services/aiEngine');
const { cacheMessage, setTyping, updateGameState, clearChatCache, invalidateLeaderboard } = require('../services/redisService');
const { checkAchievements } = require('../utils/achievements');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

function initializeSocket(io) {
  // ===== Authentication Middleware =====
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // ===== Join Game Room =====
    socket.on('join_game', (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`👤 User ${socket.userId} joined game ${gameId}`);
    });

    // ===== Leave Game Room =====
    socket.on('leave_game', (gameId) => {
      socket.leave(`game:${gameId}`);
    });

    // ===== Typing Indicator =====
    socket.on('typing', async ({ gameId, isTyping }) => {
      await setTyping(gameId, socket.userId, isTyping);
      socket.to(`game:${gameId}`).emit('user_typing', { isTyping });
    });

    // ===== Send Message (Real-time) =====
    socket.on('send_message', async ({ gameId, message, offer }) => {
      try {
        // Find game
        const game = await Game.findOne({
          _id: gameId,
          userId: socket.userId,
          status: 'active',
        });

        if (!game) {
          socket.emit('error', { message: 'Game not found or inactive' });
          return;
        }

        // Check max rounds
        if (game.currentRound >= game.maxRounds) {
          game.status = 'expired';
          game.endedAt = new Date();
          await game.save();
          socket.emit('game_over', {
            status: 'expired',
            message: 'Maximum rounds reached!',
          });
          return;
        }

        const userOffer = offer ? parseFloat(offer) : null;

        // Save user message
        const userMsg = {
          role: 'user',
          content: message,
          offer: userOffer,
          timestamp: new Date(),
        };

        game.messages.push(userMsg);
        if (userOffer) game.lastOffer.byUser = userOffer;
        game.currentRound += 1;

        // Emit user message immediately
        io.to(`game:${gameId}`).emit('new_message', userMsg);

        // Cache
        await cacheMessage(gameId, userMsg);

        // Show AI typing
        io.to(`game:${gameId}`).emit('ai_typing', { isTyping: true });

        // Generate AI response
        const aiResponse = await generateAIResponse(game, message, userOffer);

        // Stop AI typing
        io.to(`game:${gameId}`).emit('ai_typing', { isTyping: false });

        // AI message
        const aiMsg = {
          role: 'ai',
          content: aiResponse.text,
          offer: aiResponse.offer,
          timestamp: new Date(),
        };

        game.messages.push(aiMsg);
        if (aiResponse.offer) game.lastOffer.byAI = aiResponse.offer;

        // Check if deal accepted
        if (aiResponse.isAccepting && userOffer && userOffer >= game.pricing.minPrice) {
          game.status = 'won';
          game.pricing.finalPrice = userOffer;
          game.endedAt = new Date();
          game.calculateScore();

          // Update user stats
          const user = await User.findById(socket.userId);
          user.stats.totalGames += 1;
          user.stats.gamesWon += 1;
          if (game.score > user.stats.bestScore) user.stats.bestScore = game.score;
          const totalScore = user.stats.avgScore * (user.stats.totalGames - 1) + game.score;
          user.stats.avgScore = Math.round(totalScore / user.stats.totalGames);
          user.stats.totalSaved += game.pricing.originalPrice - game.pricing.finalPrice;
          const newAchievements = checkAchievements(user, game);
          if (newAchievements.length > 0) user.achievements.push(...newAchievements);
          await user.save();

          // Add to leaderboard
          await Leaderboard.create({
            userId: socket.userId,
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

          await clearChatCache(gameId);
          await invalidateLeaderboard();

          // Emit deal notification
          io.to(`game:${gameId}`).emit('deal_accepted', {
            finalPrice: userOffer,
            score: game.score,
            savings: game.pricing.originalPrice - userOffer,
            newAchievements,
          });
        }

        await game.save();
        await cacheMessage(gameId, aiMsg);
        await updateGameState(gameId, {
          currentRound: game.currentRound,
          lastOffer: game.lastOffer,
          status: game.status,
        });

        // Emit AI response
        io.to(`game:${gameId}`).emit('new_message', aiMsg);

        // Emit game state update
        io.to(`game:${gameId}`).emit('game_state', {
          currentRound: game.currentRound,
          maxRounds: game.maxRounds,
          status: game.status,
          score: game.score,
          lastOffer: game.lastOffer,
        });
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to process message' });
        io.to(`game:${gameId}`).emit('ai_typing', { isTyping: false });
      }
    });

    // ===== Disconnect =====
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });
}

module.exports = initializeSocket;
