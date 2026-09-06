import type { ExerciseType, ExerciseResult } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { requireLetterForm } from '$lib/data/letter-forms';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { writingMastery } from '$lib/stores/writingMastery';
import { WordCopyExercise, type WordCopyConfig } from './WordCopyExercise';
import { drawLetterGuide, getLetterSlot, getPaperLayout, transformLetterStrokes } from './paper';
import { scoreWord } from './scoreStrokes';

export interface WordMemoryConfig {
  type: 'word_memory';
  word: string;
  instruction: string;
  icon?: string;
}

/**
 * Look-cover-write: show the word, hide it, then write from memory.
 */
export class WordMemoryExercise extends WordCopyExercise {
  private phase: 'show' | 'write' | 'reveal' = 'show';

  constructor(config: WordMemoryConfig) {
    super(config as unknown as WordCopyConfig);
    this.guideAlpha = 0;
  }

  get type(): ExerciseType {
    return 'word_memory';
  }

  getInstruction(): string {
    const config = this.config as WordMemoryConfig;
    if (this.phase === 'show') {
      return `Lies das Wort: ${config.word}`;
    }
    return config.instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

    const config = this.config as WordMemoryConfig;
    const letters = config.word.split('');
    this.drawPaper(ctx, letters.length);

    if (this.phase === 'show' || this.phase === 'reveal') {
      this.drawModelWord(ctx, letters);
    }

    if (this.phase === 'write' || this.phase === 'reveal') {
      this.drawUserStrokes(ctx);
    }

    this.drawInstruction(ctx, this.getInstruction());

    if (this.phase === 'show') {
      this.drawControls(ctx, { showDone: false, showGuide: false, extraLabel: 'Weiter' });
    } else {
      this.drawControls(ctx, { showGuide: false });
    }
    this.drawRepeatButton(ctx);
  }

  protected override drawModelWord(ctx: RenderContext, letters: string[]): void {
    const modelLayout = getPaperLayout(ctx.width, ctx.height * 0.55, ctx.scale * 0.55, letters.length);
    modelLayout.top = 70 * ctx.scale;
    modelLayout.height = 90 * ctx.scale;

    letters.forEach((glyph, index) => {
      const form = requireLetterForm(glyph);
      const slot = getLetterSlot(modelLayout, index);
      drawLetterGuide(ctx, transformLetterStrokes(form, slot), 1, '#333');
    });
  }

  protected onExtra(): ExerciseResult | null {
    if (this.phase === 'show') {
      this.phase = 'write';
      audioEngine.playSound('pop');
      speechEngine.speak((this.config as WordMemoryConfig).instruction);
    }
    return null;
  }

  protected onDone(): ExerciseResult | null {
    if (this.phase === 'show') return null;

    const config = this.config as WordMemoryConfig;
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
        hitRadius: 20 * ctx.scale,
        waypointThreshold: 0.4,
        overlapThreshold: 0.3,
        overallThreshold: 0.46
      }
    );

    writingMastery.recordWord(config.word, 'memory', score.passed);
    this.phase = 'reveal';

    if (!score.passed) {
      this.failedAttempts += 1;
      this.clearStrokes();
      audioEngine.playSound('wrong');
      speechEngine.speak('Schau noch einmal und schreibe das Wort aus dem Kopf.');
      this.phase = 'show';
      return null;
    }

    audioEngine.playSound('success');
    speechEngine.speak('Genau!');
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
