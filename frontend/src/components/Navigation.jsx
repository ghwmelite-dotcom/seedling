import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import CurrencySelector from './CurrencySelector';
import ExchangeRateDisplay from './ExchangeRateDisplay';

// Categorized navigation structure
const navCategories = [
  {
    category: 'Core',
    description: 'Essential tools',
    items: [
      { id: 'simulator', label: 'Simulator', icon: '🌱', description: 'Run simulations' },
      { id: 'scenarios', label: 'Scenarios', icon: '📚', description: 'Explore what-ifs' },
      { id: 'analytics', label: 'Analytics', icon: '📊', description: 'Wealth insights' },
    ],
  },
  {
    category: 'AI Powered',
    description: 'Smart features',
    items: [
      { id: 'coach', label: 'AI Coach', icon: '🤖', description: 'Get advice' },
      { id: 'oracle', label: 'Life Oracle', icon: '🔮', description: 'Predict expenses' },
      { id: 'chronicles', label: 'Chronicles', icon: '📖', description: 'AI family stories' },
    ],
  },
  {
    category: 'Experience',
    description: 'Immersive features',
    items: [
      { id: 'garden', label: 'AR Garden', icon: '🌳', description: '3D wealth tree' },
      { id: 'soundscapes', label: 'Soundscapes', icon: '🎵', description: 'Wealth music' },
      { id: 'voice', label: 'Voice Control', icon: '🎙️', description: 'Speak commands' },
    ],
  },
  {
    category: 'Family & Legacy',
    description: 'Generational wealth',
    items: [
      { id: 'collaborate', label: 'Collaborate', icon: '👨‍👩‍👧‍👦', description: 'Plan together' },
      { id: 'capsule', label: 'Time Capsule', icon: '💌', description: 'Future messages' },
      { id: 'ancestors', label: 'Ancestors', icon: '👴', description: 'Reverse simulation' },
    ],
  },
  {
    category: 'Connect & Share',
    description: 'Export & integrate',
    items: [
      { id: 'bank', label: 'Bank Sync', icon: '🏦', description: 'Connect accounts' },
      { id: 'report', label: 'PDF Report', icon: '📄', description: 'Generate report' },
      { id: 'nft', label: 'NFT Certs', icon: '🎖️', description: 'Mint achievements' },
    ],
  },
  {
    category: 'You',
    description: 'Progress & preferences',
    items: [
      { id: 'achievements', label: 'Achievements', icon: '🏆', description: 'Your progress' },
      { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Preferences' },
    ],
  },
];

// Category color themes
const categoryColors = {
  'Core': { gradient: 'from-seedling-500/20 to-emerald-500/20', border: 'border-seedling-500/30', text: 'text-seedling-400' },
  'AI Powered': { gradient: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  'Experience': { gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  'Family & Legacy': { gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  'Connect & Share': { gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  'You': { gradient: 'from-slate-500/20 to-slate-400/20', border: 'border-slate-500/30', text: 'text-slate-300' },
};

const Navigation = () => {
  const { activePanel, setActivePanel } = useStore();
  const [collapsedCategories, setCollapsedCategories] = React.useState({});

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Find which category the active panel belongs to
  const getActiveCategoryColor = () => {
    for (const cat of navCategories) {
      if (cat.items.some(item => item.id === activePanel)) {
        return categoryColors[cat.category];
      }
    }
    return categoryColors['Core'];
  };

  return (
    <nav className="glass-card p-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {/* Logo Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-seedling-500 to-emerald-600 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 10px rgba(34, 197, 94, 0.3)',
              '0 0 20px rgba(34, 197, 94, 0.5)',
              '0 0 10px rgba(34, 197, 94, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xl">🌱</span>
        </motion.div>
        <div>
          <h1 className="text-xl font-bold text-white">Seedling</h1>
          <p className="text-xs text-slate-400">Wealth Time Machine</p>
        </div>
      </div>

      {/* Categorized Navigation */}
      <div className="space-y-4">
        {navCategories.map((category) => {
          const colors = categoryColors[category.category];
          const isCollapsed = collapsedCategories[category.category];
          const hasActiveItem = category.items.some(item => item.id === activePanel);

          return (
            <div key={category.category} className="space-y-1">
              {/* Category Header */}
              <motion.button
                onClick={() => toggleCategory(category.category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  hasActiveItem ? `bg-gradient-to-r ${colors.gradient} ${colors.border} border` : 'hover:bg-slate-800/50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                    {category.category}
                  </span>
                </div>
                <motion.svg
                  className={`w-4 h-4 ${colors.text}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* Category Items */}
              <motion.div
                initial={false}
                animate={{
                  height: isCollapsed ? 0 : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pl-1">
                  {category.items.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        activePanel === item.id
                          ? `bg-gradient-to-r ${colors.gradient} border ${colors.border} text-white`
                          : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs opacity-60">{item.description}</div>
                      </div>
                      {activePanel === item.id && (
                        <motion.div
                          className={`w-1 h-6 rounded-full ${colors.text.replace('text-', 'bg-')}`}
                          layoutId="activeIndicator"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* View mode toggle */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <ViewModeToggle />
      </div>

      {/* Quick stats */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <QuickStats />
      </div>

      {/* Currency tools */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="px-2 space-y-3">
          <div className="text-slate-400 text-xs">Currency</div>
          <div className="flex items-center gap-2">
            <CurrencySelector compact />
            <ExchangeRateDisplay compact />
          </div>
        </div>
      </div>
    </nav>
  );
};

// View mode toggle (2D/3D)
const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="px-2">
      <div className="text-slate-400 text-xs mb-2">Tree View</div>
      <div className="flex bg-slate-800/50 rounded-xl p-1">
        <motion.button
          onClick={() => setViewMode('2d')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === '2d' ? 'bg-seedling-500 text-white' : 'text-slate-400'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          2D Tree
        </motion.button>
        <motion.button
          onClick={() => setViewMode('3d')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === '3d' ? 'bg-seedling-500 text-white' : 'text-slate-400'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          3D Tree
        </motion.button>
      </div>
    </div>
  );
};

// Quick stats display
const QuickStats = () => {
  const { unlockedAchievements, simulation } = useStore();

  const totalAchievements = 16; // From AchievementSystem
  const members = simulation?.baseline?.members?.length || 0;

  return (
    <div className="px-2 space-y-3">
      <div className="text-slate-400 text-xs">Quick Stats</div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Achievements</span>
        <span className="text-seedling-400 font-semibold">
          {unlockedAchievements.length}/{totalAchievements}
        </span>
      </div>

      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-seedling-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedAchievements.length / totalAchievements) * 100}%` }}
        />
      </div>

      {members > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Family Members</span>
          <span className="text-blue-400 font-semibold">{members}</span>
        </div>
      )}
    </div>
  );
};

export default Navigation;
