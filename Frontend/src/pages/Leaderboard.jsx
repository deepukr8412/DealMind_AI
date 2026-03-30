// ===========================================
// Leaderboard Page
// Shows top negotiators with rankings
// ===========================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiTrophy, HiUser, HiChartBar } from 'react-icons/hi2';
import api from '../services/api';
import useThemeStore from '../store/themeStore';

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const rankBgs = ['bg-yellow-400/10', 'bg-gray-300/10', 'bg-amber-600/10'];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankings, setMyRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchLeaderboard();
    fetchMyRankings();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRankings = async () => {
    try {
      const res = await api.get('/leaderboard/me');
      setMyRankings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <HiTrophy className="w-8 h-8" />
          Leaderboard
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
          Top negotiators ranked by their best deals
        </p>
      </div>

      {/* My Rank */}
      {myRankings && (
        <div className={`rounded-2xl p-5 mb-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-primary-500/10 to-accent-400/10 border border-primary-500/20'
            : 'bg-gradient-to-r from-primary-50 to-pink-50 border border-primary-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
                Your Best Rank
              </p>
              <p className="text-2xl font-bold">
                #{myRankings.bestRank}{' '}
                <span className={`text-sm font-normal ${
                  theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
                }`}>
                  of {myRankings.totalPlayers}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
                Best Score
              </p>
              <p className="text-2xl font-bold text-primary-400">
                {myRankings.entries[0]?.score || 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className={`rounded-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={`text-sm ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>Loading...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <HiTrophy className={`w-12 h-12 mx-auto mb-3 ${
              theme === 'dark' ? 'text-dark-400' : 'text-gray-300'
            }`} />
            <p className={`${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
              No entries yet. Be the first!
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className={`grid grid-cols-12 gap-3 p-4 text-xs font-medium ${
              theme === 'dark' ? 'text-dark-300 border-b border-dark-600' : 'text-gray-500 border-b border-gray-200'
            }`}>
              <div className="col-span-1">#</div>
              <div className="col-span-3">Player</div>
              <div className="col-span-3">Product</div>
              <div className="col-span-2 text-right">Final Price</div>
              <div className="col-span-1 text-right">Rounds</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            {/* Entries */}
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-12 gap-3 p-4 items-center ${
                  i < 3 ? rankBgs[i] : ''
                } ${theme === 'dark' ? 'border-b border-dark-700' : 'border-b border-gray-100'}`}
              >
                <div className={`col-span-1 font-bold ${i < 3 ? rankColors[i] : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      entry.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{entry.username}</span>
                </div>
                <div className={`col-span-3 text-sm truncate ${
                  theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
                }`}>
                  {entry.productName}
                </div>
                <div className={`col-span-2 text-right text-sm ${
                  theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
                }`}>
                  ${entry.finalPrice?.toLocaleString()}
                </div>
                <div className={`col-span-1 text-right text-sm ${
                  theme === 'dark' ? 'text-dark-300' : 'text-gray-500'
                }`}>
                  {entry.rounds}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-primary-400">{entry.score}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
