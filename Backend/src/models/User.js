// ===========================================
// User Model
// Stores user authentication and profile data
// ===========================================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      // Not required for Google OAuth users
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    // Game statistics
    stats: {
      totalGames: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      gamesLost: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      totalSaved: { type: Number, default: 0 },
    },
    // Achievements
    achievements: [
      {
        name: String,
        description: String,
        icon: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    // Reset password handling
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Don't return password or reset tokens in JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);
