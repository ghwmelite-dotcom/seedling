import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Voice command patterns and their handlers
const COMMAND_PATTERNS = [
  {
    patterns: [
      /what (?:if|happens if) i (?:save|invest|put away) \$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:more\s+)?(?:per|a|each)?\s*month/i,
      /(?:save|invest) \$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:monthly|per month|a month)/i,
    ],
    action: 'SET_MONTHLY_SAVINGS',
    extract: (match) => ({ monthlySavings: parseFloat(match[1].replace(/,/g, '')) }),
    response: (data) => `I'll simulate saving $${data.monthlySavings.toLocaleString()} per month.`,
  },
  {
    patterns: [
      /(?:start(?:ing)?\s+)?(?:with|at)\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(?:initial|starting)\s+(?:amount|savings|net worth)\s+(?:of\s+)?\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    ],
    action: 'SET_STARTING_AMOUNT',
    extract: (match) => ({ startingAmount: parseFloat(match[1].replace(/,/g, '')) }),
    response: (data) => `Setting starting net worth to $${data.startingAmount.toLocaleString()}.`,
  },
  {
    patterns: [
      /(?:i(?:'m| am)|i'll be|start(?:ing)? at)\s+(\d+)\s*(?:years?)?\s*old/i,
      /(?:age|at age)\s+(\d+)/i,
    ],
    action: 'SET_AGE',
    extract: (match) => ({ age: parseInt(match[1]) }),
    response: (data) => `Setting your starting age to ${data.age}.`,
  },
  {
    patterns: [
      /(?:show|simulate|run)\s+(\d+)\s*generations?/i,
      /(\d+)\s*generations?\s+(?:simulation|forecast)/i,
    ],
    action: 'SET_GENERATIONS',
    extract: (match) => ({ generations: parseInt(match[1]) }),
    response: (data) => `Simulating ${data.generations} generations into the future.`,
  },
  {
    patterns: [
      /(?:my|annual|yearly)\s+(?:income|salary)\s+(?:is|of)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(?:i|i'll)\s+(?:earn|make)\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per|a|each)?\s*year/i,
    ],
    action: 'SET_INCOME',
    extract: (match) => ({ income: parseFloat(match[1].replace(/,/g, '')) }),
    response: (data) => `Setting annual income to $${data.income.toLocaleString()}.`,
  },
  {
    patterns: [
      /(?:savings?\s+rate|save)\s+(\d+)%/i,
      /(\d+)%\s+savings?\s+rate/i,
    ],
    action: 'SET_SAVINGS_RATE',
    extract: (match) => ({ savingsRate: parseInt(match[1]) }),
    response: (data) => `Setting savings rate to ${data.savingsRate}%.`,
  },
  {
    patterns: [
      /(?:skip|quit|stop)\s+(?:the\s+)?(?:coffee|latte|avocado|eating out|subscription)/i,
      /(?:no|cut)\s+(?:more\s+)?(?:coffee|latte|avocado|eating out|subscription)/i,
    ],
    action: 'HABIT_CHANGE',
    extract: (match) => {
      const habit = match[0].toLowerCase();
      if (habit.includes('coffee') || habit.includes('latte')) return { habitSavings: 150, habitName: 'daily coffee' };
      if (habit.includes('avocado')) return { habitSavings: 100, habitName: 'avocado toast' };
      if (habit.includes('eating out')) return { habitSavings: 400, habitName: 'eating out' };
      if (habit.includes('subscription')) return { habitSavings: 50, habitName: 'subscriptions' };
      return { habitSavings: 100, habitName: 'small habit' };
    },
    response: (data) => `Skipping ${data.habitName} could save you $${data.habitSavings}/month!`,
  },
  {
    patterns: [
      /run\s+(?:the\s+)?simulation/i,
      /simulate\s+(?:my\s+)?(?:wealth|future|finances?)/i,
      /(?:start|begin|go)/i,
    ],
    action: 'RUN_SIMULATION',
    extract: () => ({}),
    response: () => `Running simulation now...`,
  },
  {
    patterns: [
      /(?:reset|clear|start over)/i,
    ],
    action: 'RESET',
    extract: () => ({}),
    response: () => `Resetting simulation parameters.`,
  },
  {
    patterns: [
      /(?:what|how much)\s+(?:will|would|could)\s+(?:i|we)\s+have/i,
      /(?:show|tell)\s+(?:me\s+)?(?:my|the)\s+(?:results?|projection|forecast)/i,
    ],
    action: 'SHOW_RESULTS',
    extract: () => ({}),
    response: () => `Here are your simulation results.`,
  },
];

// Audio visualizer component
const AudioVisualizer = ({ isListening, audioLevel }) => {
  const bars = 12;

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(bars)].map((_, i) => {
        const delay = i * 0.05;
        const height = isListening
          ? 20 + Math.sin((Date.now() / 100) + i) * 15 + (audioLevel * 30)
          : 4;

        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${isListening ? 'bg-seedling-400' : 'bg-slate-600'}`}
            animate={{ height }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
};

// Command suggestion chip
const CommandSuggestion = ({ command, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-600/50 hover:text-white transition-colors"
  >
    "{command}"
  </motion.button>
);

// Voice command history item
const HistoryItem = ({ command, response, timestamp, isSuccess }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-3 py-3 border-b border-slate-700/50 last:border-0"
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      isSuccess ? 'bg-seedling-500/20 text-seedling-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {isSuccess ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-white font-medium truncate">"{command}"</div>
      <div className="text-slate-400 text-sm">{response}</div>
      <div className="text-slate-500 text-xs mt-1">{timestamp}</div>
    </div>
  </motion.div>
);

// Main Voice Control Component
const VoiceControl = ({ onSimulationUpdate }) => {
  const { simulation, currency } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentParams, setCurrentParams] = useState({
    name: 'You',
    age: 30,
    income: 75000,
    savings: 10000,
    debt: 15000,
    education: 'bachelors',
    financial_literacy: 0.5,
    monthlyHabitChange: 200,
    generations: 4,
  });

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript(final);
        processCommand(final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Audio level monitoring
  useEffect(() => {
    if (!isListening) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const startAudioMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.error('Audio monitoring error:', err);
      }
    };

    startAudioMonitoring();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening]);

  // Process voice command
  const processCommand = useCallback((text) => {
    const normalizedText = text.toLowerCase().trim();
    let matched = false;
    let response = '';
    let isSuccess = false;

    for (const cmd of COMMAND_PATTERNS) {
      for (const pattern of cmd.patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          matched = true;
          const extractedData = cmd.extract(match);
          response = cmd.response(extractedData);
          isSuccess = true;

          // Update parameters based on action
          switch (cmd.action) {
            case 'SET_MONTHLY_SAVINGS':
              setCurrentParams(prev => ({ ...prev, monthlyHabitChange: extractedData.monthlySavings }));
              break;
            case 'SET_STARTING_AMOUNT':
              setCurrentParams(prev => ({ ...prev, savings: extractedData.startingAmount }));
              break;
            case 'SET_AGE':
              setCurrentParams(prev => ({ ...prev, age: extractedData.age }));
              break;
            case 'SET_GENERATIONS':
              setCurrentParams(prev => ({ ...prev, generations: extractedData.generations }));
              break;
            case 'SET_INCOME':
              setCurrentParams(prev => ({ ...prev, income: extractedData.income }));
              break;
            case 'SET_SAVINGS_RATE':
              // Convert savings rate to actual savings amount based on income
              setCurrentParams(prev => ({
                ...prev,
                savings: Math.round(prev.income * (extractedData.savingsRate / 100))
              }));
              break;
            case 'HABIT_CHANGE':
              setCurrentParams(prev => ({ ...prev, monthlyHabitChange: extractedData.habitSavings }));
              break;
            case 'RUN_SIMULATION':
              if (onSimulationUpdate) {
                onSimulationUpdate(currentParams);
              }
              break;
            case 'RESET':
              setCurrentParams({
                name: 'You',
                age: 30,
                income: 75000,
                savings: 10000,
                debt: 15000,
                education: 'bachelors',
                financial_literacy: 0.5,
                monthlyHabitChange: 200,
                generations: 4,
              });
              break;
            default:
              break;
          }
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      response = "I didn't understand that. Try saying something like 'Save $500 per month' or 'Run simulation'.";
      isSuccess = false;
    }

    // Add to history
    setCommandHistory(prev => [{
      command: text,
      response,
      isSuccess,
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));

    // Text-to-speech response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentParams, onSimulationUpdate]);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Process text input
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      processCommand(transcript);
      setTranscript('');
    }
  };

  // Suggested commands
  const suggestions = [
    "Save $500 per month",
    "What if I skip coffee",
    "Start at age 25",
    "Show 5 generations",
    "My income is $100,000",
    "Run simulation",
  ];

  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
          <span className="text-4xl">🎙️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Voice Control Unavailable</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Voice control requires a browser that supports the Web Speech API. Try using Chrome, Edge, or Safari.
        </p>
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
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-orange-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}
              animate={isListening ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                  '0 0 40px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                ]
              } : {}}
              transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
            >
              <span className="text-3xl">🎙️</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Voice Time Travel</h2>
              <p className="text-slate-400">Control simulations with natural language</p>
            </div>
          </div>

          {/* Listening toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-seedling-500 text-white shadow-lg shadow-seedling-500/30'
            }`}
          >
            {isListening ? (
              <>
                <motion.div
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                Listening...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Listening
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Audio visualizer and transcript */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <AudioVisualizer isListening={isListening} audioLevel={audioLevel} />

        {/* Transcript display */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/50 min-h-[60px]">
          {isListening ? (
            <div className="text-white">
              {transcript && <span className="text-seedling-400">{transcript}</span>}
              {interimTranscript && <span className="text-slate-400 ml-1">{interimTranscript}</span>}
              {!transcript && !interimTranscript && (
                <span className="text-slate-500 italic">Speak now...</span>
              )}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type a command..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-1 rounded-lg bg-seedling-500 text-white text-sm"
              >
                Send
              </motion.button>
            </form>
          )}
        </div>

        {/* Command suggestions */}
        <div className="mt-4">
          <div className="text-slate-400 text-sm mb-2">Try saying:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <CommandSuggestion
                key={i}
                command={suggestion}
                onClick={() => {
                  setTranscript(suggestion);
                  processCommand(suggestion);
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Current parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Current Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Age</div>
            <div className="text-white font-bold text-xl">{currentParams.age}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Current Savings</div>
            <div className="text-seedling-400 font-bold text-xl">
              {formatCurrency(currentParams.savings, currency)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Annual Income</div>
            <div className="text-white font-bold text-xl">
              {formatCurrency(currentParams.income, currency)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Current Debt</div>
            <div className="text-red-400 font-bold text-xl">{formatCurrency(currentParams.debt, currency)}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Monthly Habit Change</div>
            <div className="text-amber-400 font-bold text-xl">
              {formatCurrency(currentParams.monthlyHabitChange, currency)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50">
            <div className="text-slate-400 text-sm">Generations</div>
            <div className="text-white font-bold text-xl">{currentParams.generations}</div>
          </div>
        </div>

        {/* Run simulation button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSimulationUpdate && onSimulationUpdate(currentParams)}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-seedling-500 to-emerald-600 text-white font-semibold shadow-lg shadow-seedling-500/30"
        >
          Run Simulation with These Parameters
        </motion.button>
      </motion.div>

      {/* Command history */}
      {commandHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Command History</h3>
          <div className="max-h-64 overflow-y-auto">
            {commandHistory.map((item, index) => (
              <HistoryItem key={index} {...item} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceControl;
