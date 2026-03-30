// ===========================================
// Authentication Routes
// ===========================================
const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerValidation, loginValidation, resetPasswordValidation, profileValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Multer config for avatar uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);

// Password Reset Flow
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidation, authController.resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  authController.googleCallback
);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, profileValidation, authController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), authController.uploadAvatar);
router.get('/imagekit-auth', auth, authController.imagekitAuth);

module.exports = router;
