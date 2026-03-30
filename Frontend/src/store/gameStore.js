// ===========================================
// Game Store (Zustand)
// Manages game state, messages, and game flow
// ===========================================
import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
  // Current game
  currentGame: null,
  messages: [],
  gameState: null,
  products: [],
  
  // History
  gameHistory: [],
  historyPagination: null,

  // UI state
  loading: false,
  sending: false,
  aiTyping: false,
  error: null,

  // Fetch available products
  fetchProducts: async () => {
    try {
      const res = await api.get('/game/products');
      set({ products: res.data.products });
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  },

  // Start a new game
  startGame: async (productName) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/game/start', { productName });
      const game = res.data.game;
      set({
        currentGame: game,
        messages: game.messages || [],
        gameState: {
          currentRound: game.currentRound,
          maxRounds: game.maxRounds,
          status: game.status,
          lastOffer: { byUser: null, byAI: null },
        },
        loading: false,
      });
      return game;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start game';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Send message (HTTP fallback)
  sendMessage: async (gameId, message, offer) => {
    set({ sending: true, aiTyping: true });
    try {
      // Add user message to UI immediately
      const userMsg = {
        role: 'user',
        content: message,
        offer: offer || null,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, userMsg],
      }));

      const res = await api.post(`/game/${gameId}/message`, { message, offer });

      // Add AI response
      set((state) => ({
        messages: [...state.messages, res.data.aiMessage],
        gameState: res.data.gameState,
        sending: false,
        aiTyping: false,
      }));

      return res.data;
    } catch (err) {
      set({ sending: false, aiTyping: false });
      throw new Error(err.response?.data?.message || 'Failed to send message');
    }
  },

  // Accept deal
  acceptDeal: async (gameId, price) => {
    try {
      const res = await api.post(`/game/${gameId}/accept`, { price });
      const { result } = res.data;
      
      set((state) => ({
        gameState: { 
          ...state.gameState, 
          status: 'won',
          score: result.score,
          finalPrice: result.finalPrice
        },
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to accept deal');
    }
  },

  // Abandon game
  abandonGame: async (gameId) => {
    try {
      await api.post(`/game/${gameId}/abandon`);
      set((state) => ({
        gameState: { ...state.gameState, status: 'abandoned' },
      }));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to abandon game');
    }
  },

  // Fetch game by ID
  fetchGame: async (gameId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/game/${gameId}`);
      const game = res.data.game;
      set({
        currentGame: game,
        messages: game.messages || [],
        gameState: {
          currentRound: game.currentRound,
          maxRounds: game.maxRounds,
          status: game.status,
          score: game.score,
          lastOffer: game.lastOffer,
        },
        loading: false,
      });
      return game;
    } catch (err) {
      set({ loading: false });
      throw new Error(err.response?.data?.message || 'Failed to fetch game');
    }
  },

  // Fetch game history
  fetchHistory: async (page = 1) => {
    try {
      const res = await api.get(`/game/history?page=${page}&limit=10`);
      set({
        gameHistory: res.data.games,
        historyPagination: res.data.pagination,
      });
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  },

  // Add message (from socket)
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Set AI typing
  setAITyping: (isTyping) => set({ aiTyping: isTyping }),

  // Update game state
  updateGameState: (state) => set({ gameState: state }),

  // Clear current game
  clearGame: () =>
    set({
      currentGame: null,
      messages: [],
      gameState: null,
      error: null,
    }),
}));

export default useGameStore;
