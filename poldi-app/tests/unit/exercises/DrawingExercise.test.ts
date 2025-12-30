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

import { DrawingExercise } from '$lib/exercises/drawing/DrawingExercise';
import type { DrawingConfig } from '$lib/exercises/drawing/DrawingExercise';

describe('DrawingExercise', () => {
  let exercise: DrawingExercise;
  let mockConfig: DrawingConfig;

  const createMockContext = () => ({
    ctx: {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
      bezierCurveTo: vi.fn()
    } as any,
    width: 800,
    height: 600,
    scale: 1
  });

  beforeEach(() => {
    mockConfig = {
      type: 'drawing',
      shape: 'circle',
      instruction: 'Zeichne einen Kreis'
    };
    exercise = new DrawingExercise(mockConfig);
  });

  describe('Initialization', () => {
    it('should create exercise with config', () => {
      expect(exercise).toBeDefined();
      expect(exercise.config).toEqual(mockConfig);
    });

    it('should have correct type', () => {
      expect(exercise.type).toBe('drawing');
    });

    it('should accept circle shape', () => {
      const config: DrawingConfig = {
        type: 'drawing',
        shape: 'circle',
        instruction: 'Zeichne einen Kreis'
      };
      const ex = new DrawingExercise(config);
      expect(ex.config.shape).toBe('circle');
    });

    it('should accept square shape', () => {
      const config: DrawingConfig = {
        type: 'drawing',
        shape: 'square',
        instruction: 'Zeichne ein Quadrat'
      };
      const ex = new DrawingExercise(config);
      expect(ex.config.shape).toBe('square');
    });

    it('should accept all shape types', () => {
      const shapes = ['circle', 'square', 'triangle', 'star', 'heart'] as const;
      shapes.forEach((shape) => {
        const config: DrawingConfig = {
          type: 'drawing',
          shape,
          instruction: `Zeichne ${shape}`
        };
        const ex = new DrawingExercise(config);
        expect(ex.config.shape).toBe(shape);
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
          arc: vi.fn(),
          stroke: vi.fn(),
          rect: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          setLineDash: vi.fn(),
          bezierCurveTo: vi.fn()
        },
        width: 800,
        height: 600,
        scale: 1
      } as any;

      expect(() => {
        exercise.render(mockCtx);
      }).not.toThrow();
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
      expect(instruction).toMatch(/Zeichne/);
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
