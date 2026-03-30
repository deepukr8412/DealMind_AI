// ===========================================
// Register Page
// Premium registration with glassmorphism
// ===========================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiSparkles } from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (!passwordRegex.test(formData.password)) {
      return toast.error('Password must include uppercase, lowercase, number, and symbol');
    }

    try {
      await register(formData);
      toast.success('Account created! 🎉 Complete your profile.');
      navigate('/profile-setup');
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
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <HiSparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            Start your negotiation mastery journey
          </p>
        </div>

        {/* Google Sign Up */}
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
          <span className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>or</span>
          <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-dark-500' : 'bg-gray-200'}`} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>Username</label>
            <div className="relative">
              <HiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <input
                type="text"
                required
                minLength={3}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="deal_master"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>Email</label>
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
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>Password</label>
            <div className="relative">
              <HiLockClosed className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="Aa1@••••"
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
            className="w-full btn-accent text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className={`text-center text-sm mt-6 ${
          theme === 'dark' ? 'text-dark-200' : 'text-gray-500'
        }`}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
