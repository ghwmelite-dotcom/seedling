import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

// Audio Context for Web Audio API (procedural sounds)
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Procedural sound generators using Web Audio API
const SoundGenerators = {
  // Soft pop sound for node appearing
  pop: (volume = 0.3) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  },

  // Success chime for achievements
  success: (volume = 0.4) => {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + i * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);

      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  },

  // Click sound for buttons
  click: (volume = 0.2) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  },

  // Whoosh sound for transitions
  whoosh: (volume = 0.2) => {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.3);
  },

  // Coin/money sound
  coin: (volume = 0.3) => {
    const ctx = getAudioContext();
    const notes = [1318.51, 1567.98]; // E6, G6

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + i * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);

      oscillator.start(ctx.currentTime + i * 0.08);
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
  },

  // Level up / milestone sound
  levelUp: (volume = 0.4) => {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + i * 0.12 + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.5);

      oscillator.start(ctx.currentTime + i * 0.12);
      oscillator.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  },

  // Error/warning sound
  error: (volume = 0.3) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  },

  // Ambient drone for background (returns stop function)
  ambientDrone: (volume = 0.05) => {
    const ctx = getAudioContext();
    const oscillators = [];
    const gains = [];
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);

    // Create multiple oscillators for rich ambient sound
    [110, 220, 330, 55].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGain);

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slow modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.3 - i * 0.05, ctx.currentTime);

      osc.start();
      oscillators.push(osc);
      gains.push(gain);
    });

    // Return stop function
    return () => {
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      setTimeout(() => {
        oscillators.forEach(osc => osc.stop());
      }, 1000);
    };
  },
};

// Sound Context
const SoundContext = createContext(null);

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context;
};

// Sound Provider Component
export const SoundProvider = ({ children }) => {
  const { soundEnabled, musicEnabled, volume } = useStore();
  const ambientStopRef = useRef(null);

  // Play a sound effect
  const playSound = useCallback((soundName, customVolume) => {
    if (!soundEnabled) return;

    const generator = SoundGenerators[soundName];
    if (generator) {
      try {
        generator(customVolume ?? volume);
      } catch (e) {
        console.log('Sound playback failed:', e);
      }
    }
  }, [soundEnabled, volume]);

  // Start ambient music
  const startAmbient = useCallback(() => {
    if (!musicEnabled || ambientStopRef.current) return;

    try {
      ambientStopRef.current = SoundGenerators.ambientDrone(volume * 0.3);
    } catch (e) {
      console.log('Ambient music failed:', e);
    }
  }, [musicEnabled, volume]);

  // Stop ambient music
  const stopAmbient = useCallback(() => {
    if (ambientStopRef.current) {
      ambientStopRef.current();
      ambientStopRef.current = null;
    }
  }, []);

  // Handle music enable/disable
  useEffect(() => {
    if (musicEnabled) {
      // Don't auto-start - wait for user interaction
    } else {
      stopAmbient();
    }

    return () => stopAmbient();
  }, [musicEnabled, stopAmbient]);

  const value = {
    playSound,
    startAmbient,
    stopAmbient,
    sounds: Object.keys(SoundGenerators),
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

// Sound Settings Panel Component
const SoundSettings = () => {
  const {
    soundEnabled, setSoundEnabled,
    musicEnabled, setMusicEnabled,
    volume, setVolume
  } = useStore();

  const { playSound, startAmbient, stopAmbient } = useSounds();

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const testSound = (soundName) => {
    playSound(soundName);
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
          whileHover={{ rotate: [0, -10, 10, 0] }}
        >
          <span className="text-2xl">🔊</span>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">Sound Settings</h3>
          <p className="text-slate-400">Customize your audio experience</p>
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className="flex items-center justify-between mb-4 p-4 bg-slate-800/50 rounded-xl">
        <div>
          <div className="text-white font-semibold">Sound Effects</div>
          <div className="text-slate-400 text-sm">UI sounds and feedback</div>
        </div>
        <motion.button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) playSound('click');
          }}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${
            soundEnabled ? 'bg-seedling-500' : 'bg-slate-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full"
            animate={{ x: soundEnabled ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Ambient Music Toggle */}
      <div className="flex items-center justify-between mb-4 p-4 bg-slate-800/50 rounded-xl">
        <div>
          <div className="text-white font-semibold">Ambient Music</div>
          <div className="text-slate-400 text-sm">Background ambiance</div>
        </div>
        <motion.button
          onClick={() => {
            setMusicEnabled(!musicEnabled);
            if (!musicEnabled) {
              startAmbient();
            } else {
              stopAmbient();
            }
          }}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${
            musicEnabled ? 'bg-seedling-500' : 'bg-slate-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full"
            animate={{ x: musicEnabled ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Volume Slider */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-semibold">Volume</div>
          <div className="text-seedling-400 font-semibold">{Math.round(volume * 100)}%</div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-seedling-500 [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-seedling-500/50"
        />
      </div>

      {/* Sound Test Panel */}
      <div className="p-4 bg-slate-800/50 rounded-xl">
        <div className="text-white font-semibold mb-3">Test Sounds</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'pop', icon: '🔵', label: 'Pop' },
            { name: 'click', icon: '👆', label: 'Click' },
            { name: 'success', icon: '✅', label: 'Success' },
            { name: 'coin', icon: '🪙', label: 'Coin' },
            { name: 'levelUp', icon: '⬆️', label: 'Level Up' },
            { name: 'whoosh', icon: '💨', label: 'Whoosh' },
            { name: 'error', icon: '❌', label: 'Error' },
          ].map((sound) => (
            <motion.button
              key={sound.name}
              onClick={() => testSound(sound.name)}
              disabled={!soundEnabled}
              className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-center
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl mb-1">{sound.icon}</div>
              <div className="text-xs text-slate-400">{sound.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Audio info */}
      <div className="mt-4 text-center">
        <p className="text-slate-500 text-xs">
          Sounds are generated using Web Audio API • No audio files required
        </p>
      </div>
    </motion.div>
  );
};

export default SoundSettings;
