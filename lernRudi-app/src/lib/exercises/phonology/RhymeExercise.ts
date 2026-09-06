/**
 * RhymeExercise - Test rhyming ability
 *
 * Shows a word and two options. User selects which option rhymes.
 * Ported from prototype.html lines 326-337, 694-702, 1016-1037, 1561-1573
 */

import { ExercisePlugin } from '../base/ExercisePlugin';
import type { ExerciseType, ExerciseResult, InputEvent } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { icons, labels, type IconKey } from '$lib/data/assets';
import { colors } from '$lib/data/colors';

export interface RhymeExerciseConfig {
  type: 'rhyme';
  word: string;           // Word to rhyme with (as icon key or text)
  target: IconKey;        // Correct rhyming option
  distractors: IconKey[]; // Wrong options (array with 1 element)
}

export class RhymeExercise extends ExercisePlugin {
  private word: string;
  private target: IconKey;
  private distractors: IconKey[];

  get type(): ExerciseType {
    return 'rhyme';
  }

  constructor(config: RhymeExerciseConfig) {
    super(config);
    this.word = config.word;
    this.target = config.target;
    this.distractors = config.distractors;
  }

  /**
   * Generate instruction speech
   * Format: "Was reimt sich auf Maus? ... Haus? ... oder Auto?"
   */
  getInstruction(): string {
    const wordLabel = labels[this.word as IconKey] || this.word;
    const targetLabel = labels[this.target];
    const distractorLabel = labels[this.distractors[0]];

    return `Was reimt sich auf ${wordLabel}? ... ${targetLabel}? ... oder ${distractorLabel}?`;
  }

  /**
   * Render the rhyme task
   */
  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);

    const { width, height, scale } = ctx;
    const boxW = 140 * scale;
    const boxH = 140 * scale;
    const py = height * 0.5;

    // Draw prompt word at top
    ctx.ctx.fillStyle = colors.text;
    ctx.ctx.font = `${30 * scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'top';

    const promptText = `"${labels[this.word as IconKey] || this.word}"`;
    ctx.ctx.fillText(promptText, width / 2, 100 * scale);

    // Draw two option boxes
    this.renderOption(ctx, this.target, width / 2 - boxW - 30 * scale, py, boxW, boxH);
    this.renderOption(ctx, this.distractors[0], width / 2 + 30 * scale, py, boxW, boxH);

    // Draw repeat instruction button
    this.drawRepeatButton(ctx);
  }

  /**
   * Render a single option box
   */
  private renderOption(
    ctx: RenderContext,
    iconKey: IconKey,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    // Draw white box
    this.drawRoundedRect(ctx, { x, y, w, h }, {
      borderRadius: 15,
      fillStyle: colors.white
    });

    // Draw icon
    ctx.ctx.fillStyle = colors.text;
    this.drawIcon(ctx, icons[iconKey], { x, y, w, h }, 70);
  }

  /**
   * Handle user input
   */
  handleInput(event: InputEvent): ExerciseResult | null {
    if (!this.isStartEvent(event)) {
      return null;
    }

    // Check repeat button first
    if (this.checkRepeatButtonClick(event)) {
      return null; // Repeat requested, don't process other inputs
    }

    const { width, height, scale } = this.getRenderContext();
    const boxW = 140 * scale;
    const boxH = 140 * scale;
    const py = height * 0.5;

    // Check if target box was clicked
    const targetRect = {
      x: width / 2 - boxW - 30 * scale,
      y: py,
      w: boxW,
      h: boxH
    };

    if (this.isInside(event.x, event.y, targetRect)) {
      // Only count as correct if no previous incorrect attempt
      const finalCorrect = !this.hasIncorrectAttempt;

      return {
        correct: finalCorrect,
        responseTime: this.getElapsedTime()
      };
    }

    // Check if distractor box was clicked
    const distractorRect = {
      x: width / 2 + 30 * scale,
      y: py,
      w: boxW,
      h: boxH
    };

    if (this.isInside(event.x, event.y, distractorRect)) {
      // Mark that user made incorrect attempt
      this.hasIncorrectAttempt = true;

      return {
        correct: false,
        responseTime: this.getElapsedTime()
      };
    }

    return null;
  }
}
