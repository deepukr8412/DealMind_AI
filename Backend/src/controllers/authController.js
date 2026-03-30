const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const imagekit = require('../config/imagekit');
const { sendLoginEmail, sendResetPasswordEmail } = require('../services/mailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ===== Register =====
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);
    
    // Async send welcome login email
    sendLoginEmail(user.email, user.username);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please complete your profile.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

// ===== Login =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user has a password (might be Google OAuth only)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please login with Google',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send login email asynchronously
    sendLoginEmail(user.email, user.username);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isProfileComplete: user.isProfileComplete,
        stats: user.stats,
        achievements: user.achievements,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

// ===== Forgot Password =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Minutes
    await user.save();

    // Create reset url
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    console.log(`🔑 Reset Link Generated: ${resetUrl}`);

    // Send email (Async, don't block the UI)
    console.log(`📡 Email Step: Attempting send to: ${user.email}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Warning: EMAIL_USER or EMAIL_PASS missing in Backend .env!');
    }
    
    // We don't await this, so the response is fast
    sendResetPasswordEmail(user.email, resetUrl).catch(err => {
      console.error('❌ Async Email Error:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'If the account exists, a reset link will be sent shortly! 📧',
    });
  } catch (error) {
    console.error('❌ Forgot Password CRITICAL Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset request',
    });
  }
};

// ===== Reset Password =====
exports.resetPassword = async (req, res) => {
  try {
    // Hash token to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

// ===== Google OAuth Callback =====
exports.googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Async send welcome login email
    sendLoginEmail(req.user.email, req.user.username);

    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

// ===== Get Current User =====
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
    });
  }
};

// ===== Update Profile =====
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};

    if (username) {
      // Check if username is taken
      const existing = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
      updates.username = username;
    }

    if (bio !== undefined) updates.bio = bio;
    updates.isProfileComplete = true;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// ===== Upload Avatar =====
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `avatar_${req.userId}_${Date.now()}`,
      folder: '/dealmind/avatars',
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: result.url },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: result.url,
      user,
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
    });
  }
};

// ===== ImageKit Auth Endpoint =====
exports.imagekitAuth = (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ImageKit auth failed',
    });
  }
};
