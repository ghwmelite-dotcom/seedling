import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import CurrencySelector from './CurrencySelector';
import ExchangeRateDisplay from './ExchangeRateDisplay';

const navItems = [
  { id: 'simulator', label: 'Simulator', icon: '🌱', description: 'Run simulations' },
  { id: 'analytics', label: 'Analytics', icon: '📊', description: 'Wealth insights' },
  { id: 'scenarios', label: 'Scenarios', icon: '📚', description: 'Explore what-ifs' },
  { id: 'achievements', label: 'Achievements', icon: '🏆', description: 'Your progress' },
  { id: 'coach', label: 'AI Coach', icon: '🤖', description: 'Get advice' },
  { id: 'report', label: 'Report', icon: '📄', description: 'Generate PDF' },
  { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Sound & more' },
];

const Navigation = () => {
  const { activePanel, setActivePanel } = useStore();

  return (
    <nav className="glass-card p-4">
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

      <div className="space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePanel === item.id
                ? 'bg-gradient-to-r from-seedling-500/20 to-emerald-500/20 border border-seedling-500/50 text-white'
                : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-60">{item.description}</div>
            </div>
            {activePanel === item.id && (
              <motion.div
                className="w-1.5 h-8 bg-seedling-500 rounded-full"
                layoutId="activeIndicator"
              />
            )}
          </motion.button>
        ))}
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
