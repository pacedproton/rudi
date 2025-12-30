/**
 * MissingExercise - Find missing number in sequence
 *
 * Child sees a sequence of numbers with one missing (shown as "?")
 * and must identify which number is missing.
 * Example: 1 2 ? 4 5 → answer is 3
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';

export interface MissingConfig {
  type: 'missing';
  start: number;  // starting number
  length: number; // sequence length (e.g., 5)
  missingIndex: number;  // which position is missing (0-based)
}

export class MissingExercise extends ExercisePlugin {
  private start!: number;
  private length!: number;
  private missingIndex!: number;
  private sequence!: Array<number | null>;
  private missingNumber!: number;
  private buttons: Array<{ num: number; x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'missing';
  }

  initialize(config: MissingConfig): void {
    super.initialize(config);
    this.start = config.start;
    this.length = config.length;
    this.missingIndex = config.missingIndex;

    // Build sequence
    this.sequence = [];
    for (let i = 0; i < this.length; i++) {
      if (i === this.missingIndex) {
        this.sequence.push(null);  // Missing number
        this.missingNumber = this.start + i;
      } else {
        this.sequence.push(this.start + i);
      }
    }
  }

  getInstruction(): string {
    return 'Welche Zahl fehlt?';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Welche Zahl fehlt?', width / 2, height * 0.12);

    // Draw sequence boxes
    const boxSize = 70 * scale;
    const boxSpacing = 20 * scale;
    const totalWidth = this.length * boxSize + (this.length - 1) * boxSpacing;
    const startX = (width - totalWidth) / 2;
    const sequenceY = height * 0.3;

    this.sequence.forEach((num, index) => {
      const x = startX + index * (boxSize + boxSpacing);

      // Box
      this.drawRoundedRect(ctx, { x, y: sequenceY, w: boxSize, h: boxSize }, {
        fillStyle: num === null ? '#ffe0b2' : '#e8eaf6',
        strokeStyle: num === null ? '#ff9800' : '#667eea',
        lineWidth: num === null ? 4 * scale : 3 * scale
      });

      // Number or "?"
      ctx.ctx.font = `${40 * scale}px Arial`;
      ctx.ctx.fillStyle = '#333';
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(
        num !== null ? num.toString() : '?',
        x + boxSize / 2,
        sequenceY + boxSize / 2
      );
    });

    // Draw answer buttons (missing number ± 2)
    const minNum = Math.max(1, this.missingNumber - 2);
    const maxNum = this.missingNumber + 2;
    const numButtons = maxNum - minNum + 1;

    const buttonSize = 70 * scale;
    const buttonTotalWidth = numButtons * buttonSize + (numButtons - 1) * boxSpacing;
    const buttonStartX = (width - buttonTotalWidth) / 2;
    const buttonY = height * 0.6;

    this.buttons = [];

    for (let i = minNum; i <= maxNum; i++) {
      const x = buttonStartX + (i - minNum) * (buttonSize + boxSpacing);
      this.buttons.push({ num: i, x, y: buttonY, w: buttonSize, h: buttonSize });

      this.drawRoundedRect(ctx, { x, y: buttonY, w: buttonSize, h: buttonSize }, {
        fillStyle: '#667eea',
        strokeStyle: '#555',
        lineWidth: 2 * scale
      });

      ctx.ctx.font = `${36 * scale}px Arial`;
      ctx.ctx.fillStyle = '#fff';
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(i.toString(), x + buttonSize / 2, buttonY + buttonSize / 2);
    }

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    for (const button of this.buttons) {
      if (this.isInside(event.x, event.y, button)) {
        const correct = button.num === this.missingNumber;

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

    return null;
  }
}
