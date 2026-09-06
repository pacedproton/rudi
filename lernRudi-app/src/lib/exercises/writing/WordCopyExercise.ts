import type { ExerciseType, ExerciseResult } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { requireLetterForm } from '$lib/data/letter-forms';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { writingMastery } from '$lib/stores/writingMastery';
import { WritingExerciseBase } from './WritingExerciseBase';
import {
  drawLetterGuide,
  getLetterSlot,
  getPaperLayout,
  transformLetterStrokes,
  type LetterSlot
} from './paper';
import { scoreWord } from './scoreStrokes';

export interface WordCopyConfig {
  type: 'word_copy';
  word: string;
  instruction: string;
  icon?: string;
}

/**
 * Copy a printed word onto four-line paper. Each letter is scored in its slot.
 */
export class WordCopyExercise extends WritingExerciseBase {
  constructor(config: WordCopyConfig) {
    super(config);
    this.guideAlpha = 0.22;
  }

  get type(): ExerciseType {
    return 'word_copy';
  }

  getInstruction(): string {
    return (this.config as WordCopyConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

    const config = this.config as WordCopyConfig;
    const letters = config.word.split('');
    const layout = this.drawPaper(ctx, letters.length);

    this.drawModelWord(ctx, letters);
    this.drawWordGuides(ctx, letters, true);
    this.drawUserStrokes(ctx);
    this.drawInstruction(ctx, config.instruction);
    this.drawControls(ctx);
    this.drawRepeatButton(ctx);
  }

  protected drawModelWord(ctx: RenderContext, letters: string[]): void {
    const modelLayout = getPaperLayout(ctx.width, ctx.height * 0.55, ctx.scale * 0.55, letters.length);
    modelLayout.top = 70 * ctx.scale;
    modelLayout.height = 90 * ctx.scale;

    letters.forEach((glyph, index) => {
      const form = requireLetterForm(glyph);
      const slot = getLetterSlot(modelLayout, index);
      const strokes = transformLetterStrokes(form, slot);
      drawLetterGuide(ctx, strokes, 1, '#333');
    });
  }

  protected drawWordGuides(ctx: RenderContext, letters: string[], faded: boolean): LetterSlot[] {
    const layout = this.paper ?? this.drawPaper(ctx, letters.length);
    return letters.map((glyph, index) => {
      const form = requireLetterForm(glyph);
      const slot = getLetterSlot(layout, index);
      if (faded) {
        drawLetterGuide(ctx, transformLetterStrokes(form, slot), this.guideAlpha);
      }
      return slot;
    });
  }

  protected onDone(): ExerciseResult | null {
    const config = this.config as WordCopyConfig;
    const ctx = this.getRenderContext();
    const letters = config.word.split('');
    const layout = this.paper ?? this.drawPaper(ctx, letters.length);
    const slots = letters.map((_, index) => getLetterSlot(layout, index));
    const expected = letters.map((glyph, index) =>
      transformLetterStrokes(requireLetterForm(glyph), slots[index])
    );
    const score = scoreWord(
      this.userStrokePoints(),
      expected,
      slots.map((slot) => ({ left: slot.left, right: slot.right })),
      {
        hitRadius: 18 * ctx.scale,
        waypointThreshold: 0.42,
        overlapThreshold: 0.32,
        overallThreshold: 0.48
      }
    );

    writingMastery.recordWord(config.word, 'copy', score.passed);

    if (!score.passed) {
      this.failedAttempts += 1;
      this.clearStrokes();
      this.guideAlpha = 0.35;
      audioEngine.playSound('wrong');
      speechEngine.speak('Schreibe das Wort noch einmal. Schau genau hin.');
      return null;
    }

    audioEngine.playSound('success');
    speechEngine.speak('Toll geschrieben!');
    return {
      correct: true,
      responseTime: Date.now() - this.startTime,
      metadata: {
        word: config.word,
        accuracy: score.overall,
        strokes: this.strokes.length
      }
    };
  }
}
