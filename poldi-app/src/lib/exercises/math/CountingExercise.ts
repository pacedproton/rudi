/**
 * CountingExercise - Count objects
 *
 * Child sees a number of objects (apples, ladybugs, etc.) and must count them,
 * then select the correct number from options.
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons } from '$lib/data/assets';

export interface CountingConfig {
  type: 'counting';
  count: number;  // 1-9
  icon: keyof typeof icons;
}

export class CountingExercise extends ExercisePlugin {
  private count!: number;
  private icon!: keyof typeof icons;
  private buttons: Array<{ num: number; x: number; y: number; w: number; h: number }> = [];
  private objectPositions: Array<{ x: number; y: number }> = [];

  get type(): ExerciseType {
    return 'counting';
  }

  initialize(config: CountingConfig): void {
    super.initialize(config);
    this.count = config.count;
    this.icon = config.icon;

    // Generate random positions ONCE during initialization to prevent flickering
    this.objectPositions = [];
  }

  getInstruction(): string {
    return 'Wie viele siehst du?';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Wie viele siehst du?', width / 2, height * 0.12);

    // Draw objects in a scattered/random pattern
    const displayArea = {
      x: width * 0.15,
      y: height * 0.22,
      w: width * 0.7,
      h: height * 0.35
    };

    // Generate positions on first render to prevent flickering
    if (this.objectPositions.length === 0) {
      this.generateObjectPositions(displayArea, this.count);
    }

    this.drawScatteredObjects(ctx, displayArea, scale);

    // Draw number buttons (show count ± 2, clamped to 1-9)
    const minNum = Math.max(1, this.count - 2);
    const maxNum = Math.min(9, this.count + 2);
    const numButtons = maxNum - minNum + 1;

    const buttonSize = 70 * scale;
    const buttonSpacing = 15 * scale;
    const totalWidth = numButtons * buttonSize + (numButtons - 1) * buttonSpacing;
    const startX = (width - totalWidth) / 2;
    const buttonY = height * 0.7;

    this.buttons = [];

    for (let i = minNum; i <= maxNum; i++) {
      const x = startX + (i - minNum) * (buttonSize + buttonSpacing);
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

  /**
   * Generate object positions once during initialization
   * FIX: Prevents "stroboscope fast" flickering by calculating positions only once
   */
  private generateObjectPositions(area: { x: number; y: number; w: number; h: number }, count: number): void {
    this.objectPositions = [];

    // Create grid-based positions with some randomness
    const cols = Math.ceil(Math.sqrt(count * 1.5));
    const rows = Math.ceil(count / cols);
    const cellW = area.w / cols;
    const cellH = area.h / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Base position in grid
      const baseX = area.x + col * cellW + cellW / 2;
      const baseY = area.y + row * cellH + cellH / 2;

      // Add some randomness
      const randomX = (Math.random() - 0.5) * cellW * 0.4;
      const randomY = (Math.random() - 0.5) * cellH * 0.4;

      this.objectPositions.push({
        x: baseX + randomX,
        y: baseY + randomY
      });
    }
  }

  /**
   * Draw objects using pre-calculated positions
   */
  private drawScatteredObjects(ctx: RenderContext, area: { x: number; y: number; w: number; h: number }, scale: number): void {
    const objectSize = 50 * scale;

    ctx.ctx.font = `${objectSize}px Arial`;
    ctx.ctx.fillStyle = '#333';

    // Draw each object at its fixed position
    this.objectPositions.forEach(pos => {
      ctx.ctx.fillText(icons[this.icon], pos.x, pos.y);
    });
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    for (const button of this.buttons) {
      if (this.isInside(event.x, event.y, button)) {
        const correct = button.num === this.count;

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
