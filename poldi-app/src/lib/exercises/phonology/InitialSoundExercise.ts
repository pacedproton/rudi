/**
 * InitialSoundExercise - Match words by initial sound
 *
 * Child sees/hears a target word and must select which of two options
 * starts with the same sound.
 * Example: Target "Haus" (house), Options: "Hund" (dog) vs "Katze" (cat)
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons, labels } from '$lib/data/assets';

export interface InitialSoundConfig {
  type: 'initial';
  target: keyof typeof icons;  // target word
  match: keyof typeof icons;    // correct match (same initial sound)
  distractor: keyof typeof icons;  // wrong answer
}

export class InitialSoundExercise extends ExercisePlugin {
  private target!: keyof typeof icons;
  private options!: Array<keyof typeof icons>;
  private correctIndex!: number;
  private boxes: Array<{ x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'initial';
  }

  initialize(config: InitialSoundConfig): void {
    super.initialize(config);
    this.target = config.target;

    // Randomize option positions
    if (Math.random() < 0.5) {
      this.options = [config.match, config.distractor];
      this.correctIndex = 0;
    } else {
      this.options = [config.distractor, config.match];
      this.correctIndex = 1;
    }
  }

  getInstruction(): string {
    const targetLabel = labels[this.target];
    const option1Label = labels[this.options[0]];
    const option2Label = labels[this.options[1]];

    return `Was beginnt wie ${targetLabel}? ${option1Label} oder ${option2Label}?`;
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText('Was beginnt gleich?', width / 2, height * 0.12);

    // Draw target word (top center)
    const targetBoxSize = 150 * scale;
    const targetBox = {
      x: (width - targetBoxSize) / 2,
      y: height * 0.18,
      w: targetBoxSize,
      h: targetBoxSize
    };

    this.drawRoundedRect(ctx, targetBox, {
      fillStyle: '#f0f0f0',
      strokeStyle: '#667eea',
      lineWidth: 4 * scale
    });

    // Target icon
    ctx.ctx.font = `${70 * scale}px Arial`;
    ctx.ctx.fillText(
      icons[this.target],
      targetBox.x + targetBox.w / 2,
      targetBox.y + targetBox.h / 2
    );

    // Target label
    ctx.ctx.font = `${20 * scale}px Arial`;
    ctx.ctx.fillStyle = '#667eea';
    ctx.ctx.fillText(
      labels[this.target],
      targetBox.x + targetBox.w / 2,
      targetBox.y + targetBox.h + 25 * scale
    );

    // Draw option boxes (side by side below)
    const boxWidth = 180 * scale;
    const boxHeight = 200 * scale;
    const spacing = 80 * scale;
    const startX = (width - (boxWidth * 2 + spacing)) / 2;
    const boxY = height * 0.5;

    this.boxes = [
      { x: startX, y: boxY, w: boxWidth, h: boxHeight },
      { x: startX + boxWidth + spacing, y: boxY, w: boxWidth, h: boxHeight }
    ];

    this.options.forEach((option, index) => {
      const box = this.boxes[index];

      this.drawRoundedRect(ctx, box, {
        fillStyle: '#fff',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });

      // Option icon
      ctx.ctx.font = `${80 * scale}px Arial`;
      ctx.ctx.fillText(
        icons[option],
        box.x + box.w / 2,
        box.y + box.h * 0.4
      );

      // Option label
      ctx.ctx.font = `${22 * scale}px Arial`;
      ctx.ctx.fillStyle = '#333';
      ctx.ctx.fillText(
        labels[option],
        box.x + box.w / 2,
        box.y + box.h * 0.75
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

    // Check which box was clicked
    for (let i = 0; i < this.boxes.length; i++) {
      if (this.isInside(event.x, event.y, this.boxes[i])) {
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
