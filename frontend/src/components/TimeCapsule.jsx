import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Capsule types with different unlock conditions
const CAPSULE_TYPES = [
  { id: 'milestone', label: 'Wealth Milestone', icon: '💰', description: 'Unlocks when a net worth target is reached' },
  { id: 'date', label: 'Future Date', icon: '📅', description: 'Unlocks on a specific date' },
  { id: 'generation', label: 'Generation', icon: '👨‍👩‍👧‍👦', description: 'Unlocks for a specific generation' },
  { id: 'achievement', label: 'Achievement', icon: '🏆', description: 'Unlocks when an achievement is earned' },
];

// Predefined milestone amounts
const MILESTONE_AMOUNTS = [10000, 50000, 100000, 250000, 500000, 1000000, 5000000, 10000000];

// Capsule card component
const CapsuleCard = ({ capsule, onOpen, onDelete, currentNetWorth, currentGeneration }) => {
  const isUnlocked = (() => {
    switch (capsule.unlockType) {
      case 'milestone':
        return currentNetWorth >= capsule.unlockValue;
      case 'date':
        return new Date() >= new Date(capsule.unlockValue);
      case 'generation':
        return currentGeneration >= capsule.unlockValue;
      default:
        return false;
    }
  })();

  const getProgressText = () => {
    switch (capsule.unlockType) {
      case 'milestone':
        const progress = Math.min(100, (currentNetWorth / capsule.unlockValue) * 100);
        return `${progress.toFixed(0)}% • ${formatCurrency(capsule.unlockValue, 'USD')}`;
      case 'date':
        const daysLeft = Math.max(0, Math.ceil((new Date(capsule.unlockValue) - new Date()) / (1000 * 60 * 60 * 24)));
        return daysLeft > 0 ? `${daysLeft} days remaining` : 'Ready to open!';
      case 'generation':
        return `Generation ${capsule.unlockValue}`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-6 rounded-2xl border transition-all overflow-hidden ${
        isUnlocked
          ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/40'
          : capsule.isOpened
          ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
          : 'bg-slate-800/50 border-slate-700/50'
      }`}
    >
      {/* Glow effect for unlocked */}
      {isUnlocked && !capsule.isOpened && (
        <motion.div
          className="absolute inset-0 bg-amber-500/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isUnlocked
                ? 'bg-amber-500/30'
                : 'bg-slate-700/50'
            }`}
            animate={isUnlocked && !capsule.isOpened ? {
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            } : {}}
            transition={{ duration: 1, repeat: isUnlocked ? Infinity : 0 }}
          >
            <span className="text-2xl">{capsule.isOpened ? '📭' : isUnlocked ? '✉️' : '🔒'}</span>
          </motion.div>
          <div>
            <div className="text-white font-bold">{capsule.title}</div>
            <div className="text-slate-400 text-sm flex items-center gap-1">
              <span>{CAPSULE_TYPES.find(t => t.id === capsule.unlockType)?.icon}</span>
              {getProgressText()}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(capsule.id)}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      </div>

      {/* Content preview or message */}
      <div className="mb-4">
        {capsule.isOpened ? (
          <div className="p-4 rounded-xl bg-slate-900/50">
            <p className="text-slate-300 whitespace-pre-wrap">{capsule.message}</p>
            {capsule.mediaType && (
              <div className="mt-3 text-slate-500 text-sm flex items-center gap-2">
                <span>{capsule.mediaType === 'audio' ? '🎤' : capsule.mediaType === 'video' ? '📹' : '📎'}</span>
                {capsule.mediaType} attached
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/50 text-center">
            <span className="text-4xl mb-2 block">{isUnlocked ? '🎁' : '🔐'}</span>
            <p className="text-slate-400 text-sm">
              {isUnlocked ? 'Ready to be opened!' : 'Contents sealed until unlock condition is met'}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar for milestones */}
      {capsule.unlockType === 'milestone' && !capsule.isOpened && (
        <div className="mb-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentNetWorth / capsule.unlockValue) * 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {/* Created date */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Created {new Date(capsule.createdAt).toLocaleDateString()}</span>
        {capsule.isOpened && <span>Opened {new Date(capsule.openedAt).toLocaleDateString()}</span>}
      </div>

      {/* Open button */}
      {isUnlocked && !capsule.isOpened && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpen(capsule.id)}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/30"
        >
          Open Time Capsule
        </motion.button>
      )}
    </motion.div>
  );
};

// Create capsule modal
const CreateCapsuleModal = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockType, setUnlockType] = useState('milestone');
  const [unlockValue, setUnlockValue] = useState(100000);
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockGeneration, setUnlockGeneration] = useState(2);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Handle create
  const handleCreate = () => {
    const capsule = {
      id: Date.now().toString(),
      title,
      message,
      unlockType,
      unlockValue: unlockType === 'date' ? unlockDate : unlockType === 'generation' ? unlockGeneration : unlockValue,
      mediaType: audioBlob ? 'audio' : null,
      createdAt: new Date().toISOString(),
      isOpened: false,
    };

    onCreate(capsule);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setMessage('');
    setUnlockType('milestone');
    setUnlockValue(100000);
    setUnlockDate('');
    setUnlockGeneration(2);
    setAudioBlob(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Time Capsule</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-seedling-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-2">Capsule Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Message for my grandchildren..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-seedling-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-2">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message to the future..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-seedling-500 resize-none"
              />
            </div>

            {/* Audio recording */}
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-2">Voice Message (Optional)</label>
              <div className="flex items-center gap-3">
                {!audioBlob ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                      isRecording
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-white"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Record Voice Message
                      </>
                    )}
                  </motion.button>
                ) : (
                  <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                    <span className="text-seedling-400">🎤 Recording saved</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setAudioBlob(null)}
                      className="ml-auto text-red-400"
                    >
                      Delete
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Unlock condition */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-3">Unlock Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {CAPSULE_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUnlockType(type.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      unlockType === type.id
                        ? 'bg-seedling-500/20 border-2 border-seedling-500'
                        : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <div className="text-white font-medium">{type.label}</div>
                    <div className="text-slate-400 text-xs">{type.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Unlock value based on type */}
            {unlockType === 'milestone' && (
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-3">Target Net Worth</label>
                <div className="grid grid-cols-4 gap-2">
                  {MILESTONE_AMOUNTS.map((amount) => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUnlockValue(amount)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        unlockValue === amount
                          ? 'bg-seedling-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {formatCurrency(amount, 'USD')}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {unlockType === 'date' && (
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">Unlock Date</label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-seedling-500"
                />
              </div>
            )}

            {unlockType === 'generation' && (
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">Target Generation</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={unlockGeneration}
                    onChange={(e) => setUnlockGeneration(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-bold text-xl w-8">{unlockGeneration}</span>
                </div>
                <div className="text-slate-500 text-sm mt-2">
                  {unlockGeneration === 2 && 'Your children'}
                  {unlockGeneration === 3 && 'Your grandchildren'}
                  {unlockGeneration === 4 && 'Your great-grandchildren'}
                  {unlockGeneration >= 5 && `Generation ${unlockGeneration}`}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                  <span className="text-2xl">💌</span>
                </div>
                <div>
                  <div className="text-white font-bold">{title || 'Untitled Capsule'}</div>
                  <div className="text-slate-400 text-sm">
                    {CAPSULE_TYPES.find(t => t.id === unlockType)?.icon}{' '}
                    {unlockType === 'milestone' && formatCurrency(unlockValue, 'USD')}
                    {unlockType === 'date' && new Date(unlockDate).toLocaleDateString()}
                    {unlockType === 'generation' && `Generation ${unlockGeneration}`}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 mb-4">
                <p className="text-slate-300 whitespace-pre-wrap line-clamp-4">
                  {message || 'No message'}
                </p>
              </div>

              {audioBlob && (
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <span>🎤</span> Voice message attached
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-800/50 text-center">
              <span className="text-4xl block mb-2">🔐</span>
              <p className="text-slate-400 text-sm">
                This capsule will be locked until the unlock condition is met
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
            disabled={step === 1 && (!title || !message)}
            className="px-6 py-2 rounded-xl bg-seedling-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < 3 ? 'Continue' : 'Create Capsule'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Opening animation modal
const OpeningAnimation = ({ capsule, onComplete }) => {
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('unlocking'), 1000),
      setTimeout(() => setPhase('opening'), 2500),
      setTimeout(() => setPhase('revealed'), 4000),
      setTimeout(() => onComplete(), 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <motion.span
                className="text-8xl block"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🔐
              </motion.span>
              <p className="text-white text-xl mt-4">Unlocking time capsule...</p>
            </motion.div>
          )}

          {phase === 'unlocking' && (
            <motion.div
              key="unlocking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="text-8xl block"
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                ✨
              </motion.span>
              <p className="text-amber-400 text-xl mt-4">From the past...</p>
            </motion.div>
          )}

          {phase === 'opening' && (
            <motion.div
              key="opening"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="text-9xl block"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5 }}
              >
                📬
              </motion.span>
              <p className="text-white text-2xl mt-4 font-bold">{capsule.title}</p>
            </motion.div>
          )}

          {phase === 'revealed' && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md"
            >
              <span className="text-6xl block mb-4">💌</span>
              <div className="bg-slate-900/80 rounded-xl p-6 text-left">
                <p className="text-slate-300 whitespace-pre-wrap">{capsule.message}</p>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Created on {new Date(capsule.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main Time Capsule Component
const TimeCapsule = () => {
  const { simulation, currency } = useStore();
  const [capsules, setCapsules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openingCapsule, setOpeningCapsule] = useState(null);
  const [filter, setFilter] = useState('all');

  // Load capsules from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seedling_time_capsules');
    if (saved) {
      setCapsules(JSON.parse(saved));
    }
  }, []);

  // Save capsules to localStorage
  useEffect(() => {
    localStorage.setItem('seedling_time_capsules', JSON.stringify(capsules));
  }, [capsules]);

  const currentNetWorth = simulation?.scenario?.tree?.netWorth || 0;
  const currentGeneration = simulation?.scenario?.tree?.generation || 1;

  // Handle create capsule
  const handleCreate = (capsule) => {
    setCapsules([capsule, ...capsules]);
  };

  // Handle open capsule
  const handleOpen = (id) => {
    const capsule = capsules.find(c => c.id === id);
    if (capsule) {
      setOpeningCapsule(capsule);
    }
  };

  // Complete opening animation
  const handleOpenComplete = () => {
    setCapsules(capsules.map(c =>
      c.id === openingCapsule.id
        ? { ...c, isOpened: true, openedAt: new Date().toISOString() }
        : c
    ));
    setOpeningCapsule(null);
  };

  // Handle delete capsule
  const handleDelete = (id) => {
    setCapsules(capsules.filter(c => c.id !== id));
  };

  // Filter capsules
  const filteredCapsules = capsules.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'locked') return !c.isOpened;
    if (filter === 'opened') return c.isOpened;
    return true;
  });

  const unlockedCount = capsules.filter(c => {
    if (c.isOpened) return false;
    switch (c.unlockType) {
      case 'milestone': return currentNetWorth >= c.unlockValue;
      case 'date': return new Date() >= new Date(c.unlockValue);
      case 'generation': return currentGeneration >= c.unlockValue;
      default: return false;
    }
  }).length;

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.3)',
                  '0 0 40px rgba(245, 158, 11, 0.5)',
                  '0 0 20px rgba(245, 158, 11, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">💌</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Digital Time Capsule</h2>
              <p className="text-slate-400">Messages sealed for future generations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unlockedCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium"
              >
                {unlockedCount} ready to open
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-seedling-500 text-white font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Capsule
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white">{capsules.length}</div>
          <div className="text-slate-400 text-sm">Total Capsules</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{unlockedCount}</div>
          <div className="text-slate-400 text-sm">Ready to Open</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {capsules.filter(c => !c.isOpened).length}
          </div>
          <div className="text-slate-400 text-sm">Still Locked</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-seedling-400">
            {capsules.filter(c => c.isOpened).length}
          </div>
          <div className="text-slate-400 text-sm">Opened</div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'locked', 'opened'].map((f) => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl capitalize transition-colors ${
              filter === f
                ? 'bg-seedling-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Capsules grid */}
      {filteredCapsules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-xl font-bold text-white mb-2">No Time Capsules Yet</h3>
          <p className="text-slate-400 mb-4">
            Create your first time capsule to leave messages for future generations
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-seedling-500 text-white font-medium"
          >
            Create Your First Capsule
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <AnimatePresence>
            {filteredCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onOpen={handleOpen}
                onDelete={handleDelete}
                currentNetWorth={currentNetWorth}
                currentGeneration={currentGeneration}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCapsuleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Opening animation */}
      <AnimatePresence>
        {openingCapsule && (
          <OpeningAnimation
            capsule={openingCapsule}
            onComplete={handleOpenComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsule;
