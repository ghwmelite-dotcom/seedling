import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Story templates for different life phases and wealth levels
const STORY_TEMPLATES = {
  childhood: [
    "Born into a family that valued {values}, {name} grew up in {location} during the {era}.",
    "{name} spent their early years {activity}, developing a natural curiosity for {interest}.",
    "As a child, {name} would often {childhood_memory}, a habit that would shape their future.",
  ],
  education: [
    "At {age}, {name} pursued {education} at {institution}, graduating with honors in {field}.",
    "Education became {name}'s passport to opportunity, studying {field} while working part-time.",
    "{name} chose the unconventional path of {education}, which opened unexpected doors.",
  ],
  career: [
    "Their career began humbly at {first_job}, but {name}'s determination was unstoppable.",
    "By {age}, {name} had risen to {position} at {company}, earning {salary} annually.",
    "{name} took a leap of faith, founding {business} which would change everything.",
  ],
  wealth_building: [
    "Following the family tradition of {habit}, {name} invested {investment_style}.",
    "The compound growth from decades of disciplined saving transformed {name}'s {amount} into generational wealth.",
    "{name} understood what their {ancestor} had taught: small seeds grow into mighty oaks.",
  ],
  legacy: [
    "At {age}, {name} passed down not just {amount}, but a philosophy of {philosophy}.",
    "{name}'s greatest gift wasn't the inheritance—it was the financial wisdom shared at family dinners.",
    "The {family_name} legacy continued, as {name} ensured the next generation was prepared.",
  ],
  milestone: [
    "The day {name} hit {milestone} was celebrated with {celebration}—a testament to years of discipline.",
    "Reaching {milestone} wasn't luck. It was {years} years of {habit} compounding relentlessly.",
    "When the portfolio crossed {milestone}, {name} remembered starting with just {starting_amount}.",
  ],
};

// Character traits based on wealth trajectories
const TRAITS = {
  aggressive_saver: ['disciplined', 'frugal', 'strategic', 'patient', 'visionary'],
  moderate: ['balanced', 'practical', 'thoughtful', 'steady', 'wise'],
  spender: ['generous', 'experiential', 'present-focused', 'adventurous', 'spontaneous'],
};

// Era names for different time periods
const getEra = (year) => {
  if (year < 2030) return 'the digital revolution';
  if (year < 2040) return 'the AI renaissance';
  if (year < 2050) return 'the sustainable transition';
  if (year < 2060) return 'the space age';
  if (year < 2080) return 'the quantum era';
  return 'the post-scarcity age';
};

// Generate a name for descendants
const generateName = (generation, gender = null) => {
  const maleNames = ['Alexander', 'Benjamin', 'Christopher', 'David', 'Ethan', 'Felix', 'Gabriel', 'Henry', 'Isaac', 'James', 'Kai', 'Leo', 'Marcus', 'Nathan', 'Oliver', 'Phoenix', 'Quinn', 'Rafael', 'Sebastian', 'Theodore'];
  const femaleNames = ['Aurora', 'Beatrice', 'Clara', 'Diana', 'Eleanor', 'Freya', 'Grace', 'Harper', 'Iris', 'Jasmine', 'Katherine', 'Luna', 'Maya', 'Nora', 'Olivia', 'Penelope', 'Quinn', 'Rosa', 'Sophia', 'Victoria'];

  const useGender = gender || (Math.random() > 0.5 ? 'male' : 'female');
  const names = useGender === 'male' ? maleNames : femaleNames;
  const seed = generation * 7 + (useGender === 'male' ? 3 : 11);
  return names[seed % names.length];
};

// Generate location based on era
const generateLocation = (year) => {
  const locations = {
    early: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Denver', 'Chicago'],
    mid: ['Neo Tokyo', 'Singapore Prime', 'Dubai Heights', 'London Central', 'Berlin Hub'],
    late: ['Mars Colony Alpha', 'Orbital Station Artemis', 'New Auckland', 'Cascadia Metro', 'Sahara Green City'],
  };

  if (year < 2040) return locations.early[Math.floor(Math.random() * locations.early.length)];
  if (year < 2070) return locations.mid[Math.floor(Math.random() * locations.mid.length)];
  return locations.late[Math.floor(Math.random() * locations.late.length)];
};

// Generate a complete story for a family member
const generateStory = (member, generation, simulation, currency) => {
  const baseYear = new Date().getFullYear();
  const birthYear = baseYear + (generation * 25);
  const currentAge = member.age || 30 + (generation * 5);
  const netWorth = member.netWorth || 0;
  const name = member.name || generateName(generation);

  const stories = [];
  const era = getEra(birthYear);
  const location = generateLocation(birthYear);

  // Childhood story
  const childhoodTemplate = STORY_TEMPLATES.childhood[generation % STORY_TEMPLATES.childhood.length];
  stories.push({
    phase: 'Early Years',
    year: birthYear,
    age: '0-18',
    text: childhoodTemplate
      .replace('{name}', name)
      .replace('{values}', 'financial wisdom and perseverance')
      .replace('{location}', location)
      .replace('{era}', era)
      .replace('{activity}', 'learning about compound interest')
      .replace('{interest}', 'building wealth')
      .replace('{childhood_memory}', 'track their allowance in a notebook'),
    icon: '👶',
  });

  // Education story
  const eduTemplate = STORY_TEMPLATES.education[generation % STORY_TEMPLATES.education.length];
  const fields = ['Financial Engineering', 'Sustainable Technology', 'Quantum Computing', 'Biotech Innovation', 'Space Economics'];
  stories.push({
    phase: 'Education',
    year: birthYear + 18,
    age: '18-25',
    text: eduTemplate
      .replace('{name}', name)
      .replace('{age}', '18')
      .replace('{education}', 'higher education')
      .replace('{institution}', 'a prestigious university')
      .replace('{field}', fields[generation % fields.length]),
    icon: '🎓',
  });

  // Career story
  const careerTemplate = STORY_TEMPLATES.career[generation % STORY_TEMPLATES.career.length];
  const positions = ['Chief Innovation Officer', 'Founding Partner', 'Portfolio Director', 'Venture Lead', 'Strategy Architect'];
  stories.push({
    phase: 'Career',
    year: birthYear + 25,
    age: '25-45',
    text: careerTemplate
      .replace('{name}', name)
      .replace('{age}', '35')
      .replace('{first_job}', 'a small startup')
      .replace('{position}', positions[generation % positions.length])
      .replace('{company}', 'a leading firm')
      .replace('{salary}', formatCurrency(netWorth * 0.08, currency))
      .replace('{business}', `${name}'s Ventures`),
    icon: '💼',
  });

  // Wealth building story
  const wealthTemplate = STORY_TEMPLATES.wealth_building[generation % STORY_TEMPLATES.wealth_building.length];
  stories.push({
    phase: 'Wealth Building',
    year: birthYear + 40,
    age: '40-60',
    text: wealthTemplate
      .replace('{name}', name)
      .replace('{habit}', 'consistent investing')
      .replace('{investment_style}', 'in diversified index funds and emerging technologies')
      .replace('{amount}', formatCurrency(netWorth * 0.3, currency))
      .replace('{ancestor}', generation > 0 ? 'parents' : 'mentors'),
    icon: '📈',
  });

  // Legacy story
  if (netWorth > 100000) {
    const legacyTemplate = STORY_TEMPLATES.legacy[generation % STORY_TEMPLATES.legacy.length];
    stories.push({
      phase: 'Legacy',
      year: birthYear + 60,
      age: '60+',
      text: legacyTemplate
        .replace('{name}', name)
        .replace('{age}', '65')
        .replace('{amount}', formatCurrency(netWorth, currency))
        .replace('{philosophy}', 'abundance through discipline')
        .replace('{family_name}', 'family'),
      icon: '🌳',
    });
  }

  // Milestone achievements
  const milestones = [10000, 100000, 500000, 1000000, 5000000, 10000000];
  const achievedMilestones = milestones.filter(m => netWorth >= m);

  if (achievedMilestones.length > 0) {
    const topMilestone = achievedMilestones[achievedMilestones.length - 1];
    const milestoneTemplate = STORY_TEMPLATES.milestone[generation % STORY_TEMPLATES.milestone.length];
    stories.push({
      phase: 'Milestone',
      year: birthYear + 45,
      age: 'Achievement',
      text: milestoneTemplate
        .replace('{name}', name)
        .replace('{milestone}', formatCurrency(topMilestone, currency))
        .replace('{celebration}', 'quiet gratitude and a family gathering')
        .replace('{years}', '20+')
        .replace('{habit}', 'disciplined saving')
        .replace('{starting_amount}', formatCurrency(topMilestone * 0.01, currency)),
      icon: '🏆',
      highlight: true,
    });
  }

  return {
    name,
    generation,
    birthYear,
    netWorth,
    location,
    era,
    stories,
  };
};

// Typewriter effect hook
const useTypewriter = (text, speed = 30, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

// Individual story card component
const StoryCard = ({ story, index, isActive, onComplete }) => {
  const { displayedText, isComplete } = useTypewriter(story.text, 20, isActive);

  useEffect(() => {
    if (isComplete && onComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`relative p-6 rounded-2xl border transition-all duration-500 ${
        story.highlight
          ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/40'
          : 'bg-slate-800/50 border-slate-700/50'
      } ${isActive ? 'ring-2 ring-seedling-500/50' : ''}`}
    >
      {/* Phase badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{story.icon}</span>
          <div>
            <div className="text-white font-bold">{story.phase}</div>
            <div className="text-slate-400 text-sm">Age {story.age}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-seedling-400 font-mono text-sm">{story.year}</div>
        </div>
      </div>

      {/* Story text with typewriter effect */}
      <p className="text-slate-300 leading-relaxed min-h-[4rem]">
        {isActive ? displayedText : story.text}
        {isActive && !isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-2 h-5 bg-seedling-400 ml-1 align-middle"
          />
        )}
      </p>

      {/* Decorative elements */}
      {story.highlight && (
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Character portrait component
const CharacterPortrait = ({ chronicle, isSelected }) => {
  const generationColors = [
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
  ];

  const colorClass = generationColors[chronicle.generation % generationColors.length];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-seedling-400 ring-offset-2 ring-offset-slate-900' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
        <span className="text-3xl font-bold text-white">
          {chronicle.name.charAt(0)}
        </span>
      </div>

      {/* Generation badge */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
        <span className="text-xs font-bold text-seedling-400">G{chronicle.generation + 1}</span>
      </div>

      {/* Name */}
      <div className="mt-2 text-center">
        <div className="text-white text-sm font-medium truncate max-w-[80px]">{chronicle.name}</div>
        <div className="text-slate-500 text-xs">{chronicle.birthYear}</div>
      </div>
    </motion.div>
  );
};

// Main Family Chronicles component
const FamilyChronicles = () => {
  const { simulation, currency } = useStore();
  const [chronicles, setChronicles] = useState([]);
  const [selectedChronicle, setSelectedChronicle] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate chronicles from simulation data
  const generateChronicles = useCallback(() => {
    if (!simulation?.scenario?.tree) return;

    setIsGenerating(true);

    // Extract family members from tree
    const extractMembers = (node, generation = 0, members = []) => {
      if (!node) return members;

      members.push({
        ...node,
        generation,
      });

      if (node.children) {
        node.children.forEach(child => {
          extractMembers(child, generation + 1, members);
        });
      }

      return members;
    };

    const members = extractMembers(simulation.scenario.tree);

    // Generate chronicle for each member
    setTimeout(() => {
      const newChronicles = members.map((member, index) =>
        generateStory(member, member.generation, simulation, currency)
      );

      setChronicles(newChronicles);
      if (newChronicles.length > 0) {
        setSelectedChronicle(newChronicles[0]);
      }
      setIsGenerating(false);
    }, 1000);
  }, [simulation, currency]);

  // Auto-generate on simulation change
  useEffect(() => {
    if (simulation) {
      generateChronicles();
    }
  }, [simulation, generateChronicles]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !selectedChronicle) return;

    const timer = setTimeout(() => {
      if (activeStoryIndex < selectedChronicle.stories.length - 1) {
        setActiveStoryIndex(prev => prev + 1);
      } else {
        // Move to next character
        const currentIndex = chronicles.findIndex(c => c.name === selectedChronicle.name);
        if (currentIndex < chronicles.length - 1) {
          setSelectedChronicle(chronicles[currentIndex + 1]);
          setActiveStoryIndex(0);
        } else {
          setIsAutoPlaying(false);
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, activeStoryIndex, selectedChronicle, chronicles]);

  // No simulation state
  if (!simulation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <span className="text-4xl">📖</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Family Chronicles</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Run a simulation to generate AI-powered narrative stories about your descendants' lives, achievements, and the legacy they build.
        </p>
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Run a simulation to begin</span>
        </div>
      </motion.div>
    );
  }

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                  '0 0 40px rgba(168, 85, 247, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">📖</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Family Chronicles</h2>
              <p className="text-slate-400">AI-generated stories of your descendants</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Regenerate button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateChronicles}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <motion.svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={isGenerating ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </motion.button>

            {/* Auto-play toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                isAutoPlaying
                  ? 'bg-seedling-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:text-white'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auto-Play
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Character selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Family Members</h3>

        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="flex items-center gap-3"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400">Generating family stories...</span>
            </motion.div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-2">
            {chronicles.map((chronicle, index) => (
              <div
                key={chronicle.name + index}
                onClick={() => {
                  setSelectedChronicle(chronicle);
                  setActiveStoryIndex(0);
                }}
              >
                <CharacterPortrait
                  chronicle={chronicle}
                  isSelected={selectedChronicle?.name === chronicle.name}
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Selected character's story */}
      <AnimatePresence mode="wait">
        {selectedChronicle && (
          <motion.div
            key={selectedChronicle.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            {/* Character header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{selectedChronicle.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedChronicle.name}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400">Generation {selectedChronicle.generation + 1}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Born {selectedChronicle.birthYear}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-seedling-400">{formatCurrency(selectedChronicle.netWorth, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-slate-400 text-sm">Location</div>
                <div className="text-white font-medium">{selectedChronicle.location}</div>
                <div className="text-purple-400 text-sm">{selectedChronicle.era}</div>
              </div>
            </div>

            {/* Story navigation */}
            <div className="flex items-center gap-2 mb-6">
              {selectedChronicle.stories.map((story, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveStoryIndex(index)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    index === activeStoryIndex
                      ? 'bg-seedling-500 text-white'
                      : index < activeStoryIndex
                      ? 'bg-seedling-500/20 text-seedling-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  <span className="text-lg">{story.icon}</span>
                </motion.button>
              ))}
            </div>

            {/* Story cards */}
            <div className="grid gap-4">
              {selectedChronicle.stories.map((story, index) => (
                <AnimatePresence key={index}>
                  {index <= activeStoryIndex && (
                    <StoryCard
                      story={story}
                      index={index}
                      isActive={index === activeStoryIndex}
                      onComplete={() => {
                        if (isAutoPlaying && index === activeStoryIndex) {
                          // Auto-advance handled by useEffect
                        }
                      }}
                    />
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveStoryIndex(Math.max(0, activeStoryIndex - 1))}
                disabled={activeStoryIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </motion.button>

              <div className="text-slate-500 text-sm">
                {activeStoryIndex + 1} of {selectedChronicle.stories.length} chapters
              </div>

              <motion.button
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveStoryIndex(Math.min(selectedChronicle.stories.length - 1, activeStoryIndex + 1))}
                disabled={activeStoryIndex === selectedChronicle.stories.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-seedling-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story stats */}
      {chronicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-white">{chronicles.length}</div>
            <div className="text-slate-400 text-sm">Family Members</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {chronicles.reduce((sum, c) => sum + c.stories.length, 0)}
            </div>
            <div className="text-slate-400 text-sm">Story Chapters</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {Math.max(...chronicles.map(c => c.generation)) + 1}
            </div>
            <div className="text-slate-400 text-sm">Generations</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-seedling-400">
              {formatCurrency(chronicles.reduce((sum, c) => sum + c.netWorth, 0), currency)}
            </div>
            <div className="text-slate-400 text-sm">Total Legacy</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FamilyChronicles;
