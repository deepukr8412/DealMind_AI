// ===========================================
// Game Page
// Product selection + Negotiation chat UI
// ===========================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiArrowPath, HiXMark,
  HiCurrencyDollar, HiClock, HiChartBar,
  HiCheckCircle, HiExclamationTriangle,
  HiSparkles, HiHandRaised, HiMicrophone,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useGameStore from '../store/gameStore';
import useThemeStore from '../store/themeStore';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import useAuthStore from '../store/authStore';
import soundService from '../services/soundService';

export default function GamePage() {
  const {
    currentGame, messages, gameState, products,
    loading, sending, aiTyping,
    startGame, sendMessage, acceptDeal, abandonGame,
    fetchProducts, clearGame, addMessage, setAITyping, updateGameState,
  } = useGameStore();
  const { token } = useAuthStore();
  const { theme } = useThemeStore();

  const [input, setInput] = useState('');
  const [offer, setOffer] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timer, setTimer] = useState(300);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Setup Socket.IO for real-time chat
  useEffect(() => {
    if (!currentGame || !token) return;

    const socket = connectSocket(token);

    socket.emit('join_game', currentGame.id);

    socket.on('ai_typing', ({ isTyping }) => {
      setAITyping(isTyping);
      if (isTyping) soundService.play('TYPING');
    });

    socket.on('deal_accepted', (data) => {
      soundService.play('DEAL_WON');
      toast.success(`🎉 Deal closed! You saved $${data.savings}!`);
      updateGameState({ ...gameState, status: 'won' });
    });

    socket.on('new_message', (msg) => {
      if (msg.role === 'ai') soundService.play('MESSAGE_IN');
    });

    socket.on('game_state', (state) => {
      updateGameState(state);
    });

    socket.on('error', ({ message }) => {
      toast.error(message);
    });

    return () => {
      socket.off('ai_typing');
      socket.off('deal_accepted');
      socket.off('game_state');
      socket.off('error');
    };
  }, [currentGame?.id, token]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  // Timer
  useEffect(() => {
    if (!currentGame || gameState?.status !== 'active') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGame, gameState?.status]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Start game
  const handleStart = async (productName) => {
    try {
      await startGame(productName);
      setTimer(300);
      soundService.play('MESSAGE_OUT');
      toast.success('Game started! 🎮');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const msg = input.trim();
    const offerVal = showOffer && offer ? parseFloat(offer) : null;
    setInput('');
    setOffer('');
    setShowOffer(false);
    soundService.play('MESSAGE_OUT');

    try {
      await sendMessage(currentGame.id, msg, offerVal);
    } catch (err) {
      toast.error(err.message);
    }

    inputRef.current?.focus();
  };

  // Accept deal
  const handleAcceptDeal = async () => {
    const lastAIOffer = gameState?.lastOffer?.byAI;
    if (!lastAIOffer) {
      toast.error('No offer to accept yet');
      return;
    }
    try {
      const result = await acceptDeal(currentGame.id, lastAIOffer);
      soundService.play('DEAL_WON');
      toast.success(`🎉 Deal closed at $${result.result.finalPrice}! Score: ${result.result.score}%`);
    } catch (err) {
      soundService.play('DEAL_LOST');
      toast.error(err.message);
    }
  };

  // Abandon
  const handleAbandon = async () => {
    try {
      await abandonGame(currentGame.id);
      clearGame();
      toast('Game abandoned', { icon: '👋' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ===== PRODUCT SELECTION SCREEN =====
  if (!currentGame) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 lg:p-8 max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Choose Your Challenge</h1>
          <p className={`${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            Select a product to negotiate. Each seller has a hidden strategy — can you crack it?
          </p>
        </div>

        {/* Random Product */}
        <motion.button
          onClick={() => handleStart()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mb-6 p-6 rounded-2xl text-left transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-primary-500/20 to-accent-400/20 border border-primary-500/30 hover:border-primary-500/50'
              : 'bg-gradient-to-r from-primary-100 to-pink-100 border border-primary-200'
          }`}
          disabled={loading}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
              <HiSparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">🎲 Random Challenge</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-dark-200' : 'text-gray-600'}`}>
                Get a random product and AI personality — the ultimate test!
              </p>
            </div>
          </div>
        </motion.button>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleStart(product.name)}
              disabled={loading}
              className={`p-5 rounded-2xl text-left transition-all group ${
                theme === 'dark'
                  ? 'bg-dark-800 border border-dark-600/50 hover:border-primary-500/50'
                  : 'bg-white border border-gray-200 hover:border-primary-300 shadow-sm'
              } disabled:opacity-50`}
            >
              <span className="text-4xl block mb-3">{product.image}</span>
              <h3 className="font-bold text-sm mb-1 group-hover:text-primary-400 transition-colors">
                {product.name}
              </h3>
              <p className={`text-xs mb-3 line-clamp-2 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-500'
              }`}>
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-dark-600 text-dark-200' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.category}
                </span>
                <span className="text-lg font-bold text-primary-400">
                  ${product.originalPrice.toLocaleString()}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ===== GAME SCREEN =====
  const isGameOver = gameState?.status && gameState.status !== 'active';

  return (
    <div className="h-screen flex flex-col">
      {/* Game Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'bg-dark-800 border-dark-600/50' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentGame.product?.image}</span>
          <div>
            <h2 className="font-bold text-sm">{currentGame.product?.name}</h2>
            <p className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
              Listed at ${currentGame.originalPrice?.toLocaleString()} • {currentGame.aiStrategy} seller
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Round Indicator */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
            theme === 'dark' ? 'bg-dark-600' : 'bg-gray-100'
          }`}>
            <HiChartBar className="w-4 h-4" />
            Round {gameState?.currentRound || 1}/{gameState?.maxRounds || 15}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
            timer < 60 ? 'bg-danger-400/20 text-danger-400' : theme === 'dark' ? 'bg-dark-600' : 'bg-gray-100'
          }`}>
            <HiClock className="w-4 h-4" />
            {formatTime(timer)}
          </div>

          {/* Abandon */}
          {!isGameOver && (
            <button
              onClick={handleAbandon}
              className="p-2 rounded-xl text-danger-400 hover:bg-danger-400/10 transition-colors"
              title="Abandon game"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'system' ? (
              // System message
              <div className={`text-center w-full py-4`}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  theme === 'dark' ? 'bg-dark-700 text-dark-200' : 'bg-gray-100 text-gray-600'
                }`}>
                  <HiCheckCircle className="w-4 h-4 text-success-400" />
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className={`max-w-[80%] lg:max-w-[65%]`}>
                {/* Sender label */}
                <p className={`text-[10px] mb-1 ${
                  msg.role === 'user' ? 'text-right' : ''
                } ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
                  {msg.role === 'user' ? 'You' : '🤖 Seller'}
                </p>
                <div
                  className={`px-4 py-3 ${
                    msg.role === 'user'
                      ? 'chat-bubble-user text-white'
                      : `chat-bubble-ai ${
                          theme === 'dark'
                            ? 'bg-dark-700 text-dark-100'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.offer && (
                    <div className={`mt-2 pt-2 border-t ${
                      msg.role === 'user' ? 'border-white/20' : theme === 'dark' ? 'border-dark-500' : 'border-gray-200'
                    }`}>
                      <span className="text-xs font-medium flex items-center gap-1">
                        <HiCurrencyDollar className="w-3 h-3" />
                        Offer: ${msg.offer.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* AI Typing Indicator */}
        <AnimatePresence>
          {aiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className={`px-4 py-3 rounded-2xl ${
                theme === 'dark' ? 'bg-dark-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-dark-300' : 'bg-gray-400'
                  } typing-dot`} />
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-dark-300' : 'bg-gray-400'
                  } typing-dot`} />
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-dark-300' : 'bg-gray-400'
                  } typing-dot`} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Game Over Banner */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-t ${
            theme === 'dark' ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'
          }`}
        >
          <div className="text-center">
            {gameState.status === 'won' ? (
              <>
                <HiCheckCircle className="w-8 h-8 text-success-400 mx-auto mb-2" />
                <p className="font-bold text-success-400">Deal Closed! 🎉</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
                  Score: {gameState.score}%
                </p>
              </>
            ) : (
              <>
                <HiExclamationTriangle className="w-8 h-8 text-warning-400 mx-auto mb-2" />
                <p className="font-bold text-warning-400">Game Over</p>
              </>
            )}
            <button
              onClick={() => clearGame()}
              className="btn-primary text-white px-6 py-2 rounded-xl text-sm mt-3"
            >
              <HiArrowPath className="w-4 h-4 inline mr-1" />
              New Game
            </button>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      {!isGameOver && (
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'bg-dark-800 border-dark-600/50' : 'bg-white border-gray-200'
        }`}>
          {/* Accept Deal Button */}
          {gameState?.lastOffer?.byAI && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleAcceptDeal}
                className="btn-accent text-white px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1"
              >
                <HiHandRaised className="w-4 h-4" />
                Accept ${gameState.lastOffer.byAI.toLocaleString()}
              </button>
              <span className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
                Seller's last offer
              </span>
            </div>
          )}

          {/* Offer Input */}
          <AnimatePresence>
            {showOffer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3"
              >
                <div className="flex items-center gap-2">
                  <HiCurrencyDollar className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
                  }`} />
                  <input
                    type="number"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="Your offer amount"
                    className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none ${
                      theme === 'dark'
                        ? 'bg-dark-700 border border-dark-500 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => { setShowOffer(false); setOffer(''); }}
                    className="text-dark-300"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOffer(!showOffer)}
              className={`p-3 rounded-xl transition-colors ${
                showOffer
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark' ? 'bg-dark-600 text-dark-200 hover:bg-dark-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Make an offer"
            >
              <HiCurrencyDollar className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : 'Type or speak your offer...'}
              className={`flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all ${
                isListening ? 'ring-2 ring-primary-500 bg-primary-500/5' : ''
              } ${
                theme === 'dark'
                  ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-primary-500'
              }`}
              disabled={sending}
            />
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-danger-500 text-white animate-pulse'
                  : theme === 'dark' ? 'bg-dark-600 text-dark-200 hover:bg-dark-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <HiMicrophone className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="btn-primary text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiPaperAirplane className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
