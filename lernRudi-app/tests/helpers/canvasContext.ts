import { vi } from 'vitest';
import type { RenderContext } from '$lib/core/CanvasManager';

export function createCanvasContext(
  width = 800,
  height = 600,
  scale = 1
): RenderContext {
  return {
    ctx: {
      canvas: { width, height },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      globalAlpha: 1,
      shadowColor: '',
      shadowBlur: 0,
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      rect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      roundRect: vi.fn(),
      setLineDash: vi.fn(),
      bezierCurveTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn()
    } as unknown as CanvasRenderingContext2D,
    width,
    height,
    scale,
    time: 0
  };
}
