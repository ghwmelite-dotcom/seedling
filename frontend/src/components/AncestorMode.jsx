import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Historical economic data (simplified)
const ECONOMIC_ERAS = [
  { year: 1920, name: 'Roaring Twenties', growth: 0.08, inflation: 0.02, events: ['Post-WWI boom', 'Stock market surge'] },
  { year: 1930, name: 'Great Depression', growth: -0.05, inflation: -0.02, events: ['Market crash', 'Unemployment peak'] },
  { year: 1940, name: 'WWII Era', growth: 0.06, inflation: 0.05, events: ['War economy', 'Rationing'] },
  { year: 1950, name: 'Post-War Boom', growth: 0.07, inflation: 0.02, events: ['GI Bill', 'Suburban growth'] },
  { year: 1960, name: 'Golden Age', growth: 0.05, inflation: 0.02, events: ['Civil rights', 'Space race'] },
  { year: 1970, name: 'Stagflation', growth: 0.03, inflation: 0.08, events: ['Oil crisis', 'High inflation'] },
  { year: 1980, name: 'Reagan Era', growth: 0.04, inflation: 0.05, events: ['Tax cuts', 'Market growth'] },
  { year: 1990, name: 'Tech Boom', growth: 0.06, inflation: 0.03, events: ['Internet rise', 'Dot-com bubble'] },
  { year: 2000, name: 'New Millennium', growth: 0.03, inflation: 0.02, events: ['9/11', 'Housing boom'] },
  { year: 2010, name: 'Recovery Era', growth: 0.04, inflation: 0.02, events: ['Financial recovery', 'Tech giants'] },
  { year: 2020, name: 'Pandemic Era', growth: 0.02, inflation: 0.05, events: ['COVID-19', 'Remote work'] },
];

// Country-specific ancestor names
const COUNTRY_ANCESTOR_NAMES = {
  US: { greatgreat: ['Elijah', 'Martha', 'Theodore', 'Eleanor'], great: ['Robert', 'Dorothy', 'James', 'Helen'], grand: ['Richard', 'Barbara', 'Thomas', 'Patricia'], parent: ['Michael', 'Linda', 'David', 'Susan'] },
  GB: { greatgreat: ['Alfred', 'Edith', 'Arthur', 'Florence'], great: ['Harold', 'Doris', 'Frederick', 'Gladys'], grand: ['Ronald', 'Joan', 'Kenneth', 'Maureen'], parent: ['Andrew', 'Susan', 'Stephen', 'Julie'] },
  CA: { greatgreat: ['George', 'Elsie', 'Henry', 'Mabel'], great: ['Donald', 'Shirley', 'Gordon', 'Jean'], grand: ['Brian', 'Sandra', 'Gary', 'Diane'], parent: ['Mark', 'Karen', 'Scott', 'Jennifer'] },
  AU: { greatgreat: ['Herbert', 'Olive', 'Percy', 'Ivy'], great: ['Bruce', 'Shirley', 'Keith', 'Dawn'], grand: ['Trevor', 'Lorraine', 'Graeme', 'Christine'], parent: ['Shane', 'Michelle', 'Darren', 'Nicole'] },
  DE: { greatgreat: ['Wilhelm', 'Gertrud', 'Heinrich', 'Hedwig'], great: ['Klaus', 'Ingrid', 'Dieter', 'Brigitte'], grand: ['Wolfgang', 'Renate', 'Jürgen', 'Monika'], parent: ['Thomas', 'Sabine', 'Andreas', 'Claudia'] },
  FR: { greatgreat: ['Marcel', 'Germaine', 'Henri', 'Marguerite'], great: ['Jacques', 'Simone', 'Pierre', 'Monique'], grand: ['Jean-Pierre', 'Françoise', 'Alain', 'Martine'], parent: ['Philippe', 'Isabelle', 'Laurent', 'Nathalie'] },
  JP: { greatgreat: ['Taro', 'Hana', 'Ichiro', 'Kiku'], great: ['Kenji', 'Yoshiko', 'Takeshi', 'Sachiko'], grand: ['Hiroshi', 'Keiko', 'Masao', 'Yoko'], parent: ['Takuya', 'Yuki', 'Daisuke', 'Mika'] },
  IN: { greatgreat: ['Ramesh', 'Savitri', 'Gopal', 'Lakshmi'], great: ['Suresh', 'Kamala', 'Vijay', 'Sarita'], grand: ['Rajesh', 'Sunita', 'Anil', 'Geeta'], parent: ['Rahul', 'Priya', 'Amit', 'Neha'] },
  BR: { greatgreat: ['João', 'Maria', 'José', 'Ana'], great: ['Antônio', 'Francisca', 'Francisco', 'Lúcia'], grand: ['Carlos', 'Márcia', 'Paulo', 'Sandra'], parent: ['Rodrigo', 'Fernanda', 'Bruno', 'Juliana'] },
  MX: { greatgreat: ['José', 'María', 'Juan', 'Guadalupe'], great: ['Roberto', 'Rosa', 'Luis', 'Carmen'], grand: ['Carlos', 'Patricia', 'Jorge', 'Margarita'], parent: ['Alejandro', 'Adriana', 'Miguel', 'Claudia'] },
  ZA: { greatgreat: ['Johannes', 'Susanna', 'Hendrik', 'Maria'], great: ['Petrus', 'Anna', 'Jacobus', 'Elizabeth'], grand: ['Johan', 'Magda', 'Pieter', 'Anette'], parent: ['Thabo', 'Lerato', 'Sipho', 'Nomvula'] },
  NG: { greatgreat: ['Chukwu', 'Adaeze', 'Obinna', 'Ngozi'], great: ['Emeka', 'Chinwe', 'Nnamdi', 'Ifeoma'], grand: ['Chidi', 'Nneka', 'Uche', 'Amaka'], parent: ['Oluwaseun', 'Funke', 'Chinedu', 'Blessing'] },
  KE: { greatgreat: ['Kamau', 'Wanjiku', 'Mwangi', 'Nyambura'], great: ['Njoroge', 'Wangari', 'Kariuki', 'Njeri'], grand: ['James', 'Mary', 'Peter', 'Grace'], parent: ['Brian', 'Faith', 'Kevin', 'Joy'] },
  AE: { greatgreat: ['Mohammed', 'Fatima', 'Ahmed', 'Khadija'], great: ['Khalid', 'Maryam', 'Sultan', 'Aisha'], grand: ['Rashid', 'Noura', 'Hamad', 'Sara'], parent: ['Omar', 'Layla', 'Faisal', 'Dana'] },
  SG: { greatgreat: ['Ah Kow', 'Ah Lian', 'Boon Huat', 'Siew Mei'], great: ['Cheng Hock', 'Mei Ling', 'Kok Wai', 'Soo Hoon'], grand: ['David', 'Jenny', 'Michael', 'Grace'], parent: ['Ryan', 'Rachel', 'Marcus', 'Nicole'] },
  KR: { greatgreat: ['Sung-ho', 'Soon-ja', 'Dong-hyun', 'Young-hee'], great: ['Jung-ho', 'Mi-young', 'Seung-hoon', 'Eun-jung'], grand: ['Jae-won', 'Soo-yeon', 'Min-ho', 'Ji-young'], parent: ['Hyun-woo', 'Yuna', 'Jun-ho', 'Min-ji'] },
  CN: { greatgreat: ['Guoqiang', 'Xiuying', 'Jianguo', 'Lanying'], great: ['Jianguo', 'Fang', 'Zhiqiang', 'Huifang'], grand: ['Wei', 'Hong', 'Jian', 'Yan'], parent: ['Hao', 'Xia', 'Chen', 'Li'] },
  PH: { greatgreat: ['Jose', 'Maria', 'Pedro', 'Rosario'], great: ['Antonio', 'Corazon', 'Francisco', 'Remedios'], grand: ['Roberto', 'Esperanza', 'Eduardo', 'Gloria'], parent: ['Carlo', 'Anna', 'Miguel', 'Sofia'] },
  NZ: { greatgreat: ['George', 'Edith', 'William', 'Mabel'], great: ['Donald', 'Shirley', 'Bruce', 'Jean'], grand: ['Murray', 'Judith', 'Ross', 'Christine'], parent: ['Jason', 'Rachel', 'Brendon', 'Nicole'] },
  IE: { greatgreat: ['Patrick', 'Brigid', 'Michael', 'Mary'], great: ['Seamus', 'Kathleen', 'Brendan', 'Maureen'], grand: ['Declan', 'Siobhan', 'Liam', 'Aisling'], parent: ['Conor', 'Aoife', 'Sean', 'Ciara'] },
};

// Generate ancestor based on historical context
const generateAncestor = (generation, year, previousWealth = 0, countryCode = 'US') => {
  const era = ECONOMIC_ERAS.find(e => year >= e.year && year < e.year + 10) || ECONOMIC_ERAS[0];
  const countryNames = COUNTRY_ANCESTOR_NAMES[countryCode] || COUNTRY_ANCESTOR_NAMES.US;
  const genNames = countryNames[generation] || countryNames.parent;
  const name = genNames[Math.floor(Math.random() * genNames.length)];

  // Calculate wealth based on era and decisions
  const decisions = [];
  let wealth = previousWealth || (500 + Math.random() * 2000); // Starting wealth adjusted for era

  // Career decision
  const careers = [
    { name: 'Factory Worker', multiplier: 1.0, stability: 0.8 },
    { name: 'Small Business Owner', multiplier: 1.5, stability: 0.5 },
    { name: 'Professional', multiplier: 1.8, stability: 0.9 },
    { name: 'Farmer', multiplier: 0.8, stability: 0.6 },
    { name: 'Tradesperson', multiplier: 1.2, stability: 0.7 },
  ];
  const career = careers[Math.floor(Math.random() * careers.length)];
  decisions.push({ type: 'career', choice: career.name, impact: career.multiplier });
  wealth *= career.multiplier;

  // Savings habit
  const savingsRate = 0.05 + Math.random() * 0.2;
  decisions.push({ type: 'savings', choice: `${Math.round(savingsRate * 100)}% savings rate`, impact: 1 + savingsRate });
  wealth *= (1 + savingsRate);

  // Investment decision based on era
  const investments = [
    { name: 'Kept in savings', multiplier: 1.02 },
    { name: 'Invested in stocks', multiplier: 1 + era.growth },
    { name: 'Bought property', multiplier: 1.05 },
    { name: 'Started business', multiplier: 1.15 },
  ];
  const investment = investments[Math.floor(Math.random() * investments.length)];
  decisions.push({ type: 'investment', choice: investment.name, impact: investment.multiplier });
  wealth *= Math.pow(investment.multiplier, 10); // Compounded over decade

  // Life events
  const lifeEvents = [];
  if (Math.random() > 0.7) {
    lifeEvents.push({ type: 'hardship', name: 'Medical emergency', impact: -0.2 });
    wealth *= 0.8;
  }
  if (Math.random() > 0.8) {
    lifeEvents.push({ type: 'windfall', name: 'Inheritance', impact: 0.3 });
    wealth *= 1.3;
  }
  if (era.events.some(e => e.includes('Depression') || e.includes('crash'))) {
    lifeEvents.push({ type: 'historical', name: era.events[0], impact: -0.4 });
    wealth *= 0.6;
  }

  // Adjust for inflation to present day
  const yearsToPresent = new Date().getFullYear() - year;
  const inflationAdjusted = wealth * Math.pow(1.03, yearsToPresent);

  return {
    name,
    generation,
    birthYear: year,
    deathYear: year + 70 + Math.floor(Math.random() * 20),
    era: era.name,
    eraEvents: era.events,
    career: career.name,
    decisions,
    lifeEvents,
    wealthAtPeak: Math.round(wealth),
    wealthInflationAdjusted: Math.round(inflationAdjusted),
    passedDown: Math.round(wealth * (0.3 + Math.random() * 0.4)), // 30-70% passed to next gen
    story: generateStory(name, generation, year, era, career, decisions, lifeEvents),
  };
};

// Generate narrative story for ancestor
const generateStory = (name, generation, year, era, career, decisions, lifeEvents) => {
  const relationLabels = {
    greatgreat: 'great-great-grandparent',
    great: 'great-grandparent',
    grand: 'grandparent',
    parent: 'parent',
  };

  let story = `${name}, your ${relationLabels[generation]}, was born in ${year} during ${era.name}. `;

  story += `They worked as a ${career.name.toLowerCase()}, a common and respectable profession of the time. `;

  const savingsDecision = decisions.find(d => d.type === 'savings');
  if (savingsDecision) {
    story += `Known for their ${savingsDecision.impact > 1.1 ? 'exceptional' : 'modest'} frugality, they maintained a ${savingsDecision.choice}. `;
  }

  const investmentDecision = decisions.find(d => d.type === 'investment');
  if (investmentDecision) {
    story += `${name} ${investmentDecision.choice.toLowerCase()}, which proved to be ${investmentDecision.multiplier > 1.05 ? 'a wise decision' : 'a safe choice'}. `;
  }

  if (lifeEvents.length > 0) {
    lifeEvents.forEach(event => {
      if (event.type === 'hardship') {
        story += `They faced hardship when ${event.name.toLowerCase()} struck the family. `;
      } else if (event.type === 'windfall') {
        story += `Fortune smiled when they received ${event.name.toLowerCase()}. `;
      } else if (event.type === 'historical') {
        story += `The ${event.name} significantly impacted their financial situation. `;
      }
    });
  }

  story += `Their choices laid the foundation for future generations.`;

  return story;
};

// Ancestor card component
const AncestorCard = ({ ancestor, isExpanded, onToggle, currency }) => {
  const generationColors = {
    greatgreat: 'from-amber-600 to-amber-800',
    great: 'from-emerald-600 to-emerald-800',
    grand: 'from-blue-600 to-blue-800',
    parent: 'from-purple-600 to-purple-800',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div
        className={`p-6 cursor-pointer bg-gradient-to-r ${generationColors[ancestor.generation]}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{ancestor.name}</h3>
              <p className="text-white/70">
                {ancestor.birthYear} - {ancestor.deathYear} • {ancestor.era}
              </p>
              <p className="text-white/60 text-sm">{ancestor.career}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-sm">Peak Wealth (Adjusted)</div>
            <div className="text-white font-bold text-xl">
              {formatCurrency(ancestor.wealthInflationAdjusted, currency)}
            </div>
            <motion.svg
              className="w-5 h-5 text-white/70 ml-auto mt-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: isExpanded ? 180 : 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-800/50"
          >
            <div className="p-6 space-y-6">
              {/* Story */}
              <div>
                <h4 className="text-white font-semibold mb-2">Their Story</h4>
                <p className="text-slate-300 leading-relaxed">{ancestor.story}</p>
              </div>

              {/* Historical context */}
              <div>
                <h4 className="text-white font-semibold mb-2">Historical Context</h4>
                <div className="flex flex-wrap gap-2">
                  {ancestor.eraEvents.map((event, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key decisions */}
              <div>
                <h4 className="text-white font-semibold mb-2">Key Decisions</h4>
                <div className="grid grid-cols-3 gap-3">
                  {ancestor.decisions.map((decision, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-700/50">
                      <div className="text-slate-400 text-xs capitalize mb-1">{decision.type}</div>
                      <div className="text-white text-sm">{decision.choice}</div>
                      <div className={`text-xs mt-1 ${decision.impact > 1 ? 'text-seedling-400' : 'text-red-400'}`}>
                        {decision.impact > 1 ? '+' : ''}{Math.round((decision.impact - 1) * 100)}% impact
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Life events */}
              {ancestor.lifeEvents.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Life Events</h4>
                  <div className="space-y-2">
                    {ancestor.lifeEvents.map((event, i) => (
                      <div key={i} className={`p-3 rounded-xl flex items-center gap-3 ${
                        event.impact > 0 ? 'bg-seedling-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className="text-xl">
                          {event.type === 'hardship' ? '💔' : event.type === 'windfall' ? '🍀' : '📰'}
                        </span>
                        <div>
                          <div className={event.impact > 0 ? 'text-seedling-400' : 'text-red-400'}>
                            {event.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {event.impact > 0 ? '+' : ''}{Math.round(event.impact * 100)}% wealth impact
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wealth passed down */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-amber-400 text-sm">Passed to Next Generation</div>
                    <div className="text-white font-bold text-xl">
                      {formatCurrency(ancestor.passedDown, currency)}
                    </div>
                  </div>
                  <span className="text-4xl">🎁</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Family tree connector
const TreeConnector = () => (
  <div className="flex justify-center py-2">
    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-600 to-slate-700" />
  </div>
);

// Main Ancestor Mode Component
const AncestorMode = () => {
  const { simulation, currency, userCountry } = useStore();
  const [expandedAncestor, setExpandedAncestor] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ancestors, setAncestors] = useState(null);

  // Current user info
  const currentYear = new Date().getFullYear();
  const currentNetWorth = simulation?.scenario?.tree?.netWorth || 50000;

  // Generate ancestors
  const generateAncestors = () => {
    setIsGenerating(true);
    const countryCode = userCountry?.code || 'US';

    setTimeout(() => {
      const generatedAncestors = {};
      let previousWealth = 0;

      // Great-great grandparents (~1900)
      generatedAncestors.greatgreat = generateAncestor('greatgreat', currentYear - 120, previousWealth, countryCode);
      previousWealth = generatedAncestors.greatgreat.passedDown;

      // Great grandparents (~1930)
      generatedAncestors.great = generateAncestor('great', currentYear - 90, previousWealth, countryCode);
      previousWealth = generatedAncestors.great.passedDown;

      // Grandparents (~1960)
      generatedAncestors.grand = generateAncestor('grand', currentYear - 60, previousWealth, countryCode);
      previousWealth = generatedAncestors.grand.passedDown;

      // Parents (~1990)
      generatedAncestors.parent = generateAncestor('parent', currentYear - 30, previousWealth, countryCode);

      setAncestors(generatedAncestors);
      setIsGenerating(false);
    }, 1500);
  };

  // Calculate total inherited wealth
  const totalLegacy = ancestors
    ? Object.values(ancestors).reduce((sum, a) => sum + a.passedDown, 0)
    : 0;

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.3)',
                  '0 0 40px rgba(245, 158, 11, 0.5)',
                  '0 0 20px rgba(245, 158, 11, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🏛️</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ancestor Mode</h2>
              <p className="text-slate-400">Discover how your ancestors' choices shaped your legacy</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateAncestors}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {ancestors ? 'Regenerate' : 'Generate History'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {!ancestors ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <span className="text-6xl block mb-4">🌳</span>
          <h3 className="text-xl font-bold text-white mb-2">Explore Your Family History</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Generate a simulated family history to see how decisions across generations might have led to your current financial situation.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateAncestors}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium"
          >
            Discover Your Ancestors
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Legacy summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">4</div>
              <div className="text-slate-400 text-sm">Generations</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xl font-bold text-emerald-400">
                {formatCurrency(totalLegacy, currency)}
              </div>
              <div className="text-slate-400 text-sm">Total Legacy</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xl font-bold text-purple-400">
                {formatCurrency(currentNetWorth, currency)}
              </div>
              <div className="text-slate-400 text-sm">Your Net Worth</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xl font-bold text-white">
                {Math.round((currentNetWorth / totalLegacy) * 100) || 0}%
              </div>
              <div className="text-slate-400 text-sm">Growth from Legacy</div>
            </div>
          </motion.div>

          {/* Family tree */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <AncestorCard
              ancestor={ancestors.greatgreat}
              isExpanded={expandedAncestor === 'greatgreat'}
              onToggle={() => setExpandedAncestor(expandedAncestor === 'greatgreat' ? null : 'greatgreat')}
              currency={currency}
            />
            <TreeConnector />
            <AncestorCard
              ancestor={ancestors.great}
              isExpanded={expandedAncestor === 'great'}
              onToggle={() => setExpandedAncestor(expandedAncestor === 'great' ? null : 'great')}
              currency={currency}
            />
            <TreeConnector />
            <AncestorCard
              ancestor={ancestors.grand}
              isExpanded={expandedAncestor === 'grand'}
              onToggle={() => setExpandedAncestor(expandedAncestor === 'grand' ? null : 'grand')}
              currency={currency}
            />
            <TreeConnector />
            <AncestorCard
              ancestor={ancestors.parent}
              isExpanded={expandedAncestor === 'parent'}
              onToggle={() => setExpandedAncestor(expandedAncestor === 'parent' ? null : 'parent')}
              currency={currency}
            />
            <TreeConnector />

            {/* You */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 bg-gradient-to-r from-seedling-600 to-emerald-700"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-3xl">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">You</h3>
                  <p className="text-white/70">Present Day • The Legacy Continues</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-white/70 text-sm">Current Net Worth</div>
                  <div className="text-white font-bold text-xl">
                    {formatCurrency(currentNetWorth, currency)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Legacy Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-xl">💡</span>
                <span>Your ancestors' decisions compounded over {Math.round((currentYear - ancestors.greatgreat.birthYear))} years</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-xl">📈</span>
                <span>Average wealth growth: {Math.round(((currentNetWorth / (ancestors.greatgreat.wealthAtPeak || 1)) ** (1/4) - 1) * 100)}% per generation</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-xl">🎯</span>
                <span>Most impactful decision: {ancestors.grand.decisions[0]?.choice || 'Career choice'}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-3 text-sm text-slate-500"
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          This is a simulated family history based on historical economic data and statistical patterns.
          Your actual family history may be very different. Use this as a storytelling tool to understand
          how generational wealth compounds over time.
        </p>
      </motion.div>
    </div>
  );
};

export default AncestorMode;
