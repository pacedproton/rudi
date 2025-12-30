/**
 * WordLengthExercise - Compare word lengths
 *
 * Child sees two words and must identify which word is longer.
 * Example: "Zug" (1 syllable) vs "Lokomotive" (4 syllables)
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { RenderContext } from '$lib/core/CanvasManager';
import type { InputEvent, ExerciseResult, SpeechRequest, ExerciseType } from '../base/types';
import { icons, labels } from '$lib/data/assets';

interface WordInfo {
  icon: keyof typeof icons;
  txt: string;
  len: number;  // syllable count
}

export interface WordLengthConfig {
  type: 'wordlength';
  words: [WordInfo, WordInfo];  // Always exactly 2 words
  correctIndex: number;  // 0 or 1
}

export class WordLengthExercise extends ExercisePlugin {
  private words!: [WordInfo, WordInfo];
  private correctIndex!: number;
  private boxes: Array<{ x: number; y: number; w: number; h: number }> = [];

  get type(): ExerciseType {
    return 'wordlength';
  }

  initialize(config: WordLengthConfig): void {
    super.initialize(config);
    this.words = config.words;
    this.correctIndex = config.correctIndex;
  }

  getInstruction(): string {
    return `Welches Wort ist länger? ${this.words[0].txt} oder ${this.words[1].txt}?`;
  }

  render(ctx: RenderContext): void {
    this.saveContext(ctx);

    const { width, height, scale } = ctx;
    const boxWidth = 200 * scale;
    const boxHeight = 250 * scale;
    const spacing = 100 * scale;
    const startX = (width - (boxWidth * 2 + spacing)) / 2;
    const boxY = height * 0.35;

    // Store box positions for hit detection
    this.boxes = [
      { x: startX, y: boxY, w: boxWidth, h: boxHeight },
      { x: startX + boxWidth + spacing, y: boxY, w: boxWidth, h: boxHeight }
    ];

    // Draw instruction text at top
    ctx.ctx.font = `${28 * scale}px Arial`;
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.textAlign = 'center';
    ctx.ctx.fillText('Welches Wort ist länger?', width / 2, height * 0.15);

    // Draw both word boxes
    this.words.forEach((word, index) => {
      const box = this.boxes[index];

      // Box background
      this.drawRoundedRect(ctx, box, {
        fillStyle: '#fff',
        strokeStyle: '#667eea',
        lineWidth: 3 * scale
      });

      // Icon (emoji)
      ctx.ctx.font = `${80 * scale}px Arial`;
      ctx.ctx.textAlign = 'center';
      ctx.ctx.textBaseline = 'middle';
      ctx.ctx.fillText(
        icons[word.icon],
        box.x + box.w / 2,
        box.y + box.h * 0.35
      );

      // Word text
      ctx.ctx.font = `${24 * scale}px Arial`;
      ctx.ctx.fillStyle = '#333';
      ctx.ctx.fillText(
        word.txt,
        box.x + box.w / 2,
        box.y + box.h * 0.7
      );

      // Syllable dots (visual aid)
      const dotRadius = 4 * scale;
      const dotSpacing = 12 * scale;
      const totalWidth = word.len * dotSpacing;
      const dotStartX = box.x + (box.w - totalWidth) / 2 + dotSpacing / 2;
      const dotY = box.y + box.h * 0.85;

      ctx.ctx.fillStyle = '#667eea';
      for (let i = 0; i < word.len; i++) {
        ctx.ctx.beginPath();
        ctx.ctx.arc(
          dotStartX + i * dotSpacing,
          dotY,
          dotRadius,
          0,
          Math.PI * 2
        );
        ctx.ctx.fill();
      }
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
