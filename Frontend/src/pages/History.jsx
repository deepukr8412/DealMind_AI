// ===========================================
// Game History Page
// Shows past negotiations with pagination
// ===========================================
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiClock, HiCheckCircle, HiXCircle, HiExclamationTriangle } from 'react-icons/hi2';
import useGameStore from '../store/gameStore';
import useThemeStore from '../store/themeStore';

const statusConfig = {
  won: { icon: HiCheckCircle, color: 'text-success-400', label: 'Won' },
  lost: { icon: HiXCircle, color: 'text-danger-400', label: 'Lost' },
  abandoned: { icon: HiExclamationTriangle, color: 'text-warning-400', label: 'Abandoned' },
  expired: { icon: HiClock, color: 'text-dark-300', label: 'Expired' },
  active: { icon: HiClock, color: 'text-primary-400', label: 'Active' },
};

export default function History() {
  const { gameHistory, historyPagination, fetchHistory } = useGameStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <HiClock className="w-8 h-8" />
          Game History
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
          Review your past negotiations and scores
        </p>
      </div>

      {gameHistory.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${
          theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200'
        }`}>
          <HiClock className={`w-12 h-12 mx-auto mb-3 ${
            theme === 'dark' ? 'text-dark-400' : 'text-gray-300'
          }`} />
          <p className={`${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
            No games played yet. Start your first negotiation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {gameHistory.map((game, i) => {
            const status = statusConfig[game.status] || statusConfig.active;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-5 ${
                  theme === 'dark'
                    ? 'bg-dark-800 border border-dark-600/50'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{game.product?.image || '📦'}</span>
                    <div>
                      <h3 className="font-bold">{game.product?.name}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
                        {formatDate(game.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                    {game.score > 0 && (
                      <p className="text-lg font-bold text-primary-400 mt-1">{game.score}%</p>
                    )}
                  </div>
                </div>

                {/* Price details */}
                <div className={`flex items-center gap-6 mt-3 pt-3 border-t text-sm ${
                  theme === 'dark' ? 'border-dark-600 text-dark-200' : 'border-gray-100 text-gray-600'
                }`}>
                  <span>Original: <strong>${game.pricing?.originalPrice?.toLocaleString()}</strong></span>
                  {game.pricing?.finalPrice && (
                    <span>Final: <strong className="text-success-400">${game.pricing.finalPrice.toLocaleString()}</strong></span>
                  )}
                  <span>Rounds: <strong>{game.currentRound}</strong></span>
                </div>
              </motion.div>
            );
          })}

          {/* Pagination */}
          {historyPagination && historyPagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: historyPagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchHistory(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    historyPagination.page === i + 1
                      ? 'btn-primary text-white'
                      : theme === 'dark' ? 'bg-dark-700 text-dark-200 hover:bg-dark-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
