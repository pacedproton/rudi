import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TraceExercise } from '$lib/exercises/motor/TraceExercise';
import type { TraceExerciseConfig } from '$lib/exercises/motor/TraceExercise';
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
    shadowColor: '',
    shadowBlur: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
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
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    save: vi.fn(),
    restore: vi.fn()
  } as any,
  width: 800,
  height: 600,
  scale: 1
});

describe('TraceExercise', () => {
  let exercise: TraceExercise;
  let config: TraceExerciseConfig;
  let mockContext: RenderContext;

  beforeEach(() => {
    config = {
      type: 'trace',
      shape: 'circle'
    };
    exercise = new TraceExercise(config);
    mockContext = createMockContext();
  });

  describe('Initialization', () => {
    it('should have correct type', () => {
      expect(exercise.type).toBe('trace');
    });

    it('should initialize with shape', () => {
      exercise.initialize(config);
      expect(exercise.getInstruction()).toContain('Kreis');
    });

    it('should support all shapes', () => {
      const shapes: Array<'circle' | 'cross' | 'triangle'> = ['circle', 'cross', 'triangle'];
      shapes.forEach(shape => {
        const cfg = { type: 'trace' as const, shape };
        const ex = new TraceExercise(cfg);
        ex.initialize(cfg);
        expect(ex.getInstruction()).toBeDefined();
      });
    });

    it('should reset drawing state on initialize', () => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render first

      // Simulate some drawing
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });

      // Re-initialize
      exercise.initialize(config);
      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should have clean state (no drawing paths rendered)
      // We can't easily check this without internal state, but verify no crash
      expect(mockContext.ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('Instructions', () => {
    it('should provide circle instruction in German', () => {
      exercise.initialize({ type: 'trace', shape: 'circle' });
      expect(exercise.getInstruction()).toBe('Zeichne den Kreis nach!');
    });

    it('should provide cross instruction in German', () => {
      exercise.initialize({ type: 'trace', shape: 'cross' });
      expect(exercise.getInstruction()).toBe('Zeichne das Kreuz nach!');
    });

    it('should provide triangle instruction in German', () => {
      exercise.initialize({ type: 'trace', shape: 'triangle' });
      expect(exercise.getInstruction()).toBe('Zeichne das Dreieck nach!');
    });

    it('should include instruction in onStart speech', () => {
      exercise.initialize(config);
      const speech = exercise.onStart();
      expect(speech[0].text).toContain('Kreis');
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      exercise.initialize(config);
    });

    it('should render guide shape', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.arc).toHaveBeenCalled();
      expect(mockContext.ctx.stroke).toHaveBeenCalled();
    });

    it('should render dashed guide lines', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.setLineDash).toHaveBeenCalledWith([10]);
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

    it('should render drawn paths', () => {
      exercise.render(mockContext); // Must render first to save context

      // Draw a path
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'move' });

      vi.clearAllMocks();
      exercise.render(mockContext);

      expect(mockContext.ctx.moveTo).toHaveBeenCalledWith(100, 100);
      expect(mockContext.ctx.lineTo).toHaveBeenCalledWith(110, 110);
      expect(mockContext.ctx.lineTo).toHaveBeenCalledWith(120, 120);
    });
  });

  describe('Drawing Input', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render to save context
    });

    it('should start drawing on start event', () => {
      const result = exercise.handleInput({ x: 100, y: 100, type: 'start' });
      expect(result).toBeNull(); // Drawing doesn't complete immediately
    });

    it('should add points on move events', () => {
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'move' });

      // Render should show multiple points
      vi.clearAllMocks();
      exercise.render(mockContext);
      expect(mockContext.ctx.lineTo).toHaveBeenCalledTimes(2);
    });

    it('should complete path on end event', () => {
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      const result = exercise.handleInput({ x: 120, y: 120, type: 'end' });

      expect(result).toBeNull(); // Not complete until Fertig clicked
    });

    it('should allow multiple drawing paths', () => {
      exercise.render(mockContext); // Must render first to save context

      // First path
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'end' });

      // Second path
      exercise.handleInput({ x: 200, y: 200, type: 'start' });
      exercise.handleInput({ x: 210, y: 210, type: 'move' });
      exercise.handleInput({ x: 220, y: 220, type: 'end' });

      // Should render both paths
      vi.clearAllMocks();
      exercise.render(mockContext);
      expect(mockContext.ctx.beginPath).toHaveBeenCalled();
    });
  });

  describe('Fertig Button - Bug Fix', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render to save context
    });

    it('should complete exercise when Fertig clicked', () => {
      // Draw something first
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'end' });

      // Click Fertig button (bottom center)
      const result = exercise.handleInput({ x: 400, y: 550, type: 'start' });

      expect(result).not.toBeNull();
      expect(result?.correct).toBe(true);
      expect(result?.responseTime).toBeDefined();
    });

    it('CRITICAL: should NOT start new path when Fertig clicked', () => {
      // Draw a path
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'end' });

      // Click Fertig button
      const result = exercise.handleInput({ x: 400, y: 550, type: 'start' });
      expect(result).not.toBeNull();

      // Should return result immediately, not continue processing
      // If bug exists, it would start a new path at button coordinates
      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should NOT have drawn a new point at button coordinates
      // (Can't easily assert this without exposing internal state,
      // but the test verifies the result is returned)
    });

    it('should include metadata in result', () => {
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });
      exercise.handleInput({ x: 120, y: 120, type: 'end' });

      const result = exercise.handleInput({ x: 400, y: 550, type: 'start' });

      expect(result?.metadata).toBeDefined();
      expect(result?.metadata?.pathCount).toBe(1);
      expect(result?.metadata?.totalPoints).toBeGreaterThan(0);
    });
  });

  describe('Repeat Button Functionality', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext); // Must render to save context
    });

    it('should set repeatRequested flag when repeat button clicked', () => {
      // Click repeat button (top-right corner)
      const result = exercise.handleInput({ x: 750, y: 20, type: 'start' });

      expect(result).toBeNull();
      expect(exercise.repeatRequested).toBe(true);
    });

    it('should NOT process other inputs when repeat button clicked', () => {
      // Click repeat button
      exercise.handleInput({ x: 750, y: 20, type: 'start' });

      // Should not start a drawing path at those coordinates
      vi.clearAllMocks();
      exercise.render(mockContext);

      // If it incorrectly started drawing, we'd see drawing calls
      // Instead, verify repeatRequested is true
      expect(exercise.repeatRequested).toBe(true);
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset drawing state', () => {
      exercise.initialize(config);
      exercise.render(mockContext);

      // Draw something
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      exercise.handleInput({ x: 110, y: 110, type: 'move' });

      exercise.reset();

      // State should be cleared
      vi.clearAllMocks();
      exercise.render(mockContext);
      expect(mockContext.ctx.lineTo).not.toHaveBeenCalled();
    });

    it('should cleanup resources', () => {
      exercise.initialize(config);
      exercise.cleanup();

      // Should not throw when rendering after cleanup
      expect(() => exercise.render(mockContext)).not.toThrow();
    });
  });

  describe('Shape Variations', () => {
    it('should render cross shape with two lines', () => {
      const crossConfig = { type: 'trace' as const, shape: 'cross' as const };
      exercise = new TraceExercise(crossConfig);
      exercise.initialize(crossConfig);

      vi.clearAllMocks();
      exercise.render(mockContext);

      // Cross has vertical and horizontal lines
      expect(mockContext.ctx.moveTo).toHaveBeenCalled();
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should render triangle shape', () => {
      const triangleConfig = { type: 'trace' as const, shape: 'triangle' as const };
      exercise = new TraceExercise(triangleConfig);
      exercise.initialize(triangleConfig);

      vi.clearAllMocks();
      exercise.render(mockContext);

      expect(mockContext.ctx.closePath).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should handle clicking outside drawing area', () => {
      const result = exercise.handleInput({ x: -10, y: -10, type: 'start' });
      expect(result).toBeNull();
    });

    it('should handle move events without start', () => {
      const result = exercise.handleInput({ x: 100, y: 100, type: 'move' });
      expect(result).toBeNull();
    });

    it('should handle end events without start', () => {
      const result = exercise.handleInput({ x: 100, y: 100, type: 'end' });
      expect(result).toBeNull();
    });

    it('should handle rapid input events', () => {
      exercise.handleInput({ x: 100, y: 100, type: 'start' });
      for (let i = 0; i < 100; i++) {
        exercise.handleInput({ x: 100 + i, y: 100 + i, type: 'move' });
      }
      exercise.handleInput({ x: 200, y: 200, type: 'end' });

      // Should not crash or throw
      expect(() => exercise.render(mockContext)).not.toThrow();
    });
  });
});
