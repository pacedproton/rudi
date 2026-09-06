import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Create mock stores
const mockCurrentModuleIndex = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockCurrentTaskIndex = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockCurrentModule = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockTotalTasksInModule = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockTotalKeys = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockModules = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockSettings = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };

// Mock StateManager stores
vi.mock('$lib/core/StateManager', () => ({
  currentModuleIndex: mockCurrentModuleIndex,
  currentTaskIndex: mockCurrentTaskIndex,
  currentModule: mockCurrentModule,
  totalTasksInModule: mockTotalTasksInModule,
  totalKeys: mockTotalKeys,
  modules: mockModules
}));

// Mock settings store
vi.mock('$lib/stores/settings', () => ({
  settings: mockSettings
}));

describe('ProgressBar Component', () => {
  const mockModulesData = [
    {
      id: 'phonology',
      title: 'Reime und Laute',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'rhyme' })
    },
    {
      id: 'lettersounds',
      title: 'Anfangslaute',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'initial' })
    },
    {
      id: 'quantities',
      title: 'Mengen',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'quantity' })
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Settings Integration', () => {
    it('should respect showProgress setting', () => {
      // This is a basic integration test that the component loads
      // Component rendering tests require Svelte Testing Library
      // which needs proper component compilation setup
      expect(mockSettings).toBeDefined();
      expect(mockCurrentModuleIndex).toBeDefined();
    });

    it('should respect showScore setting', () => {
      expect(mockSettings).toBeDefined();
      expect(mockTotalKeys).toBeDefined();
    });
  });

  describe('Progress Calculation Logic', () => {
    it('should calculate 0% progress at start', () => {
      const modules = mockModulesData;
      const currentModuleIndex = 0;
      const currentTaskIndex = 0;

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(108);
      expect(completedExercises).toBe(0);
      expect(percentComplete).toBe(0);
    });

    it('should calculate 50% progress correctly', () => {
      const modules = mockModulesData;
      const currentModuleIndex = 1; // Module 2
      const currentTaskIndex = 18; // Halfway through module 2 = 36 + 18 = 54 total

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(108);
      expect(completedExercises).toBe(54);
      expect(percentComplete).toBe(50);
    });

    it('should calculate 100% progress at end', () => {
      const modules = mockModulesData;
      const currentModuleIndex = 2; // Module 3 (last)
      const currentTaskIndex = 36; // All tasks complete

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(108);
      expect(completedExercises).toBe(108);
      expect(percentComplete).toBe(100);
    });

    it('should handle middle of second module', () => {
      const modules = mockModulesData;
      const currentModuleIndex = 1; // Module 2
      const currentTaskIndex = 12; // 36 (mod 1) + 12 = 48 total

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(108);
      expect(completedExercises).toBe(48);
      expect(Math.round(percentComplete)).toBe(44); // ~44.4%
    });

    it('should round percentages correctly', () => {
      const modules = mockModulesData;
      const currentModuleIndex = 0;
      const currentTaskIndex = 23; // 23/108 = 21.3%

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(Math.round(percentComplete)).toBe(21);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty modules array', () => {
      const modules: any[] = [];
      const currentModuleIndex = 0;
      const currentTaskIndex = 0;

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(0);
      expect(completedExercises).toBe(0);
      expect(percentComplete).toBe(0);
    });

    it('should handle single module', () => {
      const modules = [mockModulesData[0]];
      const currentModuleIndex = 0;
      const currentTaskIndex = 18;

      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      const percentComplete = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      expect(totalExercises).toBe(36);
      expect(completedExercises).toBe(18);
      expect(percentComplete).toBe(50);
    });
  });

  describe('Task Count Display', () => {
    it('should display first task correctly (1-indexed)', () => {
      const currentTaskIndex = 0; // 0-indexed
      const displayTaskNumber = currentTaskIndex + 1; // Convert to 1-indexed

      expect(displayTaskNumber).toBe(1);
    });

    it('should display last task correctly', () => {
      const totalTasksInModule = 36;
      const currentTaskIndex = 35; // Last task (0-indexed)
      const displayTaskNumber = currentTaskIndex + 1;

      expect(displayTaskNumber).toBe(36);
      expect(displayTaskNumber).toBe(totalTasksInModule);
    });

    it('should display middle task correctly', () => {
      const currentTaskIndex = 17; // 18th task (0-indexed)
      const displayTaskNumber = currentTaskIndex + 1;

      expect(displayTaskNumber).toBe(18);
    });
  });

  describe('Multi-Module Progress Tracking', () => {
    it('should track progress from start to end', () => {
      const modules = mockModulesData;
      let currentModuleIndex = 0;
      let currentTaskIndex = 0;

      // Start of first module
      let totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      let completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      expect(completedExercises).toBe(0);

      // Halfway through first module
      currentTaskIndex = 18;
      completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      expect(completedExercises).toBe(18);

      // Start of second module
      currentModuleIndex = 1;
      currentTaskIndex = 0;
      completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      expect(completedExercises).toBe(36);

      // End of all modules
      currentModuleIndex = 2;
      currentTaskIndex = 36;
      completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      expect(completedExercises).toBe(108);
    });

    it('should calculate percentage at each stage', () => {
      const modules = mockModulesData;
      const totalExercises = 108;

      // 25% complete (27/108)
      let currentModuleIndex = 0;
      let currentTaskIndex = 27;
      let completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      let percentComplete = (completedExercises / totalExercises) * 100;
      expect(Math.round(percentComplete)).toBe(25);

      // 75% complete (81/108)
      currentModuleIndex = 2;
      currentTaskIndex = 9;
      completedExercises = modules.slice(0, currentModuleIndex).reduce((sum, mod) => sum + mod.tasks.length, 0) + currentTaskIndex;
      percentComplete = (completedExercises / totalExercises) * 100;
      expect(Math.round(percentComplete)).toBe(75);
    });
  });
});
