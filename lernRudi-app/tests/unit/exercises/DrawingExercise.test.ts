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
import { sampleDrawingShape } from '$lib/exercises/drawing/sampleShapePath';
import { createCanvasContext } from '../../helpers/canvasContext';

describe('DrawingExercise', () => {
  let exercise: DrawingExercise;
  let mockConfig: DrawingConfig;

  const createMockContext = () => createCanvasContext();

  function clickFertig() {
    return exercise.handleInput({ x: 70, y: 550, type: 'end' });
  }

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
      expect(() => {
        exercise.render(createMockContext());
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

  describe('Scoring', () => {
    it('rejects random points away from the circle', () => {
      exercise.render(createMockContext());
      exercise.handleInput({ x: 40, y: 40, type: 'start' });
      for (let i = 0; i < 24; i++) {
        exercise.handleInput({ x: 40 + (i % 6) * 8, y: 40 + Math.floor(i / 6) * 8, type: 'move' });
      }
      exercise.handleInput({ x: 80, y: 80, type: 'end' });
      expect(clickFertig()).toBeNull();
    });

    it('accepts points along the dashed circle', () => {
      exercise.render(createMockContext());
      const [guide] = sampleDrawingShape('circle', 800, 600, 1);
      exercise.handleInput({ x: guide[0].x, y: guide[0].y, type: 'start' });
      for (const point of guide.slice(1)) {
        exercise.handleInput({ x: point.x, y: point.y, type: 'move' });
      }
      exercise.handleInput({ x: guide[guide.length - 1].x, y: guide[guide.length - 1].y, type: 'end' });
      const result = clickFertig();
      expect(result).not.toBeNull();
      expect(result?.correct).toBe(true);
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
