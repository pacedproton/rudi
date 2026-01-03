/**
 * Settings Store - Persistent configuration for Flinki App
 *
 * Manages user preferences with localStorage persistence
 */

import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
  // Audio Settings
  speechEnabled: boolean;
  speechRate: number;        // 0.5 - 2.0
  speechVolume: number;      // 0.0 - 1.0
  soundEnabled: boolean;
  soundVolume: number;       // 0.0 - 1.0

  // Exercise Settings
  shuffleExercises: boolean;
  shuffleModules: boolean;
  showTimer: boolean;
  autoAdvance: boolean;      // Auto-advance after correct answer
  feedbackDuration: number;  // ms

  // Difficulty
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'mixed';

  // Display
  showProgress: boolean;
  showScore: boolean;
  animations: boolean;
  particlesEnabled: boolean;

  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  // Audio
  speechEnabled: true,
  speechRate: 1.0,
  speechVolume: 1.0,
  soundEnabled: true,
  soundVolume: 0.7,

  // Exercise
  shuffleExercises: false,
  shuffleModules: false,
  showTimer: false,
  autoAdvance: true,
  feedbackDuration: 1500,

  // Difficulty
  difficultyLevel: 'mixed',

  // Display
  showProgress: true,
  showScore: true,
  animations: true,
  particlesEnabled: true,

  // Accessibility
  highContrast: false,
  largeText: false,
  reducedMotion: false
};

const STORAGE_KEY = 'flinki-settings';

/**
 * Load settings from localStorage
 */
function loadSettings(): Settings {
  if (!browser) return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  if (!browser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Create the settings store with persistence
 */
function createSettingsStore() {
  const { subscribe, set, update }: Writable<Settings> = writable(loadSettings());

  return {
    subscribe,
    set: (value: Settings) => {
      saveSettings(value);
      set(value);
    },
    update: (updater: (settings: Settings) => Settings) => {
      update((current) => {
        const updated = updater(current);
        saveSettings(updated);
        return updated;
      });
    },
    reset: () => {
      saveSettings(DEFAULT_SETTINGS);
      set(DEFAULT_SETTINGS);
    },
    // Convenience methods
    toggleSpeech: () => {
      update((s) => {
        const updated = { ...s, speechEnabled: !s.speechEnabled };
        saveSettings(updated);
        return updated;
      });
    },
    toggleSound: () => {
      update((s) => {
        const updated = { ...s, soundEnabled: !s.soundEnabled };
        saveSettings(updated);
        return updated;
      });
    },
    setSpeechRate: (rate: number) => {
      update((s) => {
        const updated = { ...s, speechRate: Math.max(0.5, Math.min(2.0, rate)) };
        saveSettings(updated);
        return updated;
      });
    },
    setSpeechVolume: (volume: number) => {
      update((s) => {
        const updated = { ...s, speechVolume: Math.max(0, Math.min(1, volume)) };
        saveSettings(updated);
        return updated;
      });
    },
    setSoundVolume: (volume: number) => {
      update((s) => {
        const updated = { ...s, soundVolume: Math.max(0, Math.min(1, volume)) };
        saveSettings(updated);
        return updated;
      });
    },
    toggleShuffle: () => {
      update((s) => {
        const updated = { ...s, shuffleExercises: !s.shuffleExercises };
        saveSettings(updated);
        return updated;
      });
    },
    toggleShuffleModules: () => {
      update((s) => {
        const updated = { ...s, shuffleModules: !s.shuffleModules };
        saveSettings(updated);
        return updated;
      });
    },
    setDifficulty: (level: 'easy' | 'medium' | 'hard' | 'mixed') => {
      update((s) => {
        const updated = { ...s, difficultyLevel: level };
        saveSettings(updated);
        return updated;
      });
    },
    toggleAnimations: () => {
      update((s) => {
        const updated = { ...s, animations: !s.animations };
        saveSettings(updated);
        return updated;
      });
    }
  };
}

export const settings = createSettingsStore();

// Derived stores for convenience
export const speechEnabled = derived(settings, ($settings) => $settings.speechEnabled);
export const soundEnabled = derived(settings, ($settings) => $settings.soundEnabled);
export const shuffleEnabled = derived(settings, ($settings) => $settings.shuffleExercises);
export const animationsEnabled = derived(settings, ($settings) => $settings.animations && !$settings.reducedMotion);

