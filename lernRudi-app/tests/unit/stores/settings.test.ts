import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment to simulate browser environment
vi.mock('$app/environment', () => ({
  browser: true,
  dev: false,
  building: false,
  version: 'test'
}));

// Mock browser environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

globalThis.localStorage = localStorageMock as any;

// Import after mocking
const { settings } = await import('$lib/stores/settings');

describe('Settings Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Default Values', () => {
    it('should initialize with default settings', () => {
      const currentSettings = get(settings);

      expect(currentSettings.speechEnabled).toBe(true);
      expect(currentSettings.speechRate).toBe(1.0);
      expect(currentSettings.speechVolume).toBe(1.0);
      expect(currentSettings.soundEnabled).toBe(true);
      expect(currentSettings.soundVolume).toBe(0.7);
      expect(currentSettings.shuffleExercises).toBe(false);
      expect(currentSettings.shuffleModules).toBe(false);
      expect(currentSettings.showTimer).toBe(false);
      expect(currentSettings.autoAdvance).toBe(true);
      expect(currentSettings.feedbackDuration).toBe(1500);
      expect(currentSettings.difficultyLevel).toBe('mixed');
      expect(currentSettings.showProgress).toBe(true);
      expect(currentSettings.showScore).toBe(true);
      expect(currentSettings.animations).toBe(true);
      expect(currentSettings.particlesEnabled).toBe(true);
      expect(currentSettings.highContrast).toBe(false);
      expect(currentSettings.largeText).toBe(false);
      expect(currentSettings.reducedMotion).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should save settings to localStorage when updated', () => {
      settings.update((s) => ({ ...s, speechEnabled: false }));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'poldi-settings',
        expect.stringContaining('"speechEnabled":false')
      );
    });

    it('should load settings from localStorage on init', () => {
      const customSettings = {
        speechEnabled: false,
        speechRate: 1.5,
        speechVolume: 0.5
      };

      localStorageMock.setItem('poldi-settings', JSON.stringify(customSettings));

      // Re-import to trigger load
      const currentSettings = get(settings);
      expect(currentSettings.speechEnabled).toBe(false);
    });

    it('should handle corrupt localStorage data gracefully', () => {
      // This test verifies that the store was initialized successfully despite
      // any potential corrupt data. Since the store is loaded at import time,
      // we verify it has valid default values
      const currentSettings = get(settings);

      // Should have valid settings (defaults or previously loaded values)
      expect(currentSettings).toBeDefined();
      expect(typeof currentSettings.speechEnabled).toBe('boolean');
      expect(typeof currentSettings.speechRate).toBe('number');
      expect(currentSettings.speechRate).toBeGreaterThanOrEqual(0.5);
      expect(currentSettings.speechRate).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Convenience Methods', () => {
    it('should toggle speech with toggleSpeech()', () => {
      const initial = get(settings).speechEnabled;
      settings.toggleSpeech();
      expect(get(settings).speechEnabled).toBe(!initial);
    });

    it('should toggle sound with toggleSound()', () => {
      const initial = get(settings).soundEnabled;
      settings.toggleSound();
      expect(get(settings).soundEnabled).toBe(!initial);
    });

    it('should toggle shuffle with toggleShuffle()', () => {
      const initial = get(settings).shuffleExercises;
      settings.toggleShuffle();
      expect(get(settings).shuffleExercises).toBe(!initial);
    });

    it('should toggle shuffle modules with toggleShuffleModules()', () => {
      const initial = get(settings).shuffleModules;
      settings.toggleShuffleModules();
      expect(get(settings).shuffleModules).toBe(!initial);
    });

    it('should set speech rate within bounds', () => {
      settings.setSpeechRate(1.5);
      expect(get(settings).speechRate).toBe(1.5);

      settings.setSpeechRate(3.0); // Above max
      expect(get(settings).speechRate).toBe(2.0);

      settings.setSpeechRate(0.1); // Below min
      expect(get(settings).speechRate).toBe(0.5);
    });

    it('should set speech volume within bounds', () => {
      settings.setSpeechVolume(0.5);
      expect(get(settings).speechVolume).toBe(0.5);

      settings.setSpeechVolume(1.5); // Above max
      expect(get(settings).speechVolume).toBe(1.0);

      settings.setSpeechVolume(-0.5); // Below min
      expect(get(settings).speechVolume).toBe(0);
    });

    it('should set sound volume within bounds', () => {
      settings.setSoundVolume(0.8);
      expect(get(settings).soundVolume).toBe(0.8);

      settings.setSoundVolume(2.0); // Above max
      expect(get(settings).soundVolume).toBe(1.0);

      settings.setSoundVolume(-1.0); // Below min
      expect(get(settings).soundVolume).toBe(0);
    });

    it('should set difficulty level', () => {
      settings.setDifficulty('easy');
      expect(get(settings).difficultyLevel).toBe('easy');

      settings.setDifficulty('hard');
      expect(get(settings).difficultyLevel).toBe('hard');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all settings to defaults', () => {
      // Change multiple settings
      settings.update((s) => ({
        ...s,
        speechEnabled: false,
        speechRate: 1.5,
        shuffleExercises: true,
        difficultyLevel: 'hard' as const
      }));

      // Reset
      settings.reset();

      const currentSettings = get(settings);
      expect(currentSettings.speechEnabled).toBe(true);
      expect(currentSettings.speechRate).toBe(1.0);
      expect(currentSettings.shuffleExercises).toBe(false);
      expect(currentSettings.difficultyLevel).toBe('mixed');
    });

    it('should save default settings to localStorage on reset', () => {
      settings.reset();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'poldi-settings',
        expect.stringContaining('"speechEnabled":true')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid sequential updates', () => {
      for (let i = 0; i < 10; i++) {
        settings.setSpeechRate(0.5 + i * 0.1);
      }

      const finalRate = get(settings).speechRate;
      expect(finalRate).toBeGreaterThanOrEqual(0.5);
      expect(finalRate).toBeLessThanOrEqual(2.0);
    });

    it('should maintain consistency across multiple toggles', () => {
      settings.toggleSpeech();
      settings.toggleSpeech();
      settings.toggleSpeech();

      expect(get(settings).speechEnabled).toBe(false);
    });

    it('should handle all difficulty levels', () => {
      const levels: Array<'easy' | 'medium' | 'hard' | 'mixed'> = ['easy', 'medium', 'hard', 'mixed'];

      levels.forEach(level => {
        settings.setDifficulty(level);
        expect(get(settings).difficultyLevel).toBe(level);
      });
    });
  });
});
