/**
 * SyllablesExercise - Count syllables in a word
 *
 * Child hears/sees a word and must tap out the correct number of syllables.
 * Example: "Schmetterling" (butterfly) = 3 syllables
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons } from '$lib/data/assets';

export interface SyllablesConfig {
  type: 'syllables';
  word: string;
  icon: keyof typeof icons;
  count: number;  // correct syllable count
}

export class SyllablesExercise extends ExercisePlugin {
  private word!: string;
  private icon!: keyof typeof icons;
  private correctCount!: number;
  private tappedCount = 0;
  private tapCircles: Array<{ x: number; y: number; time: number }> = [];
  private submitButton = { x: 0, y: 0, w: 0, h: 0 };

  get type(): ExerciseType {
    return 'syllables';
  }

  initialize(config: SyllablesConfig): void {
    super.initialize(config);
    this.word = config.word;
    this.icon = config.icon;
    this.correctCount = config.count;
    this.tappedCount = 0;
    this.tapCircles = [];
  }

  getInstruction(): string {
    return `Klatsche die Silben: ${this.word}`;
  }

  onStart(): SpeechRequest[] {
    return [
      { text: `Klatsche die Silben.` },
      { text: this.word, delay: 800 }
    ];
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Klatsche die Silben!', width / 2, height * 0.12);

    // Draw word and icon
    ctx.ctx.font = `${80 * scale}px Arial`;
    ctx.ctx.fillText(icons[this.icon], width / 2, height * 0.28);

    ctx.ctx.font = `${32 * scale}px Arial`;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.fillText(this.word, width / 2, height * 0.42);

    // Draw tap area with circles
    const tapAreaY = height * 0.52;
    const tapAreaHeight = height * 0.25;
    ctx.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.ctx.fillRect(0, tapAreaY, width, tapAreaHeight);

    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#666';
    ctx.ctx.fillText('Tippe hier für jede Silbe', width / 2, tapAreaY + 30 * scale);

    // Draw tapped circles
    const circleRadius = 25 * scale;
    const circleSpacing = 70 * scale;
    const startX = width / 2 - ((this.tapCircles.length - 1) * circleSpacing) / 2;
    const circleY = tapAreaY + tapAreaHeight / 2;

    this.tapCircles.forEach((circle, index) => {
      const age = Date.now() - circle.time;
      const alpha = Math.max(0, 1 - age / 2000);  // Fade out after 2s

      ctx.ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
      ctx.ctx.beginPath();
      ctx.ctx.arc(
        startX + index * circleSpacing,
        circleY,
        circleRadius,
        0,
        Math.PI * 2
      );
      ctx.ctx.fill();
    });

    // Draw submit button
    const buttonWidth = 180 * scale;
    const buttonHeight = 50 * scale;
    this.submitButton = {
      x: (width - buttonWidth) / 2,
      y: height * 0.82,
      w: buttonWidth,
      h: buttonHeight
    };

    this.drawRoundedRect(ctx, this.submitButton, {
      fillStyle: this.tappedCount > 0 ? '#667eea' : '#ccc',
      strokeStyle: '#555',
      lineWidth: 2 * scale
    });

    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#fff';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(
      `Fertig (${this.tappedCount})`,
      this.submitButton.x + this.submitButton.w / 2,
      this.submitButton.y + this.submitButton.h / 2
    );

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    // Check if submit button clicked
    if (this.isInside(event.x, event.y, this.submitButton) && this.tappedCount > 0) {
      const correct = this.tappedCount === this.correctCount;
      return {
        correct,
        responseTime: this.getElapsedTime()
      };
    }

    // Check if tap area clicked (anywhere in the middle section)
    const ctx = this.getSavedContext();
    if (!ctx) return null;

    const tapAreaY = ctx.height * 0.52;
    const tapAreaHeight = ctx.height * 0.25;

    if (event.y >= tapAreaY && event.y <= tapAreaY + tapAreaHeight) {
      // Add a tap
      this.tappedCount++;
      this.tapCircles.push({
        x: event.x,
        y: event.y,
        time: Date.now()
      });
    }

    return null;
  }
}
