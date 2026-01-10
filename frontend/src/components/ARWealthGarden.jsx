import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Tree growth stages based on net worth
const GROWTH_STAGES = [
  { minWorth: 0, stage: 'seed', emoji: '🌱', label: 'Seed', color: 'from-green-400 to-green-600' },
  { minWorth: 10000, stage: 'sprout', emoji: '🌿', label: 'Sprout', color: 'from-green-500 to-emerald-600' },
  { minWorth: 50000, stage: 'sapling', emoji: '🪴', label: 'Sapling', color: 'from-emerald-500 to-teal-600' },
  { minWorth: 100000, stage: 'young_tree', emoji: '🌳', label: 'Young Tree', color: 'from-teal-500 to-cyan-600' },
  { minWorth: 500000, stage: 'mature_tree', emoji: '🌲', label: 'Mature Tree', color: 'from-cyan-500 to-blue-600' },
  { minWorth: 1000000, stage: 'ancient_tree', emoji: '🏔️', label: 'Ancient Oak', color: 'from-blue-500 to-purple-600' },
  { minWorth: 5000000, stage: 'world_tree', emoji: '✨', label: 'World Tree', color: 'from-purple-500 to-pink-600' },
  { minWorth: 10000000, stage: 'cosmic_tree', emoji: '🌌', label: 'Cosmic Tree', color: 'from-pink-500 to-rose-600' },
];

// Get growth stage based on net worth
const getGrowthStage = (netWorth) => {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (netWorth >= GROWTH_STAGES[i].minWorth) {
      return GROWTH_STAGES[i];
    }
  }
  return GROWTH_STAGES[0];
};

// Particle system for magical effects
const MagicParticle = ({ delay, duration, size, color }) => (
  <motion.div
    className={`absolute rounded-full ${color}`}
    style={{ width: size, height: size }}
    initial={{
      opacity: 0,
      scale: 0,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100 - Math.random() * 100],
      x: [0, (Math.random() - 0.5) * 100],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// 3D Tree visualization component
const Tree3DView = ({ members, selectedMember, onSelectMember, isARMode }) => {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);

  // Handle rotation drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    setRotation(prev => prev + deltaX * 0.5);
    lastX.current = e.clientX;
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  // Auto-rotate when not dragging
  useEffect(() => {
    if (isDragging || isARMode) return;
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.2);
    }, 50);
    return () => clearInterval(interval);
  }, [isDragging, isARMode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseDown={handleMouseDown}
      style={{ perspective: '1000px' }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
        isARMode
          ? 'bg-transparent'
          : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
      }`}>
        {/* Stars in background */}
        {!isARMode && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Ground plane */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: isARMode
            ? 'transparent'
            : 'linear-gradient(to top, rgba(34, 197, 94, 0.3), transparent)',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Tree container with 3D rotation */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Render tree members in 3D space */}
        {members.map((member, index) => {
          const stage = getGrowthStage(member.netWorth);
          const angle = (index / members.length) * Math.PI * 2;
          const radius = 150 + member.generation * 50;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const y = -member.generation * 80;

          return (
            <motion.div
              key={index}
              className={`absolute cursor-pointer transition-all duration-300 ${
                selectedMember === index ? 'z-50' : 'z-10'
              }`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                transformStyle: 'preserve-3d',
              }}
              onClick={() => onSelectMember(index)}
              whileHover={{ scale: 1.2 }}
            >
              {/* Tree/Node visualization */}
              <motion.div
                className={`relative flex flex-col items-center`}
                animate={selectedMember === index ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 1, repeat: selectedMember === index ? Infinity : 0 }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 blur-xl opacity-50 bg-gradient-to-t ${stage.color} rounded-full scale-150`} />

                {/* Main tree icon */}
                <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-2xl`}>
                  <span className="text-4xl">{stage.emoji}</span>

                  {/* Leaves/particles */}
                  {member.netWorth > 100000 && [...Array(5)].map((_, i) => (
                    <MagicParticle
                      key={i}
                      delay={i * 0.3}
                      duration={2 + Math.random()}
                      size={6 + Math.random() * 4}
                      color="bg-seedling-400/60"
                    />
                  ))}
                </div>

                {/* Member info */}
                <div className="mt-2 text-center bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <div className="text-white text-sm font-medium">{member.name || `Gen ${member.generation + 1}`}</div>
                  <div className="text-seedling-400 text-xs font-mono">
                    {formatCurrency(member.netWorth, 'USD')}
                  </div>
                </div>

                {/* Connection line to parent */}
                {member.generation > 0 && (
                  <div className="absolute top-0 left-1/2 w-0.5 h-20 bg-gradient-to-b from-seedling-500/50 to-transparent -translate-y-full" />
                )}
              </motion.div>
            </motion.div>
          );
        })}

        {/* Central trunk */}
        <div className="absolute w-8 h-64 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 rounded-t-full"
          style={{ transform: 'translateY(100px)' }}
        />
      </div>

      {/* Floating UI elements */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-4 py-2"
        >
          <div className="text-slate-400 text-xs">Total Legacy</div>
          <div className="text-seedling-400 font-bold">
            {formatCurrency(members.reduce((sum, m) => sum + m.netWorth, 0), 'USD')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-4 py-2"
        >
          <div className="text-slate-400 text-xs">Generations</div>
          <div className="text-white font-bold">
            {Math.max(...members.map(m => m.generation)) + 1}
          </div>
        </motion.div>
      </div>

      {/* Drag instruction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
        Drag to rotate • Click nodes to inspect
      </motion.div>
    </div>
  );
};

// AR Camera View Component (simulated)
const ARCameraView = ({ onCapture, isActive }) => {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error('Camera error:', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-2xl">
        <div className="text-center">
          <span className="text-4xl mb-4 block">📷</span>
          <p className="text-slate-400">{error}</p>
          <p className="text-slate-500 text-sm mt-2">Using simulated AR mode instead</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* AR overlay grid */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* AR scan effect */}
      <motion.div
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-seedling-400 to-transparent"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Capture button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCapture}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-seedling-500" />
      </motion.button>
    </div>
  );
};

// Member detail panel
const MemberDetailPanel = ({ member, stage, onClose }) => {
  const { currency } = useStore();

  if (!member) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="glass-card p-6 w-80"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Tree Details</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      {/* Stage visualization */}
      <div className={`p-6 rounded-xl bg-gradient-to-br ${stage.color} mb-4`}>
        <div className="text-center">
          <span className="text-6xl block mb-2">{stage.emoji}</span>
          <div className="text-white font-bold text-xl">{stage.label}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Generation</span>
          <span className="text-white font-medium">{member.generation + 1}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Net Worth</span>
          <span className="text-seedling-400 font-medium">{formatCurrency(member.netWorth, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Growth Stage</span>
          <span className="text-white font-medium">{stage.stage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Age</span>
          <span className="text-white font-medium">{member.age || 'Unknown'}</span>
        </div>
      </div>

      {/* Progress to next stage */}
      {stage.minWorth < 10000000 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Next Stage</span>
            <span className="text-amber-400">
              {GROWTH_STAGES[GROWTH_STAGES.indexOf(stage) + 1]?.label || 'Max'}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stage.color}`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (member.netWorth / (GROWTH_STAGES[GROWTH_STAGES.indexOf(stage) + 1]?.minWorth || 10000000)) * 100)}%`
              }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Main AR Wealth Garden Component
const ARWealthGarden = () => {
  const { simulation, currency } = useStore();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isARMode, setIsARMode] = useState(false);
  const [showCapture, setShowCapture] = useState(false);

  // Extract members from simulation
  useEffect(() => {
    if (!simulation?.scenario?.tree) return;

    const extractMembers = (node, generation = 0, result = []) => {
      if (!node) return result;

      result.push({
        ...node,
        generation,
        name: node.name || `Generation ${generation + 1}`,
      });

      if (node.children) {
        node.children.forEach(child => {
          extractMembers(child, generation + 1, result);
        });
      }

      return result;
    };

    setMembers(extractMembers(simulation.scenario.tree));
  }, [simulation]);

  const handleCapture = () => {
    setShowCapture(true);
    setTimeout(() => setShowCapture(false), 2000);
  };

  // No simulation state
  if (!simulation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <span className="text-4xl">🌳</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">AR Wealth Garden</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Watch your family wealth tree grow in augmented reality. Run a simulation to plant your first seed and see it flourish across generations.
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

  const selectedMemberData = selectedMember !== null ? members[selectedMember] : null;
  const selectedStage = selectedMemberData ? getGrowthStage(selectedMemberData.netWorth) : null;

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.3)',
                  '0 0 40px rgba(34, 197, 94, 0.5)',
                  '0 0 20px rgba(34, 197, 94, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🌳</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">AR Wealth Garden</h2>
              <p className="text-slate-400">Your family tree in 3D space</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AR Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsARMode(!isARMode)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                isARMode
                  ? 'bg-seedling-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isARMode ? 'Exit AR' : 'AR Mode'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Growth stages legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white font-semibold">Growth Stages</span>
          <span className="text-slate-500 text-sm">• Based on net worth</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GROWTH_STAGES.map((stage, index) => (
            <motion.div
              key={stage.stage}
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${stage.color} flex items-center gap-2`}
            >
              <span>{stage.emoji}</span>
              <span className="text-white text-sm font-medium">{stage.label}</span>
              <span className="text-white/70 text-xs">
                {formatCurrency(stage.minWorth, currency)}+
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main view */}
      <div className="flex gap-6">
        {/* 3D Tree View or AR Camera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 glass-card overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isARMode ? (
              <motion.div
                key="ar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[500px]"
              >
                <ARCameraView onCapture={handleCapture} isActive={isARMode} />

                {/* Overlay trees in AR mode */}
                <div className="absolute inset-0 pointer-events-none">
                  <Tree3DView
                    members={members}
                    selectedMember={selectedMember}
                    onSelectMember={setSelectedMember}
                    isARMode={true}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Tree3DView
                  members={members}
                  selectedMember={selectedMember}
                  onSelectMember={setSelectedMember}
                  isARMode={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capture flash effect */}
          <AnimatePresence>
            {showCapture && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-white z-50"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedMemberData && (
            <MemberDetailPanel
              member={selectedMemberData}
              stage={selectedStage}
              onClose={() => setSelectedMember(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-3xl mb-1">
            {getGrowthStage(Math.max(...members.map(m => m.netWorth))).emoji}
          </div>
          <div className="text-slate-400 text-sm">Tallest Tree</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-seedling-400">{members.length}</div>
          <div className="text-slate-400 text-sm">Trees in Garden</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {Math.max(...members.map(m => m.generation)) + 1}
          </div>
          <div className="text-slate-400 text-sm">Generations Deep</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xl font-bold text-amber-400">
            {formatCurrency(members.reduce((sum, m) => sum + m.netWorth, 0), currency)}
          </div>
          <div className="text-slate-400 text-sm">Garden Value</div>
        </div>
      </motion.div>
    </div>
  );
};

export default ARWealthGarden;
