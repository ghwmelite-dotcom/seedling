import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Life event categories with probabilities and costs
const LIFE_EVENTS = {
  housing: {
    icon: '🏠',
    color: 'from-blue-500 to-cyan-600',
    events: [
      { name: 'Home Purchase', baseAge: 30, ageRange: 10, baseCost: 350000, costRange: 0.5, probability: 0.75 },
      { name: 'Major Renovation', baseAge: 45, ageRange: 15, baseCost: 50000, costRange: 0.4, probability: 0.6 },
      { name: 'Second Property', baseAge: 50, ageRange: 10, baseCost: 400000, costRange: 0.5, probability: 0.25 },
      { name: 'Downsizing Move', baseAge: 65, ageRange: 10, baseCost: 30000, costRange: 0.3, probability: 0.4 },
    ],
  },
  family: {
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-500 to-rose-600',
    events: [
      { name: 'Wedding', baseAge: 28, ageRange: 8, baseCost: 35000, costRange: 0.5, probability: 0.7 },
      { name: 'First Child', baseAge: 30, ageRange: 8, baseCost: 15000, costRange: 0.3, probability: 0.65 },
      { name: 'Second Child', baseAge: 33, ageRange: 6, baseCost: 12000, costRange: 0.3, probability: 0.5 },
      { name: 'Child College Fund', baseAge: 48, ageRange: 5, baseCost: 120000, costRange: 0.4, probability: 0.6 },
    ],
  },
  health: {
    icon: '🏥',
    color: 'from-red-500 to-orange-600',
    events: [
      { name: 'Major Medical Expense', baseAge: 55, ageRange: 20, baseCost: 25000, costRange: 0.6, probability: 0.4 },
      { name: 'Long-term Care Planning', baseAge: 60, ageRange: 10, baseCost: 100000, costRange: 0.5, probability: 0.35 },
      { name: 'Health Emergency Fund', baseAge: 40, ageRange: 20, baseCost: 20000, costRange: 0.4, probability: 0.5 },
    ],
  },
  career: {
    icon: '💼',
    color: 'from-purple-500 to-indigo-600',
    events: [
      { name: 'Career Transition', baseAge: 40, ageRange: 15, baseCost: 30000, costRange: 0.5, probability: 0.45 },
      { name: 'Start a Business', baseAge: 35, ageRange: 15, baseCost: 75000, costRange: 0.6, probability: 0.2 },
      { name: 'Advanced Education', baseAge: 32, ageRange: 10, baseCost: 60000, costRange: 0.4, probability: 0.35 },
      { name: 'Early Retirement', baseAge: 55, ageRange: 10, baseCost: 500000, costRange: 0.3, probability: 0.15 },
    ],
  },
  lifestyle: {
    icon: '✨',
    color: 'from-amber-500 to-yellow-600',
    events: [
      { name: 'Dream Vacation', baseAge: 35, ageRange: 30, baseCost: 15000, costRange: 0.5, probability: 0.6 },
      { name: 'New Vehicle', baseAge: 30, ageRange: 10, baseCost: 45000, costRange: 0.4, probability: 0.7 },
      { name: 'Home Office Setup', baseAge: 35, ageRange: 15, baseCost: 10000, costRange: 0.4, probability: 0.5 },
      { name: 'Major Celebration', baseAge: 50, ageRange: 20, baseCost: 20000, costRange: 0.5, probability: 0.4 },
    ],
  },
  emergency: {
    icon: '🚨',
    color: 'from-slate-500 to-slate-700',
    events: [
      { name: 'Job Loss Buffer', baseAge: 40, ageRange: 25, baseCost: 40000, costRange: 0.4, probability: 0.3 },
      { name: 'Natural Disaster Recovery', baseAge: 45, ageRange: 30, baseCost: 35000, costRange: 0.6, probability: 0.15 },
      { name: 'Legal Expenses', baseAge: 45, ageRange: 25, baseCost: 25000, costRange: 0.5, probability: 0.2 },
    ],
  },
};

// Calculate predicted events based on user's profile
const predictEvents = (currentAge, income, netWorth) => {
  const predictions = [];
  const seed = currentAge * 1000 + income; // Deterministic randomness

  Object.entries(LIFE_EVENTS).forEach(([category, { icon, color, events }]) => {
    events.forEach((event, eventIndex) => {
      // Calculate probability modifier based on profile
      let probModifier = 1;
      if (income > 100000) probModifier *= 1.2;
      if (netWorth > 500000) probModifier *= 1.1;

      // Use seeded "random" for consistency
      const pseudoRandom = Math.sin(seed + eventIndex * 100) * 0.5 + 0.5;
      const adjustedProb = Math.min(0.95, event.probability * probModifier);

      if (pseudoRandom < adjustedProb) {
        // Calculate predicted age
        const ageOffset = (Math.sin(seed + eventIndex * 50) * 0.5 + 0.5) * event.ageRange - event.ageRange / 2;
        const predictedAge = Math.round(event.baseAge + ageOffset);

        // Calculate predicted cost (adjusted for inflation and income)
        const costModifier = 1 + (income / 75000 - 1) * 0.3;
        const costVariation = (Math.sin(seed + eventIndex * 75) * 0.5 + 0.5) * event.costRange;
        const predictedCost = Math.round(event.baseCost * costModifier * (1 + costVariation - event.costRange / 2));

        // Calculate years until event
        const yearsUntil = predictedAge - currentAge;

        if (yearsUntil > -5) { // Include recent past events too
          predictions.push({
            ...event,
            category,
            icon,
            color,
            predictedAge,
            predictedCost,
            yearsUntil,
            probability: Math.round(adjustedProb * 100),
            isPast: yearsUntil < 0,
            isImminent: yearsUntil >= 0 && yearsUntil <= 5,
          });
        }
      }
    });
  });

  // Sort by years until event
  return predictions.sort((a, b) => a.yearsUntil - b.yearsUntil);
};

// Event card component
const EventCard = ({ event, onPrepare, currency }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${
        event.isPast
          ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
          : event.isImminent
          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/40'
          : 'bg-slate-800/50 border-slate-700/50'
      }`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center`}>
              <span className="text-2xl">{event.icon}</span>
            </div>
            <div>
              <div className="text-white font-bold">{event.name}</div>
              <div className="text-slate-400 text-sm">
                {event.isPast ? 'May have occurred' : `Age ${event.predictedAge}`}
                {!event.isPast && (
                  <span className="ml-2 text-slate-500">
                    ({event.yearsUntil === 0 ? 'This year' : `${event.yearsUntil} years`})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-lg font-bold ${event.isImminent ? 'text-amber-400' : 'text-white'}`}>
              {formatCurrency(event.predictedCost, currency)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className={`w-2 h-2 rounded-full ${
                event.probability >= 70 ? 'bg-red-500' :
                event.probability >= 50 ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              <span className="text-slate-400">{event.probability}% likely</span>
            </div>
          </div>
        </div>

        {/* Imminent badge */}
        {event.isImminent && !event.isPast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-amber-400 text-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚠️
            </motion.span>
            Prepare now - this event is approaching!
          </motion.div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-4 space-y-4">
              {/* Savings recommendation */}
              {!event.isPast && event.yearsUntil > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/50">
                  <div className="text-slate-400 text-sm mb-1">Monthly savings needed</div>
                  <div className="text-seedling-400 font-bold text-xl">
                    {formatCurrency(event.predictedCost / (event.yearsUntil * 12), currency)}/mo
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    To fully fund this in {event.yearsUntil} years
                  </div>
                </div>
              )}

              {/* Tips */}
              <div>
                <div className="text-slate-400 text-sm mb-2">Preparation Tips</div>
                <ul className="space-y-1 text-slate-300 text-sm">
                  {event.category === 'housing' && (
                    <>
                      <li>• Start building a dedicated savings fund</li>
                      <li>• Research mortgage rates and down payment requirements</li>
                      <li>• Consider location and long-term appreciation</li>
                    </>
                  )}
                  {event.category === 'family' && (
                    <>
                      <li>• Review your insurance coverage</li>
                      <li>• Consider opening a 529 education savings plan</li>
                      <li>• Budget for ongoing expenses, not just one-time costs</li>
                    </>
                  )}
                  {event.category === 'health' && (
                    <>
                      <li>• Maximize HSA contributions if eligible</li>
                      <li>• Review health insurance options annually</li>
                      <li>• Consider supplemental insurance for gaps</li>
                    </>
                  )}
                  {event.category === 'career' && (
                    <>
                      <li>• Build an emergency fund covering 6+ months</li>
                      <li>• Invest in skills and networking</li>
                      <li>• Research tax implications and benefits</li>
                    </>
                  )}
                  {event.category === 'lifestyle' && (
                    <>
                      <li>• Set up automatic savings transfers</li>
                      <li>• Look for deals and plan ahead</li>
                      <li>• Consider the total cost of ownership</li>
                    </>
                  )}
                  {event.category === 'emergency' && (
                    <>
                      <li>• Prioritize this over discretionary spending</li>
                      <li>• Keep funds in a high-yield savings account</li>
                      <li>• Review and adjust coverage regularly</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Action button */}
              {!event.isPast && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPrepare(event)}
                  className={`w-full py-3 rounded-xl font-medium bg-gradient-to-r ${event.color} text-white`}
                >
                  Add to Simulation
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Timeline visualization
const EventTimeline = ({ events, currentAge, currency }) => {
  const maxAge = Math.max(currentAge + 40, ...events.map(e => e.predictedAge));
  const minAge = Math.min(currentAge, ...events.filter(e => !e.isPast).map(e => e.predictedAge));

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />

      {/* Current age marker */}
      <div
        className="absolute left-4 w-5 h-5 rounded-full bg-seedling-500 border-4 border-slate-900 z-10"
        style={{ top: '0%' }}
      />
      <div className="absolute left-12 top-0 text-seedling-400 text-sm font-medium">
        Now (Age {currentAge})
      </div>

      {/* Events */}
      <div className="space-y-4 pt-10">
        {events.filter(e => !e.isPast).slice(0, 8).map((event, index) => {
          const progress = (event.predictedAge - currentAge) / (maxAge - currentAge);

          return (
            <motion.div
              key={event.name + event.predictedAge}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center gap-4 pl-12"
            >
              {/* Timeline dot */}
              <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-slate-900 ${
                event.isImminent ? 'bg-amber-500' : 'bg-slate-600'
              }`} />

              {/* Event card */}
              <div className={`flex-1 p-3 rounded-xl ${
                event.isImminent
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'bg-slate-800/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{event.icon}</span>
                    <span className="text-white font-medium">{event.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Age {event.predictedAge}</div>
                    <div className={`font-bold ${event.isImminent ? 'text-amber-400' : 'text-white'}`}>
                      {formatCurrency(event.predictedCost, currency)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Main Life Event Oracle Component
const LifeEventOracle = ({ onAddToSimulation }) => {
  const { simulation, currency, userCountry } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'timeline'
  const [aiPredictions, setAiPredictions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [useAI, setUseAI] = useState(false);

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://seedling-api.anthropic-code.workers.dev';

  const currentAge = simulation?.scenario?.tree?.currentAge || simulation?.scenario?.tree?.age || 30;
  const income = simulation?.scenario?.tree?.income || 75000;
  const netWorth = simulation?.scenario?.tree?.netWorth || 50000;
  const hasHome = simulation?.scenario?.tree?.ownsHome || false;
  const education = simulation?.scenario?.tree?.education || 'bachelors';

  // Fetch AI predictions
  const fetchAIPredictions = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/predict-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: currentAge,
          income,
          netWorth,
          hasHome,
          education,
          country: userCountry,
        })
      });

      const data = await response.json();

      if (data.success && data.events?.length > 0) {
        // Transform AI events to match our format
        const transformed = data.events.map((event, index) => ({
          name: event.event,
          predictedAge: event.age,
          predictedCost: event.cost,
          probability: event.probability === 'high' ? 85 : event.probability === 'medium' ? 60 : 35,
          category: 'ai',
          icon: '🤖',
          color: 'from-purple-500 to-pink-600',
          yearsUntil: event.age - currentAge,
          isPast: event.age < currentAge,
          isImminent: event.age - currentAge >= 0 && event.age - currentAge <= 5,
          reason: event.reason,
          isAI: true,
        }));
        setAiPredictions(transformed);
        setUseAI(true);
      }
    } catch (error) {
      console.error('AI prediction failed:', error);
    }
    setIsLoadingAI(false);
  };

  // Generate predictions
  const predictions = useMemo(() => {
    const basePredictions = predictEvents(currentAge, income, netWorth);
    if (useAI && aiPredictions.length > 0) {
      // Merge AI predictions with base predictions, AI first
      return [...aiPredictions, ...basePredictions];
    }
    return basePredictions;
  }, [currentAge, income, netWorth, useAI, aiPredictions]);

  // Filter predictions
  const filteredPredictions = selectedCategory === 'all'
    ? predictions
    : predictions.filter(p => p.category === selectedCategory);

  // Calculate totals
  const totalPredictedCosts = predictions
    .filter(p => !p.isPast && p.yearsUntil <= 20)
    .reduce((sum, p) => sum + p.predictedCost, 0);

  const imminentEvents = predictions.filter(p => p.isImminent && !p.isPast);

  const handlePrepare = (event) => {
    if (onAddToSimulation) {
      onAddToSimulation({
        type: 'life_event',
        name: event.name,
        cost: event.predictedCost,
        yearsUntil: event.yearsUntil,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                  '0 0 40px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(139, 92, 246, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🔮</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Life Event Oracle</h2>
              <p className="text-slate-400">AI predictions of major future expenses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Predictions Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAIPredictions}
              disabled={isLoadingAI}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                useAI && aiPredictions.length > 0
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:text-white'
              }`}
            >
              {isLoadingAI ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Thinking...
                </>
              ) : (
                <>
                  <span className="text-lg">🤖</span>
                  {useAI ? 'AI Active' : 'Get AI Predictions'}
                </>
              )}
            </motion.button>

            {/* View toggle */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-seedling-500 text-white' : 'text-slate-400'
                }`}
              >
                Cards
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'timeline' ? 'bg-seedling-500 text-white' : 'text-slate-400'
                }`}
              >
                Timeline
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{predictions.length}</div>
          <div className="text-slate-400 text-sm">Predicted Events</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{imminentEvents.length}</div>
          <div className="text-slate-400 text-sm">Within 5 Years</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xl font-bold text-purple-400">
            {formatCurrency(totalPredictedCosts, currency)}
          </div>
          <div className="text-slate-400 text-sm">20-Year Total</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xl font-bold text-seedling-400">
            {formatCurrency(totalPredictedCosts / 240, currency)}/mo
          </div>
          <div className="text-slate-400 text-sm">Avg. Monthly Need</div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            selectedCategory === 'all'
              ? 'bg-seedling-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Events
        </motion.button>
        {Object.entries(LIFE_EVENTS).map(([key, { icon }]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-xl transition-colors capitalize flex items-center gap-2 ${
              selectedCategory === key
                ? 'bg-seedling-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{icon}</span>
            {key}
          </motion.button>
        ))}
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {filteredPredictions.map((event, index) => (
              <EventCard
                key={event.name + event.predictedAge}
                event={event}
                onPrepare={handlePrepare}
                currency={currency}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6"
          >
            <EventTimeline
              events={filteredPredictions}
              currentAge={currentAge}
              currency={currency}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 text-sm text-slate-500"
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Predictions are based on statistical averages and your profile. Actual life events may vary significantly.
          Use these projections as a guide for financial planning, not as certainties.
        </p>
      </motion.div>
    </div>
  );
};

export default LifeEventOracle;
