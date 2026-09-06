/**
 * DiscriminationExercise - Find matching/different shape
 *
 * Child sees a target shape and must find the matching shape among options
 * OR find the one that is different.
 * Example: Target: red circle, Options: red circle, blue circle, red square
 * → Must find exact match (red circle)
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';

type Shape = 'circle' | 'square' | 'triangle';
type Color = 'red' | 'blue' | 'green' | 'yellow';

interface ShapeSpec {
  shape: Shape;
  color: Color;
}

export interface DiscriminationConfig {
  type: 'discrimination';
  task: 'match' | 'different';  // find matching or different
  target: ShapeSpec;
  options: ShapeSpec[];
  correctIndex: number;
}

export class DiscriminationExercise extends ExercisePlugin {
  private task!: 'match' | 'different';
  private target!: ShapeSpec;
  private options!: ShapeSpec[];
  private correctIndex!: number;
  private boxes: Array<{ x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'discrimination';
  }

  initialize(config: DiscriminationConfig): void {
    super.initialize(config);
    this.task = config.task;
    this.target = config.target;
    this.options = config.options;
    this.correctIndex = config.correctIndex;
  }

  getInstruction(): string {
    return this.task === 'match'
      ? 'Finde die gleiche Form!'
      : 'Finde die andere Form!';
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;

    // Draw instruction
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(this.getInstruction(), width / 2, height * 0.1);

    // Draw target shape
    const targetSize = 100 * scale;
    const targetBox = {
      x: (width - targetSize) / 2,
      y: height * 0.18,
      w: targetSize,
      h: targetSize
    };

    this.drawRoundedRect(ctx, targetBox, {
      fillStyle: '#f5f5f5',
      strokeStyle: '#667eea',
      lineWidth: 4 * scale
    });

    this.drawShape(ctx, this.target, targetBox.x + targetBox.w / 2, targetBox.y + targetBox.h / 2, 40 * scale);

    // Draw option boxes (3-4 options in a row)
    const boxSize = 100 * scale;
    const boxSpacing = 30 * scale;
    const totalWidth = this.options.length * boxSize + (this.options.length - 1) * boxSpacing;
    const startX = (width - totalWidth) / 2;
    const optionsY = height * 0.5;

    this.boxes = [];

    this.options.forEach((option, index) => {
      const x = startX + index * (boxSize + boxSpacing);
      this.boxes.push({ x, y: optionsY, w: boxSize, h: boxSize });

      this.drawRoundedRect(ctx, { x, y: optionsY, w: boxSize, h: boxSize }, {
        fillStyle: '#fff',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });

      this.drawShape(ctx, option, x + boxSize / 2, optionsY + boxSize / 2, 35 * scale);
    });

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Draw a colored shape
   */
  private drawShape(ctx: RenderContext, spec: ShapeSpec, x: number, y: number, size: number): void {
    const colors = {
      red: '#e74c3c',
      blue: '#3498db',
      green: '#2ecc71',
      yellow: '#f1c40f'
    };

    ctx.ctx.fillStyle = colors[spec.color];
    ctx.ctx.strokeStyle = '#333';
    ctx.ctx.lineWidth = 2;

    ctx.ctx.beginPath();

    switch (spec.shape) {
      case 'circle':
        ctx.ctx.arc(x, y, size, 0, Math.PI * 2);
        break;

      case 'square':
        ctx.ctx.rect(x - size, y - size, size * 2, size * 2);
        break;

      case 'triangle':
        ctx.ctx.moveTo(x, y - size);
        ctx.ctx.lineTo(x + size, y + size);
        ctx.ctx.lineTo(x - size, y + size);
        ctx.ctx.closePath();
        break;
    }

    ctx.ctx.fill();
    ctx.ctx.stroke();
  }

  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) return null;

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

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
