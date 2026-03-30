// ===========================================
// Login Page
// Premium login with glassmorphism effects
// ===========================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiSparkles } from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      theme === 'dark' ? 'bg-dark-900' : 'bg-gradient-to-br from-primary-50 to-white'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md relative z-10 ${
          theme === 'dark' ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-8 shadow-2xl`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <HiSparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            Sign in to continue your negotiation journey
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border transition-all mb-6 ${
            theme === 'dark'
              ? 'border-dark-500 hover:bg-dark-600 text-white'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <FcGoogle className="w-5 h-5" />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-dark-500' : 'bg-gray-200'}`} />
          <span className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
            or sign in with email
          </span>
          <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-dark-500' : 'bg-gray-200'}`} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>
              Email
            </label>
            <div className="relative">
              <HiEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-medium ${
                theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
              }`}>
                Password
              </label>
              <Link to="/forgot-password" className="text-[10px] text-primary-400 font-medium hover:text-primary-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <HiLockClosed className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
                }`}
              >
                {showPass ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className={`text-center text-sm mt-6 ${
          theme === 'dark' ? 'text-dark-200' : 'text-gray-500'
        }`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
