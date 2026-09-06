/**
 * QuantityExercise - Compare quantities (more/less)
 *
 * Child sees two sets of coins and must identify which side has MORE.
 * Example: 4 coins on left vs 2 coins on right → click left side
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';

export interface QuantityConfig {
  type: 'quantity';
  l: number;  // left quantity
  r: number;  // right quantity
}

export class QuantityExercise extends ExercisePlugin {
  private leftCount!: number;
  private rightCount!: number;
  private leftBox = { x: 0, y: 0, w: 0, h: 0 };
  private rightBox = { x: 0, y: 0, w: 0, h: 0 };

  get type(): ExerciseType {
    return 'quantity';
  }

  initialize(config: QuantityConfig): void {
    super.initialize(config);
    this.leftCount = config.l;
    this.rightCount = config.r;
  }

  getInstruction(): string {
    return 'Wo sind MEHR Münzen?';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${32 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Wo sind MEHR Münzen?', width / 2, height * 0.12);

    // Define left and right boxes
    const boxWidth = width * 0.35;
    const boxHeight = height * 0.55;
    const boxY = height * 0.25;

    this.leftBox = {
      x: width * 0.1,
      y: boxY,
      w: boxWidth,
      h: boxHeight
    };

    this.rightBox = {
      x: width * 0.55,
      y: boxY,
      w: boxWidth,
      h: boxHeight
    };

    // Draw boxes
    [this.leftBox, this.rightBox].forEach(box => {
      this.drawRoundedRect(ctx, box, {
        fillStyle: 'rgba(255, 255, 255, 0.3)',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });
    });

    // Draw coins in left box
    this.drawCoins(ctx, this.leftBox, this.leftCount);

    // Draw coins in right box
    this.drawCoins(ctx, this.rightBox, this.rightCount);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw coins in a grid pattern within a box
   */
  private drawCoins(ctx: RenderContext, box: { x: number; y: number; w: number; h: number }, count: number): void {
    const { scale } = ctx;
    const coinRadius = 25 * scale;
    const spacing = 20 * scale;
    const cols = Math.min(count, 3);  // Max 3 columns
    const rows = Math.ceil(count / cols);

    const gridWidth = cols * (coinRadius * 2 + spacing) - spacing;
    const gridHeight = rows * (coinRadius * 2 + spacing) - spacing;
    const startX = box.x + (box.w - gridWidth) / 2 + coinRadius;
    const startY = box.y + (box.h - gridHeight) / 2 + coinRadius;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (coinRadius * 2 + spacing);
      const y = startY + row * (coinRadius * 2 + spacing);

      // Gold coin
      ctx.ctx.fillStyle = '#FFD700';
      ctx.ctx.beginPath();
      ctx.ctx.arc(x, y, coinRadius, 0, Math.PI * 2);
      ctx.ctx.fill();

      // Coin border
      ctx.ctx.strokeStyle = '#DAA520';
      ctx.ctx.lineWidth = 2 * scale;
      ctx.ctx.stroke();

      // Coin shine
      ctx.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.ctx.beginPath();
      ctx.ctx.arc(x - coinRadius * 0.3, y - coinRadius * 0.3, coinRadius * 0.4, 0, Math.PI * 2);
      ctx.ctx.fill();
    }
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    // Check which box was clicked
    let clickedSide: 'left' | 'right' | null = null;

    if (this.isInside(event.x, event.y, this.leftBox)) {
      clickedSide = 'left';
    } else if (this.isInside(event.x, event.y, this.rightBox)) {
      clickedSide = 'right';
    }

    if (!clickedSide) return null;

    // Correct answer is the side with MORE coins
    const correctSide = this.leftCount > this.rightCount ? 'left' : 'right';
    const correct = clickedSide === correctSide;

    // If user already made an incorrect attempt, mark this as incorrect
    // even if they now clicked the right answer
    const finalCorrect = correct && !this.hasIncorrectAttempt;

    // Track if this was an incorrect attempt
    if (!correct) {
      this.hasIncorrectAttempt = true;
    }

    return {
      correct: finalCorrect,
      responseTime: this.getElapsedTime()
    };
  }
}
