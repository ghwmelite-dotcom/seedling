import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

// Predefined scenarios
const PRESET_SCENARIOS = [
  {
    id: 'early_bird',
    name: 'Early Bird Investor',
    description: 'Start investing at 22 vs 32 - see the power of starting early',
    icon: '🐦',
    category: 'timing',
    difficulty: 'beginner',
    params: {
      baseline: { startAge: 32, monthlySavings: 500, returnRate: 7 },
      scenario: { startAge: 22, monthlySavings: 500, returnRate: 7 },
    },
    insight: 'Starting 10 years earlier can mean 2-3x more wealth at retirement!',
    tags: ['compound interest', 'early start', 'retirement'],
  },
  {
    id: 'coffee_empire',
    name: 'Coffee Shop to Empire',
    description: 'What if you invested your daily coffee money instead?',
    icon: '☕',
    category: 'habits',
    difficulty: 'beginner',
    params: {
      baseline: { monthlySavings: 200, dailyCoffeeCost: 5 },
      scenario: { monthlySavings: 350, dailyCoffeeCost: 0 },
    },
    insight: '$5/day = $150/month = potentially $170,000 over 30 years!',
    tags: ['latte factor', 'small habits', 'daily choices'],
  },
  {
    id: 'homeowner_advantage',
    name: "Homeowner's Edge",
    description: 'Compare buying a home at 28 vs renting forever',
    icon: '🏠',
    category: 'assets',
    difficulty: 'intermediate',
    params: {
      baseline: { ownsHome: false, monthlyRent: 1500 },
      scenario: { ownsHome: true, homePurchaseAge: 28, homeValue: 350000 },
    },
    insight: 'Homeownership builds equity and can be passed to next generation.',
    tags: ['real estate', 'equity', 'inheritance'],
  },
  {
    id: 'education_multiplier',
    name: 'Education Multiplier',
    description: 'How does a college degree affect generational wealth?',
    icon: '🎓',
    category: 'income',
    difficulty: 'intermediate',
    params: {
      baseline: { education: 'high_school', startingIncome: 35000 },
      scenario: { education: 'bachelors', startingIncome: 55000, studentLoans: 40000 },
    },
    insight: 'Despite student loans, higher education often leads to 40-70% more lifetime earnings.',
    tags: ['education', 'income', 'career'],
  },
  {
    id: 'side_hustle',
    name: 'Side Hustle Success',
    description: 'Add $500/month extra income and invest it all',
    icon: '💼',
    category: 'income',
    difficulty: 'intermediate',
    params: {
      baseline: { monthlyIncome: 5000, monthlySavings: 500 },
      scenario: { monthlyIncome: 5500, monthlySavings: 1000 },
    },
    insight: 'A side hustle that generates $500/month can add $500K+ to your family wealth.',
    tags: ['side hustle', 'extra income', 'entrepreneurship'],
  },
  {
    id: 'frugal_family',
    name: 'Frugal Family Fortune',
    description: '30% savings rate vs 10% - the power of living below your means',
    icon: '🐷',
    category: 'savings',
    difficulty: 'beginner',
    params: {
      baseline: { savingsRate: 10 },
      scenario: { savingsRate: 30 },
    },
    insight: 'Saving 30% instead of 10% can mean retiring 10-15 years earlier!',
    tags: ['frugality', 'savings rate', 'FIRE'],
  },
  {
    id: 'market_timing',
    name: 'Stay the Course',
    description: 'Consistent investing vs trying to time the market',
    icon: '📉',
    category: 'strategy',
    difficulty: 'advanced',
    params: {
      baseline: { investmentStrategy: 'market_timing', avgReturn: 5 },
      scenario: { investmentStrategy: 'buy_and_hold', avgReturn: 7 },
    },
    insight: 'Time IN the market beats timing the market. Consistency wins.',
    tags: ['market timing', 'buy and hold', 'consistency'],
  },
  {
    id: 'generational_knowledge',
    name: 'Financial Literacy Legacy',
    description: 'What if each generation taught the next about money?',
    icon: '📚',
    category: 'legacy',
    difficulty: 'advanced',
    params: {
      baseline: { financialLiteracy: 'low', investStartAge: 35 },
      scenario: { financialLiteracy: 'high', investStartAge: 22 },
    },
    insight: 'Teaching kids about money early can advance family wealth by 1-2 generations.',
    tags: ['education', 'legacy', 'family'],
  },
  {
    id: 'emergency_fund',
    name: 'Emergency Fund Shield',
    description: 'How does having 6 months savings protect your family?',
    icon: '🛡️',
    category: 'safety',
    difficulty: 'beginner',
    params: {
      baseline: { emergencyFund: 0, debtFromEmergencies: 15000 },
      scenario: { emergencyFund: 20000, debtFromEmergencies: 0 },
    },
    insight: 'An emergency fund prevents wealth-destroying debt cycles.',
    tags: ['emergency fund', 'protection', 'debt prevention'],
  },
  {
    id: 'max_retirement',
    name: 'Max Out Retirement',
    description: 'Contributing max to 401k vs minimum for match only',
    icon: '🏦',
    category: 'retirement',
    difficulty: 'intermediate',
    params: {
      baseline: { retirement401k: 6, employerMatch: 3 },
      scenario: { retirement401k: 22, employerMatch: 3 },
    },
    insight: 'Maxing out 401k contributions can add $1M+ to retirement savings.',
    tags: ['401k', 'retirement', 'tax advantage'],
  },
  {
    id: 'debt_avalanche',
    name: 'Debt Avalanche Attack',
    description: 'Aggressively pay off high-interest debt first',
    icon: '⛰️',
    category: 'debt',
    difficulty: 'intermediate',
    params: {
      baseline: { debtStrategy: 'minimum', totalDebt: 50000, avgInterest: 18 },
      scenario: { debtStrategy: 'avalanche', totalDebt: 50000, avgInterest: 18 },
    },
    insight: 'The avalanche method saves thousands in interest payments.',
    tags: ['debt', 'interest', 'payoff strategy'],
  },
  {
    id: 'wealth_transfer',
    name: 'Strategic Wealth Transfer',
    description: 'Plan inheritance vs leave it to chance',
    icon: '🎁',
    category: 'legacy',
    difficulty: 'advanced',
    params: {
      baseline: { estatePlan: false, inheritanceTax: 40 },
      scenario: { estatePlan: true, inheritanceTax: 15 },
    },
    insight: 'Proper estate planning can preserve 20-40% more wealth for heirs.',
    tags: ['estate planning', 'inheritance', 'taxes'],
  },
];

const CATEGORIES = {
  timing: { name: 'Timing', color: 'from-blue-500 to-cyan-500', icon: '⏰' },
  habits: { name: 'Daily Habits', color: 'from-orange-500 to-amber-500', icon: '☕' },
  assets: { name: 'Assets', color: 'from-green-500 to-emerald-500', icon: '🏠' },
  income: { name: 'Income', color: 'from-purple-500 to-pink-500', icon: '💰' },
  savings: { name: 'Savings', color: 'from-yellow-500 to-orange-500', icon: '🐷' },
  strategy: { name: 'Strategy', color: 'from-indigo-500 to-violet-500', icon: '📊' },
  legacy: { name: 'Legacy', color: 'from-rose-500 to-red-500', icon: '🌳' },
  safety: { name: 'Safety Net', color: 'from-teal-500 to-cyan-500', icon: '🛡️' },
  retirement: { name: 'Retirement', color: 'from-slate-500 to-slate-600', icon: '🏦' },
  debt: { name: 'Debt', color: 'from-red-500 to-rose-500', icon: '💳' },
};

const DIFFICULTIES = {
  beginner: { name: 'Beginner', color: 'text-green-400 bg-green-400/20' },
  intermediate: { name: 'Intermediate', color: 'text-yellow-400 bg-yellow-400/20' },
  advanced: { name: 'Advanced', color: 'text-red-400 bg-red-400/20' },
};

// Scenario card component
const ScenarioCard = ({ scenario, onSelect, isSelected }) => {
  const category = CATEGORIES[scenario.category];
  const difficulty = DIFFICULTIES[scenario.difficulty];

  return (
    <motion.div
      className={`glass-card p-5 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-seedling-500' : ''
      }`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(scenario)}
      layoutId={scenario.id}
    >
      <div className="flex items-start gap-4">
        <motion.div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
        >
          <span className="text-3xl">{scenario.icon}</span>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold truncate">{scenario.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${difficulty.color}`}>
              {difficulty.name}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">{scenario.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {scenario.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Scenario detail panel
const ScenarioDetail = ({ scenario, onRun, onClose }) => {
  const category = CATEGORIES[scenario.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="glass-card p-6 h-full"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
            <span className="text-4xl">{scenario.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{scenario.name}</h3>
            <p className="text-slate-400">{category.name} Scenario</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-slate-300 text-lg mb-6">{scenario.description}</p>

      {/* Insight callout */}
      <div className="bg-gradient-to-r from-seedling-500/20 to-emerald-500/20 border border-seedling-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-seedling-400 font-semibold mb-1">Key Insight</h4>
            <p className="text-slate-300">{scenario.insight}</p>
          </div>
        </div>
      </div>

      {/* Comparison preview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <span>📊</span> Baseline
          </h5>
          <ul className="text-slate-300 text-sm space-y-1">
            {Object.entries(scenario.params.baseline).slice(0, 4).map(([key, value]) => (
              <li key={key}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:{' '}
                <span className="text-white">{typeof value === 'number' && value > 100 ? `$${value.toLocaleString()}` : value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <h5 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
            <span>🚀</span> Scenario
          </h5>
          <ul className="text-slate-300 text-sm space-y-1">
            {Object.entries(scenario.params.scenario).slice(0, 4).map(([key, value]) => (
              <li key={key}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:{' '}
                <span className="text-white">{typeof value === 'number' && value > 100 ? `$${value.toLocaleString()}` : value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h5 className="text-slate-400 text-sm mb-2">Related Topics</h5>
        <div className="flex flex-wrap gap-2">
          {scenario.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Run button */}
      <motion.button
        onClick={() => onRun(scenario)}
        className="w-full py-4 bg-gradient-to-r from-seedling-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-seedling-500/25"
        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center justify-center gap-2">
          <span>🚀</span>
          Run This Scenario
        </span>
      </motion.button>
    </motion.div>
  );
};

// Main Scenario Library component
const ScenarioLibrary = ({ onRunScenario }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { savedScenarios, addScenario } = useStore();

  // Filter scenarios
  const filteredScenarios = PRESET_SCENARIOS.filter((scenario) => {
    const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleRunScenario = (scenario) => {
    if (onRunScenario) {
      onRunScenario(scenario);
    }
    addScenario({ ...scenario, timestamp: Date.now() });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel - Scenario list */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl">📚</span>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Scenario Library</h2>
            <p className="text-slate-400">Explore pre-built "what if" simulations</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scenarios..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl transition-colors ${
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
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                selectedCategory === key
                  ? `bg-gradient-to-r ${cat.color} text-white`
                  : 'bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Scenario grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onSelect={setSelectedScenario}
              isSelected={selectedScenario?.id === scenario.id}
            />
          ))}
        </div>

        {filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-400">No scenarios match your search</p>
          </div>
        )}
      </div>

      {/* Right panel - Scenario detail */}
      <div className="hidden lg:block">
        <AnimatePresence mode="wait">
          {selectedScenario ? (
            <ScenarioDetail
              key={selectedScenario.id}
              scenario={selectedScenario}
              onRun={handleRunScenario}
              onClose={() => setSelectedScenario(null)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 h-full flex flex-col items-center justify-center text-center"
            >
              <div className="text-6xl mb-4">👆</div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a Scenario</h3>
              <p className="text-slate-400">
                Click on any scenario to see details and run the simulation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile detail modal */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/80 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScenario(null)}
          >
            <motion.div
              className="w-full max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ScenarioDetail
                scenario={selectedScenario}
                onRun={handleRunScenario}
                onClose={() => setSelectedScenario(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScenarioLibrary;
