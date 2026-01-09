import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const TimelineScrubber = ({ simulation, onYearChange }) => {
  const {
    currentYear, setCurrentYear,
    isPlaying, setIsPlaying,
    playbackSpeed, setPlaybackSpeed
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef(null);
  const sliderRef = useRef(null);

  const maxYears = simulation?.baseline?.members?.[0]?.currentAge || 80;
  const startYear = new Date().getFullYear();

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentYear((prev) => {
          const next = prev + 1;
          if (next >= maxYears) {
            setIsPlaying(false);
            return maxYears;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, maxYears, setCurrentYear, setIsPlaying]);

  // Notify parent of year changes
  useEffect(() => {
    if (onYearChange) {
      onYearChange(currentYear);
    }
  }, [currentYear, onYearChange]);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setCurrentYear(value);
  };

  const togglePlay = () => {
    if (currentYear >= maxYears) {
      setCurrentYear(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const skipToStart = () => {
    setCurrentYear(0);
    setIsPlaying(false);
  };

  const skipToEnd = () => {
    setCurrentYear(maxYears);
    setIsPlaying(false);
  };

  // Calculate milestone markers
  const milestones = [
    { year: 0, label: 'Start', icon: '🌱' },
    { year: Math.floor(maxYears * 0.25), label: 'Gen 2', icon: '👶' },
    { year: Math.floor(maxYears * 0.5), label: 'Gen 3', icon: '👨‍👩‍👧' },
    { year: Math.floor(maxYears * 0.75), label: 'Gen 4', icon: '🏠' },
    { year: maxYears, label: 'Legacy', icon: '🌳' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">⏱️</span>
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Time Machine</h3>
            <p className="text-slate-400 text-sm">Watch your legacy unfold</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="px-4 py-2 bg-slate-700/50 rounded-xl text-center min-w-[120px]"
            key={currentYear}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <div className="text-2xl font-bold text-white">{startYear + currentYear}</div>
            <div className="text-xs text-slate-400">Year {currentYear}</div>
          </motion.div>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="relative mb-6 pt-8">
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-2">
          {milestones.map((milestone) => (
            <motion.div
              key={milestone.year}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setCurrentYear(milestone.year)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg mb-1">{milestone.icon}</span>
              <span className="text-xs text-slate-400">{milestone.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar background */}
        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-full"
            style={{ width: `${(currentYear / maxYears) * 100}%` }}
            layoutId="progress"
          />

          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              animation: 'shimmer 2s infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Custom slider thumb */}
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max={maxYears}
          value={currentYear}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
          style={{ top: '32px' }}
        />

        {/* Visual thumb */}
        <motion.div
          className="absolute top-[26px] w-6 h-6 bg-white rounded-full shadow-lg border-4 border-purple-500 cursor-grab active:cursor-grabbing"
          style={{
            left: `calc(${(currentYear / maxYears) * 100}% - 12px)`,
          }}
          animate={{
            scale: isDragging ? 1.3 : 1,
            boxShadow: isDragging
              ? '0 0 20px rgba(168, 85, 247, 0.8)'
              : '0 0 10px rgba(168, 85, 247, 0.4)',
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={skipToStart}
          className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </motion.button>

        <motion.button
          onClick={togglePlay}
          className={`p-4 rounded-2xl ${
            isPlaying
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600'
          } shadow-lg`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </motion.button>

        <motion.button
          onClick={skipToEnd}
          className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </motion.button>

        <motion.button
          onClick={handleSpeedChange}
          className="px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors min-w-[60px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-white font-semibold">{playbackSpeed}x</span>
        </motion.button>
      </div>

      {/* Year indicator line */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-slate-400 text-sm">
              Traveling through time at {playbackSpeed}x speed...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineScrubber;
