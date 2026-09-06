/**
 * Shared stroke capture, four-line paper, and control buttons
 * for the post-reading writing exercises.
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseResult, InputEvent, Rect } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { audioEngine } from '$lib/core/AudioEngine';
import { drawFourLinePaper, getPaperLayout, type PaperLayout } from './paper';
import type { StrokePoint } from './scoreStrokes';

export type WritingStroke = Array<StrokePoint & { time: number }>;

export abstract class WritingExerciseBase extends ExercisePlugin {
  protected isDrawing = false;
  protected strokes: WritingStroke[] = [];
  protected currentStroke: WritingStroke = [];
  protected guideAlpha = 0.35;
  protected paper: PaperLayout | null = null;
  protected failedAttempts = 0;

  protected doneRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  protected guideRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  protected clearRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  protected extraRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

  protected abstract onDone(): ExerciseResult | null;

  protected userStrokePoints(): StrokePoint[][] {
    return this.strokes.map((stroke) => stroke.map(({ x, y }) => ({ x, y })));
  }

  protected drawPaper(ctx: RenderContext, letterCount = 1): PaperLayout {
    this.paper = getPaperLayout(ctx.width, ctx.height, ctx.scale, letterCount);
    drawFourLinePaper(ctx, this.paper);
    return this.paper;
  }

  protected drawUserStrokes(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();
    c.strokeStyle = '#2d3142';
    c.lineWidth = 6 * ctx.scale;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    const all = [...this.strokes, this.currentStroke];
    for (const stroke of all) {
      if (stroke.length < 2) continue;
      c.beginPath();
      c.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        c.lineTo(stroke[i].x, stroke[i].y);
      }
      c.stroke();
    }
    c.restore();
  }

  protected drawInstruction(ctx: RenderContext, text: string): void {
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.font = `bold ${26 * ctx.scale}px Nunito, Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'alphabetic';
    ctx.ctx.fillText(text, ctx.width / 2, 52 * ctx.scale);
  }

  protected drawControls(
    ctx: RenderContext,
    options: { showDone?: boolean; showGuide?: boolean; extraLabel?: string } = {}
  ): void {
    const { width, height, scale } = ctx;
    const btnW = 120 * scale;
    const btnH = 56 * scale;
    const y = height - 76 * scale;

    this.clearRect = { x: width - 140 * scale, y, w: btnW, h: btnH };
    this.guideRect = { x: 0, y: 0, w: 0, h: 0 };
    this.doneRect = { x: 0, y: 0, w: 0, h: 0 };
    this.extraRect = { x: 0, y: 0, w: 0, h: 0 };

    this.drawButton(ctx, this.clearRect, '#ff9800', 'Löschen');

    if (options.showGuide !== false) {
      this.guideRect = { x: width - 280 * scale, y, w: btnW, h: btnH };
      this.drawButton(
        ctx,
        this.guideRect,
        this.guideAlpha > 0 ? '#9c27b0' : '#4caf50',
        this.guideAlpha > 0 ? 'Hilfe aus' : 'Hilfe an'
      );
    }

    if (options.showDone !== false && this.strokes.length > 0) {
      this.doneRect = { x: 20 * scale, y, w: btnW, h: btnH };
      this.drawButton(ctx, this.doneRect, '#4caf50', 'Fertig');
    }

    if (options.extraLabel) {
      this.extraRect = { x: width / 2 - btnW / 2, y, w: btnW, h: btnH };
      this.drawButton(ctx, this.extraRect, '#667eea', options.extraLabel);
    }
  }

  protected drawButton(ctx: RenderContext, rect: Rect, fill: string, label: string): void {
    this.drawRoundedRect(ctx, rect, {
      fillStyle: fill,
      borderRadius: 10 * ctx.scale
    });
    ctx.ctx.fillStyle = 'white';
    ctx.ctx.font = `bold ${18 * ctx.scale}px Nunito, Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  }

  protected hitControl(x: number, y: number): 'done' | 'guide' | 'clear' | 'extra' | null {
    if (this.isInside(x, y, this.doneRect)) return 'done';
    if (this.isInside(x, y, this.guideRect)) return 'guide';
    if (this.isInside(x, y, this.clearRect)) return 'clear';
    if (this.isInside(x, y, this.extraRect)) return 'extra';
    return null;
  }

  protected clearStrokes(): void {
    this.strokes = [];
    this.currentStroke = [];
    this.isDrawing = false;
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (this.checkRepeatButtonClick(event)) {
      return null;
    }

    const { x, y, type } = event;
    const control = this.hitControl(x, y);

    if (type === 'end') {
      if (this.isDrawing && this.currentStroke.length > 1) {
        this.strokes.push([...this.currentStroke]);
      }
      this.currentStroke = [];
      this.isDrawing = false;

      if (control === 'clear') {
        this.clearStrokes();
        audioEngine.playSound('pop');
        return null;
      }
      if (control === 'guide') {
        this.guideAlpha = this.guideAlpha > 0 ? 0 : 0.35;
        audioEngine.playSound('pop');
        return null;
      }
      if (control === 'extra') {
        return this.onExtra();
      }
      if (control === 'done' && this.strokes.length > 0) {
        return this.onDone();
      }
      return null;
    }

    if (type === 'start') {
      if (control) return null;
      this.isDrawing = true;
      this.currentStroke = [{ x, y, time: Date.now() }];
      return null;
    }

    if (type === 'move' && this.isDrawing) {
      this.currentStroke.push({ x, y, time: Date.now() });
    }

    return null;
  }

  protected onExtra(): ExerciseResult | null {
    return null;
  }

  cleanup(): void {
    super.cleanup();
    this.clearStrokes();
    this.failedAttempts = 0;
  }
}
