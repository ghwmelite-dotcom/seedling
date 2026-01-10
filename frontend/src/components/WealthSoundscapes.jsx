import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Musical scales for different wealth moods
const SCALES = {
  struggling: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16], // C minor
  growing: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C major
  thriving: [261.63, 293.66, 329.63, 369.99, 415.30, 466.16, 523.25], // C lydian
  wealthy: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 587.33], // C pentatonic
  legendary: [261.63, 329.63, 392.00, 493.88, 587.33, 659.25, 783.99], // C major 7 arpeggio
};

// Wealth thresholds for different soundscapes
const WEALTH_MOODS = [
  { min: 0, max: 10000, mood: 'struggling', name: 'Seeds of Hope', color: 'from-slate-500 to-slate-600', emoji: '🌱' },
  { min: 10000, max: 100000, mood: 'growing', name: 'Rising Tide', color: 'from-blue-500 to-cyan-600', emoji: '🌊' },
  { min: 100000, max: 500000, mood: 'thriving', name: 'Golden Hour', color: 'from-amber-500 to-orange-600', emoji: '☀️' },
  { min: 500000, max: 1000000, mood: 'wealthy', name: 'Summit View', color: 'from-emerald-500 to-teal-600', emoji: '🏔️' },
  { min: 1000000, max: Infinity, mood: 'legendary', name: 'Cosmic Harmony', color: 'from-purple-500 to-pink-600', emoji: '✨' },
];

// Get mood based on net worth
const getMood = (netWorth) => {
  for (const mood of WEALTH_MOODS) {
    if (netWorth >= mood.min && netWorth < mood.max) {
      return mood;
    }
  }
  return WEALTH_MOODS[WEALTH_MOODS.length - 1];
};

// Audio visualizer bars
const VisualizerBar = ({ index, audioData, isPlaying, mood }) => {
  const height = isPlaying && audioData ? (audioData[index * 4] || 0) / 255 * 100 : 10;

  return (
    <motion.div
      className={`w-1 rounded-full bg-gradient-to-t ${mood?.color || 'from-slate-500 to-slate-600'}`}
      animate={{ height: `${Math.max(10, height)}%` }}
      transition={{ duration: 0.05 }}
    />
  );
};

// Circular visualizer
const CircularVisualizer = ({ audioData, isPlaying, mood }) => {
  const bars = 32;

  return (
    <div className="relative w-64 h-64">
      {/* Center orb */}
      <motion.div
        className={`absolute inset-1/4 rounded-full bg-gradient-to-br ${mood?.color || 'from-slate-500 to-slate-600'}`}
        animate={isPlaying ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(255,255,255,0.2)',
            '0 0 60px rgba(255,255,255,0.4)',
            '0 0 20px rgba(255,255,255,0.2)',
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{mood?.emoji || '🎵'}</span>
        </div>
      </motion.div>

      {/* Radial bars */}
      {[...Array(bars)].map((_, i) => {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const value = isPlaying && audioData ? (audioData[i * 4] || 0) / 255 : 0.1;
        const length = 40 + value * 60;

        return (
          <motion.div
            key={i}
            className={`absolute left-1/2 top-1/2 origin-left h-1 rounded-full bg-gradient-to-r ${mood?.color || 'from-slate-500 to-slate-600'}`}
            style={{
              transform: `rotate(${angle}rad) translateX(50px)`,
            }}
            animate={{ width: length }}
            transition={{ duration: 0.05 }}
          />
        );
      })}
    </div>
  );
};

// Preset soundscape card
const SoundscapePreset = ({ preset, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-4 rounded-xl text-left transition-all ${
      isActive
        ? `bg-gradient-to-br ${preset.color} text-white`
        : 'bg-slate-800/50 hover:bg-slate-700/50'
    }`}
  >
    <span className="text-2xl block mb-2">{preset.emoji}</span>
    <div className={`font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>{preset.name}</div>
    <div className={`text-sm ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
      {formatCurrency(preset.min, 'USD')} - {preset.max === Infinity ? '∞' : formatCurrency(preset.max, 'USD')}
    </div>
  </motion.button>
);

// Main Wealth Soundscapes Component
const WealthSoundscapes = () => {
  const { simulation, currency } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedMood, setSelectedMood] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [currentNote, setCurrentNote] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const sequencerRef = useRef(null);

  const netWorth = simulation?.scenario?.tree?.netWorth || 0;
  const autoMood = getMood(netWorth);
  const activeMood = selectedMood || autoMood;

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, [volume]);

  // Create a soft pad sound
  const createPadOscillator = useCallback((frequency, type = 'sine') => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    // Soft attack and release
    oscGain.gain.value = 0;
    oscGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
    oscGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);

    osc.connect(oscGain);
    oscGain.connect(gainNodeRef.current);

    osc.start();
    osc.stop(ctx.currentTime + 4);

    return osc;
  }, [initAudio]);

  // Create ambient drone
  const createDrone = useCallback(() => {
    const ctx = initAudio();
    const scale = SCALES[activeMood.mood];
    const baseFreq = scale[0] / 2; // One octave down

    // Create multiple detuned oscillators for rich sound
    const oscillators = [];
    const detuneAmounts = [-5, 0, 5, 7];

    detuneAmounts.forEach((detune, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = baseFreq;
      osc.detune.value = detune;

      oscGain.gain.value = 0.05 / detuneAmounts.length;

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);

      osc.start();
      oscillators.push({ osc, gain: oscGain });
    });

    return oscillators;
  }, [initAudio, activeMood]);

  // Play a melodic sequence
  const playSequence = useCallback(() => {
    const scale = SCALES[activeMood.mood];
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Random note from scale
    const noteIndex = Math.floor(Math.random() * scale.length);
    const frequency = scale[noteIndex] * (Math.random() > 0.5 ? 1 : 2); // Sometimes octave up

    setCurrentNote(noteIndex);
    createPadOscillator(frequency, Math.random() > 0.7 ? 'triangle' : 'sine');
  }, [activeMood, createPadOscillator]);

  // Update audio visualization
  const updateVisualization = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setAudioData(dataArray);

    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  }, []);

  // Start playing
  const startPlaying = useCallback(() => {
    initAudio();

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Start drone
    oscillatorsRef.current = createDrone();

    // Start melodic sequence
    playSequence();
    sequencerRef.current = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to play a note
        playSequence();
      }
    }, 2000 + Math.random() * 2000);

    // Start visualization
    updateVisualization();

    setIsPlaying(true);
  }, [initAudio, createDrone, playSequence, updateVisualization]);

  // Stop playing
  const stopPlaying = useCallback(() => {
    // Stop sequencer
    if (sequencerRef.current) {
      clearInterval(sequencerRef.current);
    }

    // Stop oscillators
    oscillatorsRef.current.forEach(({ osc, gain }) => {
      gain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
      setTimeout(() => {
        try { osc.stop(); } catch (e) {}
      }, 1000);
    });
    oscillatorsRef.current = [];

    // Stop visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlaying(false);
    setAudioData(null);
  }, []);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlaying();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopPlaying]);

  // Change soundscape when mood changes
  useEffect(() => {
    if (isPlaying) {
      stopPlaying();
      setTimeout(startPlaying, 500);
    }
  }, [activeMood.mood]);

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
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeMood.color} flex items-center justify-center`}
              animate={isPlaying ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.2)',
                  '0 0 40px rgba(255,255,255,0.4)',
                  '0 0 20px rgba(255,255,255,0.2)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
            >
              <span className="text-3xl">🎵</span>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Wealth Soundscapes</h2>
              <p className="text-slate-400">Generative music that evolves with your wealth</p>
            </div>
          </div>

          {/* Play button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-red-500 shadow-lg shadow-red-500/30'
                : 'bg-seedling-500 shadow-lg shadow-seedling-500/30'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Current mood display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card p-8 bg-gradient-to-br ${activeMood.color} relative overflow-hidden`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={isPlaying ? {
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              } : {}}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-white/70 text-sm mb-1">Current Soundscape</div>
            <div className="text-4xl font-bold text-white mb-2">{activeMood.name}</div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-2xl">{activeMood.emoji}</span>
              <span>Based on {formatCurrency(netWorth, currency)} net worth</span>
            </div>
          </div>

          {/* Circular visualizer */}
          <div className="hidden md:block">
            <CircularVisualizer
              audioData={audioData}
              isPlaying={isPlaying}
              mood={activeMood}
            />
          </div>
        </div>

        {/* Bar visualizer for mobile */}
        <div className="md:hidden mt-6 h-24 flex items-end justify-center gap-1">
          {[...Array(32)].map((_, i) => (
            <VisualizerBar
              key={i}
              index={i}
              audioData={audioData}
              isPlaying={isPlaying}
              mood={activeMood}
            />
          ))}
        </div>
      </motion.div>

      {/* Volume control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </motion.div>

      {/* Soundscape presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Soundscape Presets</h3>
          {selectedMood && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(null)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Reset to Auto
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {WEALTH_MOODS.map((preset) => (
            <SoundscapePreset
              key={preset.mood}
              preset={preset}
              isActive={activeMood.mood === preset.mood}
              onClick={() => setSelectedMood(preset)}
            />
          ))}
        </div>
      </motion.div>

      {/* Musical info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">About This Soundscape</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-slate-400 text-sm mb-2">Musical Mode</div>
            <div className="text-white font-medium">
              {activeMood.mood === 'struggling' && 'C Minor - Reflective and hopeful'}
              {activeMood.mood === 'growing' && 'C Major - Bright and optimistic'}
              {activeMood.mood === 'thriving' && 'C Lydian - Dreamy and expansive'}
              {activeMood.mood === 'wealthy' && 'C Pentatonic - Peaceful and balanced'}
              {activeMood.mood === 'legendary' && 'C Major 7 - Ethereal and transcendent'}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-sm mb-2">Characteristics</div>
            <div className="text-white font-medium">
              {activeMood.mood === 'struggling' && 'Gentle pads, contemplative melodies'}
              {activeMood.mood === 'growing' && 'Rising arpeggios, building momentum'}
              {activeMood.mood === 'thriving' && 'Lush harmonies, warm textures'}
              {activeMood.mood === 'wealthy' && 'Open spaces, serene ambience'}
              {activeMood.mood === 'legendary' && 'Cosmic swells, celestial tones'}
            </div>
          </div>
        </div>

        {/* Scale visualization */}
        <div className="mt-6">
          <div className="text-slate-400 text-sm mb-3">Current Scale</div>
          <div className="flex gap-2">
            {SCALES[activeMood.mood].map((freq, i) => (
              <motion.div
                key={i}
                className={`flex-1 h-12 rounded-lg flex items-center justify-center text-sm font-mono ${
                  currentNote === i && isPlaying
                    ? `bg-gradient-to-t ${activeMood.color} text-white`
                    : 'bg-slate-800 text-slate-400'
                }`}
                animate={currentNote === i && isPlaying ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {Math.round(freq)}Hz
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-3 text-sm text-slate-500"
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          The soundscape automatically adapts to your simulated net worth. Run a simulation to hear how your financial future sounds, or manually select a preset to preview different wealth levels.
        </p>
      </motion.div>
    </div>
  );
};

export default WealthSoundscapes;
