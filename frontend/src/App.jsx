import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Header,
  Footer,
  Navigation,
  HabitCalculator,
  InputForm,
  FamilyTree,
  MemberDetail,
  ComparisonSummary,
  InsightCard,
  TimelineScrubber,
  AICoach,
  AchievementSystem,
  AnalyticsDashboard,
  ScenarioLibrary,
  PDFReportGenerator,
  SoundSettings,
  SoundProvider,
  useSounds,
} from './components';
import { useApiHealth, useSimulation } from './hooks/useApi';
import useStore from './store/useStore';

// Main App Content (wrapped by SoundProvider)
function AppContent() {
  const { connected: apiConnected } = useApiHealth();
  const { result, loading, error, runSimulation } = useSimulation();
  const [selectedMember, setSelectedMember] = useState(null);
  const [lastHabitChange, setLastHabitChange] = useState(100);

  const {
    activePanel,
    setActivePanel,
    viewMode,
    setSimulation,
    autoDetectCurrency,
  } = useStore();

  // Get sound hook - now safely inside SoundProvider
  const { playSound } = useSounds();

  // Auto-detect currency on first visit
  useEffect(() => {
    autoDetectCurrency();
  }, [autoDetectCurrency]);

  // Update store when simulation runs
  useEffect(() => {
    if (result) {
      setSimulation(result);
      playSound('success');
    }
  }, [result, setSimulation, playSound]);

  const handleSimulation = async (formData) => {
    setLastHabitChange(formData.monthlyHabitChange);
    playSound('click');
    await runSimulation(formData);
  };

  const handleScenarioRun = (scenario) => {
    // Convert scenario params to simulation format
    const formData = {
      startingAge: 30,
      startingNetWorth: 50000,
      annualIncome: 75000,
      savingsRate: scenario.params.scenario.savingsRate || 20,
      monthlyHabitChange: 200,
      generations: 4,
      ...scenario.params.scenario,
    };
    handleSimulation(formData);
    setActivePanel('simulator');
  };

  // Panel content renderer
  const renderPanel = () => {
    switch (activePanel) {
      case 'simulator':
        return (
          <div className="space-y-8">
            {/* Quick Calculator */}
            <HabitCalculator />

            {/* Input Form */}
            <InputForm onSubmit={handleSimulation} loading={loading} />

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error} - Using local simulation as fallback</span>
              </motion.div>
            )}

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Timeline Scrubber */}
                <TimelineScrubber
                  simulation={result}
                  onYearChange={(year) => console.log('Year:', year)}
                />

                {/* Summary */}
                <ComparisonSummary summary={result.summary} />

                {/* Tree Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FamilyTree
                    root={result.baseline.tree}
                    title="Current Path"
                    isScenario={false}
                    onSelectMember={setSelectedMember}
                    selectedMember={selectedMember}
                  />
                  <FamilyTree
                    root={result.scenario.tree}
                    title="With Habit Change"
                    isScenario={true}
                    onSelectMember={setSelectedMember}
                    selectedMember={selectedMember}
                  />
                </div>

                {/* Key Insight */}
                <InsightCard
                  difference={result.summary.difference.totalNetWorth}
                  monthlyHabitChange={lastHabitChange}
                />
              </motion.div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <AnalyticsDashboard
            simulation={result}
            comparisonSummary={result?.summary}
          />
        );

      case 'scenarios':
        return (
          <ScenarioLibrary onRunScenario={handleScenarioRun} />
        );

      case 'achievements':
        return (
          <AchievementSystem simulation={result} />
        );

      case 'coach':
        return (
          <AICoach simulation={result} />
        );

      case 'report':
        return (
          <PDFReportGenerator simulation={result} />
        );

      case 'settings':
        return (
          <SoundSettings />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-72 min-h-screen p-4 sticky top-0">
          <Navigation />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <Header apiConnected={apiConnected} />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {activePanel === 'coach' ? 'AI Financial Coach' : activePanel}
                </h2>
                <p className="text-slate-400">
                  {activePanel === 'simulator' && 'Run wealth simulations across generations'}
                  {activePanel === 'analytics' && 'Deep dive into your wealth data'}
                  {activePanel === 'scenarios' && 'Explore pre-built what-if scenarios'}
                  {activePanel === 'achievements' && 'Track your progress and unlock rewards'}
                  {activePanel === 'coach' && 'Get personalized financial advice'}
                  {activePanel === 'report' && 'Generate professional PDF reports'}
                  {activePanel === 'settings' && 'Customize your experience'}
                </p>
              </div>

              {/* API Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiConnected ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <span className="text-slate-400 text-sm">
                  {apiConnected ? 'API Connected' : 'Local Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Panel Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>

          <Footer />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activePanel={activePanel} setActivePanel={setActivePanel} />

      {/* Member Detail Panel */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetail member={selectedMember} onClose={() => setSelectedMember(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile bottom navigation
const MobileNav = ({ activePanel, setActivePanel }) => {
  const navItems = [
    { id: 'simulator', icon: '🌱' },
    { id: 'analytics', icon: '📊' },
    { id: 'scenarios', icon: '📚' },
    { id: 'achievements', icon: '🏆' },
    { id: 'coach', icon: '🤖' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`p-3 rounded-xl ${
              activePanel === item.id
                ? 'bg-seedling-500/20 text-seedling-400'
                : 'text-slate-400'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-xl">{item.icon}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

// Root App component with providers
function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}

export default App;
