import type { ExerciseType, ExerciseResult, SpeechRequest } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { requireLetterForm } from '$lib/data/letter-forms';
import { icons } from '$lib/data/assets';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { writingMastery } from '$lib/stores/writingMastery';
import { WritingExerciseBase } from './WritingExerciseBase';
import { drawLetterGuide, getLetterSlot, getPaperLayout, transformLetterStrokes } from './paper';
import { scoreWord } from './scoreStrokes';

export interface WordDictationConfig {
  type: 'word_dictation';
  word: string;
  instruction: string;
  icon?: string;
}

/**
 * Hear the word (and see a picture if available), then write it. Reveal after scoring.
 */
export class WordDictationExercise extends WritingExerciseBase {
  private reveal = false;

  get type(): ExerciseType {
    return 'word_dictation';
  }

  getInstruction(): string {
    return (this.config as WordDictationConfig).instruction;
  }

  onStart(): SpeechRequest[] {
    const config = this.config as WordDictationConfig;
    return [{ text: config.instruction }, { text: config.word }];
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

    const config = this.config as WordDictationConfig;
    const letters = config.word.split('');
    this.drawPaper(ctx, letters.length);

    this.drawPicture(ctx, config.icon);

    if (this.reveal) {
      this.drawModelWord(ctx, letters);
    }

    this.drawUserStrokes(ctx);
    this.drawInstruction(ctx, config.instruction);
    this.drawControls(ctx, { showGuide: false });
    this.drawRepeatButton(ctx);
  }

  private drawPicture(ctx: RenderContext, iconKey?: string): void {
    if (!iconKey || !(iconKey in icons)) return;
    const icon = icons[iconKey as keyof typeof icons];
    ctx.ctx.font = `${56 * ctx.scale}px Arial`;
    ctx.ctx.textAlign = 'center';
    ctx.ctx.textBaseline = 'middle';
    ctx.ctx.fillText(icon, ctx.width / 2, 88 * ctx.scale);
  }

  private drawModelWord(ctx: RenderContext, letters: string[]): void {
    const modelLayout = getPaperLayout(ctx.width, ctx.height * 0.4, ctx.scale * 0.4, letters.length);
    modelLayout.top = 118 * ctx.scale;
    modelLayout.height = 70 * ctx.scale;
    letters.forEach((glyph, index) => {
      const slot = getLetterSlot(modelLayout, index);
      drawLetterGuide(ctx, transformLetterStrokes(requireLetterForm(glyph), slot), 1, '#667eea');
    });
  }

  protected onDone(): ExerciseResult | null {
    const config = this.config as WordDictationConfig;
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

    writingMastery.recordWord(config.word, 'dictation', score.passed);
    this.reveal = true;

    if (!score.passed) {
      this.failedAttempts += 1;
      this.clearStrokes();
      audioEngine.playSound('wrong');
      speechEngine.speak(`Das Wort ist ${config.word}. Schreibe es noch einmal.`);
      this.reveal = false;
      return null;
    }

    audioEngine.playSound('success');
    speechEngine.speak('Richtig!');
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
