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

import { ConnectDotsExercise, generateDotPattern, layoutDots } from '$lib/exercises/drawing/ConnectDotsExercise';
import type { ConnectDotsConfig } from '$lib/exercises/drawing/ConnectDotsExercise';
import { createCanvasContext } from '../../helpers/canvasContext';

describe('ConnectDotsExercise', () => {
  let exercise: ConnectDotsExercise;
  let mockConfig: ConnectDotsConfig;

  const createMockContext = () => createCanvasContext();

  beforeEach(() => {
    mockConfig = {
      type: 'connect_dots',
      dots: [
        { x: 100, y: 100, number: 1 },
        { x: 200, y: 100, number: 2 },
        { x: 200, y: 200, number: 3 },
        { x: 100, y: 200, number: 4 }
      ],
      shape: 'Quadrat',
      instruction: 'Verbinde die Punkte!'
    };
    exercise = new ConnectDotsExercise(mockConfig);
  });

  describe('Initialization', () => {
    it('should create exercise with config', () => {
      expect(exercise).toBeDefined();
      expect(exercise.config).toEqual(mockConfig);
    });

    it('should have correct type', () => {
      expect(exercise.type).toBe('connect_dots');
    });

    it('should have dots array', () => {
      expect(mockConfig.dots).toBeDefined();
      expect(Array.isArray(mockConfig.dots)).toBe(true);
      expect(mockConfig.dots.length).toBeGreaterThan(0);
    });

    it('should have numbered dots', () => {
      mockConfig.dots.forEach((dot, index) => {
        expect(dot.number).toBe(index + 1);
        expect(dot.x).toBeGreaterThanOrEqual(0);
        expect(dot.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have shape name', () => {
      expect(mockConfig.shape).toBeDefined();
      expect(typeof mockConfig.shape).toBe('string');
    });
  });

  describe('generateDotPattern', () => {
    it('should generate star pattern', () => {
      const dots = generateDotPattern('star', 800, 600);
      expect(dots).toBeDefined();
      expect(Array.isArray(dots)).toBe(true);
      expect(dots.length).toBeGreaterThan(0);

      // Check sequential numbering
      dots.forEach((dot, index) => {
        expect(dot.number).toBe(index + 1);
      });
    });

    it('should generate house pattern', () => {
      const dots = generateDotPattern('house', 800, 600);
      expect(dots).toBeDefined();
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should generate tree pattern', () => {
      const dots = generateDotPattern('tree', 800, 600);
      expect(dots).toBeDefined();
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should generate heart pattern', () => {
      const dots = generateDotPattern('heart', 800, 600);
      expect(dots).toBeDefined();
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should generate flower pattern', () => {
      const dots = generateDotPattern('flower', 800, 600);
      expect(dots).toBeDefined();
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should have valid coordinates', () => {
      const dots = generateDotPattern('star', 800, 600);
      dots.forEach((dot) => {
        expect(dot.x).toBeGreaterThanOrEqual(0);
        expect(dot.x).toBeLessThanOrEqual(800);
        expect(dot.y).toBeGreaterThanOrEqual(0);
        expect(dot.y).toBeLessThanOrEqual(600);
      });
    });

    it('should scale to different canvas sizes', () => {
      const dots1 = generateDotPattern('star', 400, 300);
      const dots2 = generateDotPattern('star', 1200, 900);

      expect(dots1.length).toBe(dots2.length);
      // Coordinates should be scaled appropriately
      expect(dots2[0].x).not.toBe(dots1[0].x);
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

    it('should handle click on first dot', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      const result = exercise.handleInput({ x: 100, y: 100, type: 'end' });
      // Result should be null until all dots are connected
      expect(result).toBeNull();
    });

    it('should handle end event', () => {
      // Must render first to save context
      exercise.render(createMockContext());

      const result = exercise.handleInput({ x: 500, y: 500, type: 'end' });
      // Should not throw
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
      expect(instruction).toMatch(/Verbinde|Punkte/);
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

  describe('Closed house shape', () => {
    const houseDots = [
      { x: 250, y: 300, number: 1 },
      { x: 250, y: 200, number: 2 },
      { x: 350, y: 150, number: 3 },
      { x: 450, y: 200, number: 4 },
      { x: 450, y: 300, number: 5 },
      { x: 450, y: 450, number: 6 },
      { x: 250, y: 450, number: 7 },
      { x: 250, y: 300, number: 8 }
    ];

    it('completes when the closing tap shares a pixel with dot 1', () => {
      exercise = new ConnectDotsExercise({
        type: 'connect_dots',
        dots: houseDots,
        shape: 'Haus',
        instruction: 'Verbinde die Punkte zum Haus!'
      });
      exercise.render(createMockContext());

      let result = null;
      for (const dot of houseDots) {
        result = exercise.handleInput({ x: dot.x, y: dot.y, type: 'end' });
      }

      expect(result).not.toBeNull();
      expect(result?.correct).toBe(true);
    });

    it('centers the 800x600 pattern on a wide canvas', () => {
      const laid = layoutDots(houseDots, 1200, 800, 1);
      expect(laid[0].x).toBe(450);
      expect(laid[0].x).not.toBe(250);
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
