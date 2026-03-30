// ===========================================
// Google OAuth Strategy Configuration
// Uses Passport.js with Google OAuth 2.0
// ===========================================
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true, // Crucial for Render/Vercel
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.avatar) {
            user.avatar = profile.photos[0]?.value || '';
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString(36),
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value || '',
          isProfileComplete: false,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
