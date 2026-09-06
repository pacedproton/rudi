/**
 * CanvasManager - Canvas setup and render loop management
 *
 * Handles canvas initialization, responsive resizing, and render loop
 */

import { get } from 'svelte/store';
import { canvasSize, updateCanvasSize } from './StateManager';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  scale: number;
  time: number;  // Frame counter for animations
}

export type RenderFunction = (ctx: RenderContext) => void;

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number | null = null;
  private renderFn: RenderFunction | null = null;
  private time = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;

    this.setupResponsive();
  }

  /**
   * Set up responsive canvas resizing
   */
  private setupResponsive(): void {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update canvas dimensions
      this.canvas.width = width;
      this.canvas.height = height;

      // Update store with new dimensions and scale
      updateCanvasSize(width, height);
    };

    // Initial resize
    resize();

    // Listen for window resize
    window.addEventListener('resize', resize);

    // Also use ResizeObserver for better responsiveness
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => resize());
      this.resizeObserver.observe(this.canvas.parentElement || document.body);
    }
  }

  /**
   * Start the render loop
   * @param renderFn Function to call each frame
   */
  startRenderLoop(renderFn: RenderFunction): void {
    this.renderFn = renderFn;

    const render = () => {
      this.time++;
      const size = get(canvasSize);

      // Create render context
      const context: RenderContext = {
        ctx: this.ctx,
        width: size.width,
        height: size.height,
        scale: size.scale,
        time: this.time
      };

      // Call render function
      if (this.renderFn) {
        this.renderFn(context);
      }

      // Continue loop
      this.animationFrame = requestAnimationFrame(render);
    };

    // Start loop
    render();
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    const size = get(canvasSize);
    this.ctx.clearRect(0, 0, size.width, size.height);
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the 2D context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopRenderLoop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Note: We don't remove window resize listener as it's added globally
    // Consider using addEventListener with { once: true } or proper cleanup in production
  }

  /**
   * Get current frame time
   */
  getTime(): number {
    return this.time;
  }

  /**
   * Reset frame counter
   */
  resetTime(): void {
    this.time = 0;
  }
}
