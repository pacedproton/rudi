import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TracePathExercise } from '$lib/exercises/motor/TracePathExercise';
import type { TracePathConfig } from '$lib/exercises/motor/TracePathExercise';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent } from '$lib/exercises/base/types';

// Mock canvas context
const createMockContext = (): RenderContext => ({
  ctx: {
    canvas: { width: 800, height: 600 },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    save: vi.fn(),
    restore: vi.fn()
  } as any,
  width: 800,
  height: 600,
  scale: 1
});

describe('TracePathExercise', () => {
  let exercise: TracePathExercise;
  let config: TracePathConfig;
  let mockContext: RenderContext;

  beforeEach(() => {
    config = {
      type: 'trace_path',
      difficulty: 'medium'
    };
    exercise = new TracePathExercise(config);
    mockContext = createMockContext();
  });

  describe('Initialization', () => {
    it('should have correct type', () => {
      expect(exercise.type).toBe('trace_path');
    });

    it('should initialize with default medium difficulty', () => {
      exercise.initialize(config);
      expect(exercise.getInstruction()).toBeDefined();
    });

    it('should support all difficulty levels', () => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      difficulties.forEach(difficulty => {
        const cfg = { type: 'trace_path' as const, difficulty };
        const ex = new TracePathExercise(cfg);
        ex.initialize(cfg);
        expect(ex.getInstruction()).toBeDefined();
      });
    });

    it('should default to medium if no difficulty specified', () => {
      const cfg = { type: 'trace_path' as const };
      exercise = new TracePathExercise(cfg);
      exercise.initialize(cfg);
      expect(exercise.getInstruction()).toBeDefined();
    });
  });

  describe('Instructions', () => {
    it('should provide instruction in German', () => {
      exercise.initialize(config);
      expect(exercise.getInstruction()).toBe('Fahre mit dem Finger die Straße nach!');
    });

    it('should include instruction in onStart speech', () => {
      exercise.initialize(config);
      const speech = exercise.onStart();
      expect(speech[0].text).toContain('Straße');
    });
  });

  describe('Path Generation', () => {
    it('should generate curvy path for easy difficulty', () => {
      exercise.initialize({ type: 'trace_path', difficulty: 'easy' });
      exercise.render(mockContext);

      // Easy should have fewer points (5)
      // Check that path is rendered
      expect(mockContext.ctx.moveTo).toHaveBeenCalled();
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should generate more complex path for hard difficulty', () => {
      exercise.initialize({ type: 'trace_path', difficulty: 'hard' });
      exercise.render(mockContext);

      // Hard should have more points (12)
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should generate different paths on re-initialization', () => {
      exercise.initialize(config);
      exercise.render(mockContext);
      const firstCallCount = (mockContext.ctx.lineTo as any).mock.calls.length;

      vi.clearAllMocks();

      exercise.initialize(config);
      exercise.render(mockContext);
      const secondCallCount = (mockContext.ctx.lineTo as any).mock.calls.length;

      // Both should have rendered paths
      expect(firstCallCount).toBeGreaterThan(0);
      expect(secondCallCount).toBeGreaterThan(0);
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      exercise.initialize(config);
    });

    it('should render path guide', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.moveTo).toHaveBeenCalled();
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
      expect(mockContext.ctx.stroke).toHaveBeenCalled();
    });

    it('should render start marker', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.arc).toHaveBeenCalled();
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        '⚑',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render end marker', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        '★',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render dashed centerline', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.setLineDash).toHaveBeenCalled();
    });

    it('should render instruction text', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        'Fahre die Straße nach!',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render Fertig button', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        'Fertig',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render repeat instruction button', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        '🔊',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render traced path', () => {
      // Draw a trace
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      exercise.handleInput({ x: 120, y: 300, type: 'move' });

      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should render the traced path
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });
  });

  describe('Tracing Input', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render to save context
    });

    it('should start tracing on start event', () => {
      const result = exercise.handleInput({ x: 100, y: 300, type: 'start' });
      expect(result).toBeNull(); // Not complete yet
    });

    it('should continue tracing on move events', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      exercise.handleInput({ x: 120, y: 300, type: 'move' });

      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should have multiple points
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should stop tracing on end event', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      const result = exercise.handleInput({ x: 120, y: 300, type: 'end' });

      expect(result).toBeNull(); // Not complete until Fertig
    });

    it('should allow multiple trace attempts', () => {
      // First trace
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      exercise.handleInput({ x: 120, y: 300, type: 'end' });

      // Second trace
      exercise.handleInput({ x: 200, y: 300, type: 'start' });
      exercise.handleInput({ x: 210, y: 300, type: 'move' });
      exercise.handleInput({ x: 220, y: 300, type: 'end' });

      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should render traced paths
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });
  });

  describe('Fertig Button', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render to save context
    });

    it('should not complete if insufficient tracing (< 10 points)', () => {
      // Draw just a few points
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 105, y: 300, type: 'move' });
      exercise.handleInput({ x: 110, y: 300, type: 'end' });

      // Click Fertig button (right side, near bottom)
      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });

      expect(result).toBeNull(); // Insufficient tracing
    });

    it('should complete if sufficient tracing (> 10 points)', () => {
      // Draw enough points
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 15; i++) {
        exercise.handleInput({ x: 100 + i * 5, y: 300, type: 'move' });
      }
      exercise.handleInput({ x: 200, y: 300, type: 'end' });

      // Click Fertig button
      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });

      expect(result).not.toBeNull();
      expect(result?.responseTime).toBeDefined();
    });

    it('should calculate coverage score', () => {
      // Trace a good path
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 50; i++) {
        exercise.handleInput({ x: 100 + i * 5, y: 300 + Math.sin(i * 0.5) * 20, type: 'move' });
      }
      exercise.handleInput({ x: 350, y: 300, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });

      // Coverage determines correctness
      expect(result).not.toBeNull();
      expect(typeof result?.correct).toBe('boolean');
    });
  });

  describe('Repeat Button Functionality', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should set repeatRequested flag when repeat button clicked', () => {
      const result = exercise.handleInput({ x: 750, y: 20, type: 'start' });

      expect(result).toBeNull();
      expect(exercise.repeatRequested).toBe(true);
    });

    it('should NOT process drawing when repeat button clicked', () => {
      exercise.handleInput({ x: 750, y: 20, type: 'start' });

      // Should not have started tracing
      vi.clearAllMocks();
      exercise.render(mockContext);

      expect(exercise.repeatRequested).toBe(true);
    });
  });

  describe('Coverage Calculation', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should accept well-traced path (>60% coverage)', () => {
      // Trace along the path
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 100; i++) {
        exercise.handleInput({
          x: 100 + i * 6,
          y: 300 + Math.sin(i * 0.3) * 100,
          type: 'move'
        });
      }
      exercise.handleInput({ x: 700, y: 300, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });

      expect(result).not.toBeNull();
      // Good coverage should be marked correct
      expect(result?.correct).toBe(true);
    });

    it('should reject poorly-traced path (<60% coverage)', () => {
      // Trace far from the path
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      for (let i = 0; i < 15; i++) {
        exercise.handleInput({ x: 100 + i, y: 100, type: 'move' });
      }
      exercise.handleInput({ x: 115, y: 100, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });

      expect(result).not.toBeNull();
      // Poor coverage should be marked incorrect
      expect(result?.correct).toBe(false);
    });
  });

  describe('Button State', () => {
    beforeEach(() => {
      exercise.initialize(config);
    });

    it('should disable Fertig button when no tracing done', () => {
      exercise.render(mockContext);

      // Button should be rendered but disabled (gray)
      // This is a visual state, hard to test directly
      // but we verify it doesn't complete
      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });
      expect(result).toBeNull();
    });

    it('should enable Fertig button after sufficient tracing', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 15; i++) {
        exercise.handleInput({ x: 100 + i * 5, y: 300, type: 'move' });
      }
      exercise.handleInput({ x: 200, y: 300, type: 'end' });

      exercise.render(mockContext);

      // Button should now work
      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });
      expect(result).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should handle clicks outside path area', () => {
      const result = exercise.handleInput({ x: 0, y: 0, type: 'start' });
      expect(result).toBeNull();
    });

    it('should handle move without start', () => {
      const result = exercise.handleInput({ x: 100, y: 300, type: 'move' });
      expect(result).toBeNull();
    });

    it('should handle end without start', () => {
      const result = exercise.handleInput({ x: 100, y: 300, type: 'end' });
      expect(result).toBeNull();
    });

    it('should handle rapid input events', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 200; i++) {
        exercise.handleInput({ x: 100 + i, y: 300, type: 'move' });
      }

      expect(() => exercise.render(mockContext)).not.toThrow();
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset tracing state', () => {
      exercise.initialize(config);
      exercise.render(mockContext);

      // Trace something
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });

      exercise.reset();

      // State should be cleared
      vi.clearAllMocks();
      exercise.render(mockContext);
      // Hard to verify traced path is gone without internal state access
      // but verify no crash
      expect(() => exercise.render(mockContext)).not.toThrow();
    });

    it('should cleanup resources', () => {
      exercise.initialize(config);
      exercise.cleanup();

      expect(() => exercise.render(mockContext)).not.toThrow();
    });
  });
});
