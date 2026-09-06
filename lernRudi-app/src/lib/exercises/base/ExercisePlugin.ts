/**
 * ExercisePlugin - Abstract base class for all exercise types
 *
 * Provides common functionality and enforces the plugin interface
 */

import type {
  IExercisePlugin,
  ExerciseType,
  ExerciseConfig,
  ExerciseState,
  ExerciseResult,
  InputEvent,
  Rect,
  BoxStyle
} from './types';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { SpeechRequest } from '$lib/core/SpeechEngine';

export abstract class ExercisePlugin implements IExercisePlugin {
  protected state: ExerciseState;
  protected startTime: number = 0;
  private savedContext: RenderContext | null = null;
  protected hasIncorrectAttempt: boolean = false; // Track if user made wrong choice

  // Repeat instruction button
  public repeatRequested: boolean = false;
  private repeatButtonRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

  constructor(public config: ExerciseConfig) {
    this.state = {
      started: false,
      completed: false,
      locked: false,
      customState: {}
    };
  }

  // ===== ABSTRACT METHODS (must be implemented by subclasses) =====

  abstract get type(): ExerciseType;
  abstract render(ctx: RenderContext): void;
  abstract handleInput(event: InputEvent): ExerciseResult | null;
  abstract getInstruction(): string;

  // ===== DEFAULT IMPLEMENTATIONS =====

  initialize(config: ExerciseConfig): void {
    this.config = config;
    this.state.started = true;
    this.startTime = Date.now();
  }

  onStart(): SpeechRequest[] {
    return [{ text: this.getInstruction() }];
  }

  onComplete(result: ExerciseResult): void {
    this.state.completed = true;
  }

  cleanup(): void {
    this.state = {
      started: false,
      completed: false,
      locked: false,
      customState: {}
    };
  }

  getState(): ExerciseState {
    return { ...this.state };
  }

  setState(state: Partial<ExerciseState>): void {
    this.state = { ...this.state, ...state };
  }

  reset(): void {
    this.cleanup();
    this.startTime = Date.now();
  }

  supportsReplay(): boolean {
    return true;
  }

  // ===== HELPER METHODS =====

  /**
   * Draw repeat instruction button (speaker icon)
   * Call this in your render() method to show the button
   */
  protected drawRepeatButton(ctx: RenderContext): void {
    const { width, scale } = ctx;
    const buttonSize = 50 * scale;
    const margin = 20 * scale;
    const backButtonClearance = 70 * scale;

    // Sit left of the HTML back button in the top-right corner
    this.repeatButtonRect = {
      x: width - buttonSize - margin - backButtonClearance,
      y: margin,
      w: buttonSize,
      h: buttonSize
    };

    // Draw button background
    this.drawRoundedRect(ctx, this.repeatButtonRect, {
      fillStyle: 'rgba(102, 126, 234, 0.9)',
      strokeStyle: '#555',
      lineWidth: 2 * scale,
      borderRadius: buttonSize / 2
    });

    // Draw speaker icon (simple emoji)
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      '🔊',
      this.repeatButtonRect.x + this.repeatButtonRect.w / 2,
      this.repeatButtonRect.y + this.repeatButtonRect.h / 2
    );
  }

  /**
   * Check if repeat button was clicked
   * Call this in your handleInput() method BEFORE other input handling
   * Returns true if repeat was requested (and sets repeatRequested flag)
   */
  protected checkRepeatButtonClick(event: InputEvent): boolean {
    if (!this.isStartEvent(event)) {
      return false;
    }

    if (this.isInside(event.x, event.y, this.repeatButtonRect)) {
      this.repeatRequested = true;
      return true;
    }

    return false;
  }

  /**
   * Check if a point is inside a rectangle
   */
  protected isInside(x: number, y: number, rect: Rect): boolean {
    return x >= rect.x &&
           x <= rect.x + rect.w &&
           y >= rect.y &&
           y <= rect.y + rect.h;
  }

  /**
   * Draw a rounded rectangle
   */
  protected drawRoundedRect(
    ctx: RenderContext,
    rect: Rect,
    style?: BoxStyle
  ): void {
    const { x, y, w, h } = rect;
    const radius = style?.borderRadius || 10;

    ctx.ctx.beginPath();
    ctx.ctx.roundRect(x, y, w, h, radius);

    if (style?.fillStyle) {
      ctx.ctx.fillStyle = style.fillStyle;
    }
    ctx.ctx.fill();

    if (style?.strokeStyle) {
      ctx.ctx.strokeStyle = style.strokeStyle;
      ctx.ctx.lineWidth = style.lineWidth || 2;
      ctx.ctx.stroke();
    }
  }

  /**
   * Draw text centered in a rectangle
   */
  protected drawCenteredText(
    ctx: RenderContext,
    text: string,
    rect: Rect,
    fontSize: number
  ): void {
    ctx.ctx.font = `${fontSize * ctx.scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      text,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2
    );
  }

  /**
   * Draw an emoji icon centered in a rectangle
   */
  protected drawIcon(
    ctx: RenderContext,
    icon: string,
    rect: Rect,
    fontSize: number
  ): void {
    ctx.ctx.font = `${fontSize * ctx.scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      icon,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2
    );
  }

  /**
   * Get elapsed time since exercise started
   */
  protected getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Save render context for later use (e.g., in handleInput)
   */
  protected saveContext(ctx: RenderContext): void {
    this.savedContext = ctx;
  }

  /**
   * Get saved render context
   */
  protected getSavedContext(): RenderContext | null {
    return this.savedContext;
  }

  /**
   * Store render context for use in input handlers
   * (Some exercises need dimensions for click detection)
   */
  protected lastRenderContext?: RenderContext;

  /**
   * Save render context (call in render method)
   */
  protected saveRenderContext(ctx: RenderContext): void {
    this.lastRenderContext = ctx;
  }

  /**
   * Get last render context
   */
  protected getRenderContext(): RenderContext {
    if (!this.lastRenderContext) {
      throw new Error('Render context not available. Call saveRenderContext() in render()');
    }
    return this.lastRenderContext;
  }

  /**
   * Check if input is a "start" event (pointer down)
   */
  protected isStartEvent(event: InputEvent): boolean {
    return event.type === 'start';
  }

  /**
   * Check if input is a "move" event
   */
  protected isMoveEvent(event: InputEvent): boolean {
    return event.type === 'move';
  }

  /**
   * Check if input is an "end" event (pointer up)
   */
  protected isEndEvent(event: InputEvent): boolean {
    return event.type === 'end';
  }
}
