import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { detectCurrencyFromLocale, getCurrencyFromCountry, DEFAULT_CURRENCY } from '../utils/format';

// Detect currency from IP using free API
const detectCurrencyFromIP = async () => {
  try {
    // Use ipapi.co for free IP geolocation
    const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
    const data = await response.json();
    if (data.country_code) {
      return getCurrencyFromCountry(data.country_code);
    }
  } catch (e) {
    console.debug('IP detection failed, using locale fallback');
  }
  return null;
};

const useStore = create(
  persist(
    (set, get) => ({
      // Currency Settings
      currency: DEFAULT_CURRENCY,
      currencyAutoDetected: false,
      setCurrency: (currency) => set({ currency }),

      // Auto-detect currency on first visit
      autoDetectCurrency: async () => {
        const state = get();
        // Only auto-detect if not already detected
        if (state.currencyAutoDetected) return;

        // First try IP-based detection
        const ipCurrency = await detectCurrencyFromIP();
        if (ipCurrency) {
          set({ currency: ipCurrency, currencyAutoDetected: true });
          return;
        }

        // Fallback to browser locale
        const localeCurrency = detectCurrencyFromLocale();
        set({ currency: localeCurrency, currencyAutoDetected: true });
      },

      // Simulation State
      simulation: null,
      setSimulation: (simulation) => set({ simulation }),

      // Timeline State
      currentYear: 0,
      maxYear: 100,
      isPlaying: false,
      playbackSpeed: 1,
      setCurrentYear: (year) => set({ currentYear: year }),
      setMaxYear: (year) => set({ maxYear: year }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      // View Mode
      viewMode: '2d', // '2d' or '3d'
      setViewMode: (mode) => set({ viewMode: mode }),

      // Selected Member
      selectedMember: null,
      setSelectedMember: (member) => set({ selectedMember: member }),

      // Achievements
      achievements: [],
      unlockedAchievements: [],
      addAchievement: (achievement) => set((state) => ({
        unlockedAchievements: [...state.unlockedAchievements, achievement]
      })),

      // Sound Settings
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.5,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setVolume: (vol) => set({ volume: vol }),

      // AI Coach
      chatHistory: [],
      addChatMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),
      clearChatHistory: () => set({ chatHistory: [] }),

      // Scenarios
      savedScenarios: [],
      addScenario: (scenario) => set((state) => ({
        savedScenarios: [...state.savedScenarios, scenario]
      })),

      // UI State
      activePanel: 'simulator', // 'simulator', 'analytics', 'achievements', 'coach', 'scenarios'
      setActivePanel: (panel) => set({ activePanel: panel }),
      showTutorial: true,
      setShowTutorial: (show) => set({ showTutorial: show }),
    }),
    {
      name: 'seedling-settings',
      partialize: (state) => ({
        currency: state.currency,
        currencyAutoDetected: state.currencyAutoDetected,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        volume: state.volume,
      }),
    }
  )
);

export default useStore;
