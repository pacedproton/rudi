/**
 * DiceExercise - Count dots on dice
 *
 * Child sees a die and must count the dots, then select the correct number.
 * Example: Die shows 4 dots → child selects "4" from number options
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';

export interface DiceConfig {
  type: 'dice';
  count: number;  // 1-6
}

export class DiceExercise extends ExercisePlugin {
  private count!: number;
  private buttons: Array<{ num: number; x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'dice';
  }

  initialize(config: DiceConfig): void {
    super.initialize(config);
    this.count = Math.min(6, Math.max(1, config.count));
  }

  getInstruction(): string {
    return 'Wie viele Punkte siehst du?';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Wie viele Punkte siehst du?', width / 2, height * 0.12);

    // Draw die
    const dieSize = 180 * scale;
    const dieX = (width - dieSize) / 2;
    const dieY = height * 0.25;

    // Die background
    this.drawRoundedRect(ctx, { x: dieX, y: dieY, w: dieSize, h: dieSize }, {
      fillStyle: '#fff',
      strokeStyle: '#333',
      lineWidth: 4 * scale
    });

    // Draw dots in standard die pattern
    this.drawDieDots(ctx, dieX, dieY, dieSize, this.count);

    // Draw number buttons (1-6)
    const buttonSize = 70 * scale;
    const buttonSpacing = 15 * scale;
    const totalWidth = 6 * buttonSize + 5 * buttonSpacing;
    const startX = (width - totalWidth) / 2;
    const buttonY = height * 0.7;

    this.buttons = [];

    for (let i = 1; i <= 6; i++) {
      const x = startX + (i - 1) * (buttonSize + buttonSpacing);
      this.buttons.push({ num: i, x, y: buttonY, w: buttonSize, h: buttonSize });

      // Button background
      this.drawRoundedRect(ctx, { x, y: buttonY, w: buttonSize, h: buttonSize }, {
        fillStyle: '#667eea',
        strokeStyle: '#555',
        lineWidth: 2 * scale
      });

      // Number
      ctx.ctx.font = `${36 * scale}px Arial`;
      ctx.ctx.fillStyle = '#fff';
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(i.toString(), x + buttonSize / 2, buttonY + buttonSize / 2);
    }

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw dots in standard die pattern
   */
  private drawDieDots(ctx: RenderContext, x: number, y: number, size: number, count: number): void {
    const { scale } = ctx;
    const dotRadius = 12 * scale;
    const offset = size / 4;  // Distance from center to corner positions

    // Define dot positions for each count (standard die layout)
    const positions: Record<number, Array<[number, number]>> = {
      1: [[0, 0]],  // center
      2: [[-offset, -offset], [offset, offset]],  // diagonal
      3: [[-offset, -offset], [0, 0], [offset, offset]],  // diagonal with center
      4: [[-offset, -offset], [offset, -offset], [-offset, offset], [offset, offset]],  // corners
      5: [[-offset, -offset], [offset, -offset], [0, 0], [-offset, offset], [offset, offset]],  // corners + center
      6: [[-offset, -offset], [offset, -offset], [-offset, 0], [offset, 0], [-offset, offset], [offset, offset]]  // 2 columns
    };

    const centerX = x + size / 2;
    const centerY = y + size / 2;

    ctx.ctx.fillStyle = '#333';

    (positions[count] || []).forEach(([dx, dy]) => {
      ctx.ctx.beginPath();
      ctx.ctx.arc(centerX + dx, centerY + dy, dotRadius, 0, Math.PI * 2);
      ctx.ctx.fill();
    });
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    // Check which button was clicked
    for (const button of this.buttons) {
      if (this.isInside(event.x, event.y, button)) {
        const correct = button.num === this.count;

        // If user already made an incorrect attempt, mark this as incorrect
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

    return null;
  }
}
