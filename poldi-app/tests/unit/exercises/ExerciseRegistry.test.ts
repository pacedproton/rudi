import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExerciseRegistry } from '$lib/exercises/base/ExerciseRegistry';
import { RhymeExercise } from '$lib/exercises/phonology/RhymeExercise';
import { MemoryExercise } from '$lib/exercises/memory/MemoryExercise';
import { TraceExercise } from '$lib/exercises/motor/TraceExercise';

describe('ExerciseRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    ExerciseRegistry.clear();
  });

  afterEach(() => {
    // Clean up after tests
    ExerciseRegistry.clear();
  });

  describe('Registration', () => {
    it('should register an exercise plugin', () => {
      ExerciseRegistry.register('rhyme', RhymeExercise);

      expect(ExerciseRegistry.supports('rhyme')).toBe(true);
      expect(ExerciseRegistry.count()).toBe(1);
    });

    it('should register multiple plugins', () => {
      ExerciseRegistry.register('rhyme', RhymeExercise);
      ExerciseRegistry.register('memory', MemoryExercise);
      ExerciseRegistry.register('trace', TraceExercise);

      expect(ExerciseRegistry.count()).toBe(3);
      expect(ExerciseRegistry.supports('rhyme')).toBe(true);
      expect(ExerciseRegistry.supports('memory')).toBe(true);
      expect(ExerciseRegistry.supports('trace')).toBe(true);
    });

    it('should warn when overwriting existing registration', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      ExerciseRegistry.register('rhyme', RhymeExercise);
      ExerciseRegistry.register('rhyme', RhymeExercise);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Exercise Creation', () => {
    beforeEach(() => {
      // Register exercises for creation tests
      ExerciseRegistry.register('rhyme', RhymeExercise);
      ExerciseRegistry.register('memory', MemoryExercise);
      ExerciseRegistry.register('trace', TraceExercise);
    });

    it('should create rhyme exercise instance', () => {
      const exercise = ExerciseRegistry.create({
        type: 'rhyme',
        word: 'Maus',
        target: 'house',
        distractors: ['car']
      });

      expect(exercise).toBeInstanceOf(RhymeExercise);
      expect(exercise.type).toBe('rhyme');
    });

    it('should create memory exercise instance', () => {
      const exercise = ExerciseRegistry.create({
        type: 'memory',
        seq: [4, 2, 7]
      });

      expect(exercise).toBeInstanceOf(MemoryExercise);
      expect(exercise.type).toBe('memory');
    });

    it('should create trace exercise instance', () => {
      const exercise = ExerciseRegistry.create({
        type: 'trace',
        shape: 'circle'
      });

      expect(exercise).toBeInstanceOf(TraceExercise);
      expect(exercise.type).toBe('trace');
    });

    it('should throw error for unregistered exercise type', () => {
      expect(() => {
        ExerciseRegistry.create({
          type: 'nonexistent' as any,
          someConfig: 'value'
        });
      }).toThrow(/not registered/);
    });

    it('should include available types in error message', () => {
      try {
        ExerciseRegistry.create({
          type: 'invalid' as any
        });
      } catch (error) {
        expect((error as Error).message).toContain('rhyme');
        expect((error as Error).message).toContain('memory');
        expect((error as Error).message).toContain('trace');
      }
    });
  });

  describe('Query Methods', () => {
    beforeEach(() => {
      ExerciseRegistry.register('rhyme', RhymeExercise);
      ExerciseRegistry.register('memory', MemoryExercise);
    });

    it('should check if exercise type is supported', () => {
      expect(ExerciseRegistry.supports('rhyme')).toBe(true);
      expect(ExerciseRegistry.supports('memory')).toBe(true);
      expect(ExerciseRegistry.supports('invalid' as any)).toBe(false);
    });

    it('should return all registered types', () => {
      const types = ExerciseRegistry.getAll();

      expect(types).toHaveLength(2);
      expect(types).toContain('rhyme');
      expect(types).toContain('memory');
    });

    it('should return plugin class', () => {
      const PluginClass = ExerciseRegistry.getPluginClass('rhyme');

      expect(PluginClass).toBe(RhymeExercise);
    });

    it('should return undefined for unregistered type', () => {
      const PluginClass = ExerciseRegistry.getPluginClass('invalid' as any);

      expect(PluginClass).toBeUndefined();
    });
  });

  describe('Clearing', () => {
    it('should clear all registrations', () => {
      ExerciseRegistry.register('rhyme', RhymeExercise);
      ExerciseRegistry.register('memory', MemoryExercise);

      expect(ExerciseRegistry.count()).toBe(2);

      ExerciseRegistry.clear();

      expect(ExerciseRegistry.count()).toBe(0);
      expect(ExerciseRegistry.supports('rhyme')).toBe(false);
    });
  });
});
