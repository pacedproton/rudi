/**
 * PatternExercise - Complete pattern sequence
 *
 * Child sees a repeating pattern with one element missing (shown as "?")
 * and must select the correct element to complete the pattern.
 * Example: 🔵🔴🔵🔴❓ → answer is 🔵
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons } from '$lib/data/assets';

export interface PatternConfig {
  type: 'pattern';
  sequence: Array<keyof typeof icons | null>;  // null = missing element
  options: Array<keyof typeof icons>;
  correctIndex: number;
}

export class PatternExercise extends ExercisePlugin {
  private sequence!: Array<keyof typeof icons | null>;
  private options!: Array<keyof typeof icons>;
  private correctIndex!: number;
  private optionBoxes: Array<{ x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'pattern';
  }

  initialize(config: PatternConfig): void {
    super.initialize(config);
    this.sequence = config.sequence;
    this.options = config.options;
    this.correctIndex = config.correctIndex;
  }

  getInstruction(): string {
    return 'Was kommt als Nächstes?';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Was kommt als Nächstes?', width / 2, height * 0.1);

    // Draw pattern sequence
    const boxSize = 70 * scale;
    const boxSpacing = 15 * scale;
    const totalWidth = this.sequence.length * boxSize + (this.sequence.length - 1) * boxSpacing;
    const startX = (width - totalWidth) / 2;
    const sequenceY = height * 0.25;

    this.sequence.forEach((item, index) => {
      const x = startX + index * (boxSize + boxSpacing);

      // Box
      this.drawRoundedRect(ctx, { x, y: sequenceY, w: boxSize, h: boxSize }, {
        fillStyle: item === null ? '#ffe0b2' : '#e8eaf6',
        strokeStyle: item === null ? '#ff9800' : '#667eea',
        lineWidth: item === null ? 4 * scale : 3 * scale
      });

      // Icon or "?"
      ctx.ctx.font = `${item === null ? 40 : 50}px Arial`;
      ctx.ctx.fillText(
        item !== null ? icons[item] : '?',
        x + boxSize / 2,
        sequenceY + boxSize / 2
      );
    });

    // Draw option boxes
    const optionsY = height * 0.55;
    const optionsTotalWidth = this.options.length * boxSize + (this.options.length - 1) * boxSpacing;
    const optionsStartX = (width - optionsTotalWidth) / 2;

    this.optionBoxes = [];

    this.options.forEach((option, index) => {
      const x = optionsStartX + index * (boxSize + boxSpacing);
      this.optionBoxes.push({ x, y: optionsY, w: boxSize, h: boxSize });

      this.drawRoundedRect(ctx, { x, y: optionsY, w: boxSize, h: boxSize }, {
        fillStyle: '#fff',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });

      ctx.ctx.font = `${50 * scale}px Arial`;
      ctx.ctx.fillText(
        icons[option],
        x + boxSize / 2,
        optionsY + boxSize / 2
      );
    });

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    for (let i = 0; i < this.optionBoxes.length; i++) {
      if (this.isInside(event.x, event.y, this.optionBoxes[i])) {
        const correct = i === this.correctIndex;

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
