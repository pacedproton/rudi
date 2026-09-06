import type { ExerciseType, ExerciseResult } from '../base/types';
import type { RenderContext } from '$lib/core/CanvasManager';
import { requireLetterForm } from '$lib/data/letter-forms';
import { audioEngine } from '$lib/core/AudioEngine';
import { speechEngine } from '$lib/core/SpeechEngine';
import { writingMastery } from '$lib/stores/writingMastery';
import { WritingExerciseBase } from './WritingExerciseBase';
import { drawLetterGuide, getLetterSlot, pointAlongStrokes, transformLetterStrokes } from './paper';
import { scoreStrokes } from './scoreStrokes';

export interface LetterTraceConfig {
  type: 'letter_trace';
  character: string;
  instruction: string;
}

/**
 * Guided stroke-order tracing. The path stays visible and a moving
 * dot shows the writing direction.
 */
export class LetterTraceExercise extends WritingExerciseBase {
  constructor(config: LetterTraceConfig) {
    super(config);
    this.guideAlpha = 0.45;
  }

  get type(): ExerciseType {
    return 'letter_trace';
  }

  getInstruction(): string {
    return (this.config as LetterTraceConfig).instruction;
  }

  render(ctx: RenderContext): void {
    this.saveRenderContext(ctx);
    ctx.ctx.clearRect(0, 0, ctx.width, ctx.height);

    const config = this.config as LetterTraceConfig;
    const form = requireLetterForm(config.character);
    const layout = this.drawPaper(ctx, 1);
    const slot = getLetterSlot(layout, 0);
    const expected = transformLetterStrokes(form, slot);

    drawLetterGuide(ctx, expected, this.guideAlpha);

    const progress = (Date.now() / 1800) % 1;
    const tip = pointAlongStrokes(expected, progress);
    if (tip) {
      ctx.ctx.beginPath();
      ctx.ctx.fillStyle = '#ff9800';
      ctx.ctx.arc(tip.x, tip.y, 10 * ctx.scale, 0, Math.PI * 2);
      ctx.ctx.fill();
    }

    this.drawUserStrokes(ctx);
    this.drawInstruction(ctx, config.instruction);
    this.drawControls(ctx, { showGuide: false });
    this.drawRepeatButton(ctx);
  }

  protected onDone(): ExerciseResult | null {
    const config = this.config as LetterTraceConfig;
    const form = requireLetterForm(config.character);
    const ctx = this.getRenderContext();
    const layout = this.paper ?? this.drawPaper(ctx, 1);
    const slot = getLetterSlot(layout, 0);
    const expected = transformLetterStrokes(form, slot);
    const score = scoreStrokes(this.userStrokePoints(), expected, {
      hitRadius: 22 * ctx.scale,
      waypointThreshold: 0.45,
      overlapThreshold: 0.35,
      overallThreshold: 0.48
    });

    writingMastery.recordLetter(config.character, score.passed);

    if (!score.passed) {
      this.failedAttempts += 1;
      this.clearStrokes();
      this.guideAlpha = 0.5;
      audioEngine.playSound('wrong');
      speechEngine.speak('Zeichne den Punkt nach. Versuch es noch einmal.');
      return null;
    }

    audioEngine.playSound('success');
    speechEngine.speak('Gut gemacht!');
    return {
      correct: true,
      responseTime: Date.now() - this.startTime,
      metadata: {
        character: config.character,
        accuracy: score.overall,
        waypointHitRate: score.waypointHitRate,
        strokes: this.strokes.length
      }
    };
  }
}
