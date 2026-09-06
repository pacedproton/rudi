/**
 * MemoryExercise - Working memory test with number sequences
 *
 * CRITICAL FIX: This exercise was missing intro speech in prototype.html
 * Now properly announces instructions before speaking numbers
 *
 * Ported from prototype.html lines 380-383, 676-684, 1281-1289, 1593-1613
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { SpeechRequest } from '$lib/core/SpeechEngine';
import { colors } from '$lib/data/colors';

export interface MemoryExerciseConfig {
  type: 'memory';
  seq: number[];  // Number sequence to remember (e.g., [4, 2] or [7, 1, 5])
}

export class MemoryExercise extends ExercisePlugin {
  private sequence: number[];
  private userInput: number[] = [];
  private numbersSpoken = false;

  get type(): ExerciseType {
    return 'memory';
  }

  constructor(config: MemoryExerciseConfig) {
    super(config);
    this.sequence = config.seq;
  }

  initialize(config: MemoryExerciseConfig): void {
    super.initialize(config);
    this.userInput = [];
    this.numbersSpoken = true;  // Enable input immediately
    this.setState({ locked: false });
  }

  /**
   * FIX: Add missing intro speech
   * Returns sequence of speech requests with proper timing
   */
  onStart(): SpeechRequest[] {
    return [
      {
        text: 'Ich sage dir Zahlen. Merke sie dir gut!',
        delay: 0
      }
    ];
  }

  getInstruction(): string {
    return 'Ich sage dir Zahlen. Merke sie dir gut!';
  }

  /**
   * Get the number sequence (for speech engine to speak)
   */
  getSequence(): number[] {
    return this.sequence;
  }

  /**
   * Render the memory task with numpad
   */
  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Show user's current input
    ctx.ctx.fillStyle = colors.text;
    ctx.ctx.font = `${40 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';

    const displayText = this.userInput.length > 0
      ? this.userInput.join(' - ')
      : '...';

    ctx.ctx.fillText(displayText, width / 2, 120 * scale);

    // Draw numpad (1-9)
    this.drawNumpad(ctx);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw numpad buttons (1-9)
   */
  private drawNumpad(ctx: RenderContext): void {
    const { width, height, scale } = ctx;
    const size = 60 * scale;
    const gap = 15 * scale;
    const sx = (width - (3 * size + 2 * gap)) / 2;
    const sy = height * 0.55;

    for (let i = 1; i <= 9; i++) {
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const x = sx + col * (size + gap);
      const y = sy + row * (size + gap);

      // Draw button
      this.drawRoundedRect(ctx, { x, y, w: size, h: size }, {
        borderRadius: 10,
        fillStyle: colors.white
      });

      // Draw number
      ctx.ctx.fillStyle = colors.text;
      ctx.ctx.font = `${30 * scale}px Arial`;
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(i.toString(), x + size / 2, y + size / 2);
    }
  }

  /**
   * Handle numpad input
   */
  handleInput(event: InputEvent): ExerciseResult | null {
    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    if (!this.isStartEvent(event) || !this.numbersSpoken) {
      return null;
    }

    const ctx = this.getSavedContext();
    if (!ctx) return null;
    const { width, height, scale } = ctx;
    const size = 60 * scale;
    const gap = 15 * scale;
    const sx = (width - (3 * size + 2 * gap)) / 2;
    const sy = height * 0.55;

    // Check which number was clicked
    for (let i = 1; i <= 9; i++) {
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const x = sx + col * (size + gap);
      const y = sy + row * (size + gap);

      if (this.isInside(event.x, event.y, { x, y, w: size, h: size })) {
        // Add number to input
        this.userInput.push(i);

        // Check if sequence is complete
        if (this.userInput.length === this.sequence.length) {
          const correct = this.checkSequence();
          return {
            correct,
            responseTime: this.getElapsedTime(),
            metadata: {
              userInput: [...this.userInput],
              expectedSequence: [...this.sequence]
            }
          };
        }

        // Not yet complete
        return null;
      }
    }

    return null;
  }

  /**
   * Check if user input matches the sequence
   */
  private checkSequence(): boolean {
    if (this.userInput.length !== this.sequence.length) {
      return false;
    }

    for (let i = 0; i < this.sequence.length; i++) {
      if (this.userInput[i] !== this.sequence[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Reset for replay
   */
  reset(): void {
    super.reset();
    this.userInput = [];
    this.numbersSpoken = false;
  }
}
