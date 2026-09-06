/**
 * TraceExercise - Motor skills test by tracing shapes
 *
 * CRITICAL FIX: This exercise was missing instruction speech in prototype.html
 * Now properly announces which shape to trace
 *
 * Ported from prototype.html lines 408, 1291-1323, 1615-1625
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { colors } from '$lib/data/colors';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { scoreStrokes } from '../writing/scoreStrokes';
import { GRAFOMOTOR_SCORE_OPTIONS, sampleTraceShape } from '../drawing/sampleShapePath';

export type TraceShape = 'circle' | 'cross' | 'triangle';

export interface TraceExerciseConfig {
  type: 'trace';
  shape: TraceShape;  // Shape to trace
}

interface Point {
  x: number;
  y: number;
}

export class TraceExercise extends ExercisePlugin {
  private shape!: TraceShape;
  private drawPaths: Point[][] = [];  // Array of paths (each path is array of points)
  private currentPath: Point[] | null = null;

  get type(): ExerciseType {
    return 'trace';
  }

  initialize(config: TraceExerciseConfig): void {
    super.initialize(config);
    this.shape = config.shape;
    this.drawPaths = [];
    this.currentPath = null;
  }

  /**
   * FIX: Add missing instruction speech for motor exercises
   */
  getInstruction(): string {
    const shapeNames: Record<TraceShape, string> = {
      'cross': 'das Kreuz',
      'circle': 'den Kreis',
      'triangle': 'das Dreieck'
    };

    return `Zeichne ${shapeNames[this.shape]} nach!`;
  }

  /**
   * Render the trace task
   */
  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);

    const { width, height, scale } = ctx;
    const centerX = width / 2;
    const centerY = height / 2 - 30 * scale;
    const radius = 80 * scale;

    // Draw guide shape (dashed outline)
    ctx.ctx.strokeStyle = '#667eea';
    ctx.ctx.setLineDash([10 * scale]);
    ctx.ctx.lineWidth = 8 * scale;
    ctx.ctx.beginPath();

    switch (this.shape) {
      case 'circle':
        ctx.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        break;

      case 'cross':
        // Vertical line
        ctx.ctx.moveTo(centerX, centerY - radius);
        ctx.ctx.lineTo(centerX, centerY + radius);
        // Horizontal line
        ctx.ctx.moveTo(centerX - radius, centerY);
        ctx.ctx.lineTo(centerX + radius, centerY);
        break;

      case 'triangle':
        ctx.ctx.moveTo(centerX, centerY - radius);
        ctx.ctx.lineTo(centerX + radius, centerY + radius);
        ctx.ctx.lineTo(centerX - radius, centerY + radius);
        ctx.ctx.closePath();
        break;
    }

    ctx.ctx.stroke();
    ctx.ctx.setLineDash([]);

    // Draw user's traced paths
    ctx.ctx.strokeStyle = colors.wood;
    ctx.ctx.lineWidth = 6 * scale;
    ctx.ctx.lineCap = 'round';
    ctx.ctx.lineJoin = 'round';

    this.drawPaths.forEach(path => {
      if (path.length > 0) {
        ctx.ctx.beginPath();
        ctx.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.ctx.stroke();
      }
    });

    // Draw current path being drawn
    if (this.currentPath && this.currentPath.length > 0) {
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      for (let i = 1; i < this.currentPath.length; i++) {
        ctx.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
      }
      ctx.ctx.stroke();
    }

    // Draw "Fertig" (Done) button
    this.drawDoneButton(ctx);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw the "Done" button
   */
  private drawDoneButton(ctx: RenderContext): void {
    const { width, height, scale } = ctx;
    const buttonY = height - 50 * scale;
    const buttonW = 200 * scale;
    const buttonH = 50 * scale;

    // Button background
    ctx.ctx.fillStyle = colors.white;
    ctx.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.ctx.shadowBlur = 10;

    this.drawRoundedRect(ctx, {
      x: width / 2 - buttonW / 2,
      y: buttonY,
      w: buttonW,
      h: buttonH
    }, {
      borderRadius: 20,
      fillStyle: colors.white
    });

    ctx.ctx.shadowBlur = 0;

    // Button text
    ctx.ctx.fillStyle = colors.wood;
    ctx.ctx.font = `bold ${20 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Fertig', width / 2, buttonY + buttonH / 2);
  }

  /**
   * Handle drawing input
   */
  handleInput(event: InputEvent): ExerciseResult | null {
    const { width, height, scale } = this.getRenderContext();

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    // Check if "Done" button was clicked (must check BEFORE handling drawing)
    if (this.isStartEvent(event)) {
      const buttonY = height - 50 * scale;
      const buttonW = 200 * scale;
      const buttonH = 50 * scale;

      if (this.isInside(event.x, event.y, {
        x: width / 2 - buttonW / 2,
        y: buttonY,
        w: buttonW,
        h: buttonH
      })) {
        return this.finishTrace();
      }

      // If not button click, start new drawing path
      this.currentPath = [{ x: event.x, y: event.y }];
    } else if (this.isMoveEvent(event) && this.currentPath) {
      // Continue current path
      this.currentPath.push({ x: event.x, y: event.y });
    } else if (this.isEndEvent(event) && this.currentPath) {
      // Finish current path
      this.drawPaths.push(this.currentPath);
      this.currentPath = null;
    }

    return null;
  }

  private finishTrace(): ExerciseResult | null {
    const ctx = this.getRenderContext();
    const expected = sampleTraceShape(this.shape, ctx.width, ctx.height, ctx.scale);
    const score = scoreStrokes(this.drawPaths, expected, {
      ...GRAFOMOTOR_SCORE_OPTIONS,
      hitRadius: GRAFOMOTOR_SCORE_OPTIONS.hitRadius * ctx.scale
    });

    if (this.drawPaths.length === 0 || !score.passed) {
      audioEngine.playSound('wrong');
      speechEngine.speak('Versuche es noch einmal.');
      this.drawPaths = [];
      this.currentPath = null;
      return null;
    }

    speechEngine.speak('Super gemacht!');
    return {
      correct: true,
      responseTime: this.getElapsedTime(),
      metadata: {
        pathCount: this.drawPaths.length,
        totalPoints: this.drawPaths.reduce((sum, path) => sum + path.length, 0),
        accuracy: score.overall
      }
    };
  }

  /**
   * Reset for replay
   */
  reset(): void {
    super.reset();
    this.drawPaths = [];
    this.currentPath = null;
  }
}
