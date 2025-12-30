import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LineTracingExercise } from '$lib/exercises/motor/LineTracingExercise';
import type { LineTracingConfig } from '$lib/exercises/motor/LineTracingExercise';
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

describe('LineTracingExercise', () => {
  let exercise: LineTracingExercise;
  let config: LineTracingConfig;
  let mockContext: RenderContext;

  beforeEach(() => {
    config = {
      type: 'line_tracing',
      lineType: 'horizontal'
    };
    exercise = new LineTracingExercise(config);
    mockContext = createMockContext();
  });

  describe('Initialization', () => {
    it('should have correct type', () => {
      exercise.initialize(config);
      expect(exercise.type).toBe('line_tracing');
    });

    it('should support all line types', () => {
      const lineTypes = ['horizontal', 'vertical', 'diagonal', 'wavy', 'zigzag', 'curve', 'spiral'];
      lineTypes.forEach(lineType => {
        const cfg = { type: 'line_tracing' as const, lineType: lineType as any };
        const ex = new LineTracingExercise(cfg);
        ex.initialize(cfg);
        expect(ex.getInstruction()).toBeDefined();
      });
    });
  });

  describe('Instructions', () => {
    it('should provide horizontal line instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'horizontal' });
      expect(exercise.getInstruction()).toBe('Ziehe eine waagerechte Linie!');
    });

    it('should provide vertical line instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'vertical' });
      expect(exercise.getInstruction()).toBe('Ziehe eine senkrechte Linie!');
    });

    it('should provide diagonal line instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'diagonal' });
      expect(exercise.getInstruction()).toBe('Ziehe eine schräge Linie!');
    });

    it('should provide wavy line instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'wavy' });
      expect(exercise.getInstruction()).toBe('Ziehe eine Wellenlinie!');
    });

    it('should provide zigzag line instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'zigzag' });
      expect(exercise.getInstruction()).toBe('Ziehe eine Zickzacklinie!');
    });

    it('should provide curve instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'curve' });
      expect(exercise.getInstruction()).toBe('Ziehe eine geschwungene Linie!');
    });

    it('should provide spiral instruction', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'spiral' });
      expect(exercise.getInstruction()).toBe('Ziehe eine Spirale!');
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      exercise.initialize(config);
    });

    it('should render guide path', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.moveTo).toHaveBeenCalled();
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
      expect(mockContext.ctx.stroke).toHaveBeenCalled();
    });

    it('should render dashed guide line', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.setLineDash).toHaveBeenCalled();
    });

    it('should render start marker', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.arc).toHaveBeenCalled();
    });

    it('should render Fertig button', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        'Fertig',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render repeat button', () => {
      exercise.render(mockContext);
      expect(mockContext.ctx.fillText).toHaveBeenCalledWith(
        '🔊',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Tracing Input', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should start tracing on start event', () => {
      const result = exercise.handleInput({ x: 100, y: 300, type: 'start' });
      expect(result).toBeNull();
    });

    it('should continue tracing on move events', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      exercise.handleInput({ x: 120, y: 300, type: 'move' });

      vi.clearAllMocks();
      exercise.render(mockContext);

      // Should have drawn the traced path
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should stop tracing on end event', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });
      const result = exercise.handleInput({ x: 120, y: 300, type: 'end' });

      expect(result).toBeNull();
    });
  });

  describe('Fertig Button', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should not complete with insufficient tracing', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 105, y: 300, type: 'move' });
      exercise.handleInput({ x: 110, y: 300, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });
      expect(result).toBeNull();
    });

    it('should complete with sufficient tracing', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 20; i++) {
        exercise.handleInput({ x: 100 + i * 5, y: 300, type: 'move' });
      }
      exercise.handleInput({ x: 200, y: 300, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });
      expect(result).not.toBeNull();
      expect(result?.metadata).toBeDefined();
      expect(result?.metadata?.lineType).toBe('horizontal');
    });

    it('should include accuracy in metadata', () => {
      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      for (let i = 0; i < 20; i++) {
        exercise.handleInput({ x: 100 + i * 5, y: 300, type: 'move' });
      }
      exercise.handleInput({ x: 200, y: 300, type: 'end' });

      const result = exercise.handleInput({ x: 750, y: 550, type: 'start' });
      expect(result?.metadata?.accuracy).toBeGreaterThanOrEqual(0);
      expect(result?.metadata?.accuracy).toBeLessThanOrEqual(1);
    });
  });

  describe('Repeat Button', () => {
    beforeEach(() => {
      exercise.initialize(config);
      exercise.render(mockContext);
    });

    it('should set repeatRequested flag', () => {
      exercise.handleInput({ x: 750, y: 20, type: 'start' });
      expect(exercise.repeatRequested).toBe(true);
    });

    it('should not process tracing when repeat clicked', () => {
      exercise.handleInput({ x: 750, y: 20, type: 'start' });
      expect(exercise.repeatRequested).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset tracing state', () => {
      exercise.initialize(config);
      exercise.render(mockContext);

      exercise.handleInput({ x: 100, y: 300, type: 'start' });
      exercise.handleInput({ x: 110, y: 300, type: 'move' });

      exercise.reset();

      vi.clearAllMocks();
      exercise.render(mockContext);
      expect(() => exercise.render(mockContext)).not.toThrow();
    });
  });

  describe('Line Type Variations', () => {
    it('should generate wavy line path', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'wavy' });
      vi.clearAllMocks();
      exercise.render(mockContext);

      // Wavy line has many points
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });

    it('should generate spiral path', () => {
      exercise.initialize({ type: 'line_tracing', lineType: 'spiral' });
      vi.clearAllMocks();
      exercise.render(mockContext);

      // Spiral has many points
      expect(mockContext.ctx.lineTo).toHaveBeenCalled();
    });
  });
});
