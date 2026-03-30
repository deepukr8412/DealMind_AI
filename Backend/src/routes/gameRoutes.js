// ===========================================
// Game Routes
// ===========================================
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');
const { gameStartValidation, chatValidation } = require('../middleware/validation');
const { gameLimiter, chatLimiter } = require('../middleware/rateLimiter');

// Get available products
router.get('/products', auth, gameController.getProducts);

// Start new game
router.post('/start', auth, gameLimiter, gameStartValidation, gameController.startGame);

// Send message in game
router.post('/:gameId/message', auth, chatLimiter, chatValidation, gameController.sendMessage);

// Accept deal
router.post('/:gameId/accept', auth, gameController.acceptDeal);

// Abandon game
router.post('/:gameId/abandon', auth, gameController.abandonGame);

// Get game history
router.get('/history', auth, gameController.getGameHistory);

// Get specific game
router.get('/:gameId', auth, gameController.getGame);

module.exports = router;
