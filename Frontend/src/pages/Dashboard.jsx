// ===========================================
// Dashboard Page
// Main hub with stats, quick actions, and overview
// ===========================================
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiTrophy, HiChatBubbleLeftRight, HiFire,
  HiChartBar, HiCurrencyDollar, HiPlay,
  HiStar, HiArrowTrendingUp,
} from 'react-icons/hi2';
import useAuthStore from '../store/authStore';
import useGameStore from '../store/gameStore';
import useThemeStore from '../store/themeStore';
import MarketNews from '../components/MarketNews';

const statCards = [
  { key: 'totalGames', label: 'Total Games', icon: HiChatBubbleLeftRight, color: 'from-blue-500 to-blue-600' },
  { key: 'gamesWon', label: 'Games Won', icon: HiTrophy, color: 'from-emerald-500 to-emerald-600' },
  { key: 'bestScore', label: 'Best Score', icon: HiFire, color: 'from-orange-500 to-red-500', suffix: '%' },
  { key: 'totalSaved', label: 'Total Saved', icon: HiCurrencyDollar, color: 'from-purple-500 to-pink-500', prefix: '$' },
];

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore();
  const { fetchProducts, products } = useGameStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchProducts();
  }, []);

  const stats = user?.stats || {};
  const achievements = user?.achievements || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="p-6 lg:p-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back,{' '}
          <span className="gradient-text">{user?.username || 'Negotiator'}</span>! 👋
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
          Ready to outsmart some sellers today?
        </p>
      </motion.div>

      <MarketNews theme={theme} />

      {/* Quick Start */}
      <motion.div
        variants={itemVariants}
        className={`relative overflow-hidden rounded-2xl p-6 mb-8 ${
          theme === 'dark' ? 'bg-gradient-to-r from-primary-500/20 to-accent-400/20 border border-primary-500/20' : 'bg-gradient-to-r from-primary-100 to-pink-100'
        }`}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">🎯 Start a New Negotiation</h2>
          <p className={`text-sm mb-4 max-w-lg ${theme === 'dark' ? 'text-dark-200' : 'text-gray-600'}`}>
            Pick a product and test your bargaining skills against our AI sellers. 
            Each seller has a unique personality — can you crack them all?
          </p>
          <button
            onClick={() => navigate('/game')}
            className="btn-primary text-white px-6 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          >
            <HiPlay className="w-5 h-5" />
            Start Game
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🤝</div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            variants={itemVariants}
            className={`rounded-2xl p-5 ${
              theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              {stat.prefix || ''}{stats[stat.key]?.toLocaleString() || 0}{stat.suffix || ''}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HiStar className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {achievements.slice(0, 6).map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
              <HiTrophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No achievements yet. Start playing!</p>
            </div>
          )}
        </motion.div>

        {/* Available Products Preview */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HiArrowTrendingUp className="w-5 h-5 text-primary-400" />
            Hot Products
          </h3>
          <div className="space-y-3">
            {products.slice(0, 5).map((p, i) => (
              <div
                key={i}
                onClick={() => navigate('/game')}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  theme === 'dark' ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.image}</span>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
                      {p.category}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary-400">
                  ${p.originalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
