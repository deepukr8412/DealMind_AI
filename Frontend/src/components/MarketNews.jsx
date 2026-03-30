import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLightBulb, HiChartBar } from 'react-icons/hi2';

const NEWS_WIDGETS = [
  "Global chip shortage continues! Electronics sellers are holding firm on prices.",
  "Luxury watch market has cooled down. Now is the best time to haggle for a Rolex!",
  "New PS5 restock expected next week! Sellers might be clearing old inventory.",
  "Private jet fuel prices drop. Aviation sellers showing increased flexibility.",
  "Rare Charizard sale at auction hit $420k — Collectibles market is heating up!",
  "Maldives travel surge! Private island owners are becoming more aggressive.",
  "Sneaker market recession: Resellers are desperate for quick cash.",
];

export default function MarketNews({ theme }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NEWS_WIDGETS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`mt-2 mb-6 p-3 rounded-xl border flex items-center gap-3 overflow-hidden ${
      theme === 'dark' ? 'bg-dark-800/50 border-dark-600/30' : 'bg-primary-50 border-primary-100 shadow-sm'
    }`}>
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-500/10'}`}>
        <HiOutlineLightBulb className="w-5 h-5 text-primary-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary-400">Market Insight</span>
          <div className="w-1 h-1 rounded-full bg-success-500 animate-pulse" />
        </div>
        
        <div className="relative h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xs font-medium truncate ${
                theme === 'dark' ? 'text-dark-100' : 'text-gray-700'
              }`}
            >
              {NEWS_WIDGETS[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
