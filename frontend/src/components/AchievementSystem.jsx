import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_simulation',
    title: 'First Steps',
    description: 'Run your first simulation',
    icon: '🌱',
    category: 'beginner',
    points: 10,
    check: (data) => data.simulationsRun >= 1,
  },
  {
    id: 'wealth_builder',
    title: 'Wealth Builder',
    description: 'Generate $100,000 in total family wealth',
    icon: '💰',
    category: 'wealth',
    points: 25,
    check: (data) => data.totalWealth >= 100000,
  },
  {
    id: 'millionaire_maker',
    title: 'Millionaire Maker',
    description: 'Create a family member with $1M+ net worth',
    icon: '💎',
    category: 'wealth',
    points: 50,
    check: (data) => data.maxMemberWealth >= 1000000,
  },
  {
    id: 'multi_millionaire',
    title: 'Multi-Millionaire Dynasty',
    description: 'Total family wealth exceeds $5M',
    icon: '👑',
    category: 'wealth',
    points: 100,
    check: (data) => data.totalWealth >= 5000000,
  },
  {
    id: 'four_generations',
    title: 'Four Generations Strong',
    description: 'Simulate 4 complete generations',
    icon: '🌳',
    category: 'legacy',
    points: 30,
    check: (data) => data.maxGeneration >= 4,
  },
  {
    id: 'homeowner_heritage',
    title: 'Homeowner Heritage',
    description: '3+ family members own homes',
    icon: '🏠',
    category: 'legacy',
    points: 40,
    check: (data) => data.homeowners >= 3,
  },
  {
    id: 'thriving_family',
    title: 'Thriving Family',
    description: '5+ members with "thriving" financial health',
    icon: '🌟',
    category: 'health',
    points: 45,
    check: (data) => data.thrivingMembers >= 5,
  },
  {
    id: 'no_distress',
    title: 'Financial Fortress',
    description: 'Complete simulation with 0 distressed members',
    icon: '🛡️',
    category: 'health',
    points: 35,
    check: (data) => data.distressedMembers === 0 && data.simulationsRun >= 1,
  },
  {
    id: 'habit_changer',
    title: 'Habit Changer',
    description: 'Use the habit calculator to find $500+/month savings',
    icon: '☕',
    category: 'tools',
    points: 20,
    check: (data) => data.habitSavings >= 500,
  },
  {
    id: 'scenario_explorer',
    title: 'Scenario Explorer',
    description: 'Try 5 different scenarios',
    icon: '🔬',
    category: 'tools',
    points: 25,
    check: (data) => data.scenariosExplored >= 5,
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Use the timeline to view 50+ years of growth',
    icon: '⏰',
    category: 'tools',
    points: 15,
    check: (data) => data.yearsViewed >= 50,
  },
  {
    id: 'ai_learner',
    title: 'AI Learner',
    description: 'Have 10+ conversations with the AI Coach',
    icon: '🤖',
    category: 'tools',
    points: 20,
    check: (data) => data.aiConversations >= 10,
  },
  {
    id: 'report_generator',
    title: 'Report Generator',
    description: 'Generate your first PDF report',
    icon: '📄',
    category: 'tools',
    points: 15,
    check: (data) => data.reportsGenerated >= 1,
  },
  {
    id: 'early_investor',
    title: 'Early Investor',
    description: 'Start investing before age 25 in simulation',
    icon: '📈',
    category: 'strategy',
    points: 30,
    check: (data) => data.earliestInvestAge <= 25,
  },
  {
    id: 'compound_master',
    title: 'Compound Interest Master',
    description: 'See 10x growth from original investment',
    icon: '🚀',
    category: 'strategy',
    points: 60,
    check: (data) => data.compoundMultiplier >= 10,
  },
  {
    id: 'diversity_champion',
    title: 'Diversity Champion',
    description: 'Have members in all financial health categories',
    icon: '🌈',
    category: 'special',
    points: 25,
    check: (data) => data.hasAllHealthTypes,
  },
];

const CATEGORIES = {
  beginner: { name: 'Getting Started', color: 'from-blue-500 to-cyan-500' },
  wealth: { name: 'Wealth Building', color: 'from-yellow-500 to-amber-500' },
  legacy: { name: 'Legacy Building', color: 'from-green-500 to-emerald-500' },
  health: { name: 'Financial Health', color: 'from-purple-500 to-pink-500' },
  tools: { name: 'Tool Mastery', color: 'from-indigo-500 to-violet-500' },
  strategy: { name: 'Strategy Expert', color: 'from-red-500 to-orange-500' },
  special: { name: 'Special', color: 'from-slate-500 to-slate-600' },
};

// Achievement notification popup
const AchievementPopup = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-1 rounded-2xl shadow-2xl">
        <div className="bg-slate-900 rounded-xl p-6 flex items-center gap-4">
          <motion.div
            className="text-5xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {achievement.icon}
          </motion.div>
          <div>
            <div className="text-yellow-400 text-sm font-semibold uppercase tracking-wide">
              Achievement Unlocked!
            </div>
            <div className="text-white text-xl font-bold">{achievement.title}</div>
            <div className="text-slate-400 text-sm">{achievement.description}</div>
            <div className="text-yellow-400 text-sm font-semibold mt-1">
              +{achievement.points} points
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Single achievement card
const AchievementCard = ({ achievement, unlocked, progress = 0 }) => {
  const category = CATEGORIES[achievement.category];

  return (
    <motion.div
      className={`relative rounded-xl p-4 border transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-yellow-500/50'
          : 'bg-slate-800/30 border-slate-700/30 opacity-60'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Unlocked glow */}
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl" />
      )}

      <div className="relative flex items-start gap-3">
        <div
          className={`text-3xl ${unlocked ? '' : 'grayscale opacity-50'}`}
          style={{ filter: unlocked ? 'none' : 'grayscale(100%)' }}
        >
          {achievement.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${unlocked ? 'text-white' : 'text-slate-400'}`}>
              {achievement.title}
            </h4>
            {unlocked && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-yellow-400"
              >
                ✓
              </motion.span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">{achievement.description}</p>

          {/* Progress bar for locked achievements */}
          {!unlocked && progress > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${category.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">{Math.round(progress)}%</div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${category.color} text-white`}>
              {category.name}
            </span>
            <span className="text-xs text-yellow-400 font-semibold">
              {achievement.points} pts
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Achievement System component
const AchievementSystem = ({ simulation }) => {
  const { unlockedAchievements, addAchievement } = useStore();
  const [newAchievement, setNewAchievement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate current stats from simulation
  const calculateStats = () => {
    if (!simulation?.baseline?.members) {
      return {
        simulationsRun: 0,
        totalWealth: 0,
        maxMemberWealth: 0,
        maxGeneration: 0,
        homeowners: 0,
        thrivingMembers: 0,
        distressedMembers: 0,
        habitSavings: 0,
        scenariosExplored: 0,
        yearsViewed: 0,
        aiConversations: 0,
        reportsGenerated: 0,
        earliestInvestAge: 100,
        compoundMultiplier: 1,
        hasAllHealthTypes: false,
      };
    }

    const members = simulation.baseline.members;
    const healthTypes = new Set(members.map(m => m.financialHealth));

    return {
      simulationsRun: 1,
      totalWealth: members.reduce((sum, m) => sum + m.netWorth, 0),
      maxMemberWealth: Math.max(...members.map(m => m.netWorth)),
      maxGeneration: Math.max(...members.map(m => m.generation)) + 1,
      homeowners: members.filter(m => m.ownsHome).length,
      thrivingMembers: members.filter(m => m.financialHealth === 'thriving').length,
      distressedMembers: members.filter(m => m.financialHealth === 'distressed').length,
      habitSavings: 0,
      scenariosExplored: 1,
      yearsViewed: 0,
      aiConversations: 0,
      reportsGenerated: 0,
      earliestInvestAge: 25,
      compoundMultiplier: 1,
      hasAllHealthTypes: healthTypes.size >= 4,
    };
  };

  // Check for new achievements
  useEffect(() => {
    const stats = calculateStats();

    ACHIEVEMENTS.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.check(stats)) {
        addAchievement(achievement.id);
        setNewAchievement(achievement);
      }
    });
  }, [simulation, unlockedAchievements, addAchievement]);

  // Calculate total points
  const totalPoints = ACHIEVEMENTS
    .filter(a => unlockedAchievements.includes(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  const maxPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(245, 158, 11, 0.3)',
                '0 0 40px rgba(245, 158, 11, 0.5)',
                '0 0 20px rgba(245, 158, 11, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">🏆</span>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Achievements</h3>
            <p className="text-slate-400 text-sm">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
        </div>

        {/* Total points */}
        <div className="text-right">
          <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
          <div className="text-slate-400 text-sm">/ {maxPoints} points</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <motion.button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            selectedCategory === 'all'
              ? 'bg-white text-slate-900'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === key
                ? `bg-gradient-to-r ${cat.color} text-white`
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedAchievements.includes(achievement.id)}
          />
        ))}
      </div>

      {/* Achievement popup */}
      <AnimatePresence>
        {newAchievement && (
          <AchievementPopup
            achievement={newAchievement}
            onClose={() => setNewAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;
