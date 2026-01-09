import { create } from 'zustand';

const useStore = create((set, get) => ({
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
}));

export default useStore;
