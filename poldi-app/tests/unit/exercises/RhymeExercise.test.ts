import { describe, it, expect, beforeEach } from 'vitest';
import { RhymeExercise } from '$lib/exercises/phonology/RhymeExercise';
import type { RenderContext } from '$lib/core/CanvasManager';

// Mock render context
const createMockRenderContext = (): RenderContext => ({
  ctx: document.createElement('canvas').getContext('2d')!,
  width: 800,
  height: 600,
  scale: 1,
  time: 0
});

describe('RhymeExercise', () => {
  let exercise: RhymeExercise;

  beforeEach(() => {
    exercise = new RhymeExercise({
      type: 'rhyme',
      word: 'Maus',
      target: 'house',
      distractors: ['car']
    });
    exercise.initialize(exercise.config);
  });

  describe('Configuration', () => {
    it('should have correct type', () => {
      expect(exercise.type).toBe('rhyme');
    });

    it('should store configuration', () => {
      expect(exercise.config.word).toBe('Maus');
      expect(exercise.config.target).toBe('house');
      expect(exercise.config.distractors).toEqual(['car']);
    });
  });

  describe('Instructions', () => {
    it('should generate German instruction speech', () => {
      const instruction = exercise.getInstruction();

      expect(instruction).toContain('Was reimt sich auf Maus?');
      expect(instruction).toContain('Haus');
      expect(instruction).toContain('Auto');
    });

    it('should return speech requests on start', () => {
      const speechRequests = exercise.onStart();

      expect(speechRequests).toHaveLength(1);
      expect(speechRequests[0].text).toContain('Was reimt sich auf');
    });
  });

  describe('Rendering', () => {
    it('should render without errors', () => {
      const ctx = createMockRenderContext();

      expect(() => exercise.render(ctx)).not.toThrow();
    });

    it('should save render context for input handling', () => {
      const ctx = createMockRenderContext();

      exercise.render(ctx);

      // Should not throw when handling input after render
      expect(() => {
        exercise.handleInput({ x: 100, y: 100, type: 'start' });
      }).not.toThrow();
    });
  });

  describe('Input Handling', () => {
    beforeEach(() => {
      // Render once to save context
      const ctx = createMockRenderContext();
      exercise.render(ctx);
    });

    it('should return null for move events', () => {
      const result = exercise.handleInput({
        x: 300,
        y: 300,
        type: 'move'
      });

      expect(result).toBeNull();
    });

    it('should return null for end events', () => {
      const result = exercise.handleInput({
        x: 300,
        y: 300,
        type: 'end'
      });

      expect(result).toBeNull();
    });

    it('should return correct result when target is clicked', () => {
      // Target is on left side (centered at ~240px)
      const result = exercise.handleInput({
        x: 240,
        y: 300,
        type: 'start'
      });

      expect(result).not.toBeNull();
      expect(result?.correct).toBe(true);
      expect(result?.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return incorrect result when distractor is clicked', () => {
      // Distractor is on right side (centered at ~560px)
      const result = exercise.handleInput({
        x: 560,
        y: 300,
        type: 'start'
      });

      expect(result).not.toBeNull();
      expect(result?.correct).toBe(false);
      expect(result?.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return null when clicking outside boxes', () => {
      const result = exercise.handleInput({
        x: 50,
        y: 50,
        type: 'start'
      });

      expect(result).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should start with correct initial state', () => {
      const state = exercise.getState();

      expect(state.started).toBe(true);
      expect(state.completed).toBe(false);
      expect(state.locked).toBe(false);
    });

    it('should update state on completion', () => {
      exercise.onComplete({ correct: true });

      const state = exercise.getState();
      expect(state.completed).toBe(true);
    });

    it('should reset state', () => {
      exercise.onComplete({ correct: true });
      exercise.reset();

      const state = exercise.getState();
      expect(state.completed).toBe(false);
      expect(state.started).toBe(false);
    });
  });

  describe('Lifecycle', () => {
    it('should cleanup resources', () => {
      exercise.cleanup();

      const state = exercise.getState();
      expect(state.started).toBe(false);
      expect(state.completed).toBe(false);
    });

    it('should support replay', () => {
      expect(exercise.supportsReplay()).toBe(true);
    });
  });
});
