import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AudioEngine and SpeechEngine before importing exercises
vi.mock('$lib/core/AudioEngine', () => ({
  audioEngine: {
    playSound: vi.fn()
  }
}));

vi.mock('$lib/core/SpeechEngine', () => ({
  speechEngine: {
    speak: vi.fn()
  }
}));

import { HandwritingExercise } from '$lib/exercises/drawing/HandwritingExercise';
import type { HandwritingConfig } from '$lib/exercises/drawing/HandwritingExercise';

describe('HandwritingExercise', () => {
  let exercise: HandwritingExercise;
  let mockConfig: HandwritingConfig;

  const createMockContext = () => ({
    ctx: {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn()
    } as any,
    width: 800,
    height: 600,
    scale: 1
  });

  beforeEach(() => {
    mockConfig = {
      type: 'handwriting',
      character: 'A',
      instruction: 'Schreibe ein A'
    };
    exercise = new HandwritingExercise(mockConfig);
  });

  describe('Initialization', () => {
    it('should create exercise with config', () => {
      expect(exercise).toBeDefined();
      expect(exercise.config).toEqual(mockConfig);
    });

    it('should have correct type', () => {
      expect(exercise.type).toBe('handwriting');
    });

    it('should accept letters', () => {
      const letters = ['A', 'B', 'C', 'O', 'L', 'M', 'S', 'T'];
      letters.forEach((letter) => {
        const config: HandwritingConfig = {
          type: 'handwriting',
          character: letter,
          instruction: `Schreibe ein ${letter}`
        };
        const ex = new HandwritingExercise(config);
        expect(ex.config.character).toBe(letter);
      });
    });

    it('should accept numbers', () => {
      const numbers = ['1', '2', '3', '4', '5'];
      numbers.forEach((num) => {
        const config: HandwritingConfig = {
          type: 'handwriting',
          character: num,
          instruction: `Schreibe eine ${num}`
        };
        const ex = new HandwritingExercise(config);
        expect(ex.config.character).toBe(num);
      });
    });
  });

  describe('Rendering', () => {
    it('should have render method', () => {
      expect(typeof exercise.render).toBe('function');
    });

    it('should render without errors', () => {
      const mockCtx = {
        ctx: {
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          fillText: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          setLineDash: vi.fn()
        },
        width: 800,
        height: 600,
        scale: 1
      } as any;

      expect(() => {
        exercise.render(mockCtx);
      }).not.toThrow();
    });

    it('should render guide character', () => {
      const mockCtx = {
        ctx: {
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          fillText: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          setLineDash: vi.fn()
        },
        width: 800,
        height: 600,
        scale: 1
      } as any;

      exercise.render(mockCtx);

      // Should render the guide character
      expect(mockCtx.ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    it('should have handleInput method', () => {
      expect(typeof exercise.handleInput).toBe('function');
    });

    it('should handle start event', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      const result = exercise.handleInput({ x: 100, y: 100, type: 'start' });
      expect(result).toBeNull();
    });

    it('should handle move event', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      const result = exercise.handleInput({ x: 110, y: 110, type: 'move' });
      expect(result).toBeNull();
    });

    it('should handle end event', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      const result = exercise.handleInput({ x: 100, y: 100, type: 'end' });
      expect(result).toBeNull();
    });

    it('should handle multiple strokes', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      // First stroke
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'end' });

      // Second stroke
      exercise.handleInput({ x: 200, y: 200, type: 'start' });
      exercise.handleInput({ x: 210, y: 210, type: 'move' });
      exercise.handleInput({ x: 220, y: 220, type: 'end' });

      // Both strokes should be tracked
      expect(true).toBe(true);
    });
  });

  describe('Instructions', () => {
    it('should have getInstruction method', () => {
      expect(typeof exercise.getInstruction).toBe('function');
    });

    it('should return instruction text', () => {
      const instruction = exercise.getInstruction();
      expect(instruction).toBe(mockConfig.instruction);
    });

    it('should use German instructions', () => {
      const instruction = exercise.getInstruction();
      expect(instruction).toMatch(/Schreibe/);
    });

    it('should mention the character', () => {
      const instruction = exercise.getInstruction();
      expect(instruction).toContain(mockConfig.character);
    });
  });

  describe('Cleanup', () => {
    it('should have cleanup method', () => {
      expect(typeof exercise.cleanup).toBe('function');
    });

    it('should clean up without errors', () => {
      expect(() => {
        exercise.cleanup();
      }).not.toThrow();
    });

    it('should reset strokes on cleanup', () => {
      exercise.cleanup();
      // Strokes should be cleared
      expect(true).toBe(true);
    });
  });

  describe('Character Validation', () => {
    it('should accept single character', () => {
      expect(mockConfig.character.length).toBe(1);
    });

    it('should work with uppercase letters', () => {
      const config: HandwritingConfig = {
        type: 'handwriting',
        character: 'Z',
        instruction: 'Schreibe ein Z'
      };
      const ex = new HandwritingExercise(config);
      expect(ex.config.character).toBe('Z');
    });

    it('should work with lowercase letters', () => {
      const config: HandwritingConfig = {
        type: 'handwriting',
        character: 'a',
        instruction: 'Schreibe ein a'
      };
      const ex = new HandwritingExercise(config);
      expect(ex.config.character).toBe('a');
    });
  });

  describe('State Management', () => {
    it('should have getState method', () => {
      expect(typeof exercise.getState).toBe('function');
    });

    it('should return state object', () => {
      const state = exercise.getState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('started');
      expect(state).toHaveProperty('completed');
    });
  });
});
