import type { ExerciseType, ExerciseResult } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { requireLetterForm } from '$lib/data/letter-forms';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { writingMastery } from '$lib/stores/writingMastery';
import { WritingExerciseBase } from './WritingExerciseBase';
import { drawLetterGuide, getLetterSlot, transformLetterStrokes } from './paper';
import { scoreStrokes } from './scoreStrokes';

export interface LetterWriteConfig {
  type: 'letter_write';
  character: string;
  instruction: string;
  guide?: 'faded' | 'hidden';
}

/**
 * Write a letter from a faded or hidden guide. Failures turn the guide back on.
 */
export class LetterWriteExercise extends WritingExerciseBase {
  constructor(config: LetterWriteConfig) {
    super(config);
    this.guideAlpha = config.guide === 'hidden' ? 0 : 0.28;
  }

  get type(): ExerciseType {
    return 'letter_write';
  }

  getInstruction(): string {
    return (this.config as LetterWriteConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

    const config = this.config as LetterWriteConfig;
    const form = requireLetterForm(config.character);
    const layout = this.drawPaper(ctx, 1);
    const slot = getLetterSlot(layout, 0);
    const expected = transformLetterStrokes(form, slot);

    drawLetterGuide(ctx, expected, this.guideAlpha);
    this.drawUserStrokes(ctx);
    this.drawInstruction(ctx, config.instruction);
    this.drawControls(ctx);
    this.drawRepeatButton(ctx);
  }

  protected onDone(): ExerciseResult | null {
    const config = this.config as LetterWriteConfig;
    const form = requireLetterForm(config.character);
    const ctx = this.getRenderContext();
    const layout = this.paper ?? this.drawPaper(ctx, 1);
    const slot = getLetterSlot(layout, 0);
    const expected = transformLetterStrokes(form, slot);
    const score = scoreStrokes(this.userStrokePoints(), expected, {
      hitRadius: 20 * ctx.scale,
      waypointThreshold: 0.5,
      overlapThreshold: 0.4,
      overallThreshold: 0.52
    });

    writingMastery.recordLetter(config.character, score.passed);

    if (!score.passed) {
      this.failedAttempts += 1;
      this.clearStrokes();
      this.guideAlpha = 0.4;
      audioEngine.playSound('wrong');
      speechEngine.speak('Schau auf die Hilfe und schreibe den Buchstaben noch einmal.');
      return null;
    }

    audioEngine.playSound('success');
    speechEngine.speak('Super!');
    return {
      correct: true,
      responseTime: Date.now() - this.startTime,
      metadata: {
        character: config.character,
        accuracy: score.overall,
        waypointHitRate: score.waypointHitRate,
        placement: score.placement,
        strokes: this.strokes.length
      }
    };
  }
}
