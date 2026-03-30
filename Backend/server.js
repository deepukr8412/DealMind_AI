// ===========================================
// DealMind AI — Main Server
// Express + Socket.IO + MongoDB + Redis
// ===========================================
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Config imports
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const passport = require('passport');
require('./src/config/passport');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');

// Socket handler
const initializeSocket = require('./src/services/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,   // Wait 60s for client
  pingInterval: 25000,  // Check every 25s
  transports: ['websocket', 'polling']
});

// ===== Middleware =====
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 DealMind AI Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ===== Initialize Socket.IO =====
initializeSocket(io);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    connectRedis();

    // Start listening
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║  🚀 DealMind AI Server Started!         ║
║  📡 Port: ${PORT}                          ║
║  🌐 Environment: ${process.env.NODE_ENV || 'development'}        ║
║  ⚡ Socket.IO: Ready                     ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
