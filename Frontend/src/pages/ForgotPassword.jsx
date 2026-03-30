import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const { theme } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-dark-900' : 'bg-gradient-to-br from-primary-50 to-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md relative z-10 ${
          theme === 'dark' ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-8 shadow-2xl`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 mx-auto flex items-center justify-center mb-4 shadow-lg glow-primary">
            <HiEnvelope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Password Reset</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            {isSent ? 'Check your email inbox 😊' : 'Enter your email to reset your password'}
          </p>
        </div>

        {error && (
          <div className="bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {isSent ? (
          <div className="text-center">
            <p className={`p-4 rounded-xl border mb-6 ${
              theme === 'dark' ? 'bg-dark-700 border-dark-600 text-dark-100' : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              Reset password link has been sent to your email 📧.
            </p>
            <Link to="/login" className="w-full btn-primary block text-center py-3 rounded-xl font-medium">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1 block opacity-70">Email Address</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                    theme === 'dark' ? 'bg-dark-700 border-dark-600 focus:border-primary-500' : 'bg-white border-gray-200 focus:border-primary-500'
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-primary-500 hover:underline">Back to Login</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
