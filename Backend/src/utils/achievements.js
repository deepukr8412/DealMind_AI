// ===========================================
// Achievement Definitions
// Unlockable achievements for the game
// ===========================================

const ACHIEVEMENTS = [
  {
    id: 'first_deal',
    name: 'First Deal',
    description: 'Complete your first negotiation',
    icon: '🏁',
    condition: (stats) => stats.totalGames >= 1,
  },
  {
    id: 'haggler',
    name: 'Haggler',
    description: 'Complete 5 negotiations',
    icon: '🤝',
    condition: (stats) => stats.totalGames >= 5,
  },
  {
    id: 'deal_master',
    name: 'Deal Master',
    description: 'Complete 20 negotiations',
    icon: '👑',
    condition: (stats) => stats.totalGames >= 20,
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Save at least 30% off the original price',
    icon: '💰',
    condition: (stats, game) => game && game.score >= 30,
  },
  {
    id: 'master_negotiator',
    name: 'Master Negotiator',
    description: 'Save at least 50% off the original price',
    icon: '🏆',
    condition: (stats, game) => game && game.score >= 50,
  },
  {
    id: 'speed_dealer',
    name: 'Speed Dealer',
    description: 'Close a deal in under 3 rounds',
    icon: '⚡',
    condition: (stats, game) => game && game.currentRound <= 3 && game.status === 'won',
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Win 5 games in a row',
    icon: '🔥',
    condition: (stats) => stats.gamesWon >= 5,
  },
  {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Negotiate an item worth over $10,000',
    icon: '💎',
    condition: (stats, game) => game && game.pricing.originalPrice >= 10000,
  },
  {
    id: 'smooth_talker',
    name: 'Smooth Talker',
    description: 'Win a game against an aggressive AI',
    icon: '😎',
    condition: (stats, game) =>
      game && game.status === 'won' && game.aiConfig.strategyType === 'aggressive',
  },
];

// Check for newly unlocked achievements
function checkAchievements(user, game = null) {
  const existingIds = user.achievements.map((a) => a.name);
  const newAchievements = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!existingIds.includes(achievement.name)) {
      if (achievement.condition(user.stats, game)) {
        newAchievements.push({
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: new Date(),
        });
      }
    }
  }

  return newAchievements;
}

// Get all achievement definitions (for display)
function getAllAchievements() {
  return ACHIEVEMENTS.map(({ id, name, description, icon }) => ({
    id,
    name,
    description,
    icon,
  }));
}

module.exports = { checkAchievements, getAllAchievements, ACHIEVEMENTS };
